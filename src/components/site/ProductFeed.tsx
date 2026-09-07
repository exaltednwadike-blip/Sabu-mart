import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { SectionHeader } from "./CategoryGrid";
import { getPublishedProducts } from "@/lib/products";

export function ProductFeed() {
  const [products, setProducts] = useState<any[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(function () {
    getPublishedProducts(18, 0)
      .then(function (data) {
        setProducts(data || []);
      })
      .catch(function () {
        setProducts([]);
      })
      .finally(function () {
        setInitialLoading(false);
      });
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-4 py-14">
      <SectionHeader
        eyebrow="Explore"
        title="Browse the latest"
        subtitle="Fresh picks from trusted sellers across Nigeria."
      />

      {initialLoading ? (
        <div className="mt-8 text-center text-sm text-muted-foreground">Loading products...</div>
      ) : products.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          No products published yet. Check back soon.
        </div>
      ) : (
        <div className="mt-8 overflow-x-auto pb-4">
          <div className="flex min-w-max gap-4">
            {products.map(function (product) {
              const image = product.images && product.images.length > 0 ? product.images[0] : null;

              return (
                <Link
                  key={product.id}
                  to="/product/$productId"
                  params={{ productId: product.id }}
                  className="group block w-[260px] shrink-0 overflow-hidden rounded-[1.6rem] border border-border bg-card shadow-soft transition hover:-translate-y-1 hover:shadow-elegant"
                >
                  <div className="relative aspect-[4/5] overflow-hidden">
                    {image ? (
                      <img src={image} alt={product.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-muted text-xs text-muted-foreground">No image</div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-black/0" />
                    <div className="absolute left-3 right-3 bottom-3 text-white">
                      <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-white/90 backdrop-blur-sm">
                        <Sparkles className="h-3.5 w-3.5" /> New
                      </div>
                      <h3 className="line-clamp-2 text-base font-semibold leading-tight">{product.title}</h3>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <span className="text-lg font-bold">₦{Number(product.price).toLocaleString()}</span>
                        <span className="rounded-full bg-white/10 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-white/90">Open</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
