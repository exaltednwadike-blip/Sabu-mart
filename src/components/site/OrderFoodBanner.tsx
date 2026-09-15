import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, UtensilsCrossed } from "lucide-react";
import { getRestaurantCount } from "@/lib/products";

export function OrderFoodBanner() {
  const [count, setCount] = useState(0);

  useEffect(function () {
    getRestaurantCount()
      .then(function (total) {
        setCount(total);
      })
      .catch(function () {
        setCount(0);
      });
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-4 py-14">
      <Link
        to="/food"
        className="relative block overflow-hidden rounded-[2rem] bg-gradient-to-r from-accent-orange via-orange-500 to-red-500 p-6 text-white shadow-elegant md:p-8"
      >
        <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 -left-10 h-40 w-40 rounded-full bg-red-950/20 blur-3xl" />
        <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
              <UtensilsCrossed className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/80">Food delivery</p>
              <h3 className="mt-2 font-display text-2xl font-bold md:text-3xl">
                🍽️ Hungry? Order food from local restaurants
              </h3>
              <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1 text-xs font-medium text-white/90">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-300" />
                🏪 {count} restaurants available
              </div>
            </div>
          </div>
          <span className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-foreground shadow-soft">
            Order now
            <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </Link>
    </section>
  );
}
