import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { getCurrentUser, getProfile } from "@/lib/auth";
import { FoodCartProvider, useFoodCart } from "@/lib/food-cart-context";
import { placeFoodOrder } from "@/lib/food";

export const Route = createFileRoute("/food/cart")({
  component: FoodCartPage,
});

function FoodCartPage() {
  return (
    <FoodCartProvider>
      <FoodCartPageInner />
    </FoodCartProvider>
  );
}

function FoodCartPageInner() {
  const navigate = useNavigate();
  const { cart, removeItem, updateQuantity, subtotal, clearCart } = useFoodCart();
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(function () {
    if (!cart.items.length) {
      navigate({ to: "/food" });
      return;
    }

    getCurrentUser().then(function (user) {
      if (!user) {
        navigate({ to: "/login" });
        return;
      }
      setUserId(user.id);
      getProfile(user.id)
        .then(function (profile) {
          setPhone(profile.phone || "");
        })
        .catch(function () {
          setPhone("");
        });
    });
  }, [cart.items.length, navigate]);

  function handleAdjust(menuItemId: string, qty: number) {
    if (qty <= 0) {
      removeItem(menuItemId);
      return;
    }
    updateQuantity(menuItemId, qty);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userId || !cart.restaurantId) {
      navigate({ to: "/login" });
      return;
    }
    if (!address.trim() || !phone.trim()) {
      setError("Please add your delivery address and phone number.");
      return;
    }

    setSubmitting(true);
    placeFoodOrder({
      buyerId: userId,
      restaurantId: cart.restaurantId,
      items: cart.items.map(function (item) {
        return {
          menuItemId: item.menuItemId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        };
      }),
      deliveryAddress: address.trim(),
      deliveryPhone: phone.trim(),
      note: note.trim(),
    })
      .then(function (order) {
        clearCart();
        navigate({ to: "/food/track/" + order.id });
      })
      .catch(function (err) {
        setError(err instanceof Error ? err.message : "Could not place order.");
      })
      .finally(function () {
        setSubmitting(false);
      });
  }

  const deliveryFee = 500;
  const serviceFee = 150;
  const total = subtotal + deliveryFee + serviceFee;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-8 md:py-10">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold">Your order</h1>
            <p className="text-sm text-muted-foreground">{cart.restaurantName || "Restaurant"}</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            {cart.items.map(function (item) {
              return (
                <div key={item.menuItemId} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft">
                  <div>
                    <div className="font-semibold text-foreground">{item.name}</div>
                    <div className="text-sm text-muted-foreground">₦{Number(item.price).toLocaleString()} each</div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="inline-flex items-center rounded-full border border-border bg-background">
                      <button type="button" onClick={function () { handleAdjust(item.menuItemId, item.quantity - 1); }} className="p-2 text-muted-foreground hover:text-foreground"><Minus className="h-4 w-4" /></button>
                      <span className="min-w-8 text-center text-sm font-semibold">{item.quantity}</span>
                      <button type="button" onClick={function () { handleAdjust(item.menuItemId, item.quantity + 1); }} className="p-2 text-muted-foreground hover:text-foreground"><Plus className="h-4 w-4" /></button>
                    </div>
                    <button type="button" onClick={function () { removeItem(item.menuItemId); }} className="inline-flex items-center gap-1 rounded-lg border border-destructive px-2.5 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/5">
                      <Trash2 className="h-3.5 w-3.5" /> Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <aside className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <h2 className="font-semibold text-foreground">Order summary</h2>
            <div className="mt-4 space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center justify-between"><span>Subtotal</span><span className="font-medium text-foreground">₦{subtotal.toLocaleString()}</span></div>
              <div className="flex items-center justify-between"><span>Delivery fee</span><span className="font-medium text-foreground">₦{deliveryFee.toLocaleString()}</span></div>
              <div className="flex items-center justify-between"><span>Service fee</span><span className="font-medium text-foreground">₦{serviceFee.toLocaleString()}</span></div>
              <div className="flex items-center justify-between border-t border-border pt-3 text-base font-bold text-foreground"><span>Total</span><span>₦{total.toLocaleString()}</span></div>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <label className="block space-y-2 text-sm">
                <span>Delivery address</span>
                <textarea
                  rows={4}
                  value={address}
                  onChange={function (e) { setAddress(e.target.value); }}
                  placeholder="Your full delivery address"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
                />
              </label>

              <label className="block space-y-2 text-sm">
                <span>Phone number</span>
                <input
                  value={phone}
                  onChange={function (e) { setPhone(e.target.value); }}
                  placeholder="Your phone number"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
                />
              </label>

              <label className="block space-y-2 text-sm">
                <span>Note (optional)</span>
                <textarea
                  rows={3}
                  value={note}
                  onChange={function (e) { setNote(e.target.value); }}
                  placeholder="Add delivery instructions"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
                />
              </label>

              <div className="rounded-xl border border-dashed border-border bg-muted/30 p-3 text-xs text-muted-foreground">
                Payment on delivery — pay the rider directly when your order arrives. Online payment is coming soon.
              </div>

              {error ? <p className="text-sm text-destructive">{error}</p> : null}

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex w-full items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
              >
                {submitting ? "Placing order..." : "Place order"}
              </button>
            </form>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
