import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { searchProducts } from "@/lib/products";
import { ProductCard } from "@/components/site/ProductGrid";

export const Route = createFileRoute("/search")({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search.q === "string" ? search.q : "",
  }),
  component: SearchPage,
});

function SearchPage() {
  const { q } = Route.useSearch();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(
    function () {
      if (!q) {
        setProducts([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      searchProducts(q)
        .then(function (data) {
          setProducts(data ?? []);
        })
        .catch(function () {
          setProducts([]);
        })
        .finally(function () {
          setLoading(false);
        });
    },
    [q],
  );

  function renderCard(p: any) {
    return <ProductCard key={p.id} p={p} />;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <Link to="/" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        &larr; Back to marketplace
      </Link>

      <h1 className="font-display text-2xl font-bold">
        {q ? `Results for "${q}"` : "Search"}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {!q
          ? "Type something in the search bar to find products."
          : loading
            ? "Searching..."
            : products.length + " product" + (products.length !== 1 ? "s" : "") + " found"}
      </p>

      {loading ? (
        <div className="mt-8 text-center text-sm text-muted-foreground">Searching...</div>
      ) : q && products.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          No products match "{q}". Try a different search term.
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {products.map(renderCard)}
        </div>
      )}
    </div>
  );
}
