import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Heart, MapPin, Trash2, ShoppingCart } from "lucide-react";
import { PageHeader } from "@/components/dashboard/DashboardShell";
import { getCurrentUser } from "@/lib/auth";
import { getWishlist, toggleWishlist } from "@/lib/wishlist";
import { addToCart } from "@/lib/cart";

export const Route = createFileRoute("/buyer/wishlist")({
  component: BuyerWishlist,
});

function BuyerWishlist() {
  const navigate = useNavigate();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    getCurrentUser()
      .then(function (user) {
        if (!user) return [];
        return getWishlist(user.id);
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

  function handleRemove(productId: string) {
    getCurrentUser().then(function (user) {
      if (!user) return;
      toggleWishlist(user.id, productId).then(load);
    });
  }

  function handleAddToCart(productId: string) {
    getCurrentUser().then(function (user) {
      if (!user) {
        navigate({ to: "/login" });
        return;
      }
      addToCart(user.id, productId, 1);
    });
  }

  function renderItem(item: any) {
    const p = item.products;
    const image = p.images && p.images.length > 0 ? p.images[0] : null;
    const sellerName = p.profiles && p.profiles.store_name ? p.profiles.store_name : "SABU Seller";

    return (
      <div key={item.id} className="group rounded-xl border border-border p-2 transition hover:shadow-soft">
        <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
          {image ? (
            <img src={image} alt="" className="h-full w-full object-cover transition group-hover:scale-105" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">No image</div>
          )}
          <button
            onClick={function () { handleRemove(p.id); }}
            className="absolute right-2 top-2 rounded-full bg-background/90 p-1.5 text-destructive shadow-soft"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="mt-2 line-clamp-1 text-sm font-medium">{p.title}</div>
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <MapPin className="h-3 w-3" /> {p.city}
        </div>
        <div className="text-sm font-bold text-primary">₦{Number(p.price).toLocaleString()}</div>
        <div className="text-[11px] text-muted-foreground">{sellerName}</div>
        <button
          onClick={function () { handleAddToCart(p.id); }}
          className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary/10 py-1.5 text-xs font-semibold text-primary hover:bg-primary hover:text-primary-foreground"
        >
          <ShoppingCart className="h-3.5 w-3.5" /> Add to cart
        </button>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="My wishlist" subtitle="Products you've saved for later." />

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center">
          <Heart className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">Your wishlist is empty.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {items.map(renderItem)}
        </div>
      )}
    </div>
  );
}
