import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export const FREE_LISTING_LIMIT = 10;

export async function getMyProductCount(sellerId: string) {
  const { count, error } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("seller_id", sellerId);
  if (error) throw error;
  return count ?? 0;
}

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
  freeDeliveryLagos: boolean;
  city: string;
  neighbourhood: string;
  phone: string;
  whatsapp: string;
  tags: string[];
  images: File[];
  videos?: File[];
  listingFee: number;
  txRef: string;
  providerTransactionId: string;
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
      free_delivery_lagos: input.freeDeliveryLagos,
      city: input.city,
      neighbourhood: input.neighbourhood,
      phone: input.phone,
      whatsapp: input.whatsapp,
      tags: input.tags,
      images: imageUrls,
      videos: videoUrls,
      status: "pending_review",
      payment_status: "paid",
      listing_fee: input.listingFee,
      paystack_reference: input.txRef,
      provider_transaction_id: input.providerTransactionId,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getTeaserImages(limit: number = 30) {
  const { data, error } = await supabase
    .from("products")
    .select("images")
    .eq("status", "published")
    .eq("availability", "available")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data || [])
    .flatMap(function (product: any) { return Array.isArray(product.images) ? product.images.slice(0, 1) : []; });
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
    .select("id, title, price, images, city, neighbourhood, created_at, listing_categories(name), profiles(store_name)")
    .eq("status", "published")
    .eq("availability", "available")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) throw error;
  return data;
}

export async function getTotalUserCount() {
  const { count, error } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true });
  if (error) throw error;
  return count ?? 0;
}

export async function getRestaurantCount() {
  const { count, error } = await supabase
    .from("restaurants")
    .select("id", { count: "exact", head: true })
    .eq("is_open", true);
  if (error) return 0;
  return count ?? 0;
}

export async function getFeaturedSellers(limit: number = 8) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, store_name")
    .eq("seller_status", "approved")
    .eq("is_seller", true)
    .not("store_name", "is", null)
    .limit(limit);
  if (error) throw error;
  const sellers = data || [];
  const withDetails = await Promise.all(sellers.map(async function (seller: any) {
    const [ratingResult, productResult] = await Promise.all([
      supabase.from("reviews").select("rating").eq("seller_id", seller.id),
      supabase.from("products").select("city").eq("seller_id", seller.id)
        .eq("status", "published").order("created_at", { ascending: false }).limit(1),
    ]);
    const ratings = ratingResult.data || [];
    const avgRating = ratings.length > 0
      ? ratings.reduce(function (sum: number, r: any) { return sum + r.rating; }, 0) / ratings.length
      : 0;
    const city = productResult.data && productResult.data[0] ? productResult.data[0].city : null;
    return {
      id: seller.id,
      storeName: seller.store_name,
      avgRating,
      reviewCount: ratings.length,
      city,
    };
  }));
  return withDetails;
}

export async function getReelItems(limit: number = 30) {
  const { data, error } = await supabase
    .from("products")
    .select("id, title, price, images, videos, seller_id, profiles(store_name)")
    .eq("status", "published")
    .eq("availability", "available")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  const items: any[] = [];
  (data || []).forEach(function (p: any) {
    if (p.videos && p.videos.length > 0) {
      p.videos.forEach(function (url: string) {
        items.push({
          id: p.id + "-v-" + url,
          productId: p.id,
          type: "video",
          url,
          title: p.title,
          price: p.price,
          storeName: p.profiles ? p.profiles.store_name : "Seller",
        });
      });
    }
    if (p.images && p.images.length > 0) {
      items.push({
        id: p.id + "-i-" + p.images[0],
        productId: p.id,
        type: "image",
        url: p.images[0],
        title: p.title,
        price: p.price,
        storeName: p.profiles ? p.profiles.store_name : "Seller",
      });
    }
  });
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = items[i]; items[i] = items[j]; items[j] = tmp;
  }
  return items.slice(0, limit);
}

export async function getReelComments(productId: string) {
  const { data, error } = await supabase.from("reel_comments")
    .select("id, body, created_at, profiles(full_name)")
    .eq("product_id", productId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function postReelComment(productId: string, userId: string, body: string) {
  const { error } = await supabase.from("reel_comments")
    .insert({ product_id: productId, user_id: userId, body });
  if (error) throw error;
}

export async function subscribeToNewsletter(email: string) {
  const { error } = await supabase.from("newsletter_subscribers").insert({ email });
  if (error) {
    if (error.code === "23505") throw new Error("This email is already subscribed.");
    throw error;
  }
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
  const [products, reviews] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }).eq("status", "published"),
    supabase.from("reviews").select("rating"),
  ]);

  const reviewData = reviews.data || [];
  const avgRating = reviewData.length > 0
    ? reviewData.reduce(function (sum: number, r: any) { return sum + r.rating; }, 0) / reviewData.length
    : 0;

  return {
    productCount: products.count ?? 0,
    userCount: 0,
    avgRating,
    reviewCount: reviewData.length,
  };
}
