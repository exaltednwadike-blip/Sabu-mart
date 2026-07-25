import { createClient } from "./supabase/client";

const supabase = createClient();

export interface FeaturedSeller {
  id: string;
  storeName: string;
  category: string;
  rating: number;
  reviewCount: number;
  salesCount: number;
}

export async function getFeaturedSellers(limit: number = 6) {
  const { data: sellerProfiles, error: sellerError } = await supabase
    .from("profiles")
    .select("id, store_name")
    .eq("seller_status", "approved");
  if (sellerError) throw sellerError;

  const sellers = sellerProfiles || [];
  if (sellers.length === 0) return [];

  const sellerIds = sellers.map(function (s: any) { return s.id; });

  const [productsRes, reviewsRes, salesRes] = await Promise.all([
    supabase
      .from("products")
      .select("seller_id, listing_categories(name)")
      .in("seller_id", sellerIds)
      .eq("status", "published"),
    supabase
      .from("reviews")
      .select("seller_id, rating")
      .in("seller_id", sellerIds),
    supabase
      .from("order_items")
      .select("seller_id")
      .in("seller_id", sellerIds)
      .eq("escrow_status", "released"),
  ]);

  const products = productsRes.data || [];
  const reviews = reviewsRes.data || [];
  const sales = salesRes.data || [];

  function topCategoryFor(sellerId: string) {
    const counts: { [key: string]: number } = {};
    products.forEach(function (p: any) {
      if (p.seller_id !== sellerId) return;
      const name = p.listing_categories && p.listing_categories.name ? p.listing_categories.name : null;
      if (!name) return;
      counts[name] = (counts[name] || 0) + 1;
    });
    const entries = Object.entries(counts);
    if (entries.length === 0) return "Marketplace seller";
    entries.sort(function (a, b) { return b[1] - a[1]; });
    return entries[0][0];
  }

  function ratingFor(sellerId: string) {
    const sellerReviews = reviews.filter(function (r: any) { return r.seller_id === sellerId; });
    if (sellerReviews.length === 0) return { average: 0, count: 0 };
    const sum = sellerReviews.reduce(function (s: number, r: any) { return s + r.rating; }, 0);
    return { average: sum / sellerReviews.length, count: sellerReviews.length };
  }

  function salesCountFor(sellerId: string) {
    return sales.filter(function (s: any) { return s.seller_id === sellerId; }).length;
  }

  function productCountFor(sellerId: string) {
    return products.filter(function (p: any) { return p.seller_id === sellerId; }).length;
  }

  const enriched: FeaturedSeller[] = sellers.map(function (s: any) {
    const r = ratingFor(s.id);
    return {
      id: s.id,
      storeName: s.store_name || "SABU Seller",
      category: topCategoryFor(s.id),
      rating: r.average,
      reviewCount: r.count,
      salesCount: salesCountFor(s.id),
    };
  });

  enriched.sort(function (a, b) {
    if (b.rating !== a.rating) return b.rating - a.rating;
    return b.salesCount - a.salesCount || productCountFor(b.id) - productCountFor(a.id);
  });

  return enriched.slice(0, limit);
}
