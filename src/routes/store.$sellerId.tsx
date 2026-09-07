import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Store, Users, Star, UserPlus, UserCheck } from "lucide-react";
import { getSellerProfile, getSellerProducts, getFollowerCount, isFollowing, toggleFollow } from "@/lib/sellers";
import { getSellerRatingSummary } from "@/lib/analytics";
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

  useEffect(function () {
    getSellerProfile(params.sellerId)
      .then(function (data) {
        setProfile(data);
        Promise.all([
          getSellerProducts(params.sellerId),
          getFollowerCount(params.sellerId),
          getSellerRatingSummary(params.sellerId),
          getCurrentUser(),
        ]).then(function (results) {
          setProducts(results[0]);
          setFollowerCount(results[1]);
          setRating(results[2]);
          const user = results[3];
          if (user) {
            setIsSelf(user.id === params.sellerId);
            isFollowing(user.id, params.sellerId).then(setFollowing);
          }
        });
      })
      .catch(function () {
        setNotFound(true);
      })
      .finally(function () {
        setLoading(false);
      });
  }, [params.sellerId]);

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

  function renderProduct(p: any) {
    return <ProductCard key={p.id} p={p} />;
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
                <Star className="h-3.5 w-3.5 fill-accent-orange text-accent-orange" /> {rating.average.toFixed(1)} ({rating.count})
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
    </div>
  );
}
