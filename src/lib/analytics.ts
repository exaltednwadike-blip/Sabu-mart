import { createClient } from "./supabase/client";

const supabase = createClient();

export async function getRevenueOverTime(sellerId: string, days: number = 30) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  const { data, error } = await supabase
    .from("wallet_transactions")
    .select("amount, created_at")
    .eq("user_id", sellerId)
    .eq("type", "escrow_release")
    .gte("created_at", cutoff.toISOString())
    .order("created_at", { ascending: true });
  if (error) throw error;

  const byDay: { [key: string]: number } = {};
  (data || []).forEach(function (row: any) {
    const day = new Date(row.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
    byDay[day] = (byDay[day] || 0) + Number(row.amount);
  });

  return Object.keys(byDay).map(function (day) {
    return { day, revenue: byDay[day] };
  });
}

export async function getTopProducts(sellerId: string, limit: number = 5) {
  const { data, error } = await supabase
    .from("order_items")
    .select("title, price, quantity")
    .eq("seller_id", sellerId);
  if (error) throw error;

  const byProduct: { [key: string]: { title: string; revenue: number; units: number } } = {};
  (data || []).forEach(function (row: any) {
    if (!byProduct[row.title]) {
      byProduct[row.title] = { title: row.title, revenue: 0, units: 0 };
    }
    byProduct[row.title].revenue += Number(row.price) * row.quantity;
    byProduct[row.title].units += row.quantity;
  });

  return Object.values(byProduct)
    .sort(function (a, b) { return b.revenue - a.revenue; })
    .slice(0, limit);
}

export async function getCategoryBreakdown(sellerId: string) {
  const { data, error } = await supabase
    .from("products")
    .select("listing_categories(name)")
    .eq("seller_id", sellerId);
  if (error) throw error;

  const byCategory: { [key: string]: number } = {};
  (data || []).forEach(function (row: any) {
    const name = row.listing_categories ? row.listing_categories.name : "Uncategorized";
    byCategory[name] = (byCategory[name] || 0) + 1;
  });

  return Object.keys(byCategory).map(function (name) {
    return { name, count: byCategory[name] };
  });
}

export async function getProductViewsAndLikes(sellerId: string) {
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id, title")
    .eq("seller_id", sellerId);
  if (productsError) throw productsError;

  const productIds = (products || []).map(function (p: any) { return p.id; });
  if (productIds.length === 0) return [];

  const [viewsResult, likesResult] = await Promise.all([
    supabase.from("product_views").select("product_id").in("product_id", productIds),
    supabase.from("wishlist_items").select("product_id").in("product_id", productIds),
  ]);
  if (viewsResult.error) throw viewsResult.error;
  if (likesResult.error) throw likesResult.error;

  const viewCounts: { [key: string]: number } = {};
  (viewsResult.data || []).forEach(function (row: any) {
    viewCounts[row.product_id] = (viewCounts[row.product_id] || 0) + 1;
  });

  const likeCounts: { [key: string]: number } = {};
  (likesResult.data || []).forEach(function (row: any) {
    likeCounts[row.product_id] = (likeCounts[row.product_id] || 0) + 1;
  });

  return (products || [])
    .map(function (p: any) {
      return {
        id: p.id,
        title: p.title,
        views: viewCounts[p.id] || 0,
        likes: likeCounts[p.id] || 0,
      };
    })
    .sort(function (a: any, b: any) { return b.views - a.views; });
}

export async function getFulfillmentFunnel(sellerId: string) {
  const { data, error } = await supabase
    .from("order_items")
    .select("seller_status")
    .eq("seller_id", sellerId);
  if (error) throw error;

  const counts = { pending: 0, confirmed: 0, shipped: 0, delivered: 0, cancelled: 0 };
  (data || []).forEach(function (row: any) {
    if (counts.hasOwnProperty(row.seller_status)) {
      (counts as any)[row.seller_status] += 1;
    }
  });

  const total = data ? data.length : 0;
  const completionRate = total > 0 ? (counts.delivered / total) * 100 : 0;

  return { counts, total, completionRate };
}

export async function getSellerRatingSummary(sellerId: string) {
  const { data, error } = await supabase
    .from("reviews")
    .select("rating")
    .eq("seller_id", sellerId);
  if (error) throw error;

  const reviews = data || [];
  if (reviews.length === 0) return { average: 0, count: 0 };
  const sum = reviews.reduce(function (s: number, r: any) { return s + r.rating; }, 0);
  return { average: sum / reviews.length, count: reviews.length };
}
