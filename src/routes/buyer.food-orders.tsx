import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Clock3, UtensilsCrossed } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getMyFoodOrders } from "@/lib/food";
import { PageHeader } from "@/components/dashboard/DashboardShell";

export const Route = createFileRoute("/buyer/food-orders")({
  component: BuyerFoodOrders,
});

function BuyerFoodOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(function () {
    getCurrentUser().then(function (user) {
      if (!user) {
        setOrders([]);
        setLoading(false);
        return;
      }
      getMyFoodOrders(user.id)
        .then(function (data) {
          setOrders(data || []);
        })
        .finally(function () {
          setLoading(false);
        });
    });
  }, []);

  return (
    <div>
      <PageHeader title="Food orders" subtitle="Track every restaurant order you’ve placed." />

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
          You haven&apos;t placed any food orders yet.
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(function (order) {
            return (
              <div key={order.id} className="rounded-2xl border border-border bg-card p-4 shadow-soft">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <UtensilsCrossed className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-semibold">{order.restaurants ? order.restaurants.name : "Restaurant"}</div>
                      <div className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={"inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold " + (
                      order.status === "delivered" ? "bg-success/10 text-success" :
                      order.status === "cancelled" ? "bg-destructive/10 text-destructive" :
                      "bg-primary/10 text-primary")}
                    >
                      <Clock3 className="h-3 w-3" /> {order.status.replace("_", " ")}
                    </span>
                    <span className="font-display text-lg font-bold">₦{Number(order.total).toLocaleString()}</span>
                  </div>
                </div>

                <div className="mt-4">
                  <Link to={"/food/track/" + order.id} className="text-sm font-medium text-primary hover:underline">
                    View tracking details
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
