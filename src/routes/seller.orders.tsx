import { createFileRoute } from "@tanstack/react-router";
import { Search, Filter, Download } from "lucide-react";
import { PageHeader } from "@/components/dashboard/DashboardShell";

export const Route = createFileRoute("/seller/orders")({
  component: SellerOrders,
});

const ORDERS = [
  { id: "#SBU-24817", buyer: "Chinelo A.", product: "MacBook Pro 14\" M3", qty: 1, amount: 1650000, date: "Today, 10:24", status: "Paid" },
  { id: "#SBU-24812", buyer: "Musa I.", product: "Wireless Headphones", qty: 2, amount: 178000, date: "Today, 08:12", status: "Shipped" },
  { id: "#SBU-24803", buyer: "Bukola O.", product: "Samsung Galaxy A55", qty: 1, amount: 385000, date: "Yesterday", status: "Pending" },
  { id: "#SBU-24798", buyer: "Femi K.", product: "Sport Chronograph Watch", qty: 1, amount: 28500, date: "Yesterday", status: "Paid" },
  { id: "#SBU-24791", buyer: "Ada N.", product: "Leather Tote — Terracotta", qty: 1, amount: 42500, date: "2 days ago", status: "Delivered" },
  { id: "#SBU-24788", buyer: "Tunde B.", product: "iPhone 15 Pro Max", qty: 1, amount: 1250000, date: "3 days ago", status: "Cancelled" },
  { id: "#SBU-24779", buyer: "Grace E.", product: "Wireless Headphones", qty: 1, amount: 89000, date: "3 days ago", status: "Delivered" },
];

const statusColor: Record<string, string> = {
  Paid: "bg-success/10 text-success",
  Shipped: "bg-primary/10 text-primary",
  Pending: "bg-accent-orange/15 text-accent-orange",
  Delivered: "bg-muted text-foreground",
  Cancelled: "bg-destructive/10 text-destructive",
};

const TABS = ["All", "Pending", "Paid", "Shipped", "Delivered", "Cancelled"];

function SellerOrders() {
  return (
    <div>
      <PageHeader
        title="Orders"
        subtitle="Track, fulfil and reconcile every purchase."
        action={
          <button className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-accent">
            <Download className="h-4 w-4" /> Export CSV
          </button>
        }
      />

      <div className="rounded-2xl border border-border bg-card shadow-soft">
        <div className="flex flex-wrap items-center gap-2 border-b border-border p-2">
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
        <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
          <div className="flex flex-1 items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 md:max-w-sm">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input placeholder="Search order ID, buyer, product..." className="flex-1 bg-transparent text-sm outline-none" />
          </div>
          <button className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-accent">
            <Filter className="h-3.5 w-3.5" /> Date range
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Order</th>
                <th className="px-4 py-3 text-left font-medium">Buyer</th>
                <th className="px-4 py-3 text-left font-medium">Product</th>
                <th className="px-4 py-3 text-right font-medium">Qty</th>
                <th className="px-4 py-3 text-right font-medium">Amount</th>
                <th className="px-4 py-3 text-left font-medium">Date</th>
                <th className="px-4 py-3 text-right font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {ORDERS.map((o) => (
                <tr key={o.id} className="border-t border-border hover:bg-accent/40">
                  <td className="px-4 py-3 font-mono text-xs text-primary">{o.id}</td>
                  <td className="px-4 py-3">{o.buyer}</td>
                  <td className="px-4 py-3 text-muted-foreground">{o.product}</td>
                  <td className="px-4 py-3 text-right">{o.qty}</td>
                  <td className="px-4 py-3 text-right font-semibold">₦{o.amount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{o.date}</td>
                  <td className="px-4 py-3 text-right">
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
    </div>
  );
}
