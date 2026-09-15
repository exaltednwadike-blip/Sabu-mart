import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ShoppingBag, CheckCircle2, Clock3, Truck, PackageCheck, XCircle } from "lucide-react";
import { getAllFoodOrders, updateFoodOrderStatus } from "@/lib/food";
import { Toaster, toast } from "sonner";

export const Route = createFileRoute("/admin/food-orders")({
  component: AdminFoodOrders,
});

const STATUS_ORDER = ["placed", "confirmed", "preparing", "out_for_delivery", "delivered"];
const FILTERS = ["all", "placed", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled"] as const;

const STATUS_LABELS: { [key: string]: string } = {
  all: "All",
  placed: "Placed",
  confirmed: "Confirmed",
  preparing: "Preparing",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const STATUS_META: { [key: string]: { color: string; icon: any; label: string } } = {
  placed: { color: "bg-accent-orange/15 text-accent-orange", icon: Clock3, label: "Placed" },
  confirmed: { color: "bg-primary/10 text-primary", icon: CheckCircle2, label: "Confirmed" },
  preparing: { color: "bg-primary/10 text-primary", icon: PackageCheck, label: "Preparing" },
  out_for_delivery: { color: "bg-primary/10 text-primary", icon: Truck, label: "Out for delivery" },
  delivered: { color: "bg-success/10 text-success", icon: CheckCircle2, label: "Delivered" },
  cancelled: { color: "bg-destructive/10 text-destructive", icon: XCircle, label: "Cancelled" },
};

function AdminFoodOrders() {
  const [statusFilter, setStatusFilter] = useState<(typeof FILTERS)[number]>("all");
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  function loadOrders() {
    setLoading(true);
    getAllFoodOrders(statusFilter === "all" ? undefined : statusFilter)
      .then(function (data) {
        setOrders(data || []);
      })
      .finally(function () {
        setLoading(false);
      });
  }

  useEffect(function () {
    loadOrders();
  }, [statusFilter]);

  function getNextStatus(current: string) {
    const index = STATUS_ORDER.indexOf(current);
    if (index === -1) return null;
    if (index === STATUS_ORDER.length - 1) return null;
    return STATUS_ORDER[index + 1];
  }

  function handleAdvance(order: any) {
    const nextStatus = getNextStatus(order.status);
    if (!nextStatus) return;
    updateFoodOrderStatus(order.id, nextStatus)
      .then(function () {
        toast.success("Order status updated.");
        loadOrders();
      })
      .catch(function (err) {
        toast.error(err instanceof Error ? err.message : "Could not update status.");
      });
  }

  function handleCancel(order: any) {
    if (order.status === "cancelled" || order.status === "delivered") return;
    updateFoodOrderStatus(order.id, "cancelled")
      .then(function () {
        toast.success("Order cancelled.");
        loadOrders();
      })
      .catch(function (err) {
        toast.error(err instanceof Error ? err.message : "Could not cancel order.");
      });
  }

  function renderStatusButton(order: any) {
    const nextStatus = getNextStatus(order.status);
    if (!nextStatus) return null;
    const labelMap: { [key: string]: string } = {
      confirmed: "Confirm order",
      preparing: "Start preparing",
      out_for_delivery: "Mark out for delivery",
      delivered: "Mark delivered",
    };

    return (
      <button
        type="button"
        onClick={function () { handleAdvance(order); }}
        className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90"
      >
        {labelMap[nextStatus] || "Advance status"}
      </button>
    );
  }

  return (
    <div>
      <Toaster position="top-right" richColors />
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <ShoppingBag className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold">Food orders</h1>
          <p className="text-sm text-muted-foreground">Track restaurant orders and move them through the delivery flow.</p>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {FILTERS.map(function (filter) {
          return (
            <button
              key={filter}
              type="button"
              onClick={function () { setStatusFilter(filter); }}
              className={"rounded-full px-3 py-1.5 text-xs font-semibold transition " + (statusFilter === filter ? "bg-primary text-primary-foreground" : "border border-border bg-card text-muted-foreground hover:bg-accent")}
            >
              {STATUS_LABELS[filter]}
            </button>
          );
        })}
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading orders...</p>
      ) : orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
          No food orders in this queue.
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(function (order) {
            const meta = STATUS_META[order.status] || STATUS_META.placed;
            const Icon = meta.icon;
            const buyerName = order.profiles && order.profiles.full_name ? order.profiles.full_name : "Buyer";
            const buyerPhone = order.profiles && order.profiles.phone ? order.profiles.phone : "No phone number";

            return (
              <div key={order.id} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
                  <div>
                    <div className="font-mono text-xs text-primary">#{order.id.slice(0, 8).toUpperCase()}</div>
                    <div className="mt-1 text-sm text-muted-foreground">{buyerName} · {buyerPhone}</div>
                  </div>
                  <span className={"inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold " + meta.color}>
                    <Icon className="h-3.5 w-3.5" /> {meta.label}
                  </span>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">Restaurant</div>
                    <div className="mt-1 font-semibold">{order.restaurants ? order.restaurants.name : "Restaurant"}</div>
                    <div className="mt-3 text-xs uppercase tracking-wide text-muted-foreground">Delivery address</div>
                    <div className="mt-1 text-sm text-muted-foreground">{order.delivery_address}</div>
                    <div className="mt-3 text-xs uppercase tracking-wide text-muted-foreground">Phone</div>
                    <div className="mt-1 text-sm text-muted-foreground">{order.delivery_phone}</div>
                  </div>

                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">Items</div>
                    <div className="mt-1 space-y-2">
                      {(order.food_order_items || []).map(function (item: any) {
                        return (
                          <div key={item.id} className="flex items-center justify-between text-sm">
                            <span>{item.item_name} x{item.quantity}</span>
                            <span className="font-medium">₦{(Number(item.price) * item.quantity).toLocaleString()}</span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-3 border-t border-border pt-2 text-sm">
                      <div className="flex items-center justify-between"><span>Subtotal</span><span>₦{Number(order.subtotal).toLocaleString()}</span></div>
                      <div className="flex items-center justify-between"><span>Delivery</span><span>₦{Number(order.delivery_fee).toLocaleString()}</span></div>
                      <div className="flex items-center justify-between"><span>Service</span><span>₦{Number(order.service_fee).toLocaleString()}</span></div>
                      <div className="mt-2 flex items-center justify-between text-base font-bold text-foreground"><span>Total</span><span>₦{Number(order.total).toLocaleString()}</span></div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
                  {renderStatusButton(order)}
                  {order.status !== "cancelled" && order.status !== "delivered" ? (
                    <button
                      type="button"
                      onClick={function () { handleCancel(order); }}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-destructive px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/5"
                    >
                      Cancel order
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
