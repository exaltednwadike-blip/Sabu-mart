import { Star, Quote } from "lucide-react";
import { SectionHeader } from "./CategoryGrid";

const REVIEWS = [
  { name: "Chinelo A.", role: "Buyer · Lagos", text: "Found a verified seller for my iPhone in minutes. Chatted, paid via escrow, delivered the next day. SABU just works.", rating: 5 },
  { name: "Musa I.", role: "Seller · Kano", text: "I've moved over 200 units in my first month. The seller dashboard and instant payouts are a game changer.", rating: 5 },
  { name: "Bukola O.", role: "Host · Abuja", text: "Listed my apartment on Monday and had bookings by Wednesday. The photos and calendar tools feel premium.", rating: 5 },
];

export function Reviews() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-14">
      <SectionHeader eyebrow="Loved by users" title="What people say about SABU" />
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {REVIEWS.map((r) => (
          <figure key={r.name} className="relative rounded-2xl border border-border bg-card p-6 shadow-soft">
            <Quote className="absolute right-5 top-5 h-8 w-8 text-primary/15" />
            <div className="flex gap-0.5">
              {Array.from({ length: r.rating }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-accent-orange text-accent-orange" />
              ))}
            </div>
            <blockquote className="mt-3 text-sm text-foreground">"{r.text}"</blockquote>
            <figcaption className="mt-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full gradient-brand font-display font-bold text-primary-foreground">
                {r.name[0]}
              </div>
              <div>
                <div className="text-sm font-semibold">{r.name}</div>
                <div className="text-xs text-muted-foreground">{r.role}</div>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
