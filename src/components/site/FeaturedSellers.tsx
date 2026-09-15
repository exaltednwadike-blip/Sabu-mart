import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Star, BadgeCheck, MapPin } from "lucide-react";
import { SectionHeader } from "./CategoryGrid";
import { getFeaturedSellers } from "@/lib/products";

export function FeaturedSellers() {
  const [sellers, setSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(function () {
    getFeaturedSellers(8)
      .then(function (data) {
        setSellers(data || []);
      })
      .catch(function () {
        setSellers([]);
      })
      .finally(function () {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return null;
  }

  if (sellers.length === 0) {
    return null;
  }

  function renderSeller(seller: any) {
    const initial = seller.storeName ? seller.storeName.charAt(0).toUpperCase() : "S";
    const ratingText = seller.reviewCount === 0
      ? "New seller"
      : `${seller.avgRating.toFixed(1)} ★ (${seller.reviewCount} reviews)`;

    return (
      <Link
        key={seller.id}
        to="/store/$sellerId"
        params={{ sellerId: seller.id }}
        className="group min-w-[220px] flex-1 rounded-2xl border border-border bg-card p-4 shadow-soft transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-elegant"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
            {initial}
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

  return (
    <section className="mx-auto max-w-7xl px-4 py-14">
      <SectionHeader
        eyebrow="Top sellers"
        title="Featured sellers"
        subtitle="Approved stores that are active on SABU."
      />
      <div className="mt-8 flex gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {sellers.map(renderSeller)}
      </div>
    </section>
  );
}
