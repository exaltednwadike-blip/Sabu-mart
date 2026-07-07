import { createFileRoute } from "@tanstack/react-router";
import { Truck, CheckCircle2, Clock, MessageSquare, Star, X } from "lucide-react";
import { PageHeader } from "@/components/dashboard/DashboardShell";
import headphones from "@/assets/product-headphones.jpg";
import laptop from "@/assets/product-laptop.jpg";
import bag from "@/assets/product-bag.jpg";
import watch from "@/assets/product-watch.jpg";
import phone from "@/assets/cat-phones.jpg";

export const Route = createFileRoute("/buyer/orders")({
  component: BuyerOrders,
});

const ORDERS = [
  { id: "#SBU-24817", product: "MacBook Pro 14\" M3", seller: "TechPro Store", image: laptop, amount: 1650000, status: "In transit", date: "Today" },
  { id: "#SBU-24798", product: "Sport Chronograph Watch", seller: "TimeCraft", image: watch, amount: 28500, status: "Processing", date: "Yesterday" },
  { id: "#SBU-24721", product: "Wireless Headphones", seller: "SoundHub NG", image: headphones, amount: 89000, status: "Delivered", date: "Last week" },
  { id: "#SBU-24688", product: "Leather Tote — Terracotta", seller: "Kano Leatherworks", image: bag, amount: 42500, status: "Delivered", date: "2 weeks ago" },
  { id: "#SBU-24601", product: "Samsung Galaxy A55", seller: "MobileHub", image: phone, amount: 385000, status: "Cancelled", date: "Last month" },
];

const statusMeta: Record<string, { color: string; icon: React.ComponentType<{ className?: string }> }> = {
  "In transit": { color: "bg-primary/10 text-primary", icon: Truck },
  Processing: { color: "bg-accent-orange/15 text-accent-orange", icon: Clock },
  Delivered: { color: "bg-success/10 text-success", icon: CheckCircle2 },
  Cancelled: { color: "bg-destructive/10 text-destructive", icon: X },
};

const TABS = ["All", "In transit", "Processing", "Delivered", "Cancelled"];

function BuyerOrders() {
  return (
    <div>
      <PageHeader title="My orders" subtitle="Track and manage every purchase." />

      <div className="mb-4 flex flex-wrap gap-2 rounded-2xl border border-border bg-card p-2 shadow-soft">
        {TABS.map((t, i) => (
          <button
            key={t}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              i === 0 ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {ORDERS.map((o) => {
          const meta = statusMeta[o.status];
          const Icon = meta.icon;
          return (
            <article key={o.id} className="rounded-2xl border border-border bg-card p-4 shadow-soft">
              <div className="flex flex-wrap items-start gap-4">
                <img src={o.image} alt="" className="h-20 w-20 rounded-xl object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-mono text-primary">{o.id}</span>
                    <span className="text-muted-foreground">· {o.date}</span>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${meta.color}`}>
                      <Icon className="h-3 w-3" /> {o.status}
                    </span>
                  </div>
                  <h3 className="mt-1 font-semibold">{o.product}</h3>
                  <div className="text-xs text-muted-foreground">Sold by {o.seller}</div>
                  <div className="mt-2 font-display text-lg font-bold">₦{o.amount.toLocaleString()}</div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-accent">
                    <MessageSquare className="h-3.5 w-3.5" /> Chat seller
                  </button>
                  {o.status === "Delivered" ? (
                    <button className="inline-flex items-center gap-1 rounded-lg bg-accent-orange px-3 py-1.5 text-xs font-semibold text-accent-orange-foreground">
                      <Star className="h-3.5 w-3.5" /> Review
                    </button>
                  ) : (
                    <button className="inline-flex items-center gap-1 rounded-lg gradient-brand px-3 py-1.5 text-xs font-semibold text-primary-foreground">
                      <Truck className="h-3.5 w-3.5" /> Track order
                    </button>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
