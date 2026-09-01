import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MapPin, MessageCircle, Heart, ShoppingCart, BadgeCheck, Truck, Check, Star } from "lucide-react";
import { getProductById, getRelatedProducts, recordProductView } from "@/lib/products";
import { addToCart } from "@/lib/cart";
import { toggleWishlist, isInWishlist } from "@/lib/wishlist";
import { getCurrentUser } from "@/lib/auth";
import { getProductReviews, getProductRatingSummary } from "@/lib/reviews";

export const Route = createFileRoute("/product/$productId")({
  component: ProductDetail,
});

function ProductDetail() {
  const params = Route.useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [ratingSummary, setRatingSummary] = useState({ average: 0, count: 0 });
  const [activeImage, setActiveImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [added, setAdded] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(function () {
    getProductById(params.productId)
      .then(function (data) {
        setProduct(data);
        if (data.category_id) {
          getRelatedProducts(data.category_id, data.id).then(setRelated);
        }
        getProductReviews(data.id).then(setReviews);
        getProductRatingSummary(data.id).then(setRatingSummary);
        getCurrentUser().then(function (user) {
          recordProductView(data.id, user ? user.id : null).catch(function () {});
          if (!user) return;
          isInWishlist(user.id, data.id).then(setWishlisted);
        });
      })
      .catch(function () {
        setNotFound(true);
      })
      .finally(function () {
        setLoading(false);
      });
  }, [params.productId]);

  function handleAddToCart() {
    setBusy(true);
    getCurrentUser()
      .then(function (user) {
        if (!user) {
          navigate({ to: "/login" });
          return null;
        }
        return addToCart(user.id, product.id, 1);
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

  function handleToggleWishlist() {
    getCurrentUser().then(function (user) {
      if (!user) {
        navigate({ to: "/login" });
        return;
      }
      toggleWishlist(user.id, product.id).then(setWishlisted);
    });
  }

  function handleChatSeller() {
    const number = product.whatsapp || product.phone;
    if (!number) return;
    const cleaned = number.replace(/[^0-9]/g, "");
    const text = encodeURIComponent("Hi, I'm interested in your listing: " + product.title + " on SABU Marketplace.");
    window.open("https://wa.me/" + cleaned + "?text=" + text, "_blank");
  }

  function renderStars(rating: number, size: string) {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={size + " " + (i <= Math.round(rating) ? "fill-accent-orange text-accent-orange" : "text-muted-foreground/30")}
        />
      );
    }
    return stars;
  }

  if (loading) {
    return <div className="mx-auto max-w-7xl px-4 py-14 text-center text-sm text-muted-foreground">Loading...</div>;
  }

  if (notFound || !product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-14 text-center">
        <p className="text-sm text-muted-foreground">This product isn't available anymore.</p>
        <Link to="/" className="mt-3 inline-block text-sm font-semibold text-primary hover:underline">Back to marketplace</Link>
      </div>
    );
  }

  const images = product.images && product.images.length > 0 ? product.images : [];
  const sellerName = product.profiles && product.profiles.store_name ? product.profiles.store_name : "SABU Seller";
  const location = product.neighbourhood ? product.neighbourhood + ", " + product.city : product.city;

  function renderThumb(img: string, i: number) {
    return (
      <button
        key={i}
        onClick={function () { setActiveImage(i); }}
        className={"aspect-square overflow-hidden rounded-lg border-2 " + (activeImage === i ? "border-primary" : "border-transparent")}
      >
        <img src={img} alt="" className="h-full w-full object-cover" />
      </button>
    );
  }

  function renderRelated(p: any) {
    const img = p.images && p.images.length > 0 ? p.images[0] : null;
    return (
      <Link
        key={p.id}
        to="/product/$productId"
        params={{ productId: p.id }}
        className="group overflow-hidden rounded-2xl border border-border bg-card transition hover:-translate-y-1 hover:shadow-elegant"
      >
        <div className="aspect-square overflow-hidden bg-muted">
          {img ? (
            <img src={img} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-110" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">No image</div>
          )}
        </div>
        <div className="p-3">
          <h4 className="line-clamp-2 text-sm font-medium">{p.title}</h4>
          <p className="mt-1 text-sm font-bold text-primary">₦{Number(p.price).toLocaleString()}</p>
        </div>
      </Link>
    );
  }

  function renderReview(r: any) {
    const initial = r.buyer_name ? r.buyer_name.charAt(0).toUpperCase() : "B";
    return (
      <div key={r.id} className="border-b border-border py-4 last:border-0">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
            {initial}
          </div>
          <div>
            <p className="text-sm font-medium">{r.buyer_name || "Verified buyer"}</p>
            <div className="flex items-center gap-0.5">{renderStars(r.rating, "h-3.5 w-3.5")}</div>
          </div>
          <span className="ml-auto text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</span>
        </div>
        {r.comment ? <p className="mt-2 text-sm text-muted-foreground">{r.comment}</p> : null}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <Link to="/" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        &larr; Back to marketplace
      </Link>

      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <div className="aspect-square overflow-hidden rounded-2xl border border-border bg-muted">
            {images.length > 0 ? (
              <img src={images[activeImage]} alt={product.title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">No image</div>
            )}
          </div>
          {images.length > 1 ? (
            <div className="mt-3 grid grid-cols-4 gap-2">
              {images.map(renderThumb)}
            </div>
          ) : null}
          {product.videos && product.videos.length > 0 ? (
            <div className="mt-4">
              <h3 className="mb-2 text-sm font-semibold">Videos</h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {product.videos.map(function (vid: string, i: number) {
                  return (
                    <video
                      key={i}
                      src={vid}
                      controls
                      className="aspect-square w-full rounded-lg border border-border bg-black object-cover"
                    />
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>

        <div>
          <div className="flex items-start justify-between gap-3">
            <h1 className="font-display text-2xl font-bold">{product.title}</h1>
            <button
              onClick={handleToggleWishlist}
              className={"rounded-full border border-border p-2.5 " + (wishlisted ? "text-destructive" : "text-muted-foreground")}
            >
              <Heart className="h-5 w-5" fill={wishlisted ? "currentColor" : "none"} />
            </button>
          </div>

          {ratingSummary.count > 0 ? (
            <div className="mt-1.5 flex items-center gap-2">
              <div className="flex items-center gap-0.5">{renderStars(ratingSummary.average, "h-4 w-4")}</div>
              <span className="text-sm font-medium">{ratingSummary.average.toFixed(1)}</span>
              <span className="text-sm text-muted-foreground">({ratingSummary.count} review{ratingSummary.count !== 1 ? "s" : ""})</span>
            </div>
          ) : (
            <p className="mt-1.5 text-sm text-muted-foreground">No reviews yet</p>
          )}

          <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" /> {location}
            {product.negotiable ? (
              <span className="rounded-full bg-accent-orange/15 px-2 py-0.5 text-[11px] font-semibold text-accent-orange">Negotiable</span>
            ) : null}
          </div>

          <div className="mt-4 font-display text-3xl font-bold text-primary">₦{Number(product.price).toLocaleString()}</div>

          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-muted px-3 py-1 font-medium">{product.condition}</span>
            {product.listing_categories ? (
              <span className="rounded-full bg-muted px-3 py-1 font-medium">{product.listing_categories.name}</span>
            ) : null}
            {product.free_delivery_lagos ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-3 py-1 font-medium text-success">
                <Truck className="h-3 w-3" /> Free delivery in Lagos
              </span>
            ) : null}
          </div>

          {product.description ? (
            <p className="mt-5 whitespace-pre-line text-sm text-muted-foreground">{product.description}</p>
          ) : null}

          <div className="mt-5 flex items-center gap-2 rounded-xl border border-border bg-card p-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
              {sellerName.charAt(0).toUpperCase()}
            </div>
            <div className="flex items-center gap-1 text-sm font-medium">
              {sellerName} <BadgeCheck className="h-4 w-4 text-primary" />
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              onClick={handleAddToCart}
              disabled={busy}
              className="flex items-center justify-center gap-2 rounded-xl gradient-brand py-3 text-sm font-semibold text-primary-foreground shadow-soft hover:opacity-90 disabled:opacity-60"
            >
              {added ? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
              {added ? "Added to cart" : "Add to cart"}
            </button>
            <button
              onClick={handleChatSeller}
              className="flex items-center justify-center gap-2 rounded-xl border border-border py-3 text-sm font-semibold hover:bg-accent"
            >
              <MessageCircle className="h-4 w-4" /> Chat on WhatsApp
            </button>
          </div>
        </div>
      </div>

      <div className="mt-16">
        <h2 className="font-display text-xl font-bold">Reviews {ratingSummary.count > 0 ? "(" + ratingSummary.count + ")" : ""}</h2>
        {reviews.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">No reviews yet. Be the first to buy and review this product.</p>
        ) : (
          <div className="mt-4 max-w-2xl">
            {reviews.map(renderReview)}
          </div>
        )}
      </div>

      {related.length > 0 ? (
        <div className="mt-16">
          <h2 className="font-display text-xl font-bold">Similar products</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {related.map(renderRelated)}
          </div>
        </div>
      ) : null}
    </div>
  );
}
