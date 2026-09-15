import { Search, MapPin, Shield, TrendingUp, Sparkles, Star, ArrowRight, UtensilsCrossed, BadgeCheck, MessagesSquare } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getMarketplaceStats, getTotalUserCount } from "@/lib/products";

function formatCount(n: number) {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "K+";
  return String(n);
}

const slides = [
  {
    title: "Shop thousands of items near you",
    body: "Find daily deals, quality items and trusted local sellers without the hassle.",
    cta: "Browse now",
    href: "/",
    tone: "from-primary via-primary/90 to-primary/70",
  },
  {
    title: "Sell on SABU — free during launch",
    body: "List up to 10 products at no cost and reach buyers directly on WhatsApp.",
    cta: "Become a seller",
    href: "/signup",
    tone: "from-accent-orange via-orange-500 to-primary",
  },
  {
    title: "Hungry? Order real Nigerian food",
    body: "Explore nearby restaurants and order your favourites without leaving the app.",
    cta: "Order food",
    href: "/food",
    tone: "from-amber-500 via-orange-500 to-red-500",
  },
  {
    title: "Message sellers directly",
    body: "Ask questions, negotiate prices and arrange delivery without jumping through hoops.",
    cta: "Learn how",
    href: "/faq",
    tone: "from-primary/90 via-teal-500 to-cyan-500",
  },
];

export function Hero() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [stats, setStats] = useState({ productCount: 0, userCount: 0, avgRating: 0, reviewCount: 0 });
  const [statsLoading, setStatsLoading] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(function () {
    Promise.all([
      getMarketplaceStats(),
      getTotalUserCount(),
    ])
      .then(function (results) {
        const marketStats = results[0];
        setStats({
          productCount: marketStats.productCount,
          userCount: results[1],
          avgRating: marketStats.avgRating,
          reviewCount: marketStats.reviewCount,
        });
      })
      .catch(function () {})
      .finally(function () {
        setStatsLoading(false);
      });
  }, []);

  useEffect(function () {
    const timer = window.setInterval(function () {
      setActiveSlide(function (previous) {
        return (previous + 1) % slides.length;
      });
    }, 5000);
    return function () {
      window.clearInterval(timer);
    };
  }, []);

  function runSearch(term: string) {
    const trimmed = term.trim();
    if (!trimmed) return;
    navigate({ to: "/search", search: { q: trimmed } });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    runSearch(query);
  }

  function handlePopularClick(term: string) {
    setQuery(term);
    runSearch(term);
  }

  const active = slides[activeSlide];

  return (
    <section className="relative overflow-hidden gradient-hero">
      <div className="pointer-events-none absolute inset-0 opacity-60" style={{ backgroundImage: "var(--gradient-mesh)" }} />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 pb-16 pt-10 lg:grid-cols-2 lg:pt-16">
        <div className="relative z-10 flex flex-col justify-center">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" /> Nigeria's fastest-growing marketplace
          </div>
          <h1 className="mt-5 font-display text-4xl font-bold leading-[1.05] tracking-tight text-foreground md:text-6xl">
            Everything you need,{" "}
            <span className="text-gradient-brand">from anyone</span>{" "}
            <span className="relative inline-block">
              nearby
              <svg className="absolute -bottom-2 left-0 w-full" height="8" viewBox="0 0 200 8" fill="none">
                <path d="M2 5C50 2 150 2 198 5" stroke="var(--accent-orange)" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </span>
            .
          </h1>
          <p className="mt-5 max-w-lg text-base text-muted-foreground md:text-lg">
            Shop products, book accommodation, rent vehicles, hire services and chat directly with
            verified sellers across Africa — all in one place.
          </p>

          <div className="mt-8 rounded-2xl border border-border bg-card p-2 shadow-elegant">
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
                  <option>Abuja</option>
                  <option>Port Harcourt</option>
                  <option>Kano</option>
                  <option>Ibadan</option>
                </select>
              </div>
              <button type="submit" className="rounded-xl gradient-brand px-6 py-3 text-sm font-semibold text-primary-foreground shadow-soft transition hover:opacity-95">
                Search
              </button>
            </form>
            <div className="flex flex-wrap gap-2 px-2 pb-1 pt-3">
              <span className="text-xs text-muted-foreground">Popular:</span>
              {[
                "iPhone 15",
                "3-bedroom apartment",
                "Toyota Camry",
                "Ankara fabric",
                "Fresh tomatoes",
              ].map(function (t) {
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={function () { handlePopularClick(t); }}
                    className="rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground transition hover:bg-primary hover:text-primary-foreground"
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-4">
            <Stat
              icon={<Shield className="h-4 w-4" />}
              value={statsLoading ? "…" : formatCount(stats.userCount)}
              label="Users signed up"
            />
            <Stat
              icon={<TrendingUp className="h-4 w-4" />}
              value={statsLoading ? "…" : formatCount(stats.productCount)}
              label="Live listings"
            />
            <Stat
              icon={<Star className="h-4 w-4" />}
              value={statsLoading ? "…" : stats.reviewCount > 0 ? `${stats.avgRating.toFixed(1)}/5` : "No ratings yet"}
              label="Buyer rating"
            />
          </div>
        </div>

        <div className="relative z-10">
          <div className="relative overflow-hidden rounded-[2rem] border border-border bg-card p-4 shadow-elegant">
            <div className={`relative overflow-hidden rounded-[1.5rem] bg-gradient-to-br ${active.tone} p-6 text-white shadow-soft`}>
              <div className="absolute -right-14 -top-10 h-40 w-40 rounded-full bg-white/20 blur-3xl" />
              <div className="absolute -bottom-10 -left-12 h-36 w-36 rounded-full bg-black/10 blur-3xl" />
              <div className="relative flex min-h-[420px] flex-col justify-between">
                <div className="inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/90">
                  <BadgeCheck className="h-3.5 w-3.5" /> SABU update
                </div>

                <div>
                  <div className="mb-5 flex items-center justify-between text-white/80">
                    <span className="inline-flex items-center gap-2 text-xs font-medium">
                      <Sparkles className="h-4 w-4" /> Fast, local, trusted
                    </span>
                    <span className="rounded-full bg-white/10 px-2 py-1 text-[10px] font-medium">Live</span>
                  </div>
                  <h2 className="max-w-sm text-3xl font-bold leading-tight md:text-4xl">{active.title}</h2>
                  <p className="mt-4 max-w-md text-sm text-white/85 md:text-base">{active.body}</p>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <Link
                    to={active.href}
                    className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-foreground shadow-soft transition hover:opacity-95"
                  >
                    {active.cta}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <div className="flex items-center gap-2 text-white/80">
                    <MessagesSquare className="h-4 w-4" />
                    <UtensilsCrossed className="h-4 w-4" />
                    <Shield className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-center gap-2">
              {slides.map(function (slide, index) {
                return (
                  <button
                    key={slide.title}
                    type="button"
                    onClick={function () { setActiveSlide(index); }}
                    className={
                      "h-2.5 rounded-full transition " +
                      (activeSlide === index ? "w-8 bg-primary" : "w-2.5 bg-primary/30 hover:bg-primary/60")
                    }
                    aria-label={"Show slide " + (index + 1)}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="rounded-xl border border-border bg-card/60 p-3 backdrop-blur">
      <div className="flex items-center gap-2 text-primary"><span>{icon}</span><span className="text-lg font-bold text-foreground">{value}</span></div>
      <div className="mt-0.5 text-[11px] text-muted-foreground">{label}</div>
    </div>
  );
}
