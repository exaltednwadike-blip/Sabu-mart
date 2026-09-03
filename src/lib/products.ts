import { createClient } from "./supabase/client";

const supabase = createClient();

export interface ListingCategory {
  id: string;
  name: string;
  listing_fee: number;
}

export async function getCategories() {
  const { data, error } = await supabase
    .from("listing_categories")
    .select("id, name, listing_fee")
    .eq("active", true)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data as ListingCategory[];
}

export interface ProductInput {
  title: string;
  description: string;
  categoryId: string;
  condition: string;
  price: number;
  stockQuantity: number;
  deliveryOption: "pickup_only" | "delivery_available" | "both";
  negotiable: boolean;
  freeDeliveryRegions?: string[];
  city: string;
  neighbourhood: string;
  phone: string;
  whatsapp: string;
  tags: string[];
  images: File[];
  videos?: File[];
  listingFee?: number;
  txRef?: string;
  providerTransactionId?: string;
}

export async function uploadProductImages(sellerId: string, images: File[]) {
  const urls: string[] = [];
  for (const image of images) {
    const fileExt = image.name.split(".").pop();
    const filePath = `${sellerId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
    const { error } = await supabase.storage.from("product-images").upload(filePath, image);
    if (error) throw error;
    const { data } = supabase.storage.from("product-images").getPublicUrl(filePath);
    urls.push(data.publicUrl);
  }
  return urls;
}

export const MAX_PRODUCT_VIDEOS = 3;

export async function uploadProductVideos(sellerId: string, videos: File[]) {
  const urls: string[] = [];
  for (const video of videos.slice(0, MAX_PRODUCT_VIDEOS)) {
    const fileExt = video.name.split(".").pop();
    const filePath = `${sellerId}/videos/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
    const { error } = await supabase.storage.from("product-images").upload(filePath, video);
    if (error) throw error;
    const { data } = supabase.storage.from("product-images").getPublicUrl(filePath);
    urls.push(data.publicUrl);
  }
  return urls;
}

export const FREE_LISTING_LIMIT = 10;

export async function getMyProductCount(sellerId: string) {
  const { count, error } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("seller_id", sellerId);
  if (error) throw error;
  return count ?? 0;
}

export async function createProduct(sellerId: string, input: ProductInput) {
  const currentCount = await getMyProductCount(sellerId);
  if (currentCount >= FREE_LISTING_LIMIT) {
    throw new Error(
      "You've reached the free launch limit of " + FREE_LISTING_LIMIT + " products. More plans are coming soon."
    );
  }

  const imageUrls = input.images.length > 0
    ? await uploadProductImages(sellerId, input.images)
    : [];

  const videoUrls = input.videos && input.videos.length > 0
    ? await uploadProductVideos(sellerId, input.videos)
    : [];

  const { data, error } = await supabase
    .from("products")
    .insert({
      seller_id: sellerId,
      title: input.title,
      description: input.description,
      category_id: input.categoryId,
      condition: input.condition,
      price: input.price,
      stock_quantity: input.stockQuantity,
      delivery_option: input.deliveryOption,
      negotiable: input.negotiable,
      free_delivery_regions: input.freeDeliveryRegions || [],
      city: input.city,
      neighbourhood: input.neighbourhood,
      phone: input.phone,
      whatsapp: input.whatsapp,
      tags: input.tags,
      images: imageUrls,
      videos: videoUrls,
      status: "pending_review",
      payment_status: "paid",
      listing_fee: 0,
      paystack_reference: input.txRef || null,
      provider_transaction_id: input.providerTransactionId || null,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getMyProducts(sellerId: string) {
  const { data, error } = await supabase
    .from("products")
    .select("*, listing_categories(name)")
    .eq("seller_id", sellerId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

function extractStoragePath(publicUrl: string) {
  const marker = "/product-images/";
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return null;
  return publicUrl.slice(idx + marker.length);
}

export async function deleteProduct(productId: string, images: string[]) {
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", productId);
  if (error) {
    if (error.code === "23503") {
      throw new Error("This product has existing orders and can't be deleted. Mark it as sold instead.");
    }
    throw error;
  }

  if (images && images.length > 0) {
    const paths = images
      .map(extractStoragePath)
      .filter(function (p): p is string { return p !== null; });
    if (paths.length > 0) {
      await supabase.storage.from("product-images").remove(paths);
    }
  }
}

export async function updateAvailability(productId: string, availability: "available" | "sold") {
  const { error } = await supabase
    .from("products")
    .update({ availability })
    .eq("id", productId);
  if (error) throw error;
}

export async function getPublishedProducts(limit: number = 12, offset: number = 0) {
  const { data, error } = await supabase
    .from("products")
    .select("id, title, price, images, city, neighbourhood, listing_categories(name), profiles(store_name)")
    .eq("status", "published")
    .eq("availability", "available")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) throw error;
  return data;
}

export async function recordProductView(productId: string, viewerId: string | null) {
  const { error } = await supabase
    .from("product_views")
    .insert({ product_id: productId, viewer_id: viewerId });
  if (error) throw error;
}

export async function getProductById(productId: string) {
  const { data, error } = await supabase
    .from("products")
    .select("*, listing_categories(id, name), profiles(store_name, phone)")
    .eq("id", productId)
    .eq("status", "published")
    .single();
  if (error) throw error;
  return data;
}

export async function getRelatedProducts(categoryId: string, excludeProductId: string, limit: number = 6) {
  const { data, error } = await supabase
    .from("products")
    .select("id, title, price, images, city, listing_categories(name), profiles(store_name)")
    .eq("status", "published")
    .eq("availability", "available")
    .eq("category_id", categoryId)
    .neq("id", excludeProductId)
    .limit(limit);
  if (error) throw error;
  return data;
}

export async function getProductsByCategory(categoryId: string) {
  const { data, error } = await supabase
    .from("products")
    .select("id, title, price, images, city, neighbourhood, listing_categories(name), profiles(store_name)")
    .eq("status", "published")
    .eq("availability", "available")
    .eq("category_id", categoryId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function searchProducts(query: string) {
  const { data, error } = await supabase
    .from("products")
    .select("id, title, price, images, city, neighbourhood, listing_categories(name), profiles(store_name)")
    .eq("status", "published")
    .eq("availability", "available")
    .ilike("title", "%" + query + "%")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getMarketplaceStats() {
  const [products, users, reviews] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }).eq("status", "published"),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("reviews").select("rating"),
  ]);

  const reviewData = reviews.data || [];
  const avgRating = reviewData.length > 0
    ? reviewData.reduce(function (sum: number, r: any) { return sum + r.rating; }, 0) / reviewData.length
    : 0;

  return {
    productCount: products.count ?? 0,
    userCount: users.count ?? 0,
    avgRating,
    reviewCount: reviewData.length,
  };
}
