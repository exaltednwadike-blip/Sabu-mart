import { createClient } from "./supabase/client";

const supabase = createClient();

export async function toggleWishlist(buyerId: string, productId: string) {
  const { data: existing } = await supabase
    .from("wishlist_items")
    .select("id")
    .eq("buyer_id", buyerId)
    .eq("product_id", productId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("wishlist_items")
      .delete()
      .eq("id", existing.id);
    if (error) throw error;
    return false;
  }

  const { error } = await supabase
    .from("wishlist_items")
    .insert({ buyer_id: buyerId, product_id: productId });
  if (error) throw error;
  return true;
}

export async function isInWishlist(buyerId: string, productId: string) {
  const { data } = await supabase
    .from("wishlist_items")
    .select("id")
    .eq("buyer_id", buyerId)
    .eq("product_id", productId)
    .maybeSingle();
  return !!data;
}

export async function getWishlist(buyerId: string) {
  const { data, error } = await supabase
    .from("wishlist_items")
    .select("id, created_at, products(id, title, price, images, city, seller_id, profiles(store_name))")
    .eq("buyer_id", buyerId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getWishlistCount(buyerId: string) {
  const { count, error } = await supabase
    .from("wishlist_items")
    .select("id", { count: "exact", head: true })
    .eq("buyer_id", buyerId);
  if (error) return 0;
  return count ?? 0;
}
