import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Truck, CheckCircle2, Clock, Package, X, MapPin, Phone } from "lucide-react";
import { PageHeader } from "@/components/dashboard/DashboardShell";
import { getCurrentUser } from "@/lib/auth";
import { getSellerOrderItems, updateSellerOrderStatus } from "@/lib/cart";

export const Route = createFileRoute("/seller/orders")({
  component: SellerOrders,
});

const statusMeta: { [key: string]: { color: string; icon: any; label: string } } = {
  pending: { color: "bg-accent-orange/15 text-accent-orange", icon: Clock, label: "Pending" },
  confirmed: { color: "bg-primary/10 text-primary", icon: Package, label: "Confirmed" },
  shipped: { color: "bg-primary/10 text-primary", icon: Truck, label: "Shipped" },
  delivered: { color: "bg-success/10 text-success", icon: CheckCircle2, label: "Delivered" },
  cancelled: { color: "bg-destructive/10 text-destructive", icon: X, label: "Cancelled" },
};

const NEXT_STATUS: { [key: string]: string } = {
  pending: "confirmed",
  confirmed: "shipped",
  shipped: "delivered",
};

const NEXT_LABEL: { [key: string]: string } = {
  pending: "Confirm order",
  confirmed: "Mark as shipped",
  shipped: "Mark as delivered",
};

function SellerOrders() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  function load() {
    setLoading(true);
    getCurrentUser()
      .then(function (user) {
        if (!user) return [];
        return getSellerOrderItems(user.id);
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

  function handleAdvance(itemId: string, currentStatus: string) {
    const next = NEXT_STATUS[currentStatus];
    if (!next) return;
    setBusyId(itemId);
    updateSellerOrderStatus(itemId, next)
      .then(load)
      .finally(function () {
        setBusyId(null);
      });
  }

  function renderItem(item: any) {
    const meta = statusMeta[item.seller_status] || statusMeta.pending;
    const Icon = meta.icon;
    const nextLabel = NEXT_LABEL[item.seller_status];
    const order = item.orders;

    return (
      <article key={item.id} className="rounded-2xl border border-border bg-card p-4 shadow-soft">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold">{item.title}</h3>
            <p className="text-xs text-muted-foreground">Qty {item.quantity} - ₦{Number(item.price).toLocaleString()} each</p>
            {order ? (
              <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3 w-3" /> {order.delivery_address}, {order.delivery_city}
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone className="h-3 w-3" /> {order.delivery_phone}
                </div>
              </div>
            ) : null}
          </div>
          <span className={"inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold " + meta.color}>
            <Icon className="h-3 w-3" /> {meta.label}
          </span>
        </div>

        {nextLabel ? (
          <div className="mt-3 border-t border-border pt-3">
            <button
              onClick={function () { handleAdvance(item.id, item.seller_status); }}
              disabled={busyId === item.id}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
            >
              {nextLabel}
            </button>
          </div>
        ) : null}
      </article>
    );
  }

  return (
    <div>
      <PageHeader title="Orders" subtitle="Manage orders for your products." />

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          No orders yet.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(renderItem)}
        </div>
      )}
    </div>
  );
}
