import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Check, Clock3, MapPin, Truck, PackageCheck, CircleX } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { getCurrentUser } from "@/lib/auth";
import { getFoodOrder } from "@/lib/food";

export const Route = createFileRoute("/food/track/$orderId")({
  component: FoodTrackPage,
});

const ORDER_STAGES = [
  { key: "placed", label: "Placed" },
  { key: "confirmed", label: "Confirmed" },
  { key: "preparing", label: "Preparing" },
  { key: "out_for_delivery", label: "Out for delivery" },
  { key: "delivered", label: "Delivered" },
];

function FoodTrackPage() {
  const { orderId } = Route.useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(function () {
    getCurrentUser().then(function (user) {
      if (!user) {
        setLoading(false);
        return;
      }
      setUserId(user.id);
      getFoodOrder(orderId)
        .then(function (data) {
          setOrder(data);
        })
        .catch(function () {
          setOrder(null);
        })
        .finally(function () {
          setLoading(false);
        });
    });
  }, [orderId]);

  const currentStageIndex = useMemo(function () {
    if (!order || !order.status || order.status === "cancelled") return -1;
    return ORDER_STAGES.findIndex(function (stage) { return stage.key === order.status; });
  }, [order]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <main className="mx-auto max-w-5xl px-4 py-10">
          <p className="text-sm text-muted-foreground">Loading order status…</p>
        </main>
        <SiteFooter />
      </div>
    );
  }

  if (!order || userId !== order.buyer_id) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <main className="mx-auto max-w-5xl px-4 py-10">
          <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
            Order not found.
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  if (order.status === "cancelled") {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <main className="mx-auto max-w-5xl px-4 py-10">
          <div className="rounded-[2rem] border border-border bg-card p-8 shadow-soft">
            <div className="flex items-center gap-3 text-destructive">
              <CircleX className="h-6 w-6" />
              <h1 className="font-display text-3xl font-bold">Order cancelled</h1>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              This order was cancelled and will no longer be processed.
            </p>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 py-10">
        <div className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-soft">
          <div className="relative h-52 w-full bg-muted">
            {order.restaurants && order.restaurants.cover_image ? (
              <img src={order.restaurants.cover_image} alt={order.restaurants.name} className="h-full w-full object-cover" />
            ) : null}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-white">
              <div className="text-[11px] uppercase tracking-[0.2em] text-white/80">Order tracking</div>
              <h1 className="mt-2 font-display text-3xl font-bold">{order.restaurants ? order.restaurants.name : "Restaurant"}</h1>
            </div>
          </div>

          <div className="grid gap-6 p-6 lg:grid-cols-[1fr_0.8fr]">
            <div>
              <div className="mb-5 flex items-center gap-3 text-sm text-muted-foreground">
                <Clock3 className="h-4 w-4 text-primary" />
                <span>Current stage: <span className="font-semibold text-foreground">{ORDER_STAGES[currentStageIndex]?.label || order.status}</span></span>
              </div>

              <div className="space-y-4">
                {ORDER_STAGES.map(function (stage, index) {
                  const isPassed = index < currentStageIndex;
                  const isCurrent = index === currentStageIndex;
                  const icon = isPassed ? Check : isCurrent ? Clock3 : MapPin;
                  const Icon = icon;
                  return (
                    <div key={stage.key} className="flex items-start gap-3">
                      <div className={"flex h-8 w-8 items-center justify-center rounded-full border " + (isPassed ? "border-success bg-success/10 text-success" : isCurrent ? "border-primary bg-primary/10 text-primary" : "border-border bg-background text-muted-foreground")}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1 border-b border-border pb-4 last:border-0 last:pb-0">
                        <div className={"font-semibold " + (isCurrent ? "text-foreground" : "text-muted-foreground")}>{stage.label}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-background p-4">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Order summary</div>
              <div className="mt-3 space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center justify-between"><span>Total</span><span className="font-semibold text-foreground">₦{Number(order.total).toLocaleString()}</span></div>
                <div className="flex items-center justify-between"><span>Delivery</span><span>{order.delivery_address}</span></div>
                <div className="flex items-center justify-between"><span>Phone</span><span>{order.delivery_phone}</span></div>
              </div>

              <div className="mt-4">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">Items</div>
                <div className="mt-2 space-y-2">
                  {(order.food_order_items || []).map(function (item: any) {
                    return (
                      <div key={item.id} className="flex items-center justify-between text-sm">
                        <span>{item.item_name} x{item.quantity}</span>
                        <span className="font-medium">₦{(Number(item.price) * item.quantity).toLocaleString()}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
