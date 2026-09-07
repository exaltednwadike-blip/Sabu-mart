import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles } from "lucide-react";
import { SectionHeader } from "./CategoryGrid";
import { getPublishedProducts } from "@/lib/products";

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
  const [products, setProducts] = useState<any[]>([]);
  const [index, setIndex] = useState(0);
  const [initialLoading, setInitialLoading] = useState(true);
  const [autoPlay, setAutoPlay] = useState(true);
  const timerRef = useRef<number | null>(null);

  useEffect(function () {
    getPublishedProducts(30, 0)
      .then(function (data) {
        setProducts(shuffle(data || []));
      })
      .catch(function () {
        setProducts([]);
      })
      .finally(function () {
        setInitialLoading(false);
      });
  }, []);

  useEffect(
    function () {
      if (products.length < 2 || !autoPlay) return;
      timerRef.current = window.setInterval(function () {
        setIndex(function (prev) {
          return (prev + 1) % products.length;
        });
      }, 2800);
      return function () {
        if (timerRef.current) window.clearInterval(timerRef.current);
      };
    },
    [products.length, autoPlay]
  );

  const slides = useMemo(function () {
    if (products.length === 0) return [];
    const total = products.length;
    return Array.from({ length: 3 }, function (_, slot) {
      const offset = slot - 1;
      const itemIndex = (index + offset + total) % total;
      const isCenter = slot === 1;
      return {
        product: products[itemIndex],
        left: isCenter ? "50%" : offset < 0 ? "18%" : "82%",
        scale: isCenter ? 1 : 0.82,
        blur: isCenter ? "blur(0px)" : "blur(5px)",
        opacity: isCenter ? 1 : 0.5,
        zIndex: isCenter ? 30 : 10,
      };
    });
  }, [products, index]);

  const activeProduct = slides.find(function (slide) { return slide.product && slide.left === "50%"; })?.product ?? products[index];

  function handleDiscover() {
    setAutoPlay(false);
    setIndex(function (prev) {
      if (products.length === 0) return 0;
      return (prev + 1) % products.length;
    });
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-14">
      <SectionHeader
        eyebrow="Explore"
        title="Discover something new"
        subtitle="A fresh mix of items from sellers across Nigeria — one new find at a time."
      />
      {initialLoading ? (
        <div className="mt-8 text-center text-sm text-muted-foreground">Loading products...</div>
      ) : products.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          No products published yet. Check back soon.
        </div>
      ) : (
        <>
          <div className="relative mx-auto mt-8 h-[420px] w-full max-w-[980px] overflow-hidden rounded-[2rem] border border-border bg-gradient-to-b from-muted/40 to-background sm:h-[470px]">
            {slides.map(function (slide, slotIndex) {
              const product = slide.product;
              const image = product.images && product.images.length > 0 ? product.images[0] : null;
              const isCenter = slotIndex === 1;
              return (
                <Link
                  key={`${product.id}-${slotIndex}`}
                  to="/product/$productId"
                  params={{ productId: product.id }}
                  className={"absolute top-1/2 w-[68%] max-w-[320px] -translate-y-1/2 overflow-hidden rounded-[1.8rem] border border-border/70 bg-card shadow-elegant transition-all duration-700 ease-out " + (isCenter ? "pointer-events-auto" : "pointer-events-none")}
                  style={{
                    left: slide.left,
                    transform: "translate(-50%, -50%) scale(" + slide.scale + ")",
                    opacity: slide.opacity,
                    filter: slide.blur,
                    zIndex: slide.zIndex,
                  }}
                >
                  <div className="relative aspect-[4/5] overflow-hidden">
                    {image ? (
                      <img src={image} alt={product.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-muted text-xs text-muted-foreground">No image</div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-black/0" />
                    <div className="absolute inset-x-0 bottom-0 p-4 text-left text-white">
                      <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-white/90 backdrop-blur-sm">
                        <Sparkles className="h-3.5 w-3.5" /> New find
                      </div>
                      <h3 className="line-clamp-2 text-base font-semibold leading-tight">{product.title}</h3>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <span className="text-lg font-bold">₦{Number(product.price).toLocaleString()}</span>
                        <span className="rounded-full bg-white/10 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-white/90">View</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 text-center">
            <button
              type="button"
              onClick={handleDiscover}
              className="inline-flex items-center gap-2 rounded-full gradient-brand px-6 py-3 text-sm font-semibold text-primary-foreground shadow-soft transition hover:opacity-95"
            >
              Discover more <ArrowRight className="h-4 w-4" />
            </button>
            {activeProduct ? (
              <Link
                to="/product/$productId"
                params={{ productId: activeProduct.id }}
                className="text-sm font-semibold text-primary underline-offset-4 hover:underline"
              >
                Open this item
              </Link>
            ) : null}
          </div>
        </>
      )}
    </section>
  );
}
