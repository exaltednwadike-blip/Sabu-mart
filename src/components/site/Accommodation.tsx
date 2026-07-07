import { MapPin, Star, Wifi, Coffee, Car, Waves } from "lucide-react";
import { SectionHeader } from "./CategoryGrid";
import img1 from "@/assets/cat-accommodation.jpg";

const STAYS = [
  { title: "Cozy 2BR Apartment · Lekki Phase 1", location: "Lagos, Nigeria", price: 45000, rating: 4.94, reviews: 128, tags: ["Wifi", "Parking", "Pool"] },
  { title: "Modern Studio near Maitama", location: "Abuja", price: 32000, rating: 4.87, reviews: 76, tags: ["Wifi", "Breakfast"] },
  { title: "Beachfront Villa · Elegushi", location: "Lagos, Nigeria", price: 120000, rating: 5.0, reviews: 41, tags: ["Wifi", "Pool", "Parking"] },
  { title: "Serviced Loft · GRA Enugu", location: "Enugu", price: 28000, rating: 4.82, reviews: 92, tags: ["Wifi", "Breakfast", "Parking"] },
];

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Wifi, Parking: Car, Pool: Waves, Breakfast: Coffee,
};

export function Accommodation() {
  return (
    <section className="relative overflow-hidden py-16">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-secondary/40 via-background to-background" />
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeader
          eyebrow="Stay & Book"
          title="Accommodation, made simple"
          subtitle="Hotels, apartments, short-lets and student housing — book instantly and chat with hosts."
          action={<a href="#" className="text-sm font-semibold text-primary hover:underline">Explore stays →</a>}
        />
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {STAYS.map((s, i) => (
            <article key={i} className="group overflow-hidden rounded-2xl border border-border bg-card transition hover:-translate-y-1 hover:shadow-elegant">
              <div className="relative aspect-[4/3] overflow-hidden">
                <img src={img1} alt={s.title} loading="lazy" width={800} height={600} className="h-full w-full object-cover transition duration-500 group-hover:scale-110" />
                <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-background/90 px-2 py-1 text-[11px] font-semibold shadow-soft backdrop-blur">
                  <Star className="h-3 w-3 fill-accent-orange text-accent-orange" /> {s.rating}
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <MapPin className="h-3 w-3" /> {s.location}
                </div>
                <h3 className="mt-1 line-clamp-1 font-semibold">{s.title}</h3>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {s.tags.map((t) => {
                    const Icon = iconMap[t] ?? Wifi;
                    return (
                      <span key={t} className="flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[10px] text-secondary-foreground">
                        <Icon className="h-3 w-3" /> {t}
                      </span>
                    );
                  })}
                </div>
                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <div className="text-lg font-bold text-foreground">₦{s.price.toLocaleString()}<span className="text-xs font-normal text-muted-foreground">/night</span></div>
                    <div className="text-[11px] text-muted-foreground">{s.reviews} reviews</div>
                  </div>
                  <button className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition hover:bg-primary-glow">
                    Book
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
