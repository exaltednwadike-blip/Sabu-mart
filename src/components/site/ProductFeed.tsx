import { useCallback, useEffect, useRef, useState } from "react";
import { SectionHeader } from "./CategoryGrid";
import { ProductCard } from "./ProductGrid";
import { getPublishedProducts } from "@/lib/products";

const PAGE_SIZE = 16;

export function ProductFeed() {
  const [products, setProducts] = useState<any[]>([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const loadMore = useCallback(
    function () {
      if (loading || !hasMore) return;
      setLoading(true);
      getPublishedProducts(PAGE_SIZE, offset)
        .then(function (data) {
          const batch = data || [];
          setProducts(function (prev) { return prev.concat(batch); });
          setOffset(function (prev) { return prev + PAGE_SIZE; });
          if (batch.length < PAGE_SIZE) {
            setHasMore(false);
          }
        })
        .catch(function () {
          setHasMore(false);
        })
        .finally(function () {
          setLoading(false);
          setInitialLoading(false);
        });
    },
    [offset, loading, hasMore]
  );

  useEffect(function () {
    loadMore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(
    function () {
      const node = sentinelRef.current;
      if (!node) return;
      const observer = new IntersectionObserver(
        function (entries) {
          if (entries[0].isIntersecting) {
            loadMore();
          }
        },
        { rootMargin: "400px" }
      );
      observer.observe(node);
      return function () {
        observer.disconnect();
      };
    },
    [loadMore]
  );

  function renderCard(p: any) {
    return <ProductCard key={p.id} p={p} />;
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-14">
      <SectionHeader
        eyebrow="Explore"
        title="Discover something new"
        subtitle="A fresh mix of items from sellers across Nigeria — keep scrolling for more."
      />
      {initialLoading ? (
        <div className="mt-8 text-center text-sm text-muted-foreground">Loading products...</div>
      ) : products.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          No products published yet. Check back soon.
        </div>
      ) : (
        <>
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {products.map(renderCard)}
          </div>
          <div ref={sentinelRef} className="h-10 w-full" />
          {loading ? (
            <div className="mt-4 text-center text-sm text-muted-foreground">Loading more...</div>
          ) : null}
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
