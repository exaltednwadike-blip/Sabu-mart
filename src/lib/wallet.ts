import { createClient } from "./supabase/client";

const supabase = createClient();

export async function confirmReceipt(orderItemId: string, expectedBuyerId: string) {
  const { error } = await supabase.rpc("confirm_order_item_receipt", {
    p_order_item_id: orderItemId,
  });
  if (error) throw error;
}

export async function raiseDispute(orderItemId: string, buyerId: string, reason: string) {
  const { error: disputeError } = await supabase.from("disputes").insert({
    order_item_id: orderItemId,
    raised_by: buyerId,
    reason,
    status: "open",
  });
  if (disputeError) throw disputeError;

  const { error: updateError } = await supabase
    .from("order_items")
    .update({ escrow_status: "disputed" })
    .eq("id", orderItemId);
  if (updateError) throw updateError;
}

export async function getWalletSummary(userId: string) {
  const { data: released } = await supabase
    .from("wallet_transactions")
    .select("amount")
    .eq("user_id", userId)
    .eq("type", "escrow_release");

  const { data: withdrawn } = await supabase
    .from("wallet_transactions")
    .select("amount")
    .eq("user_id", userId)
    .eq("type", "withdrawal");

  const { data: refunded } = await supabase
    .from("wallet_transactions")
    .select("amount")
    .eq("user_id", userId)
    .eq("type", "refund");

  const { data: held } = await supabase
    .from("order_items")
    .select("price, quantity")
    .eq("seller_id", userId)
    .eq("escrow_status", "held");

  const totalReleased = (released || []).reduce(function (sum, t) { return sum + Number(t.amount); }, 0);
  const totalWithdrawn = (withdrawn || []).reduce(function (sum, t) { return sum + Number(t.amount); }, 0);
  const totalRefunded = (refunded || []).reduce(function (sum, t) { return sum + Number(t.amount); }, 0);
  const totalHeld = (held || []).reduce(function (sum, item) { return sum + Number(item.price) * item.quantity; }, 0);

  return {
    available: totalReleased + totalRefunded - totalWithdrawn,
    pending: totalHeld,
    totalEarned: totalReleased,
  };
}

export async function getWalletTransactions(userId: string) {
  const { data, error } = await supabase
    .from("wallet_transactions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function requestWithdrawal(amount: number, bankName: string, bankCode: string, accountNumber: string, accountName: string) {
  const { data, error } = await supabase.rpc("request_withdrawal", {
    p_amount: amount,
    p_bank_name: bankName,
    p_bank_code: bankCode,
    p_account_number: accountNumber,
    p_account_name: accountName,
  });
  if (error) throw error;
  return data;
}

export async function getWithdrawalRequests(userId: string) {
  const { data, error } = await supabase
    .from("withdrawal_requests")
    .select("*")
    .eq("seller_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}
