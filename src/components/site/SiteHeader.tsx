import { Search, MapPin, ChevronDown, Menu, Heart, ShoppingBag, User, Bell, LayoutDashboard, Store } from "lucide-react";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/brand/Logo";

const MAIN_NAV = [
  "Marketplace", "Accommodation", "Vehicles", "Electronics",
  "Fashion", "Agriculture", "Food", "Jobs", "Services", "Properties",
];

const MORE_NAV = [
  "Phones", "Computers", "Beauty", "Health", "Furniture",
  "Construction", "Industrial", "Events", "Education", "Sports", "Travel",
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 w-full">
      <div className="hidden bg-primary py-1.5 text-center text-xs font-medium text-primary-foreground md:block">
        Free delivery on orders over ₦25,000 · Sell on SABU from just ₦500 per listing
      </div>
      <div className="glass border-b">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 lg:gap-6">
          <Logo />

          <div className="hidden flex-1 items-center gap-2 md:flex">
            <div className="flex flex-1 items-center rounded-xl border border-border bg-background/70 shadow-soft">
              <div className="hidden items-center gap-1 border-r border-border px-3 py-2.5 text-sm text-muted-foreground lg:flex">
                <MapPin className="h-4 w-4 text-primary" />
                Lagos
                <ChevronDown className="h-3.5 w-3.5" />
              </div>
              <input
                className="flex-1 bg-transparent px-4 py-2.5 text-sm outline-none placeholder:text-muted-foreground"
                placeholder="Search products, brands, categories..."
              />
              <button className="m-1 flex items-center gap-2 rounded-lg gradient-brand px-4 py-2 text-sm font-medium text-primary-foreground shadow-soft transition hover:opacity-90">
                <Search className="h-4 w-4" /> Search
              </button>
            </div>
          </div>

          <nav className="ml-auto flex items-center gap-1">
            <IconBtn icon={<Heart className="h-5 w-5" />} label="Saved" />
            <IconBtn icon={<Bell className="h-5 w-5" />} label="Alerts" badge="3" />
            <IconBtn icon={<ShoppingBag className="h-5 w-5" />} label="Cart" badge="2" />
            <Link
              to="/seller"
              className="hidden items-center gap-1.5 rounded-xl bg-accent-orange px-4 py-2 text-sm font-semibold text-accent-orange-foreground shadow-orange transition hover:opacity-90 md:inline-flex"
            >
              <Store className="h-4 w-4" /> Sell
            </Link>
            <Link
              to="/buyer"
              className="hidden items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm font-medium hover:bg-accent md:inline-flex"
            >
              <LayoutDashboard className="h-4 w-4" /> My account
            </Link>
            <button
              className="rounded-lg border border-border p-2 md:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-label="Menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </nav>
        </div>

        <div className="mx-auto hidden max-w-7xl items-center gap-1 overflow-x-auto px-4 pb-3 no-scrollbar md:flex">
          <a href="/" className="whitespace-nowrap rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
            Home
          </a>
          {MAIN_NAV.map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-accent hover:text-foreground"
            >
              {item}
            </a>
          ))}
          <div className="group relative">
            <button className="flex items-center gap-1 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-accent hover:text-foreground">
              More <ChevronDown className="h-3 w-3" />
            </button>
            <div className="invisible absolute right-0 top-full z-50 mt-1 grid w-64 grid-cols-2 gap-1 rounded-xl border border-border bg-popover p-2 opacity-0 shadow-elegant transition group-hover:visible group-hover:opacity-100">
              {MORE_NAV.map((m) => (
                <a
                  key={m}
                  href={`#${m.toLowerCase()}`}
                  className="rounded-lg px-2 py-1.5 text-xs hover:bg-accent"
                >
                  {m}
                </a>
              ))}
            </div>
          </div>
        </div>

        {open && (
          <div className="border-t border-border bg-background px-4 py-3 md:hidden">
            <div className="flex items-center rounded-xl border border-border bg-background">
              <Search className="ml-3 h-4 w-4 text-muted-foreground" />
              <input className="flex-1 bg-transparent px-3 py-2 text-sm outline-none" placeholder="Search SABU..." />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-1">
              {[...MAIN_NAV, ...MORE_NAV].map((item) => (
                <a key={item} href={`#${item.toLowerCase()}`} className="rounded-lg px-3 py-2 text-sm hover:bg-accent">
                  {item}
                </a>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <a href="#login" className="rounded-xl border border-border py-2 text-center text-sm font-medium">Sign in</a>
              <a href="#sell" className="rounded-xl bg-accent-orange py-2 text-center text-sm font-semibold text-accent-orange-foreground">+ Sell</a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

function IconBtn({ icon, label, badge }: { icon: React.ReactNode; label: string; badge?: string }) {
  return (
    <button
      aria-label={label}
      className="relative rounded-lg p-2 text-muted-foreground transition hover:bg-accent hover:text-foreground"
    >
      {icon}
      {badge && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent-orange px-1 text-[10px] font-bold text-accent-orange-foreground">
          {badge}
        </span>
      )}
    </button>
  );
}
