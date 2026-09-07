import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Trash2, Minus, Plus, ShoppingBag } from "lucide-react";
import { PageHeader } from "@/components/dashboard/DashboardShell";
import { getCurrentUser } from "@/lib/auth";
import { getCart, updateCartQuantity, removeFromCart } from "@/lib/cart";

export const Route = createFileRoute("/buyer/cart")({
  component: BuyerCart,
});

function BuyerCart() {
  const navigate = useNavigate();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    getCurrentUser()
      .then(function (user) {
        if (!user) return [];
        return getCart(user.id);
      })
      .then(function (data) {
        setItems(data || []);
      })
      .finally(function () {
        setLoading(false);
      });
  }

  useEffect(function () {
    load();
  }, []);

  function handleQuantityChange(cartItemId: string, newQty: number) {
    updateCartQuantity(cartItemId, newQty).then(load);
  }

  function handleRemove(cartItemId: string) {
    removeFromCart(cartItemId).then(load);
  }

  function renderItem(item: any) {
    const product = item.products;
    const image = product.images && product.images.length > 0 ? product.images[0] : null;
    const sellerName = product.profiles && product.profiles.store_name ? product.profiles.store_name : "SABU Seller";
    const lineTotal = Number(product.price) * item.quantity;

    return (
      <div key={item.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-soft">
        {image ? (
          <img src={image} alt="" className="h-16 w-16 rounded-xl object-cover" />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-muted text-xs text-muted-foreground">No image</div>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="font-medium">{product.title}</h3>
          <p className="text-xs text-muted-foreground">Sold by {sellerName}</p>
          <p className="mt-1 font-semibold text-primary">₦{Number(product.price).toLocaleString()}</p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-border px-2 py-1">
          <button
            onClick={function () { handleQuantityChange(item.id, item.quantity - 1); }}
            className="rounded p-1 hover:bg-accent"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
          <button
            onClick={function () { handleQuantityChange(item.id, item.quantity + 1); }}
            className="rounded p-1 hover:bg-accent"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="w-24 text-right font-semibold">₦{lineTotal.toLocaleString()}</div>
        <button
          onClick={function () { handleRemove(item.id); }}
          className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    );
  }

  const subtotal = items.reduce(function (sum: number, item: any) {
    return sum + Number(item.products.price) * item.quantity;
  }, 0);

  return (
    <div>
      <PageHeader title="My cart" subtitle="Review your items before checkout." />

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center">
          <ShoppingBag className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">Your cart is empty.</p>
          <Link to="/" className="mt-3 inline-block text-sm font-semibold text-primary hover:underline">
            Continue shopping
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-3 lg:col-span-2">
            {items.map(renderItem)}
          </div>
          <aside className="rounded-2xl border border-border bg-card p-6 shadow-soft lg:sticky lg:top-20 lg:self-start">
            <h3 className="font-semibold">Order summary</h3>
            <div className="mt-4 flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">₦{subtotal.toLocaleString()}</span>
            </div>
            <div className="mt-4 flex justify-between border-t border-border pt-4">
              <span className="font-semibold">Total</span>
              <span className="font-display text-xl font-bold text-primary">₦{subtotal.toLocaleString()}</span>
            </div>
            <button
              onClick={function () { navigate({ to: "/buyer/checkout" }); }}
              className="mt-5 w-full rounded-xl gradient-brand py-3 text-sm font-semibold text-primary-foreground shadow-soft transition hover:opacity-90"
            >
              Proceed to checkout
            </button>
          </aside>
        </div>
      )}
    </div>
  );
}
