import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Truck, CheckCircle2, Clock, MessageSquare, X, Package, ShieldCheck, AlertTriangle, RotateCcw } from "lucide-react";
import { PageHeader } from "@/components/dashboard/DashboardShell";
import { getCurrentUser } from "@/lib/auth";
import { getMyOrders } from "@/lib/cart";
import { confirmReceipt, raiseDispute } from "@/lib/wallet";

export const Route = createFileRoute("/buyer/orders")({
  component: BuyerOrders,
});

const statusMeta: { [key: string]: { color: string; icon: any; label: string } } = {
  pending_payment: { color: "bg-accent-orange/15 text-accent-orange", icon: Clock, label: "Pending payment" },
  processing: { color: "bg-primary/10 text-primary", icon: Package, label: "Processing" },
  shipped: { color: "bg-primary/10 text-primary", icon: Truck, label: "Shipped" },
  delivered: { color: "bg-success/10 text-success", icon: CheckCircle2, label: "Delivered" },
  cancelled: { color: "bg-destructive/10 text-destructive", icon: X, label: "Cancelled" },
};

function BuyerOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  function load() {
    setLoading(true);
    getCurrentUser()
      .then(function (user) {
        if (!user) return [];
        setUserId(user.id);
        return getMyOrders(user.id);
      })
      .then(function (data) {
        setOrders(data || []);
      })
      .finally(function () {
        setLoading(false);
      });
  }

  useEffect(function () {
    load();
  }, []);

  function handleConfirmReceipt(itemId: string) {
    if (!userId) return;
    setBusyId(itemId);
    confirmReceipt(itemId, userId)
      .then(load)
      .catch(function (err) {
        alert(err instanceof Error ? err.message : "Something went wrong.");
      })
      .finally(function () {
        setBusyId(null);
      });
  }

  function handleDispute(itemId: string) {
    if (!userId) return;
    const reason = prompt("Briefly describe the issue with this item:");
    if (!reason || !reason.trim()) return;
    setBusyId(itemId);
    raiseDispute(itemId, userId, reason.trim())
      .then(load)
      .catch(function (err) {
        alert(err instanceof Error ? err.message : "Something went wrong.");
      })
      .finally(function () {
        setBusyId(null);
      });
  }

  function renderOrder(o: any) {
    const meta = statusMeta[o.status] || statusMeta.pending_payment;
    const Icon = meta.icon;
    const items = o.order_items || [];

    function renderItem(item: any) {
      const canConfirm = item.escrow_status === "held" && (item.seller_status === "shipped" || item.seller_status === "confirmed");

      return (
        <div key={item.id} className="border-b border-border pb-2 last:border-0 last:pb-0">
          <div className="flex items-center justify-between text-sm">
            <span className="truncate">{item.title} x{item.quantity}</span>
            <span className="font-medium">₦{(Number(item.price) * item.quantity).toLocaleString()}</span>
          </div>
          {item.escrow_status === "released" ? (
            <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-success">
              <CheckCircle2 className="h-3 w-3" /> Receipt confirmed - funds released to seller
            </p>
          ) : item.escrow_status === "refunded" ? (
            <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-primary">
              <RotateCcw className="h-3 w-3" /> Refunded - money returned to your original payment method
            </p>
          ) : item.escrow_status === "disputed" ? (
            <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-accent-orange">
              <AlertTriangle className="h-3 w-3" /> Dispute raised - under admin review, please check back within 2 days
            </p>
          ) : canConfirm ? (
            <div className="mt-1.5 flex gap-2">
              <button
                onClick={function () { handleConfirmReceipt(item.id); }}
                disabled={busyId === item.id}
                className="inline-flex items-center gap-1 rounded-lg bg-primary px-2.5 py-1 text-[11px] font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
              >
                <ShieldCheck className="h-3 w-3" /> Confirm receipt
              </button>
              <button
                onClick={function () { handleDispute(item.id); }}
                disabled={busyId === item.id}
                className="inline-flex items-center gap-1 rounded-lg border border-destructive px-2.5 py-1 text-[11px] font-semibold text-destructive hover:bg-destructive/5 disabled:opacity-60"
              >
                <AlertTriangle className="h-3 w-3" /> Report issue
              </button>
            </div>
          ) : (
            <p className="mt-1 text-[11px] text-muted-foreground">
              Waiting for seller to ship this item.
            </p>
          )}
        </div>
      );
    }

    return (
      <article key={o.id} className="rounded-2xl border border-border bg-card p-4 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="font-mono text-primary">#{o.id.slice(0, 8).toUpperCase()}</span>
          <span className="text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</span>
          <span className={"inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold " + meta.color}>
            <Icon className="h-3 w-3" /> {meta.label}
          </span>
        </div>

        <div className="mt-3 space-y-2 border-t border-border pt-3">
          {items.map(renderItem)}
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
          <span className="text-sm text-muted-foreground">Total</span>
          <span className="font-display text-lg font-bold">₦{Number(o.total).toLocaleString()}</span>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-accent">
            <MessageSquare className="h-3.5 w-3.5" /> Chat seller
          </button>
        </div>
      </article>
    );
  }

  return (
    <div>
      <PageHeader title="My orders" subtitle="Track and manage every purchase." />

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          No orders yet.
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(renderOrder)}
        </div>
      )}
    </div>
  );
}
