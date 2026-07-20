import { createClient } from "./supabase/client";

const supabase = createClient();

export async function addToCart(buyerId: string, productId: string, quantity: number = 1) {
  const { data: existing } = await supabase
    .from("cart_items")
    .select("id, quantity")
    .eq("buyer_id", buyerId)
    .eq("product_id", productId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("cart_items")
      .update({ quantity: existing.quantity + quantity })
      .eq("id", existing.id);
    if (error) throw error;
    return;
  }

  const { error } = await supabase
    .from("cart_items")
    .insert({ buyer_id: buyerId, product_id: productId, quantity });
  if (error) throw error;
}

export async function getCart(buyerId: string) {
  const { data, error } = await supabase
    .from("cart_items")
    .select("id, quantity, products(id, title, price, images, city, stock_quantity, seller_id, profiles(store_name))")
    .eq("buyer_id", buyerId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function updateCartQuantity(cartItemId: string, quantity: number) {
  if (quantity <= 0) {
    return removeFromCart(cartItemId);
  }
  const { error } = await supabase
    .from("cart_items")
    .update({ quantity })
    .eq("id", cartItemId);
  if (error) throw error;
}

export async function removeFromCart(cartItemId: string) {
  const { error } = await supabase
    .from("cart_items")
    .delete()
    .eq("id", cartItemId);
  if (error) throw error;
}

export async function getCartCount(buyerId: string) {
  const { count, error } = await supabase
    .from("cart_items")
    .select("id", { count: "exact", head: true })
    .eq("buyer_id", buyerId);
  if (error) return 0;
  return count ?? 0;
}

interface CheckoutInput {
  deliveryAddress: string;
  deliveryCity: string;
  deliveryPhone: string;
  paystackReference: string;
}

export async function checkout(buyerId: string, input: CheckoutInput) {
  const cart = await getCart(buyerId);
  if (!cart || cart.length === 0) throw new Error("Your cart is empty.");

  const subtotal = cart.reduce((sum: number, item: any) => {
    return sum + Number(item.products.price) * item.quantity;
  }, 0);

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      buyer_id: buyerId,
      status: "processing",
      delivery_address: input.deliveryAddress,
      delivery_city: input.deliveryCity,
      delivery_phone: input.deliveryPhone,
      subtotal,
      total: subtotal,
      paystack_reference: input.paystackReference,
      paid_at: new Date().toISOString(),
    })
    .select()
    .single();
  if (orderError) throw orderError;

  const items = cart.map((item: any) => ({
    order_id: order.id,
    product_id: item.products.id,
    seller_id: item.products.seller_id,
    title: item.products.title,
    price: item.products.price,
    quantity: item.quantity,
    seller_status: "pending",
  }));

  const { error: itemsError } = await supabase.from("order_items").insert(items);
  if (itemsError) throw itemsError;

  const cartIds = cart.map((item: any) => item.id);
  await supabase.from("cart_items").delete().in("id", cartIds);

  return order;
}

export async function getMyOrders(buyerId: string) {
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("buyer_id", buyerId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getSellerOrderItems(sellerId: string) {
  const { data, error } = await supabase
    .from("order_items")
    .select("*, orders(delivery_address, delivery_city, delivery_phone, status, created_at)")
    .eq("seller_id", sellerId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function updateSellerOrderStatus(orderItemId: string, status: string) {
  const { error } = await supabase
    .from("order_items")
    .update({ seller_status: status })
    .eq("id", orderItemId);
  if (error) throw error;
}

export async function getBuyerStats(buyerId: string) {
  const { data: orders, error } = await supabase
    .from("orders")
    .select("id, status, total")
    .eq("buyer_id", buyerId);
  if (error) throw error;

  const activeOrders = (orders || []).filter(function (o) {
    return o.status !== "delivered" && o.status !== "cancelled";
  }).length;

  const completedOrders = (orders || []).filter(function (o) {
    return o.status === "delivered";
  }).length;

  const totalSpent = (orders || []).reduce(function (sum, o) {
    return sum + Number(o.total);
  }, 0);

  return { activeOrders, completedOrders, totalSpent };
}
