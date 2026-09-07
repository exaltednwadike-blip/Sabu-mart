import { Search, MapPin, Users, TrendingUp, Sparkles, UserPlus, Store, Shield } from "lucide-react";
import { useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import hero from "@/assets/hero-shopper.jpg";
import { getMarketplaceStats } from "@/lib/products";
import { getCurrentUser } from "@/lib/auth";

function formatCount(n: number) {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "K+";
  return String(n);
}

export function Hero() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [stats, setStats] = useState({ productCount: 0, userCount: 0, avgRating: 0, reviewCount: 0 });
  const [statsLoading, setStatsLoading] = useState(true);
  const [checked, setChecked] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(function () {
    getMarketplaceStats()
      .then(setStats)
      .catch(function () {})
      .finally(function () {
        setStatsLoading(false);
      });
    getCurrentUser().then(function (user) {
      setLoggedIn(!!user);
      setChecked(true);
    });
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

  return (
    <section className="relative overflow-hidden gradient-hero">
      <div className="pointer-events-none absolute inset-0 opacity-60" style={{ backgroundImage: "var(--gradient-mesh)" }} />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 pb-16 pt-10 lg:grid-cols-2 lg:pt-16">
        <div className="relative z-10 flex flex-col justify-center">
          <h1 className="mt-0 font-display text-4xl font-bold leading-[1.05] tracking-tight text-foreground md:text-6xl">
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

          {!checked ? null : loggedIn ? (
            <div className="mt-8 rounded-2xl border border-border bg-card p-2 shadow-elegant">
              <form className="flex flex-col gap-2 md:flex-row" onSubmit={handleSubmit}>
                <div className="flex flex-1 items-center gap-2 rounded-xl bg-background px-4 py-3">
                  <Search className="h-5 w-5 text-primary" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                    placeholder="What are you looking for?"
                  />
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-background px-4 py-3 md:w-48">
                  <MapPin className="h-5 w-5 text-accent-orange" />
                  <select className="flex-1 bg-transparent text-sm outline-none">
                    <option>Abia</option>
                    <option>Adamawa</option>
                    <option>Akwa Ibom</option>
                    <option>Anambra</option>
                    <option>Bauchi</option>
                    <option>Bayelsa</option>
                    <option>Benue</option>
                    <option>Borno</option>
                    <option>Cross River</option>
                    <option>Delta</option>
                    <option>Ebonyi</option>
                    <option>Edo</option>
                    <option>Ekiti</option>
                    <option>Enugu</option>
                    <option>FCT (Abuja)</option>
                    <option>Gombe</option>
                    <option>Imo</option>
                    <option>Jigawa</option>
                    <option>Kaduna</option>
                    <option>Kano</option>
                    <option>Katsina</option>
                    <option>Kebbi</option>
                    <option>Kogi</option>
                    <option>Kwara</option>
                    <option>Lagos</option>
                    <option>Nasarawa</option>
                    <option>Niger</option>
                    <option>Ogun</option>
                    <option>Ondo</option>
                    <option>Osun</option>
                    <option>Oyo</option>
                    <option>Plateau</option>
                    <option>Rivers</option>
                    <option>Sokoto</option>
                    <option>Taraba</option>
                    <option>Yobe</option>
                    <option>Zamfara</option>
                  </select>
                </div>
                <button type="submit" className="rounded-xl gradient-brand px-6 py-3 text-sm font-semibold text-primary-foreground shadow-soft transition hover:opacity-95">
                  Search
                </button>
              </form>
              <div className="flex flex-wrap gap-2 px-2 pb-1 pt-3">
                <span className="text-xs text-muted-foreground">Popular:</span>
                {["iPhone 15", "3-bedroom apartment", "Toyota Camry", "Ankara fabric", "Fresh tomatoes"].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => handlePopularClick(t)}
                    className="rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground transition hover:bg-primary hover:text-primary-foreground"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
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

          {loggedIn ? (
            <div className="mt-8 grid grid-cols-2 gap-4">
              <Stat
                icon={<Users className="h-4 w-4" />}
                value={statsLoading ? "…" : formatCount(stats.userCount)}
                label="Users signed up"
              />
              <Stat
                icon={<TrendingUp className="h-4 w-4" />}
                value={statsLoading ? "…" : formatCount(stats.productCount)}
                label="Live listings"
              />
            </div>
          ) : null}
        </div>

        <div className="relative z-10">
          <div className="relative">
            <div className="absolute -inset-6 rounded-[2rem] gradient-brand opacity-20 blur-3xl" />
            <img
              src={hero}
              alt="Happy SABU shopper"
              width={1400}
              height={1200}
              className="relative rounded-[2rem] object-cover shadow-elegant"
            />
            <FloatingCard className="-left-6 top-10 md:-left-10" delay="0s">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Escrow protected</div>
                  <div className="text-sm font-semibold">Buyer safety</div>
                </div>
              </div>
            </FloatingCard>
            <FloatingCard className="bottom-8 right-2 md:-right-6" delay="1.2s">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-orange/15 text-accent-orange">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Flash deal</div>
                  <div className="text-sm font-semibold">-45% today</div>
                </div>
              </div>
            </FloatingCard>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="rounded-xl border border-border bg-card/60 p-3 backdrop-blur">
      <div className="flex items-center gap-2 text-primary">{icon}<span className="text-lg font-bold text-foreground">{value}</span></div>
      <div className="mt-0.5 text-[11px] text-muted-foreground">{label}</div>
    </div>
  );
}

function FloatingCard({ children, className = "", delay = "0s" }: { children: React.ReactNode; className?: string; delay?: string }) {
  return (
    <div
      className={`absolute rounded-2xl border border-border bg-background/90 p-3 shadow-elegant backdrop-blur animate-float ${className}`}
      style={{ animationDelay: delay }}
    >
      {children}
    </div>
  );
}
