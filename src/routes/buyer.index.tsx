import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Package, Heart, Wallet, MessageSquare, Truck, CheckCircle2, Clock, Star, ArrowUpRight,
} from "lucide-react";
import { PageHeader, StatCard } from "@/components/dashboard/DashboardShell";
import headphones from "@/assets/product-headphones.jpg";
import laptop from "@/assets/product-laptop.jpg";
import bag from "@/assets/product-bag.jpg";
import watch from "@/assets/product-watch.jpg";

export const Route = createFileRoute("/buyer/")({
  component: BuyerHome,
});

const ORDERS = [
  { id: "#SBU-24817", product: "MacBook Pro 14\" M3", seller: "TechPro Store", image: laptop, status: "In transit", eta: "Tomorrow" },
  { id: "#SBU-24798", product: "Sport Chronograph Watch", seller: "TimeCraft", image: watch, status: "Processing", eta: "In 3 days" },
];

const WISHLIST = [
  { name: "Wireless Headphones", price: 89000, image: headphones },
  { name: "Leather Tote — Terracotta", price: 42500, image: bag },
  { name: "Sport Watch — Orange", price: 28500, image: watch },
  { name: "MacBook Pro 14\" M3", price: 1650000, image: laptop },
];

const statusIcon: Record<string, React.ComponentType<{ className?: string }>> = {
  "In transit": Truck,
  Processing: Clock,
  Delivered: CheckCircle2,
};

function BuyerHome() {
  return (
    <div>
      <PageHeader
        title="Welcome back, Chinelo 👋"
        subtitle="Track orders, manage your wishlist and chat with sellers."
        action={
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl gradient-brand px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft"
          >
            Continue shopping
          </Link>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active orders" value="2" icon={Package} tint="primary" />
        <StatCard label="Wishlist" value="12" icon={Heart} tint="orange" />
        <StatCard label="Wallet balance" value="₦18,500" icon={Wallet} tint="success" />
        <StatCard label="Unread messages" value="1" icon={MessageSquare} tint="primary" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Active orders</h3>
            <Link to="/buyer/orders" className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
              View all <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {ORDERS.map((o) => {
              const Icon = statusIcon[o.status] ?? Clock;
              return (
                <div key={o.id} className="flex items-center gap-4 rounded-xl border border-border p-3">
                  <img src={o.image} alt="" className="h-14 w-14 rounded-lg object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-mono text-primary">{o.id}</span>
                      <span className="text-muted-foreground">· {o.seller}</span>
                    </div>
                    <div className="mt-0.5 truncate font-medium">{o.product}</div>
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Icon className="h-3.5 w-3.5 text-primary" /> {o.status} · ETA {o.eta}
                    </div>
                  </div>
                  <button className="rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary hover:text-primary-foreground">
                    Track
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <h3 className="font-semibold">Rewards</h3>
          <div className="mt-4 rounded-xl gradient-warm p-4 text-accent-orange-foreground">
            <div className="text-xs uppercase tracking-widest opacity-90">SABU Perks</div>
            <div className="mt-1 font-display text-2xl font-bold">2,480 pts</div>
            <div className="text-xs opacity-90">Silver tier · 320 pts to Gold</div>
          </div>
          <div className="mt-4 space-y-2 text-sm">
            <PerkRow icon={Star} label="Free delivery in Lagos" />
            <PerkRow icon={CheckCircle2} label="Priority customer support" />
            <PerkRow icon={Heart} label="Early access to flash deals" />
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-soft">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Your wishlist</h3>
          <Link to="/buyer/wishlist" className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
            See all 12 <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          {WISHLIST.map((w) => (
            <div key={w.name} className="group rounded-xl border border-border p-2 transition hover:shadow-soft">
              <div className="aspect-square overflow-hidden rounded-lg bg-muted">
                <img src={w.image} alt="" className="h-full w-full object-cover transition group-hover:scale-105" />
              </div>
              <div className="mt-2 line-clamp-1 text-sm font-medium">{w.name}</div>
              <div className="text-sm font-bold text-primary">₦{w.price.toLocaleString()}</div>
              <button className="mt-2 w-full rounded-lg bg-primary/10 py-1.5 text-xs font-semibold text-primary hover:bg-primary hover:text-primary-foreground">
                Add to cart
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PerkRow({ icon: Icon, label }: { icon: React.ComponentType<{ className?: string }>; label: string }) {
  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <Icon className="h-4 w-4 text-primary" /> {label}
    </div>
  );
}
