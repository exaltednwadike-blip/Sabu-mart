import { createClient } from "./supabase/client";

const supabase = createClient();

export type TicketCategory =
  | "delivery"
  | "product_quality"
  | "seller_conduct"
  | "payment"
  | "app_issue"
  | "other";

export type TicketStatus = "open" | "in_review" | "resolved" | "closed";

export interface SupportTicket {
  id: string;
  buyer_id: string;
  order_id: string | null;
  category: TicketCategory;
  subject: string;
  description: string;
  status: TicketStatus;
  admin_response: string | null;
  resolved_at: string | null;
  created_at: string;
}

export async function submitTicket(params: {
  buyerId: string;
  orderId?: string | null;
  category: TicketCategory;
  subject: string;
  description: string;
}) {
  const { error } = await supabase.from("support_tickets").insert({
    buyer_id: params.buyerId,
    order_id: params.orderId || null,
    category: params.category,
    subject: params.subject,
    description: params.description,
  });
  if (error) throw error;
}

export async function getBuyerTickets(buyerId: string) {
  const { data, error } = await supabase
    .from("support_tickets")
    .select("*, orders(id, created_at)")
    .eq("buyer_id", buyerId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as SupportTicket[];
}

export async function listAllTickets(status?: TicketStatus) {
  let query = supabase
    .from("support_tickets")
    .select("*, profiles(full_name, phone), orders(id, created_at)")
    .order("created_at", { ascending: false });
  if (status) {
    query = query.eq("status", status);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data as any[];
}

export async function respondToTicket(
  ticketId: string,
  response: string,
  status: TicketStatus = "resolved"
) {
  const isClosing = status === "resolved" || status === "closed";
  const { error } = await supabase
    .from("support_tickets")
    .update({
      admin_response: response,
      status,
      resolved_at: isClosing ? new Date().toISOString() : null,
    })
    .eq("id", ticketId);
  if (error) throw error;
}
