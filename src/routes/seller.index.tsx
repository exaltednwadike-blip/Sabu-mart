import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Package, ShoppingCart, Wallet, TrendingUp, ArrowUpRight, Clock, Upload } from "lucide-react";
import { PageHeader, StatCard } from "@/components/dashboard/DashboardShell";
import { getCurrentUser } from "@/lib/auth";
import { getMyProducts } from "@/lib/products";
import { getSellerOrderItems } from "@/lib/cart";
import { getWalletSummary } from "@/lib/wallet";

export const Route = createFileRoute("/seller/")({
  component: SellerHome,
});

function SellerHome() {
  const [stats, setStats] = useState({ liveProducts: 0, pendingOrders: 0, available: 0, totalEarned: 0 });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(function () {
    getCurrentUser().then(function (user) {
      if (!user) return;
      Promise.all([
        getMyProducts(user.id),
        getSellerOrderItems(user.id),
        getWalletSummary(user.id),
      ])
        .then(function (results) {
          const products = results[0] || [];
          const orderItems = results[1] || [];
          const wallet = results[2];

          const liveProducts = products.filter(function (p: any) { return p.status === "published"; }).length;
          const pendingOrders = orderItems.filter(function (item: any) { return item.seller_status === "pending" || item.seller_status === "confirmed"; }).length;

          setStats({
            liveProducts,
            pendingOrders,
            available: wallet.available,
            totalEarned: wallet.totalEarned,
          });
          setRecentOrders(orderItems.slice(0, 4));
        })
        .finally(function () {
          setLoading(false);
        });
    });
  }, []);

  function renderOrder(item: any) {
    return (
      <div key={item.id} className="flex items-center gap-3 rounded-xl border border-border p-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-muted">
          <Package className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium">{item.title}</div>
          <div className="text-xs text-muted-foreground">Qty {item.quantity} - ₦{Number(item.price * item.quantity).toLocaleString()}</div>
        </div>
        <span className="rounded-full bg-accent-orange/15 px-2 py-0.5 text-[11px] font-semibold text-accent-orange">
          {item.seller_status}
        </span>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Store overview"
        subtitle="Here's how your store is doing."
        action={
          <Link
            to="/seller/upload"
            className="inline-flex items-center gap-2 rounded-xl gradient-brand px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft"
          >
            <Upload className="h-4 w-4" /> Upload product
          </Link>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Live products" value={loading ? "-" : String(stats.liveProducts)} icon={Package} tint="primary" />
        <StatCard label="Orders to fulfil" value={loading ? "-" : String(stats.pendingOrders)} icon={ShoppingCart} tint="orange" />
        <StatCard label="Available balance" value={loading ? "-" : "₦" + stats.available.toLocaleString()} icon={Wallet} tint="success" />
        <StatCard label="Total earned" value={loading ? "-" : "₦" + stats.totalEarned.toLocaleString()} icon={TrendingUp} tint="primary" />
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-soft">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Recent orders</h3>
          <Link to="/seller/orders" className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
            View all <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="mt-4 space-y-3">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : recentOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground">No orders yet.</p>
          ) : (
            recentOrders.map(renderOrder)
          )}
        </div>
      </div>
    </div>
  );
}
