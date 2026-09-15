import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export interface Restaurant {
  id: string;
  name: string;
  state: string;
  area: string | null;
  description: string | null;
  cuisine: string | null;
  cover_image: string | null;
  is_open: boolean;
  created_at: string;
}

export interface MenuItem {
  id: string;
  restaurant_id: string;
  name: string;
  price: number;
  description: string | null;
  media_url: string | null;
  media_type: "image" | "video" | null;
}

export async function getRestaurants() {
  const { data, error } = await supabase
    .from("restaurants")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as Restaurant[];
}

export async function getRestaurantById(id: string) {
  const { data, error } = await supabase
    .from("restaurants")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as Restaurant;
}

export async function getMenuItems(restaurantId: string) {
  const { data, error } = await supabase
    .from("restaurant_menu_items")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data as MenuItem[];
}

export async function uploadRestaurantMedia(file: File, folder: string) {
  const fileExt = file.name.split(".").pop();
  const filePath = "restaurants/" + folder + "/" + Date.now() + "-" + Math.random().toString(36).slice(2) + "." + fileExt;
  const { error } = await supabase.storage.from("product-images").upload(filePath, file);
  if (error) throw error;
  const { data } = supabase.storage.from("product-images").getPublicUrl(filePath);
  return data.publicUrl;
}

export async function createRestaurant(input: {
  name: string;
  state: string;
  area: string;
  description: string;
  cuisine: string;
  coverImage: File | null;
  createdBy: string;
  menuItems: { name: string; price: number; description: string; media: File | null }[];
}) {
  let coverUrl: string | null = null;
  if (input.coverImage) {
    coverUrl = await uploadRestaurantMedia(input.coverImage, "covers");
  }

  const { data: restaurant, error } = await supabase
    .from("restaurants")
    .insert({
      name: input.name,
      state: input.state,
      area: input.area,
      description: input.description,
      cuisine: input.cuisine,
      cover_image: coverUrl,
      created_by: input.createdBy,
    })
    .select()
    .single();
  if (error) throw error;

  for (const item of input.menuItems) {
    let mediaUrl: string | null = null;
    let mediaType: "image" | "video" | null = null;
    if (item.media) {
      mediaUrl = await uploadRestaurantMedia(item.media, "menu");
      mediaType = item.media.type.startsWith("video") ? "video" : "image";
    }
    const { error: itemError } = await supabase.from("restaurant_menu_items").insert({
      restaurant_id: restaurant.id,
      name: item.name,
      price: item.price,
      description: item.description,
      media_url: mediaUrl,
      media_type: mediaType,
    });
    if (itemError) throw itemError;
  }

  return restaurant;
}

export async function deleteRestaurant(id: string) {
  const { error } = await supabase.from("restaurants").delete().eq("id", id);
  if (error) throw error;
}

export async function toggleRestaurantOpen(id: string, isOpen: boolean) {
  const { error } = await supabase
    .from("restaurants")
    .update({ is_open: isOpen })
    .eq("id", id);
  if (error) throw error;
}

export interface FoodCartItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}

export async function placeFoodOrder(input: {
  buyerId: string;
  restaurantId: string;
  items: FoodCartItem[];
  deliveryAddress: string;
  deliveryPhone: string;
  note: string;
}) {
  const subtotal = input.items.reduce(function (sum, i) {
    return sum + i.price * i.quantity;
  }, 0);
  const deliveryFee = 500;
  const serviceFee = 150;
  const total = subtotal + deliveryFee + serviceFee;

  const { data: order, error } = await supabase
    .from("food_orders")
    .insert({
      buyer_id: input.buyerId,
      restaurant_id: input.restaurantId,
      delivery_address: input.deliveryAddress,
      delivery_phone: input.deliveryPhone,
      note: input.note,
      subtotal,
      delivery_fee: deliveryFee,
      service_fee: serviceFee,
      total,
    })
    .select()
    .single();
  if (error) throw error;

  const itemRows = input.items.map(function (i) {
    return {
      order_id: order.id,
      menu_item_id: i.menuItemId,
      item_name: i.name,
      price: i.price,
      quantity: i.quantity,
    };
  });

  const { error: itemsError } = await supabase.from("food_order_items").insert(itemRows);
  if (itemsError) throw itemsError;

  return order;
}

export async function getFoodOrder(orderId: string) {
  const { data, error } = await supabase
    .from("food_orders")
    .select("*, restaurants(name, cover_image), food_order_items(*)")
    .eq("id", orderId)
    .single();
  if (error) throw error;
  return data;
}

export async function getMyFoodOrders(buyerId: string) {
  const { data, error } = await supabase
    .from("food_orders")
    .select("*, restaurants(name, cover_image)")
    .eq("buyer_id", buyerId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getAllFoodOrders(status?: string) {
  let query = supabase
    .from("food_orders")
    .select("*, restaurants(name), profiles(full_name, phone)")
    .order("created_at", { ascending: false });
  if (status) query = query.eq("status", status);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function updateFoodOrderStatus(orderId: string, status: string) {
  const { error } = await supabase
    .from("food_orders")
    .update({ status })
    .eq("id", orderId);
  if (error) throw error;
}
