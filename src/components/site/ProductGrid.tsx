import { useEffect, useState } from "react";
import { Heart, MapPin, MessageCircle, BadgeCheck, ShoppingCart, Check } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { SectionHeader } from "./CategoryGrid";
import { getPublishedProducts } from "@/lib/products";
import { addToCart } from "@/lib/cart";
import { toggleWishlist, isInWishlist } from "@/lib/wishlist";
import { getCurrentUser } from "@/lib/auth";

function formatPrice(n: number) {
  return "₦" + n.toLocaleString();
}

export function ProductGrid(props: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  variant?: "default" | "flash";
}) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(function () {
    getPublishedProducts(12)
      .then(function (data) {
        setProducts(data);
      })
      .catch(function () {
        setProducts([]);
      })
      .finally(function () {
        setLoading(false);
      });
  }, []);

  function renderCard(p: any) {
    return <ProductCard key={p.id} p={p} />;
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-14">
      <SectionHeader
        eyebrow={props.eyebrow}
        title={props.title}
        subtitle={props.subtitle}
        action={
          <a href="#" className="text-sm font-semibold text-primary hover:underline">
            See all -&gt;
          </a>
        }
      />
      {loading ? (
        <div className="mt-8 text-center text-sm text-muted-foreground">Loading products...</div>
      ) : products.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          No products published yet. Check back soon.
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {products.map(renderCard)}
        </div>
      )}
    </section>
  );
}

export function ProductCard(props: { p: any }) {
  const p = props.p;
  const navigate = useNavigate();
  const [added, setAdded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [wishBusy, setWishBusy] = useState(false);
  const image = p.images && p.images.length > 0 ? p.images[0] : null;
  const location = p.neighbourhood ? p.neighbourhood + ", " + p.city : p.city;
  const sellerName = p.profiles && p.profiles.store_name ? p.profiles.store_name : "SABU Seller";

  useEffect(function () {
    getCurrentUser().then(function (user) {
      if (!user) return;
      isInWishlist(user.id, p.id).then(function (result) {
        setWishlisted(result);
      });
    });
  }, []);

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setBusy(true);
    getCurrentUser()
      .then(function (user) {
        if (!user) {
          navigate({ to: "/login" });
          return null;
        }
        return addToCart(user.id, p.id, 1);
      })
      .then(function (result) {
        if (result !== null) {
          setAdded(true);
          setTimeout(function () { setAdded(false); }, 2000);
        }
      })
      .finally(function () {
        setBusy(false);
      });
  }

  function handleToggleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setWishBusy(true);
    getCurrentUser()
      .then(function (user) {
        if (!user) {
          navigate({ to: "/login" });
          return null;
        }
        return toggleWishlist(user.id, p.id);
      })
      .then(function (result) {
        if (result !== null) {
          setWishlisted(result);
        }
      })
      .finally(function () {
        setWishBusy(false);
      });
  }

  return (
    <Link
      to="/product/$productId"
      params={{ productId: p.id }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition hover:-translate-y-1 hover:shadow-elegant"
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        {image ? (
          <img src={image} alt={p.title} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-110" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">No image</div>
        )}
        <button
          onClick={handleToggleWishlist}
          disabled={wishBusy}
          className={"absolute bottom-2 right-2 rounded-full bg-background/90 p-2 shadow-soft backdrop-blur transition hover:text-destructive " + (wishlisted ? "text-destructive opacity-100" : "text-muted-foreground opacity-0 group-hover:opacity-100")}
        >
          <Heart className="h-4 w-4" fill={wishlisted ? "currentColor" : "none"} />
        </button>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <h3 className="line-clamp-2 text-sm font-medium leading-tight text-foreground">{p.title}</h3>
        <div className="mt-auto flex items-baseline gap-2">
          <span className="text-base font-bold text-foreground">{formatPrice(Number(p.price))}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <MapPin className="h-3 w-3" /> {location}
        </div>
        <div className="flex items-center justify-between gap-2 border-t border-border pt-2">
          <div className="flex min-w-0 items-center gap-1">
            <span className="truncate text-[11px] font-medium text-foreground">{sellerName}</span>
            <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-primary" />
          </div>
        </div>
        <div className="mt-1 grid grid-cols-2 gap-1.5">
          <button
            onClick={handleAddToCart}
            disabled={busy}
            className="flex items-center justify-center gap-1 rounded-lg bg-primary py-1.5 text-xs font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
          >
            {added ? <Check className="h-3.5 w-3.5" /> : <ShoppingCart className="h-3.5 w-3.5" />}
            {added ? "Added" : "Add to cart"}
          </button>
          <span className="flex items-center justify-center gap-1 rounded-lg bg-primary/10 py-1.5 text-xs font-semibold text-primary">
            <MessageCircle className="h-3.5 w-3.5" /> View
          </span>
        </div>
      </div>
    </Link>
  );
}
