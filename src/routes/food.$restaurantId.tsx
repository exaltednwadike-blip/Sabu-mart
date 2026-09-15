import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { Minus, Plus, MapPin, BadgeCheck, Clock3, ShoppingBag } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { FoodCartProvider, useFoodCart } from "@/lib/food-cart-context";
import { getMenuItems, getRestaurantById } from "@/lib/food";

export const Route = createFileRoute("/food/$restaurantId")({
  component: RestaurantDetailPage,
});

function RestaurantDetailPage() {
  return (
    <FoodCartProvider>
      <RestaurantDetailPageInner />
    </FoodCartProvider>
  );
}

function RestaurantDetailPageInner() {
  const { restaurantId } = Route.useParams();
  const { cart, addItem, updateQuantity, removeItem } = useFoodCart();
  const [restaurant, setRestaurant] = useState<any>(null);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(function () {
    Promise.all([
      getRestaurantById(restaurantId),
      getMenuItems(restaurantId),
    ])
      .then(function (results) {
        setRestaurant(results[0]);
        setMenuItems(results[1] || []);
      })
      .finally(function () {
        setLoading(false);
      });
  }, [restaurantId]);

  const subtotal = useMemo(function () {
    if (!cart.items.length) return 0;
    return cart.items.reduce(function (sum, item) {
      return sum + item.price * item.quantity;
    }, 0);
  }, [cart.items]);

  function handleAdjust(menuItem: any, nextQty: number) {
    const existingItem = cart.items.find(function (item) {
      return item.menuItemId === menuItem.id;
    });

    if (nextQty <= 0) {
      if (existingItem) removeItem(menuItem.id);
      return;
    }

    if (existingItem) {
      updateQuantity(menuItem.id, nextQty);
      return;
    }

    addItem(restaurantId, restaurant.name, {
      id: menuItem.id,
      name: menuItem.name,
      price: Number(menuItem.price),
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <main className="mx-auto max-w-6xl px-4 py-12">
          <p className="text-sm text-muted-foreground">Loading restaurant...</p>
        </main>
        <SiteFooter />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <main className="mx-auto max-w-6xl px-4 py-12">
          <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
            Restaurant not found.
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-8 md:py-10">
        <div className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-soft">
          <div className="relative h-64 w-full md:h-80">
            {restaurant.cover_image ? (
              <img src={restaurant.cover_image} alt={restaurant.name} className="h-full w-full object-cover" />
            ) : null}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5 md:p-8">
              <div className="flex flex-wrap items-center gap-2">
                <span className={"inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold " + (restaurant.is_open ? "bg-success/15 text-success" : "bg-muted text-muted-foreground")}>
                  {restaurant.is_open ? "Open now" : "Closed"}
                </span>
                {restaurant.cuisine ? (
                  <span className="rounded-full bg-background/10 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
                    {restaurant.cuisine}
                  </span>
                ) : null}
              </div>
              <h1 className="mt-3 font-display text-3xl font-bold text-white md:text-5xl">{restaurant.name}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-white/90">
                <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {restaurant.area || "Local area"}, {restaurant.state}</span>
                <span className="inline-flex items-center gap-1.5"><BadgeCheck className="h-4 w-4" /> {restaurant.cuisine || "Popular dishes"}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-2xl font-bold">Menu</h2>
            <span className="text-sm text-muted-foreground">{menuItems.length} items</span>
          </div>

          {menuItems.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
              This restaurant has no menu items yet.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {menuItems.map(function (menuItem) {
                const cartQty = cart.items.find(function (item) { return item.menuItemId === menuItem.id; })?.quantity ?? 0;
                return (
                  <article key={menuItem.id} className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
                    <div className="relative h-48 w-full overflow-hidden bg-muted">
                      {menuItem.media_url ? (
                        menuItem.media_type === "video" ? (
                          <video src={menuItem.media_url} controls className="h-full w-full object-cover" />
                        ) : (
                          <img src={menuItem.media_url} alt={menuItem.name} className="h-full w-full object-cover" />
                        )
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No media</div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-semibold text-foreground">{menuItem.name}</h3>
                          <p className="mt-1 text-sm text-muted-foreground">{menuItem.description || "Freshly prepared and served with care."}</p>
                        </div>
                        <span className="font-display text-xl font-bold text-primary">₦{Number(menuItem.price).toLocaleString()}</span>
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-3">
                        <div className="inline-flex items-center rounded-full border border-border bg-background">
                          <button
                            type="button"
                            onClick={function () { handleAdjust(menuItem, cartQty - 1); }}
                            className="p-2 text-muted-foreground hover:text-foreground"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="min-w-8 text-center text-sm font-semibold">{cartQty}</span>
                          <button
                            type="button"
                            onClick={function () { handleAdjust(menuItem, cartQty + 1); }}
                            className="p-2 text-muted-foreground hover:text-foreground"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={function () { handleAdjust(menuItem, cartQty + 1); }}
                          className="inline-flex items-center gap-2 rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
                        >
                          <ShoppingBag className="h-4 w-4" /> Add
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {cart.restaurantId === restaurantId && cart.items.length > 0 ? (
        <div className="sticky bottom-0 border-t border-border bg-background/95 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Order</div>
              <div className="text-sm font-semibold text-foreground">{cart.items.reduce(function (sum, item) { return sum + item.quantity; }, 0)} items · ₦{subtotal.toLocaleString()}</div>
            </div>
            <Link to="/food/cart" className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft hover:opacity-90">
              View order
            </Link>
          </div>
        </div>
      ) : null}

      <SiteFooter />
    </div>
  );
}
