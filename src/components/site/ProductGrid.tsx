import { Heart, MapPin, Star, MessageCircle, Zap, BadgeCheck } from "lucide-react";
import { SectionHeader } from "./CategoryGrid";
import headphones from "@/assets/product-headphones.jpg";
import laptop from "@/assets/product-laptop.jpg";
import bag from "@/assets/product-bag.jpg";
import watch from "@/assets/product-watch.jpg";
import phone from "@/assets/cat-phones.jpg";
import fashion from "@/assets/cat-fashion.jpg";

type Product = {
  id: string;
  title: string;
  price: number;
  oldPrice?: number;
  image: string;
  location: string;
  seller: string;
  verified?: boolean;
  rating: number;
  reviews: number;
  tag?: "Flash" | "Sponsored" | "New" | "Trending";
};

const PRODUCTS: Product[] = [
  { id: "1", title: "Wireless Noise-Cancelling Headphones", price: 89000, oldPrice: 145000, image: headphones, location: "Lagos, Ikeja", seller: "SoundHub NG", verified: true, rating: 4.9, reviews: 312, tag: "Flash" },
  { id: "2", title: "MacBook Pro 14\" M3 · 16GB · 512GB", price: 1650000, image: laptop, location: "Abuja, Wuse", seller: "TechPro Store", verified: true, rating: 5.0, reviews: 87, tag: "Trending" },
  { id: "3", title: "Handcrafted Leather Tote — Terracotta", price: 42500, oldPrice: 55000, image: bag, location: "Lagos, Lekki", seller: "Kano Leatherworks", verified: true, rating: 4.8, reviews: 156, tag: "New" },
  { id: "4", title: "Sport Chronograph Watch · Orange", price: 28500, image: watch, location: "Port Harcourt", seller: "TimeCraft", rating: 4.7, reviews: 44, tag: "Sponsored" },
  { id: "5", title: "Samsung Galaxy A55 · 256GB · Dual SIM", price: 385000, oldPrice: 420000, image: phone, location: "Lagos, Ikeja", seller: "MobileHub", verified: true, rating: 4.8, reviews: 621 },
  { id: "6", title: "Autumn Linen Blazer Set · Unisex", price: 58000, image: fashion, location: "Ibadan", seller: "Adire House", verified: true, rating: 4.9, reviews: 92, tag: "New" },
];

const formatPrice = (n: number) => "₦" + n.toLocaleString();

export function ProductGrid({
  eyebrow,
  title,
  subtitle,
  variant = "default",
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  variant?: "default" | "flash";
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-14">
      <SectionHeader
        eyebrow={eyebrow}
        title={title}
        subtitle={subtitle}
        action={
          variant === "flash" ? (
            <div className="flex items-center gap-2 rounded-full bg-accent-orange/10 px-3 py-1.5 text-sm font-semibold text-accent-orange">
              <Zap className="h-4 w-4" /> Ends in 04:12:33
            </div>
          ) : (
            <a href="#" className="text-sm font-semibold text-primary hover:underline">
              See all →
            </a>
          )
        }
      />
      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {PRODUCTS.map((p) => <ProductCard key={p.id + title} p={p} />)}
      </div>
    </section>
  );
}

function ProductCard({ p }: { p: Product }) {
  const discount = p.oldPrice ? Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100) : 0;
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition hover:-translate-y-1 hover:shadow-elegant">
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img src={p.image} alt={p.title} loading="lazy" width={800} height={800} className="h-full w-full object-cover transition duration-500 group-hover:scale-110" />
        {p.tag && (
          <span className={`absolute left-2 top-2 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white ${
            p.tag === "Flash" ? "bg-destructive" :
            p.tag === "Sponsored" ? "bg-foreground/80" :
            p.tag === "Trending" ? "bg-primary" : "bg-accent-orange"
          }`}>{p.tag}</span>
        )}
        {discount > 0 && (
          <span className="absolute right-2 top-2 rounded-md bg-accent-orange px-2 py-0.5 text-[10px] font-bold text-accent-orange-foreground">
            -{discount}%
          </span>
        )}
        <button className="absolute bottom-2 right-2 rounded-full bg-background/90 p-2 text-muted-foreground opacity-0 shadow-soft backdrop-blur transition group-hover:opacity-100 hover:text-destructive">
          <Heart className="h-4 w-4" />
        </button>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <h3 className="line-clamp-2 text-sm font-medium leading-tight text-foreground">{p.title}</h3>
        <div className="mt-auto flex items-baseline gap-2">
          <span className="text-base font-bold text-foreground">{formatPrice(p.price)}</span>
          {p.oldPrice && <span className="text-xs text-muted-foreground line-through">{formatPrice(p.oldPrice)}</span>}
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <MapPin className="h-3 w-3" /> {p.location}
        </div>
        <div className="flex items-center justify-between gap-2 border-t border-border pt-2">
          <div className="flex min-w-0 items-center gap-1">
            <span className="truncate text-[11px] font-medium text-foreground">{p.seller}</span>
            {p.verified && <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-primary" />}
          </div>
          <div className="flex items-center gap-0.5 text-[11px] text-muted-foreground">
            <Star className="h-3 w-3 fill-accent-orange text-accent-orange" /> {p.rating}
          </div>
        </div>
        <button className="mt-1 flex items-center justify-center gap-1.5 rounded-lg bg-primary/10 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary hover:text-primary-foreground">
          <MessageCircle className="h-3.5 w-3.5" /> Chat seller
        </button>
      </div>
    </article>
  );
}
