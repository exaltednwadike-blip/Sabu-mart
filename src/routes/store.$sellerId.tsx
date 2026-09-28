import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Store, Users, Star, UserPlus, UserCheck, Heart } from "lucide-react";
import { getSellerProfile, getSellerProducts, getFollowerCount, isFollowing, toggleFollow } from "@/lib/sellers";
import { getSellerRatingSummary } from "@/lib/analytics";
import { getSellerReviews, getReviewLikeCounts, hasUserLikedReviews, toggleReviewLike } from "@/lib/reviews";
import { getCurrentUser } from "@/lib/auth";
import { ProductCard } from "@/components/site/ProductGrid";

export const Route = createFileRoute("/store/$sellerId")({
  component: StorePage,
});

function StorePage() {
  const params = Route.useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [followerCount, setFollowerCount] = useState(0);
  const [rating, setRating] = useState({ average: 0, count: 0 });
  const [following, setFollowing] = useState(false);
  const [isSelf, setIsSelf] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [busy, setBusy] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [likeCounts, setLikeCounts] = useState<{ [key: string]: number }>({});
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

  useEffect(function () {
    getSellerProfile(params.sellerId)
      .then(function (data) {
        setProfile(data);
        Promise.all([
          getSellerProducts(params.sellerId),
          getFollowerCount(params.sellerId),
          getSellerRatingSummary(params.sellerId),
          getCurrentUser(),
          getSellerReviews(params.sellerId),
        ]).then(function (results) {
          setProducts(results[0]);
          setFollowerCount(results[1]);
          setRating(results[2]);
          const user = results[3];
          if (user) {
            setIsSelf(user.id === params.sellerId);
            setCurrentUserId(user.id);
            isFollowing(user.id, params.sellerId).then(setFollowing);
          }
          setReviews(results[4] || []);
        });
      })
      .catch(function () {
        setNotFound(true);
      })
      .finally(function () {
        setLoading(false);
      });
  }, [params.sellerId]);

  useEffect(function () {
    if (reviews.length === 0) return;
    const ids = reviews.map(function (r: any) { return r.id; });
    getReviewLikeCounts(ids).then(setLikeCounts);
    if (currentUserId) {
      hasUserLikedReviews(ids, currentUserId).then(setLikedIds);
    }
  }, [reviews, currentUserId]);

  function handleFollow() {
    setBusy(true);
    getCurrentUser()
      .then(function (user) {
        if (!user) {
          navigate({ to: "/login" });
          return null;
        }
        return toggleFollow(user.id, params.sellerId);
      })
      .then(function (result) {
        if (result !== null) {
          setFollowing(result);
          setFollowerCount(function (c) { return result ? c + 1 : c - 1; });
        }
      })
      .finally(function () {
        setBusy(false);
      });
  }

  function handleLikeReview(reviewId: string) {
    if (!currentUserId) {
      navigate({ to: "/login" });
      return;
    }
    toggleReviewLike(reviewId, currentUserId).then(function (liked) {
      setLikedIds(function (prev) {
        const next = new Set(prev);
        if (liked) { next.add(reviewId); } else { next.delete(reviewId); }
        return next;
      });
      setLikeCounts(function (prev) {
        const count = prev[reviewId] || 0;
        const updated = { ...prev };
        updated[reviewId] = liked ? count + 1 : Math.max(0, count - 1);
        return updated;
      });
    });
  }

  function renderProduct(p: any) {
    return <ProductCard key={p.id} p={p} />;
  }

  function renderReview(r: any) {
    const liked = likedIds.has(r.id);
    const count = likeCounts[r.id] || 0;
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
        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>by {r.buyer_name || "Verified buyer"} - {new Date(r.created_at).toLocaleDateString()}</span>
          <button
            onClick={function () { handleLikeReview(r.id); }}
            className={"flex items-center gap-1 " + (liked ? "text-primary" : "")}
          >
            <Heart className="h-3.5 w-3.5" fill={liked ? "currentColor" : "none"} /> {count}
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="mx-auto max-w-7xl px-4 py-14 text-center text-sm text-muted-foreground">Loading...</div>;
  }

  if (notFound || !profile) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-14 text-center">
        <p className="text-sm text-muted-foreground">This store isn't available.</p>
        <Link to="/" className="mt-3 inline-block text-sm font-semibold text-primary hover:underline">Back to marketplace</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <Link to="/" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        &larr; Back to marketplace
      </Link>

      <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-card p-6 shadow-soft">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl gradient-brand text-2xl font-bold text-primary-foreground">
          {profile.store_name ? profile.store_name.charAt(0).toUpperCase() : "S"}
        </div>
        <div className="flex-1">
          <h1 className="font-display text-xl font-bold">{profile.store_name}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" /> {followerCount} follower{followerCount !== 1 ? "s" : ""}
            </span>
            {rating.count > 0 ? (
              <span className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-accent-orange text-accent-orange" /> {rating.average.toFixed(1)}({rating.count})
              </span>
            ) : (
              <span>No reviews yet</span>
            )}
            <span className="flex items-center gap-1">
              <Store className="h-3.5 w-3.5" /> {products.length} product{products.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
        {!isSelf ? (
          <button
            onClick={handleFollow}
            disabled={busy}
            className={
              "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold shadow-soft disabled:opacity-60 " +
              (following ? "border border-border hover:bg-accent" : "gradient-brand text-primary-foreground hover:opacity-90")
            }
          >
            {following ? <UserCheck className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
            {following ? "Following" : "Follow"}
          </button>
        ) : null}
      </div>

      <div className="mt-8">
        <h2 className="font-display text-xl font-bold">Products</h2>
        {products.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            This store hasn't listed any products yet.
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {products.map(renderProduct)}
          </div>
        )}
      </div>

      <div className="mt-8">
        <h2 className="font-display text-xl font-bold">Reviews</h2>
        {reviews.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            No reviews yet.
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {reviews.map(renderReview)}
          </div>
        )}
      </div>
    </div>
  );
}
