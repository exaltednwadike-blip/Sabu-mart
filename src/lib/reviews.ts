import { createClient } from "./supabase/client";

const supabase = createClient();

export async function submitReview(input: {
  orderItemId: string;
  productId: string;
  buyerId: string;
  sellerId: string;
  buyerName: string;
  rating: number;
  comment: string;
}) {
  const { error } = await supabase.from("reviews").insert({
    order_item_id: input.orderItemId,
    product_id: input.productId,
    buyer_id: input.buyerId,
    seller_id: input.sellerId,
    buyer_name: input.buyerName,
    rating: input.rating,
    comment: input.comment,
  });
  if (error) throw error;
}

export async function getProductReviews(productId: string) {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("product_id", productId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getProductRatingSummary(productId: string) {
  const { data, error } = await supabase
    .from("reviews")
    .select("rating")
    .eq("product_id", productId);
  if (error) throw error;
  const reviews = data || [];
  if (reviews.length === 0) return { average: 0, count: 0 };
  const sum = reviews.reduce(function (s, r) { return s + r.rating; }, 0);
  return { average: sum / reviews.length, count: reviews.length };
}

export async function getReviewableOrderItems(buyerId: string) {
  const { data, error } = await supabase
    .from("order_items")
    .select("id, title, price, product_id, seller_id, orders!inner(buyer_id)")
    .eq("orders.buyer_id", buyerId)
    .eq("escrow_status", "released");
  if (error) throw error;

  const { data: reviewed } = await supabase
    .from("reviews")
    .select("order_item_id")
    .eq("buyer_id", buyerId);

  const reviewedIds = (reviewed || []).map(function (r) { return r.order_item_id; });
  return (data || []).filter(function (item: any) { return reviewedIds.indexOf(item.id) === -1; });
}

export async function getMyReviews(buyerId: string) {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("buyer_id", buyerId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}
