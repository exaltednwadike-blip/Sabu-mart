import {
  Smartphone, Shirt, Home, Car, Wheat, UtensilsCrossed, Sparkles, Briefcase,
  Wrench, Building2, Laptop, Sofa, Baby, Gamepad2, Plane, Dumbbell, HeartPulse,
  GraduationCap, Hammer, Music, Dog, ShoppingBasket, Package, ChevronDown, ChevronUp,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getCategories, type ListingCategory } from "@/lib/products";

const ICON_MAP: { [key: string]: any } = {
  Phones: Smartphone,
  Fashion: Shirt,
  "Real Estate": Home,
  Vehicles: Car,
  Agriculture: Wheat,
  Food: UtensilsCrossed,
  Beauty: Sparkles,
  Jobs: Briefcase,
  Services: Wrench,
  Hotels: Building2,
  Computers: Laptop,
  Furniture: Sofa,
  Baby: Baby,
  Gaming: Gamepad2,
  Travel: Plane,
  Sports: Dumbbell,
  Health: HeartPulse,
  Education: GraduationCap,
  Construction: Hammer,
  Events: Music,
  Pets: Dog,
  Groceries: ShoppingBasket,
  Electronics: Laptop,
  Books: GraduationCap,
};

const TINTS = ["primary", "orange"];
const COLLAPSED_COUNT = 5;

export function CategoryGrid() {
  const [categories, setCategories] = useState<ListingCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(function () {
    getCategories()
      .then(setCategories)
      .catch(function () { setCategories([]); })
      .finally(function () { setLoading(false); });
  }, []);

  function renderCategory(c: ListingCategory, i: number) {
    const Icon = ICON_MAP[c.name] || Package;
    const tint = TINTS[i % 2];
    return (
      <Link
        key={c.id}
        to="/category/$categoryId"
        params={{ categoryId: c.id }}
        className="group relative flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-4 text-center transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-soft"
      >
        <div
          className={
            "flex h-12 w-12 items-center justify-center rounded-xl transition group-hover:scale-110 " +
            (tint === "primary"
              ? "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground"
              : "bg-accent-orange/10 text-accent-orange group-hover:bg-accent-orange group-hover:text-accent-orange-foreground")
          }
        >
          <Icon className="h-6 w-6" />
        </div>
        <span className="text-xs font-medium text-foreground">{c.name}</span>
      </Link>
    );
  }

  const visibleCategories = expanded ? categories : categories.slice(0, COLLAPSED_COUNT);
  const hasMore = categories.length > COLLAPSED_COUNT;

  return (
    <section className="mx-auto max-w-7xl px-4 py-16">
      <SectionHeader
        eyebrow="Browse"
        title="Shop by category"
        subtitle="Real categories from our live pricing catalog."
      />
      {loading ? (
        <div className="mt-8 text-center text-sm text-muted-foreground">Loading categories...</div>
      ) : (
        <>
          <div className="mt-8 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
            {visibleCategories.map(renderCategory)}
          </div>
          {hasMore ? (
            <div className="mt-5 text-center">
              <button
                onClick={function () { setExpanded(!expanded); }}
                className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs font-semibold text-muted-foreground transition hover:bg-accent hover:text-foreground"
              >
                {expanded ? (
                  <>
                    Show less <ChevronUp className="h-3.5 w-3.5" />
                  </>
                ) : (
                  <>
                    See all categories <ChevronDown className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}

export function SectionHeader(props: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        {props.eyebrow ? (
          <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            {props.eyebrow}
          </div>
        ) : null}
        <h2 className="font-display text-2xl font-bold tracking-tight md:text-3xl">{props.title}</h2>
        {props.subtitle ? <p className="mt-2 max-w-xl text-sm text-muted-foreground md:text-base">{props.subtitle}</p> : null}
      </div>
      {props.action}
    </div>
  );
}
