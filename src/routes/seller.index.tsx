import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Wallet, Package, ShoppingCart, TrendingUp, Eye, Star, MessageSquare, ArrowUpRight, Upload,
} from "lucide-react";
import { PageHeader, StatCard } from "@/components/dashboard/DashboardShell";

export const Route = createFileRoute("/seller/")({
  component: SellerHome,
});

const RECENT_ORDERS = [
  { id: "#SBU-24817", buyer: "Chinelo A.", product: "MacBook Pro 14\" M3", amount: 1650000, status: "Paid" },
  { id: "#SBU-24812", buyer: "Musa I.", product: "Wireless Headphones", amount: 89000, status: "Shipped" },
  { id: "#SBU-24803", buyer: "Bukola O.", product: "Samsung Galaxy A55", amount: 385000, status: "Pending" },
  { id: "#SBU-24798", buyer: "Femi K.", product: "Sport Chronograph Watch", amount: 28500, status: "Paid" },
  { id: "#SBU-24791", buyer: "Ada N.", product: "Leather Tote — Terracotta", amount: 42500, status: "Delivered" },
];

const TOP_PRODUCTS = [
  { name: "MacBook Pro M3", views: 4213, sold: 12, revenue: 19800000 },
  { name: "Samsung Galaxy A55", views: 3891, sold: 34, revenue: 13090000 },
  { name: "Wireless Headphones", views: 2154, sold: 89, revenue: 7921000 },
  { name: "Sport Watch", views: 1287, sold: 41, revenue: 1168500 },
];

const statusColor: Record<string, string> = {
  Paid: "bg-success/10 text-success",
  Shipped: "bg-primary/10 text-primary",
  Pending: "bg-accent-orange/15 text-accent-orange",
  Delivered: "bg-muted text-foreground",
};

function SellerHome() {
  return (
    <div>
      <PageHeader
        title="Good morning, TechPro 👋"
        subtitle="Here's what's happening with your store today."
        action={
          <Link
            to="/seller/upload"
            className="inline-flex items-center gap-2 rounded-xl gradient-brand px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft transition hover:opacity-95"
          >
            <Upload className="h-4 w-4" /> Upload product
          </Link>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Wallet balance" value="₦412,880" trend="+18%" icon={Wallet} tint="primary" />
        <StatCard label="Orders (30d)" value="284" trend="+12%" icon={ShoppingCart} tint="orange" />
        <StatCard label="Listings live" value="42" trend="+3 new" icon={Package} tint="primary" />
        <StatCard label="Store rating" value="4.98" trend="312 reviews" icon={Star} tint="success" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Revenue trend</h3>
              <p className="text-xs text-muted-foreground">Last 30 days</p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-xs font-semibold text-success">
              <TrendingUp className="h-3 w-3" /> +24.6%
            </span>
          </div>
          <RevenueSparkline />
          <div className="mt-4 grid grid-cols-3 gap-3 border-t border-border pt-4 text-center">
            <MiniStat label="Gross" value="₦8.2M" />
            <MiniStat label="Fees" value="₦412K" />
            <MiniStat label="Net payout" value="₦7.78M" tint="primary" />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <h3 className="font-semibold">Quick actions</h3>
          <div className="mt-4 grid gap-2">
            <QuickAction icon={Upload} label="Upload new product" hint="₦500 listing fee" />
            <QuickAction icon={MessageSquare} label="Reply to messages" hint="3 unread" />
            <QuickAction icon={Wallet} label="Withdraw earnings" hint="Next-day to bank" />
            <QuickAction icon={Eye} label="Boost a listing" hint="Sponsored placement" />
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card shadow-soft">
          <div className="flex items-center justify-between border-b border-border p-5">
            <h3 className="font-semibold">Recent orders</h3>
            <Link to="/seller/orders" className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
              View all <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="px-5 py-2.5 text-left font-medium">Order</th>
                  <th className="px-5 py-2.5 text-left font-medium">Buyer</th>
                  <th className="px-5 py-2.5 text-left font-medium">Product</th>
                  <th className="px-5 py-2.5 text-right font-medium">Amount</th>
                  <th className="px-5 py-2.5 text-right font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {RECENT_ORDERS.map((o) => (
                  <tr key={o.id} className="border-b border-border last:border-0 hover:bg-accent/40">
                    <td className="px-5 py-3 font-mono text-xs text-primary">{o.id}</td>
                    <td className="px-5 py-3">{o.buyer}</td>
                    <td className="px-5 py-3 text-muted-foreground">{o.product}</td>
                    <td className="px-5 py-3 text-right font-semibold">₦{o.amount.toLocaleString()}</td>
                    <td className="px-5 py-3 text-right">
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusColor[o.status]}`}>
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <h3 className="font-semibold">Top performing</h3>
          <p className="text-xs text-muted-foreground">By revenue · last 30d</p>
          <div className="mt-4 space-y-3">
            {TOP_PRODUCTS.map((p) => (
              <div key={p.name} className="flex items-center justify-between gap-3 rounded-lg border border-border p-2.5">
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{p.name}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {p.views.toLocaleString()} views · {p.sold} sold
                  </div>
                </div>
                <div className="text-right text-sm font-semibold text-primary">
                  ₦{(p.revenue / 1_000_000).toFixed(1)}M
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value, tint }: { label: string; value: string; tint?: "primary" }) {
  return (
    <div>
      <div className={`font-display text-lg font-bold ${tint === "primary" ? "text-primary" : ""}`}>{value}</div>
      <div className="text-[11px] text-muted-foreground">{label}</div>
    </div>
  );
}

function QuickAction({
  icon: Icon,
  label,
  hint,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  hint: string;
}) {
  return (
    <button className="flex items-center gap-3 rounded-xl border border-border p-3 text-left transition hover:border-primary/40 hover:bg-primary/5">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1">
        <div className="text-sm font-medium">{label}</div>
        <div className="text-[11px] text-muted-foreground">{hint}</div>
      </div>
      <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
    </button>
  );
}

function RevenueSparkline() {
  const data = [40, 58, 45, 72, 65, 88, 74, 96, 82, 110, 118, 132, 128, 150];
  const max = Math.max(...data);
  const points = data
    .map((v, i) => `${(i / (data.length - 1)) * 100},${100 - (v / max) * 90}`)
    .join(" ");
  const area = `M 0,100 L ${points.split(" ").join(" L ")} L 100,100 Z`;
  return (
    <div className="mt-5">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-40 w-full">
        <defs>
          <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#rev)" />
        <polyline
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
          points={points}
        />
      </svg>
    </div>
  );
}
