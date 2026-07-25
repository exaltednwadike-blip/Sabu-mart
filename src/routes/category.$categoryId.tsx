import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getProductsByCategory, getCategories } from "@/lib/products";
import { ProductCard } from "@/components/site/ProductGrid";

export const Route = createFileRoute("/category/$categoryId")({
  component: CategoryPage,
});

function CategoryPage() {
  const params = Route.useParams();
  const [products, setProducts] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(function () {
    Promise.all([
      getProductsByCategory(params.categoryId),
      getCategories(),
    ])
      .then(function (results) {
        setProducts(results[0]);
        const match = results[1].find(function (c: any) { return c.id === params.categoryId; });
        setCategoryName(match ? match.name : "Category");
      })
      .finally(function () {
        setLoading(false);
      });
  }, [params.categoryId]);

  function renderCard(p: any) {
    return <ProductCard key={p.id} p={p} />;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <Link to="/" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        &larr; Back to marketplace
      </Link>

      <h1 className="font-display text-2xl font-bold">{categoryName}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {loading ? "Loading..." : products.length + " product" + (products.length !== 1 ? "s" : "") + " available"}
      </p>

      {loading ? (
        <div className="mt-8 text-center text-sm text-muted-foreground">Loading products...</div>
      ) : products.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          No products in this category yet.
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {products.map(renderCard)}
        </div>
      )}
    </div>
  );
}
