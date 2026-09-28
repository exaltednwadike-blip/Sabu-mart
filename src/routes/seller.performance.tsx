import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Star, CheckCircle2, XCircle, Clock, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/dashboard/DashboardShell";
import { getCurrentUser } from "@/lib/auth";
import { getSellerPerformance, getSellerReviews, type SellerPerformance } from "@/lib/reviews";

export const Route = createFileRoute("/seller/performance")({
  component: SellerPerformancePage,
});

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "1 day ago";
  if (days < 30) return days + " days ago";
  const months = Math.floor(days / 30);
  return months + " month" + (months !== 1 ? "s" : "") + " ago";
}

function SellerPerformancePage() {
  const [perf, setPerf] = useState<SellerPerformance | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(function () {
    getCurrentUser()
      .then(function (user) {
        if (!user) return null;
        return Promise.all([getSellerPerformance(user.id), getSellerReviews(user.id)]);
      })
      .then(function (result) {
        if (!result) return;
        setPerf(result[0]);
        setReviews(result[1] || []);
      })
      .finally(function () {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div>
        <PageHeader title="Performance" subtitle="Your reputation and fulfillment record." />
        <div className="rounded-2xl border border-dashed border-border p-16 text-center text-sm text-muted-foreground">
          Loading performance data...
        </div>
      </div>
    );
  }

  const maxBreakdown = perf ? Math.max(1, ...perf.ratingBreakdown.map(function (r) { return r.count; })) : 1;

  return (
    <div>
      <PageHeader title="Performance" subtitle="Your reputation, based on real buyer reviews." />

      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard
          icon={<Star className="h-4 w-4" />}
          label="Average rating"
          value={perf && perf.reviewCount > 0 ? perf.averageRating.toFixed(2) + "/5" : "No ratings yet"}
        />
        <div className="hidden">
        <StatCard
          icon={<CheckCircle2 className="h-4 w-4" />}
          label="Fulfillment rate"
          value={perf ? Math.round(perf.fulfillmentRate * 100) + "%" : "—"}
        />
        <StatCard
          icon={<XCircle className="h-4 w-4" />}
          label="Cancellation rate"
          value={perf ? Math.round(perf.cancellationRate * 100) + "%" : "—"}
        />
        <StatCard
          icon={<Clock className="h-4 w-4" />}
          label="In progress"
          value={perf ? String(perf.inProgressCount) : "0"}
        />
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <h3 className="font-semibold">Rating breakdown</h3>
          {!perf || perf.reviewCount === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">No reviews yet. Once buyers start reviewing your orders, the breakdown shows up here.</p>
          ) : (
            <div className="mt-4 space-y-2.5">
              {perf.ratingBreakdown.map(function (r) {
                return (
                  <div key={r.stars} className="flex items-center gap-3">
                    <span className="flex w-10 shrink-0 items-center gap-1 text-xs font-medium text-muted-foreground">
                      {r.stars} <Star className="h-3 w-3 fill-accent-orange text-accent-orange" />
                    </span>
                    <div className="h-2 flex-1 rounded-full bg-muted">
                      <div className="h-2 rounded-full bg-accent-orange" style={{ width: (r.count / maxBreakdown) * 100 + "%" }} />
                    </div>
                    <span className="w-6 text-right text-xs text-muted-foreground">{r.count}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="hidden rounded-2xl border border-border bg-card p-5 shadow-soft">
          <h3 className="font-semibold">Order outcomes</h3>
          {!perf || (perf.fulfilledCount + perf.cancelledCount + perf.inProgressCount === 0) ? (
            <p className="mt-4 text-sm text-muted-foreground">No orders yet.</p>
          ) : (
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-muted-foreground"><CheckCircle2 className="h-4 w-4 text-success" /> Delivered</span>
                <span className="font-semibold">{perf.fulfilledCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-muted-foreground"><Clock className="h-4 w-4 text-accent-orange" /> In progress</span>
                <span className="font-semibold">{perf.inProgressCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-muted-foreground"><XCircle className="h-4 w-4 text-destructive" /> Cancelled</span>
                <span className="font-semibold">{perf.cancelledCount}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-soft">
        <h3 className="font-semibold">Recent reviews</h3>
        {reviews.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">No reviews yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-border">
            {reviews.slice(0, 8).map(function (r: any) {
              return (
                <li key={r.id} className="py-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium">{r.buyer_name || "SABU Buyer"}</span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Star className="h-3 w-3 fill-accent-orange text-accent-orange" /> {r.rating}/5 · {timeAgo(r.created_at)}
                    </span>
                  </div>
                  {r.comment ? <p className="mt-1 text-sm text-muted-foreground">{r.comment}</p> : null}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
      <div className="flex items-center gap-2 text-primary">
        {icon}
        <span className="text-lg font-bold text-foreground">{value}</span>
      </div>
      <div className="mt-1 text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
