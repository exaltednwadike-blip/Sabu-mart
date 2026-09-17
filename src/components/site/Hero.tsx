import { Search, MapPin, ShoppingBag, Store, UtensilsCrossed, MessageCircle, Shield, TrendingUp, Users, UserPlus } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { getMarketplaceStats } from "@/lib/products";
import heroSellImg from "@/assets/hero-slide-sell.jpg";
import heroFoodImg from "@/assets/hero-slide-food.jpg";
import heroChatImg from "@/assets/hero-slide-chat.jpg";
import { getPublicUserCount } from "@/lib/stats-server";
import { getCurrentUser } from "@/lib/auth";

const SLIDES = [
  {
    icon: ShoppingBag,
    headline: "Shop thousands of items near you",
    body: "From phones to fashion to furniture — real listings from real sellers across Nigeria.",
    cta: "Browse now",
    to: "/#product-feed",
    gradient: "from-primary to-primary/70",
  },
  {
    icon: Store,
    headline: "Sell on SABU — free during launch",
    body: "List up to 10 products at no cost, get approved fast, and reach buyers directly.",
    cta: "Become a seller",
    to: "/signup",
    gradient: "from-accent-orange to-accent-orange/70",
    image: heroSellImg,
  },
  {
    icon: UtensilsCrossed,
    headline: "Hungry? Order real Nigerian food",
    body: "Browse restaurants near you and order your favorites in a few taps.",
    cta: "Order food",
    to: "/food",
    gradient: "from-primary to-accent-orange",
    image: heroFoodImg,
  },
  {
    icon: MessageCircle,
    headline: "Message sellers directly",
    body: "No middleman — chat on WhatsApp to agree on price and delivery.",
    cta: "Learn how",
    to: "/faq",
    gradient: "from-accent-orange to-primary",
    image: heroChatImg,
  },
];

function formatCount(n: number) {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "K+";
  return String(n);
}

export function Hero() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [slide, setSlide] = useState(0);
  const [checked, setChecked] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [stats, setStats] = useState({ productCount: 0, avgRating: 0, reviewCount: 0 });
  const [userCount, setUserCount] = useState(0);
  const [statsLoading, setStatsLoading] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(function () {
    getCurrentUser().then(function (user) {
      setLoggedIn(!!user);
      setChecked(true);
    });
    getMarketplaceStats()
      .then(setStats)
      .catch(function () {});
    getPublicUserCount()
      .then(setUserCount)
      .catch(function () {})
      .finally(function () {
        setStatsLoading(false);
      });
  }, []);

  useEffect(function () {
    timerRef.current = setInterval(function () {
      setSlide(function (prev) { return (prev + 1) % SLIDES.length; });
    }, 5000);
    return function () {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  function goToSlide(i: number) {
    setSlide(i);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(function () {
      setSlide(function (prev) { return (prev + 1) % SLIDES.length; });
    }, 5000);
  }

  function runSearch(term: string) {
    const trimmed = term.trim();
    if (!trimmed) return;
    navigate({ to: "/search", search: { q: trimmed } });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    runSearch(query);
  }

  const current = SLIDES[slide];
  const Icon = current.icon;

  return (
    <section className="mx-auto max-w-7xl px-4 pb-8 pt-6">
      {/* Ad-feed carousel */}
      <div className={"relative overflow-hidden rounded-[28px] bg-gradient-to-br p-8 text-primary-foreground shadow-elegant sm:p-12 " + current.gradient}>
        {(current as any).image ? (
          <img
            src={(current as any).image}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-40 mix-blend-overlay"
          />
        ) : null}
        <div className="relative flex flex-col items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
            <Icon className="h-6 w-6" />
          </div>
          <h1 className="font-display text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
            {current.headline}
          </h1>
          <p className="max-w-lg text-sm text-primary-foreground/90 sm:text-base">{current.body}</p>
          <Link
            to={current.to}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-foreground shadow-soft transition hover:opacity-90"
          >
            {current.cta}
          </Link>
        </div>

        <div className="mt-8 flex justify-center gap-2">
          {SLIDES.map(function (_, i) {
            return (
              <button
                key={i}
                type="button"
                onClick={function () { goToSlide(i); }}
                aria-label={"Go to slide " + (i + 1)}
                className={"h-1.5 rounded-full transition-all " + (i === slide ? "w-8 bg-white" : "w-1.5 bg-white/40")}
              />
            );
          })}
        </div>
      </div>

      {/* Search + stats (logged-in only) / Sign up prompt (logged-out) */}
      {!checked ? null : loggedIn ? (
        <>
          <div className="mt-6 rounded-2xl border border-border bg-card p-2 shadow-soft">
            <form className="flex flex-col gap-2 md:flex-row" onSubmit={handleSubmit}>
              <div className="flex flex-1 items-center gap-2 rounded-xl bg-background px-4 py-3">
                <Search className="h-5 w-5 text-primary" />
                <input
                  value={query}
                  onChange={function (e) { setQuery(e.target.value); }}
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  placeholder="What are you looking for?"
                />
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-background px-4 py-3 md:w-48">
                <MapPin className="h-5 w-5 text-accent-orange" />
                <select className="flex-1 bg-transparent text-sm outline-none">
                  <option>Lagos</option>
                  <option>FCT (Abuja)</option>
                  <option>Rivers</option>
                  <option>Kano</option>
                  <option>Oyo</option>
                </select>
              </div>
              <button type="submit" className="rounded-xl gradient-brand px-6 py-3 text-sm font-semibold text-primary-foreground shadow-soft transition hover:opacity-95">
                Search
              </button>
            </form>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-4">
            <Stat icon={<Users className="h-4 w-4" />} value={statsLoading ? "…" : formatCount(userCount)} label="Users signed up" />
            <Stat icon={<TrendingUp className="h-4 w-4" />} value={statsLoading ? "…" : formatCount(stats.productCount)} label="Live listings" />
            <Stat icon={<Shield className="h-4 w-4" />} value={statsLoading ? "…" : stats.reviewCount > 0 ? stats.avgRating.toFixed(1) + "/5" : "No ratings yet"} label="Buyer rating" />
          </div>
        </>
      ) : (
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            to="/signup"
            className="inline-flex items-center justify-center gap-2 rounded-xl gradient-brand px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-soft transition hover:opacity-95"
          >
            <UserPlus className="h-4 w-4" /> Sign up to start buying
          </Link>
          <Link
            to="/signup"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-6 py-3.5 text-sm font-semibold shadow-soft transition hover:bg-accent"
          >
            <Store className="h-4 w-4" /> Become a seller — free
          </Link>
        </div>
      )}
    </section>
  );
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="flex items-center gap-2 text-primary">{icon}<span className="text-lg font-bold text-foreground">{value}</span></div>
      <div className="mt-0.5 text-[11px] text-muted-foreground">{label}</div>
    </div>
  );
}
