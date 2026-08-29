import { createClient } from "./supabase/client";
import type { SupabaseClient } from "@supabase/supabase-js";

const supabase = createClient();

export async function isAdmin(userId: string, client: SupabaseClient = supabase): Promise<boolean> {
  const { data, error } = await client
    .from("admins")
    .select("id")
    .eq("id", userId)
    .maybeSingle();
  if (error) return false;
  return !!data;
}

export interface SellerApplication {
  id: string;
  user_id: string;
  business_name: string;
  business_address: string;
  phone: string;
  id_type: string;
  id_number: string;
  id_document_url: string;
  status: "pending" | "approved" | "rejected";
  rejection_reason: string | null;
  submitted_at: string;
}

export async function listApplications(status: "pending" | "approved" | "rejected" = "pending") {
  const { data, error } = await supabase
    .from("seller_applications")
    .select("*")
    .eq("status", status)
    .order("submitted_at", { ascending: true });
  if (error) throw error;
  return data as SellerApplication[];
}

export async function getAllSellers() {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("seller_status", "approved")
    .order("store_name", { ascending: true });
  if (error) throw error;
  return data;
}

export async function getDocumentUrl(path: string) {
  const { data, error } = await supabase.storage
    .from("seller-documents")
    .createSignedUrl(path, 60 * 5);
  if (error) throw error;
  return data.signedUrl;
}

export async function approveApplication(applicationId: string, applicantUserId: string, businessName: string) {
  const reviewerId = (await supabase.auth.getUser()).data.user?.id;

  const { error: appError } = await supabase
    .from("seller_applications")
    .update({ status: "approved", reviewed_at: new Date().toISOString(), reviewed_by: reviewerId })
    .eq("id", applicationId);
  if (appError) throw appError;

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ seller_status: "approved", is_seller: true, store_name: businessName })
    .eq("id", applicantUserId);
  if (profileError) throw profileError;
}

export async function rejectApplication(applicationId: string, applicantUserId: string, reason: string) {
  const reviewerId = (await supabase.auth.getUser()).data.user?.id;

  const { error: appError } = await supabase
    .from("seller_applications")
    .update({
      status: "rejected",
      rejection_reason: reason,
      reviewed_at: new Date().toISOString(),
      reviewed_by: reviewerId,
    })
    .eq("id", applicationId);
  if (appError) throw appError;

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ seller_status: "rejected" })
    .eq("id", applicantUserId);
  if (profileError) throw profileError;
}

export interface PendingProduct {
  id: string;
  title: string;
  price: number;
  listing_fee: number;
  city: string;
  images: string[];
  created_at: string;
  seller_id: string;
  listing_categories?: { name: string } | null;
}

export async function listPendingProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("*, listing_categories(name)")
    .eq("status", "pending_review")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data as PendingProduct[];
}

export async function publishProduct(productId: string) {
  const { error } = await supabase
    .from("products")
    .update({ status: "published", published_at: new Date().toISOString() })
    .eq("id", productId);
  if (error) throw error;
}

export async function rejectProduct(productId: string) {
  const { error } = await supabase
    .from("products")
    .update({ status: "rejected" })
    .eq("id", productId);
  if (error) throw error;
}

export async function getAdminStats() {
  const [pendingApps, pendingProducts, openDisputes, pendingWithdrawals] = await Promise.all([
    supabase.from("seller_applications").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("status", "pending_review"),
    supabase.from("disputes").select("id", { count: "exact", head: true }).eq("status", "open"),
    supabase.from("withdrawal_requests").select("id", { count: "exact", head: true }).eq("status", "pending"),
  ]);

  return {
    pendingApplications: pendingApps.count ?? 0,
    pendingProducts: pendingProducts.count ?? 0,
    openDisputes: openDisputes.count ?? 0,
    pendingWithdrawals: pendingWithdrawals.count ?? 0,
  };
}

export async function listPendingWithdrawals() {
  const { data, error } = await supabase
    .from("withdrawal_requests")
    .select("*, profiles(store_name)")
    .eq("status", "pending")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data;
}

export async function markWithdrawalPaid(withdrawalId: string, transferCode: string, recipientCode: string) {
  const { error } = await supabase
    .from("withdrawal_requests")
    .update({
      status: "paid",
      processed_at: new Date().toISOString(),
      paystack_transfer_code: transferCode,
      paystack_recipient_code: recipientCode,
    })
    .eq("id", withdrawalId);
  if (error) throw error;
}

export async function rejectWithdrawal(withdrawalId: string, sellerId: string, amount: number, note: string) {
  const { error: wError } = await supabase
    .from("withdrawal_requests")
    .update({ status: "rejected", admin_notes: note, processed_at: new Date().toISOString() })
    .eq("id", withdrawalId);
  if (wError) throw wError;

  const { error: txError } = await supabase.from("wallet_transactions").insert({
    user_id: sellerId,
    type: "refund",
    amount: amount,
    note: "Withdrawal rejected - amount returned to balance",
  });
  if (txError) throw txError;
}

export async function listOpenDisputes() {
  const { data, error } = await supabase
    .from("disputes")
    .select("*, order_items(id, title, price, quantity, seller_id, order_id, orders(paystack_reference, provider_transaction_id, buyer_id))")
    .eq("status", "open")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data;
}

export async function resolveDisputeRelease(disputeId: string, orderItemId: string, sellerId: string, amount: number) {
  const { error: itemError } = await supabase
    .from("order_items")
    .update({ escrow_status: "released" })
    .eq("id", orderItemId);
  if (itemError) throw itemError;

  const { error: txError } = await supabase.from("wallet_transactions").insert({
    user_id: sellerId,
    order_item_id: orderItemId,
    type: "escrow_release",
    amount: amount,
    note: "Dispute resolved - released to seller",
  });
  if (txError) throw txError;

  const { error: disputeError } = await supabase
    .from("disputes")
    .update({ status: "resolved_release", resolved_at: new Date().toISOString() })
    .eq("id", disputeId);
  if (disputeError) throw disputeError;
}

export async function resolveDisputeRefund(disputeId: string, orderItemId: string) {
  const { error: itemError } = await supabase
    .from("order_items")
    .update({ escrow_status: "refunded" })
    .eq("id", orderItemId);
  if (itemError) throw itemError;

  const { error: disputeError } = await supabase
    .from("disputes")
    .update({ status: "resolved_refund", resolved_at: new Date().toISOString() })
    .eq("id", disputeId);
  if (disputeError) throw disputeError;
}
