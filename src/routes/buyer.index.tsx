import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Package, Heart, ShoppingBag, CheckCircle2, Clock, Star, ArrowUpRight, Store, Truck,
} from "lucide-react";
import { PageHeader, StatCard } from "@/components/dashboard/DashboardShell";
import { getCurrentUser, getProfile } from "@/lib/auth";
import { getMyOrders, getBuyerStats } from "@/lib/cart";
import { getWishlist, getWishlistCount } from "@/lib/wishlist";

export const Route = createFileRoute("/buyer/")({
  component: BuyerHome,
});

const statusIcon: { [key: string]: any } = {
  processing: Package,
  shipped: Truck,
  delivered: CheckCircle2,
};

function BuyerHome() {
  const [sellerStatus, setSellerStatus] = useState<string>("none");
  const [fullName, setFullName] = useState("");
  const [stats, setStats] = useState({ activeOrders: 0, completedOrders: 0, totalSpent: 0 });
  const [wishCount, setWishCount] = useState(0);
  const [activeOrders, setActiveOrders] = useState<any[]>([]);
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(function () {
    getCurrentUser().then(function (user) {
      if (!user) return;
      Promise.all([
        getProfile(user.id).catch(function () { return null; }),
        getBuyerStats(user.id),
        getWishlistCount(user.id),
        getMyOrders(user.id),
        getWishlist(user.id),
      ])
        .then(function (results) {
          const profile = results[0];
          if (profile) {
            setSellerStatus(profile.seller_status ?? "none");
            setFullName((profile.full_name || "").split(" ")[0] || "there");
          }
          setStats(results[1]);
          setWishCount(results[2]);
          const orders = results[3] || [];
          setActiveOrders(orders.filter(function (o: any) { return o.status !== "delivered" && o.status !== "cancelled"; }).slice(0, 3));
          setWishlist((results[4] || []).slice(0, 4));
        })
        .finally(function () {
          setLoading(false);
        });
    });
  }, []);

  function renderActiveOrder(o: any) {
    const items = o.order_items || [];
    const firstItem = items[0];
    const Icon = statusIcon[o.status] || Clock;
    return (
      <div key={o.id} className="flex items-center gap-4 rounded-xl border border-border p-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-muted">
          <Package className="h-6 w-6 text-muted-foreground" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-mono text-primary">#{o.id.slice(0, 8).toUpperCase()}</span>
            <span className="text-muted-foreground">- {items.length} item{items.length !== 1 ? "s" : ""}</span>
          </div>
          <div className="mt-0.5 truncate font-medium">{firstItem ? firstItem.title : "Order"}</div>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Icon className="h-3.5 w-3.5 text-primary" /> {o.status}
          </div>
        </div>
        <Link to="/buyer/orders" className="rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary hover:text-primary-foreground">
          View
        </Link>
      </div>
    );
  }

  function renderWishlistItem(item: any) {
    const p = item.products;
    const image = p.images && p.images.length > 0 ? p.images[0] : null;
    return (
      <Link key={item.id} to="/product/$productId" params={{ productId: p.id }} className="group rounded-xl border border-border p-2 transition hover:shadow-soft">
        <div className="aspect-square overflow-hidden rounded-lg bg-muted">
          {image ? (
            <img src={image} alt="" className="h-full w-full object-cover transition group-hover:scale-105" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">No image</div>
          )}
        </div>
        <div className="mt-2 line-clamp-1 text-sm font-medium">{p.title}</div>
        <div className="text-sm font-bold text-primary">₦{Number(p.price).toLocaleString()}</div>
      </Link>
    );
  }

  return (
    <div>
      <PageHeader
        title={"Welcome back, " + fullName + " \uD83D\uDC4B"}
        subtitle="Track orders, manage your wishlist and shop with confidence."
        action={
          <div className="flex flex-wrap gap-2">
            <SellerCta status={sellerStatus} />
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-xl gradient-brand px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft"
            >
              Continue shopping
            </Link>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active orders" value={loading ? "-" : String(stats.activeOrders)} icon={Package} tint="primary" />
        <StatCard label="Completed orders" value={loading ? "-" : String(stats.completedOrders)} icon={CheckCircle2} tint="success" />
        <StatCard label="Wishlist" value={loading ? "-" : String(wishCount)} icon={Heart} tint="orange" />
        <StatCard label="Total spent" value={loading ? "-" : "₦" + stats.totalSpent.toLocaleString()} icon={ShoppingBag} tint="primary" />
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-soft">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Active orders</h3>
          <Link to="/buyer/orders" className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
            View all <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="mt-4 space-y-3">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : activeOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active orders right now.</p>
          ) : (
            activeOrders.map(renderActiveOrder)
          )}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-soft">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Your wishlist</h3>
          <Link to="/buyer/wishlist" className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
            See all ({wishCount}) <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : wishlist.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nothing saved yet.</p>
          ) : (
            wishlist.map(renderWishlistItem)
          )}
        </div>
      </div>
    </div>
  );
}

function SellerCta({ status }: { status: string }) {
  if (status === "pending") {
    return (
      <span className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold text-muted-foreground">
        <Clock className="h-4 w-4" /> Application under review
      </span>
    );
  }
  if (status === "rejected") {
    return (
      <Link
        to="/buyer/become-seller"
        className="inline-flex items-center gap-2 rounded-xl border border-destructive px-4 py-2 text-sm font-semibold text-destructive shadow-soft hover:bg-destructive/5"
      >
        <Store className="h-4 w-4" /> Application rejected - reapply
      </Link>
    );
  }
  if (status === "approved") {
    return null;
  }
  return (
    <Link
      to="/buyer/become-seller"
      className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold shadow-soft hover:bg-accent"
    >
      <Store className="h-4 w-4" /> Become a seller
    </Link>
  );
}
