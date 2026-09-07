import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { PageHeader } from "@/components/dashboard/DashboardShell";
import { getCurrentUser, getProfile } from "@/lib/auth";
import { getReviewableOrderItems, getMyReviews, submitReview } from "@/lib/reviews";

export const Route = createFileRoute("/buyer/reviews")({
  component: BuyerReviews,
});

function BuyerReviews() {
  const [pending, setPending] = useState<any[]>([]);
  const [submitted, setSubmitted] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState("");
  const [activeItemId, setActiveItemId] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function load() {
    setLoading(true);
    getCurrentUser().then(function (user) {
      if (!user) return;
      setUserId(user.id);
      getProfile(user.id).then(function (profile) {
        setUserName(profile.full_name || user.email || "Buyer");
      });
      Promise.all([
        getReviewableOrderItems(user.id),
        getMyReviews(user.id),
      ])
        .then(function (results) {
          setPending(results[0]);
          setSubmitted(results[1]);
        })
        .finally(function () {
          setLoading(false);
        });
    });
  }

  useEffect(function () {
    load();
  }, []);

  function openReviewForm(item: any) {
    setActiveItemId(item.id);
    setRating(5);
    setComment("");
  }

  function handleSubmit(item: any) {
    if (!userId) return;
    setSubmitting(true);
    submitReview({
      orderItemId: item.id,
      productId: item.product_id,
      buyerId: userId,
      sellerId: item.seller_id,
      buyerName: userName,
      rating,
      comment: comment.trim(),
    })
      .then(function () {
        setActiveItemId(null);
        load();
      })
      .finally(function () {
        setSubmitting(false);
      });
  }

  function renderStarPicker() {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <button
          key={i}
          type="button"
          onClick={function () { setRating(i); }}
        >
          <Star className={"h-6 w-6 " + (i <= rating ? "fill-accent-orange text-accent-orange" : "text-muted-foreground/30")} />
        </button>
      );
    }
    return stars;
  }

  function renderPendingItem(item: any) {
    return (
      <div key={item.id} className="rounded-2xl border border-border bg-card p-4 shadow-soft">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">{item.title}</h3>
            <p className="text-xs text-muted-foreground">₦{Number(item.price).toLocaleString()}</p>
          </div>
          {activeItemId !== item.id ? (
            <button
              onClick={function () { openReviewForm(item); }}
              className="rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary hover:text-primary-foreground"
            >
              Leave a review
            </button>
          ) : null}
        </div>

        {activeItemId === item.id ? (
          <div className="mt-4 space-y-3 border-t border-border pt-4">
            <div className="flex items-center gap-1">{renderStarPicker()}</div>
            <textarea
              value={comment}
              onChange={function (e) { setComment(e.target.value); }}
              rows={3}
              placeholder="How was your experience with this product?"
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
            <div className="flex gap-2">
              <button
                onClick={function () { handleSubmit(item); }}
                disabled={submitting}
                className="rounded-lg gradient-brand px-4 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-60"
              >
                {submitting ? "Submitting..." : "Submit review"}
              </button>
              <button
                onClick={function () { setActiveItemId(null); }}
                className="rounded-lg border border-border px-4 py-2 text-xs font-medium hover:bg-accent"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  function renderSubmittedReview(r: any) {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star key={i} className={"h-3.5 w-3.5 " + (i <= r.rating ? "fill-accent-orange text-accent-orange" : "text-muted-foreground/30")} />
      );
    }
    return (
      <div key={r.id} className="rounded-2xl border border-border bg-card p-4 shadow-soft">
        <div className="flex items-center gap-0.5">{stars}</div>
        {r.comment ? <p className="mt-2 text-sm text-muted-foreground">{r.comment}</p> : null}
        <p className="mt-2 text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Reviews" subtitle="Share your experience on items you've received." />

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : (
        <div className="space-y-8">
          <section>
            <h3 className="mb-3 font-semibold">Awaiting your review</h3>
            {pending.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nothing to review right now.</p>
            ) : (
              <div className="space-y-3">{pending.map(renderPendingItem)}</div>
            )}
          </section>

          <section>
            <h3 className="mb-3 font-semibold">Your reviews</h3>
            {submitted.length === 0 ? (
              <p className="text-sm text-muted-foreground">You haven't reviewed anything yet.</p>
            ) : (
              <div className="space-y-3">{submitted.map(renderSubmittedReview)}</div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
