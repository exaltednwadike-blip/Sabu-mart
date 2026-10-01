import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Star, BadgeCheck, MapPin, Search } from "lucide-react";
import { getFeaturedSellers } from "@/lib/products";

export const Route = createFileRoute("/sellers")({
  component: SellersDirectory,
});

function SellersDirectory() {
  const [sellers, setSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(function () {
    getFeaturedSellers(200)
      .then(function (data) { setSellers(data || []); })
      .catch(function () { setSellers([]); })
      .finally(function () { setLoading(false); });
  }, []);

  function renderSeller(seller: any) {
    const initial = seller.storeName ? seller.storeName.charAt(0).toUpperCase() : "S";
    const ratingText = seller.reviewCount === 0
      ? "New seller"
      : seller.avgRating.toFixed(1) + " \u2605 (" + seller.reviewCount + " reviews)";
    return (
      <Link
        key={seller.id}
        to="/store/$sellerId"
        params={{ sellerId: seller.id }}
        className="rounded-2xl border border-border bg-card p-4 shadow-soft transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-elegant"
      >
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 overflow-hidden rounded-full border border-border bg-primary/10">
            {seller.displayImage ? (
              <img src={seller.displayImage} alt={seller.storeName} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-lg font-bold text-primary">{initial}</div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="truncate text-sm font-semibold text-foreground">{seller.storeName}</span>
              <BadgeCheck className="h-4 w-4 shrink-0 text-primary" />
            </div>
          </div>
        </div>
        <div className="mt-3 space-y-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Star className="h-3.5 w-3.5 fill-accent-orange text-accent-orange" />
            <span>{ratingText}</span>
          </div>
          {seller.city ? (
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              <span>{seller.city}</span>
            </div>
          ) : null}
        </div>
      </Link>
    );
  }

  const filtered = sellers.filter(function (s: any) {
    if (!query.trim()) return true;
    return (s.storeName || "").toLowerCase().indexOf(query.trim().toLowerCase()) !== -1;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <Link to="/" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        &larr; Back to marketplace
      </Link>
      <h1 className="font-display text-xl font-bold">Sellers</h1>
      <p className="mt-1 text-sm text-muted-foreground">Browse all approved stores on SABU.</p>
      <div className="mt-4 flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 shadow-soft sm:max-w-sm">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={function (e) { setQuery(e.target.value); }}
          placeholder="Search sellers..."
          className="w-full bg-transparent text-sm outline-none"
        />
      </div>
      {loading ? (
        <p className="mt-6 text-sm text-muted-foreground">Loading...</p>
      ) : filtered.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">No sellers found.</p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map(renderSeller)}
        </div>
      )}
    </div>
  );
}
