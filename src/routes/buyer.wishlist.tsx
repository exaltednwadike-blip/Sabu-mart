import { createFileRoute } from "@tanstack/react-router";
import { Heart, ShoppingCart, X, MapPin } from "lucide-react";
import { PageHeader } from "@/components/dashboard/DashboardShell";
import headphones from "@/assets/product-headphones.jpg";
import laptop from "@/assets/product-laptop.jpg";
import bag from "@/assets/product-bag.jpg";
import watch from "@/assets/product-watch.jpg";
import phone from "@/assets/cat-phones.jpg";
import fashion from "@/assets/cat-fashion.jpg";

export const Route = createFileRoute("/buyer/wishlist")({
  component: BuyerWishlist,
});

const ITEMS = [
  { name: "Wireless Noise-Cancelling Headphones", price: 89000, oldPrice: 145000, image: headphones, seller: "SoundHub NG", location: "Lagos" },
  { name: "MacBook Pro 14\" M3 · 16GB · 512GB", price: 1650000, image: laptop, seller: "TechPro Store", location: "Abuja" },
  { name: "Handcrafted Leather Tote", price: 42500, oldPrice: 55000, image: bag, seller: "Kano Leatherworks", location: "Lagos" },
  { name: "Sport Chronograph Watch", price: 28500, image: watch, seller: "TimeCraft", location: "Port Harcourt" },
  { name: "Samsung Galaxy A55 · 256GB", price: 385000, image: phone, seller: "MobileHub", location: "Lagos" },
  { name: "Autumn Linen Blazer Set", price: 58000, image: fashion, seller: "Adire House", location: "Ibadan" },
];

function BuyerWishlist() {
  return (
    <div>
      <PageHeader
        title="Wishlist"
        subtitle={`${ITEMS.length} items saved. Prices update in real time.`}
        action={
          <button className="inline-flex items-center gap-2 rounded-xl gradient-brand px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft">
            <ShoppingCart className="h-4 w-4" /> Move all to cart
          </button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ITEMS.map((i) => (
          <article key={i.name} className="group overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition hover:-translate-y-0.5 hover:shadow-elegant">
            <div className="relative aspect-[4/3] overflow-hidden bg-muted">
              <img src={i.image} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-110" />
              <button className="absolute right-2 top-2 rounded-full bg-background/90 p-2 text-destructive backdrop-blur transition hover:bg-destructive hover:text-destructive-foreground" aria-label="Remove">
                <X className="h-4 w-4" />
              </button>
              <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-bold text-destructive backdrop-blur">
                <Heart className="h-3 w-3 fill-destructive" /> Saved
              </span>
            </div>
            <div className="p-4">
              <h3 className="line-clamp-1 font-medium">{i.name}</h3>
              <div className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                <MapPin className="h-3 w-3" /> {i.seller} · {i.location}
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="font-display text-lg font-bold">₦{i.price.toLocaleString()}</span>
                {i.oldPrice && <span className="text-xs text-muted-foreground line-through">₦{i.oldPrice.toLocaleString()}</span>}
              </div>
              <button className="mt-3 w-full rounded-lg gradient-brand py-2 text-xs font-semibold text-primary-foreground shadow-soft">
                Add to cart
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
