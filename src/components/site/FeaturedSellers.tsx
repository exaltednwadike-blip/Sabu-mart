import { BadgeCheck, Star, Store } from "lucide-react";
import { useEffect, useState } from "react";
import { SectionHeader } from "./CategoryGrid";
import { getFeaturedSellers, type FeaturedSeller } from "@/lib/sellers";

const TINTS = ["primary", "orange"];

export function FeaturedSellers() {
  const [sellers, setSellers] = useState<FeaturedSeller[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(function () {
    getFeaturedSellers(6)
      .then(setSellers)
      .catch(function () {
        setSellers([]);
      })
      .finally(function () {
        setLoading(false);
      });
  }, []);

  function renderSeller(s: FeaturedSeller, i: number) {
    const tint = TINTS[i % 2];
    const initial = s.storeName.charAt(0).toUpperCase();
    return (
      <article key={s.id} className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition hover:-translate-y-0.5 hover:shadow-soft">
        <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl font-display text-2xl font-bold ${
          tint === "primary" ? "bg-primary/10 text-primary" : "bg-accent-orange/15 text-accent-orange"
        }`}>
          {initial}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="truncate font-semibold">{s.storeName}</h3>
            <BadgeCheck className="h-4 w-4 shrink-0 text-primary" />
          </div>
          <div className="text-xs text-muted-foreground">{s.category}</div>
          <div className="mt-1.5 flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1 text-foreground">
              <Star className="h-3 w-3 fill-accent-orange text-accent-orange" />
              {s.reviewCount > 0 ? s.rating.toFixed(2) : "New"}
            </span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <Store className="h-3 w-3" /> {s.salesCount} sale{s.salesCount !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
        <button className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold transition hover:bg-primary hover:text-primary-foreground">
          Visit
        </button>
      </article>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-14">
      <SectionHeader
        eyebrow="Top rated"
        title="Featured sellers"
        subtitle="Verified businesses trusted by buyers across Nigeria."
        action={<a href="#" className="text-sm font-semibold text-primary hover:underline">Browse all sellers →</a>}
      />
      {loading ? (
        <div className="mt-8 text-center text-sm text-muted-foreground">Loading sellers...</div>
      ) : sellers.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          No approved sellers yet. Once sellers are approved, they'll show up here.
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sellers.map(renderSeller)}
        </div>
      )}
    </section>
  );
}
