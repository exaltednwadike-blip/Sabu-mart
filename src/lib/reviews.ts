import { createClient } from "./supabase/client";

const supabase = createClient();

export async function submitReview(input: {
  orderItemId?: string | null;
  productId: string;
  buyerId: string;
  sellerId: string;
  buyerName: string;
  rating: number;
  comment: string;
}) {
  const { error } = await supabase.from("reviews").insert({
    order_item_id: input.orderItemId || null,
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

export async function getSellerReviews(sellerId: string) {
  const { data, error } = await supabase
    .from("reviews")
    .select("*, products(title, images)")
    .eq("seller_id", sellerId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

type RatingBreakdown = {
  stars: number;
  count: number;
};

export type SellerPerformance = {
  averageRating: number;
  reviewCount: number;
  fulfillmentRate: number;
  cancellationRate: number;
  fulfilledCount: number;
  cancelledCount: number;
  inProgressCount: number;
  ratingBreakdown: RatingBreakdown[];
};

export async function getSellerPerformance(sellerId: string): Promise<SellerPerformance> {
  const [{ data: reviewData, error: reviewError }, { data: orderItemData, error: orderError }] = await Promise.all([
    supabase.from("reviews").select("rating").eq("seller_id", sellerId),
    supabase.from("order_items").select("seller_status").eq("seller_id", sellerId),
  ]);

  if (reviewError) throw reviewError;
  if (orderError) throw orderError;

  const reviews = reviewData || [];
  const orderItems = orderItemData || [];

  const reviewCount = reviews.length;
  const averageRating = reviewCount === 0
    ? 0
    : reviews.reduce(function (sum: number, review: any) {
        return sum + Number(review.rating);
      }, 0) / reviewCount;

  const counts = { fulfilledCount: 0, cancelledCount: 0, inProgressCount: 0 };
  orderItems.forEach(function (item: any) {
    if (item.seller_status === "delivered") {
      counts.fulfilledCount += 1;
    } else if (item.seller_status === "cancelled") {
      counts.cancelledCount += 1;
    } else {
      counts.inProgressCount += 1;
    }
  });

  const totalOrders = orderItems.length;
  const fulfillmentRate = totalOrders === 0 ? 0 : counts.fulfilledCount / totalOrders;
  const cancellationRate = totalOrders === 0 ? 0 : counts.cancelledCount / totalOrders;

  const ratingBreakdown: RatingBreakdown[] = [5, 4, 3, 2, 1].map(function (stars) {
    return {
      stars,
      count: reviews.filter(function (review: any) {
        return Number(review.rating) === stars;
      }).length,
    };
  });

  return {
    averageRating,
    reviewCount,
    fulfillmentRate,
    cancellationRate,
    fulfilledCount: counts.fulfilledCount,
    cancelledCount: counts.cancelledCount,
    inProgressCount: counts.inProgressCount,
    ratingBreakdown,
  };
}
