import { BadgeCheck, Star, Store } from "lucide-react";
import { SectionHeader } from "./CategoryGrid";

const SELLERS = [
  { name: "TechPro Store", category: "Electronics", rating: 4.98, sales: "12K+", initial: "T", tint: "primary" },
  { name: "Adire House", category: "Fashion", rating: 4.95, sales: "8.2K+", initial: "A", tint: "orange" },
  { name: "Kano Leatherworks", category: "Bags & Shoes", rating: 4.92, sales: "5.6K+", initial: "K", tint: "primary" },
  { name: "SoundHub NG", category: "Audio & Music", rating: 4.9, sales: "4.1K+", initial: "S", tint: "orange" },
  { name: "MobileHub", category: "Phones", rating: 4.89, sales: "22K+", initial: "M", tint: "primary" },
  { name: "GreenFarms Co.", category: "Agriculture", rating: 4.87, sales: "3.4K+", initial: "G", tint: "orange" },
];

export function FeaturedSellers() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-14">
      <SectionHeader
        eyebrow="Top rated"
        title="Featured sellers"
        subtitle="Verified businesses trusted by thousands of buyers across Nigeria."
        action={<a href="#" className="text-sm font-semibold text-primary hover:underline">Browse all sellers →</a>}
      />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SELLERS.map((s) => (
          <article key={s.name} className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition hover:-translate-y-0.5 hover:shadow-soft">
            <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl font-display text-2xl font-bold ${
              s.tint === "primary" ? "bg-primary/10 text-primary" : "bg-accent-orange/15 text-accent-orange"
            }`}>
              {s.initial}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h3 className="truncate font-semibold">{s.name}</h3>
                <BadgeCheck className="h-4 w-4 shrink-0 text-primary" />
              </div>
              <div className="text-xs text-muted-foreground">{s.category}</div>
              <div className="mt-1.5 flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1 text-foreground">
                  <Star className="h-3 w-3 fill-accent-orange text-accent-orange" /> {s.rating}
                </span>
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Store className="h-3 w-3" /> {s.sales} sales
                </span>
              </div>
            </div>
            <button className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold transition hover:bg-primary hover:text-primary-foreground">
              Visit
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
