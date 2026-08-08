import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Star, BadgeCheck, ShoppingBag } from "lucide-react";
import { SectionHeader } from "./CategoryGrid";
import { getTopSellers, getSellerProducts } from "@/lib/sellers";
import { getSellerRatingSummary } from "@/lib/analytics";

export function FeaturedSellers() {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(function () {
    getTopSellers(6)
      .then(function (data) {
        return Promise.all(
          data.map(function (s: any) {
            return Promise.all([
              getSellerProducts(s.id),
              getSellerRatingSummary(s.id),
            ]).then(function (results) {
              return {
                id: s.id,
                store_name: s.store_name,
                productCount: results[0].length,
                rating: results[1],
              };
            });
          })
        );
      })
      .then(function (enriched) {
        setSellers(enriched.filter(function (s: any) { return s.productCount > 0; }));
      })
      .catch(function () { setSellers([]); })
      .finally(function () { setLoading(false); });
  }, []);

  function renderSeller(s: any) {
    return (
      <div key={s.id} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl gradient-brand font-display font-bold text-primary-foreground">
          {s.store_name ? s.store_name.charAt(0).toUpperCase() : "S"}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <span className="truncate text-sm font-semibold">{s.store_name}</span>
            <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-primary" />
          </div>
          <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
            {s.rating.count > 0 ? (
              <span className="flex items-center gap-0.5">
                <Star className="h-3 w-3 fill-accent-orange text-accent-orange" /> {s.rating.average.toFixed(2)}
              </span>
            ) : (
              <span>New seller</span>
            )}
            <span className="flex items-center gap-0.5">
              <ShoppingBag className="h-3 w-3" /> {s.productCount} listing{s.productCount !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
        <Link
          to="/store/$sellerId"
          params={{ sellerId: s.id }}
          className="shrink-0 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary hover:text-primary-foreground"
        >
          Visit
        </Link>
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-14">
      <SectionHeader
        eyebrow="Top rated"
        title="Featured sellers"
        subtitle="Real verified stores on SABU."
      />
      {loading ? (
        <div className="mt-8 text-center text-sm text-muted-foreground">Loading sellers...</div>
      ) : sellers.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          No active sellers with listings yet.
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sellers.map(renderSeller)}
        </div>
      )}
    </section>
  );
}
