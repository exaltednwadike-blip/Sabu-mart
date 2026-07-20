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
  freeDeliveryLagos: boolean;
  city: string;
  neighbourhood: string;
  phone: string;
  whatsapp: string;
  tags: string[];
  images: File[];
  listingFee: number;
  paystackReference: string;
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

export async function createProduct(sellerId: string, input: ProductInput) {
  const imageUrls = input.images.length > 0
    ? await uploadProductImages(sellerId, input.images)
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
      status: "pending_review",
      payment_status: "paid",
      listing_fee: input.listingFee,
      paystack_reference: input.paystackReference,
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

export async function deleteProduct(productId: string) {
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", productId);
  if (error) throw error;
}

export async function getPublishedProducts(limit: number = 12) {
  const { data, error } = await supabase
    .from("products")
    .select("id, title, price, images, city, neighbourhood, listing_categories(name), profiles(store_name)")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
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
    .eq("category_id", categoryId)
    .neq("id", excludeProductId)
    .limit(limit);
  if (error) throw error;
  return data;
}
