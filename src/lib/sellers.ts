import { createClient } from "./supabase/client";

const supabase = createClient();

export async function getSellerProfile(sellerId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, store_name, created_at")
    .eq("id", sellerId)
    .eq("is_seller", true)
    .eq("seller_status", "approved")
    .single();
  if (error) throw error;
  return data;
}

export async function getSellerProducts(sellerId: string) {
  const { data, error } = await supabase
    .from("products")
    .select("id, title, price, images, city, listing_categories(name)")
    .eq("seller_id", sellerId)
    .eq("status", "published")
    .eq("availability", "available")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getFollowerCount(sellerId: string) {
  const { count, error } = await supabase
    .from("seller_followers")
    .select("id", { count: "exact", head: true })
    .eq("seller_id", sellerId);
  if (error) return 0;
  return count ?? 0;
}

export async function isFollowing(buyerId: string, sellerId: string) {
  const { data } = await supabase
    .from("seller_followers")
    .select("id")
    .eq("buyer_id", buyerId)
    .eq("seller_id", sellerId)
    .maybeSingle();
  return !!data;
}

export async function toggleFollow(buyerId: string, sellerId: string) {
  const { data: existing } = await supabase
    .from("seller_followers")
    .select("id")
    .eq("buyer_id", buyerId)
    .eq("seller_id", sellerId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("seller_followers")
      .delete()
      .eq("id", existing.id);
    if (error) throw error;
    return false;
  }

  const { error } = await supabase
    .from("seller_followers")
    .insert({ buyer_id: buyerId, seller_id: sellerId });
  if (error) throw error;
  return true;
}

export async function getTopSellers(limit: number = 6) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, store_name")
    .eq("is_seller", true)
    .eq("seller_status", "approved")
    .limit(limit);
  if (error) throw error;
  return data;
}

export async function getMyFollowers(sellerId: string) {
  const { data, error } = await supabase
    .from("seller_followers")
    .select("id, created_at, buyer_id, profiles!seller_followers_buyer_id_fkey(full_name)")
    .eq("seller_id", sellerId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}
