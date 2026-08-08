import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { PageHeader } from "@/components/dashboard/DashboardShell";
import { getCurrentUser } from "@/lib/auth";
import { getSellerReviews } from "@/lib/reviews";

export const Route = createFileRoute("/seller/reviews")({
  component: SellerReviews,
});

function SellerReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(function () {
    getCurrentUser().then(function (user) {
      if (!user) return;
      getSellerReviews(user.id)
        .then(setReviews)
        .finally(function () { setLoading(false); });
    });
  }, []);

  const average = reviews.length > 0
    ? reviews.reduce(function (s: number, r: any) { return s + r.rating; }, 0) / reviews.length
    : 0;

  function renderStars(rating: number) {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star key={i} className={"h-4 w-4 " + (i <= rating ? "fill-accent-orange text-accent-orange" : "text-muted-foreground/30")} />
      );
    }
    return stars;
  }

  function renderReview(r: any) {
    const image = r.products && r.products.images && r.products.images[0] ? r.products.images[0] : null;
    return (
      <div key={r.id} className="rounded-2xl border border-border bg-card p-4 shadow-soft">
        <div className="flex items-start gap-3">
          {image ? (
            <img src={image} alt="" className="h-12 w-12 rounded-lg object-cover" />
          ) : (
            <div className="h-12 w-12 rounded-lg bg-muted" />
          )}
          <div className="flex-1">
            <p className="text-sm font-medium">{r.products ? r.products.title : "Product"}</p>
            <div className="mt-1 flex items-center gap-0.5">{renderStars(r.rating)}</div>
            {r.comment ? <p className="mt-2 text-sm text-muted-foreground">{r.comment}</p> : null}
            <p className="mt-2 text-xs text-muted-foreground">by {r.buyer_name || "Verified buyer"} - {new Date(r.created_at).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Reviews" subtitle="What buyers are saying about your store." />

      {!loading && reviews.length > 0 ? (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-border bg-card p-5 shadow-soft">
          <div className="font-display text-3xl font-bold">{average.toFixed(1)}</div>
          <div>
            <div className="flex items-center gap-0.5">{renderStars(Math.round(average))}</div>
            <p className="text-xs text-muted-foreground">{reviews.length} review{reviews.length !== 1 ? "s" : ""}</p>
          </div>
        </div>
      ) : null}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : reviews.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          No reviews yet.
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map(renderReview)}
        </div>
      )}
    </div>
  );
}
