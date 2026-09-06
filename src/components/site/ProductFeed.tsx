import { useCallback, useEffect, useRef, useState } from "react";
import { SectionHeader } from "./CategoryGrid";
import { ProductCard } from "./ProductGrid";
import { getPublishedProducts } from "@/lib/products";

const POOL_SIZE = 150;
const BATCH_SIZE = 8;

function shuffle<T>(arr: T[]): T[] {
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = copy[i];
    copy[i] = copy[j];
    copy[j] = tmp;
  }
  return copy;
}

export function ProductFeed() {
  const [pool, setPool] = useState<any[]>([]);
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const [initialLoading, setInitialLoading] = useState(true);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(function () {
    getPublishedProducts(POOL_SIZE, 0)
      .then(function (data) {
        setPool(shuffle(data || []));
      })
      .catch(function () {
        setPool([]);
      })
      .finally(function () {
        setInitialLoading(false);
      });
  }, []);

  const revealMore = useCallback(function () {
    setVisibleCount(function (prev) { return Math.min(prev + BATCH_SIZE, pool.length); });
  }, [pool.length]);

  useEffect(
    function () {
      const node = sentinelRef.current;
      if (!node) return;
      const observer = new IntersectionObserver(
        function (entries) {
          if (entries[0].isIntersecting) {
            revealMore();
          }
        },
        { rootMargin: "400px" }
      );
      observer.observe(node);
      return function () {
        observer.disconnect();
      };
    },
    [revealMore]
  );

  function renderCard(p: any) {
    return <ProductCard key={p.id} p={p} />;
  }

  const visibleProducts = pool.slice(0, visibleCount);
  const hasMore = visibleCount < pool.length;

  return (
    <section className="mx-auto max-w-7xl px-4 py-14">
      <SectionHeader
        eyebrow="Explore"
        title="Discover something new"
        subtitle="A fresh mix of items from sellers across Nigeria — keep scrolling for more."
      />
      {initialLoading ? (
        <div className="mt-8 text-center text-sm text-muted-foreground">Loading products...</div>
      ) : pool.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          No products published yet. Check back soon.
        </div>
      ) : (
        <>
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {visibleProducts.map(renderCard)}
          </div>
          <div ref={sentinelRef} className="h-10 w-full" />
          {!hasMore ? (
            <div className="mt-4 text-center text-sm text-muted-foreground">
              You&apos;ve reached the end — check back later for more.
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}
