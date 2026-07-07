import {
  Smartphone, Shirt, Home, Car, Wheat, UtensilsCrossed, Sparkles, Briefcase,
  Wrench, Building2, Laptop, Sofa, Baby, Gamepad2, Plane, Dumbbell, HeartPulse,
  GraduationCap, Hammer, Music, Dog, ShoppingBasket,
} from "lucide-react";

const CATEGORIES = [
  { name: "Phones", icon: Smartphone, tint: "primary" },
  { name: "Fashion", icon: Shirt, tint: "orange" },
  { name: "Real Estate", icon: Home, tint: "primary" },
  { name: "Vehicles", icon: Car, tint: "orange" },
  { name: "Agriculture", icon: Wheat, tint: "primary" },
  { name: "Food", icon: UtensilsCrossed, tint: "orange" },
  { name: "Beauty", icon: Sparkles, tint: "primary" },
  { name: "Jobs", icon: Briefcase, tint: "orange" },
  { name: "Services", icon: Wrench, tint: "primary" },
  { name: "Hotels", icon: Building2, tint: "orange" },
  { name: "Computers", icon: Laptop, tint: "primary" },
  { name: "Furniture", icon: Sofa, tint: "orange" },
  { name: "Baby", icon: Baby, tint: "primary" },
  { name: "Gaming", icon: Gamepad2, tint: "orange" },
  { name: "Travel", icon: Plane, tint: "primary" },
  { name: "Sports", icon: Dumbbell, tint: "orange" },
  { name: "Health", icon: HeartPulse, tint: "primary" },
  { name: "Education", icon: GraduationCap, tint: "orange" },
  { name: "Construction", icon: Hammer, tint: "primary" },
  { name: "Events", icon: Music, tint: "orange" },
  { name: "Pets", icon: Dog, tint: "primary" },
  { name: "Groceries", icon: ShoppingBasket, tint: "orange" },
];

export function CategoryGrid() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16">
      <SectionHeader
        eyebrow="Browse"
        title="Shop by category"
        subtitle="From farm produce to luxury apartments — 40+ categories, one marketplace."
      />
      <div className="mt-8 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-11">
        {CATEGORIES.map(({ name, icon: Icon, tint }) => (
          <a
            key={name}
            href={`#${name.toLowerCase()}`}
            className="group relative flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-4 text-center transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-soft"
          >
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-xl transition group-hover:scale-110 ${
                tint === "primary"
                  ? "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground"
                  : "bg-accent-orange/10 text-accent-orange group-hover:bg-accent-orange group-hover:text-accent-orange-foreground"
              }`}
            >
              <Icon className="h-6 w-6" />
            </div>
            <span className="text-xs font-medium text-foreground">{name}</span>
          </a>
        ))}
      </div>
    </section>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && (
          <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            {eyebrow}
          </div>
        )}
        <h2 className="font-display text-2xl font-bold tracking-tight md:text-3xl">{title}</h2>
        {subtitle && <p className="mt-2 max-w-xl text-sm text-muted-foreground md:text-base">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
