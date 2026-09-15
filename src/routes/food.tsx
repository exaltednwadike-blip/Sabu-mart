import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, MapPin, Clock3 } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { getRestaurants, getMenuItems } from "@/lib/food";

export const Route = createFileRoute("/food")({
  component: FoodPage,
});

function FoodPage() {
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [selectedCuisine, setSelectedCuisine] = useState("All");
  const [activeIndex, setActiveIndex] = useState(0);
  const [slides, setSlides] = useState<any[]>([]);

  useEffect(function () {
    getRestaurants()
      .then(function (rows) {
        setRestaurants(rows || []);
        const cuisines = Array.from(new Set((rows || []).map(function (r) { return r.cuisine; }).filter(Boolean))) as string[];
        if (cuisines.length > 0) {
          setSelectedCuisine(cuisines[0]);
        }
        return Promise.all((rows || []).slice(0, 6).map(function (restaurant) {
          return getMenuItems(restaurant.id).then(function (items) {
            return items.slice(0, 2).map(function (item) {
              return {
                id: item.id,
                restaurantId: restaurant.id,
                restaurantName: restaurant.name,
                title: item.name,
                subtitle: restaurant.cuisine || "Chef specials",
                image: item.media_url || restaurant.cover_image,
                type: item.media_type || "image",
              };
            });
          });
        }));
      })
      .then(function (menuSlides) {
        const flatSlides = menuSlides.flat();
        setSlides(flatSlides.slice(0, 8));
      })
      .catch(function () {
        setRestaurants([]);
      });
  }, []);

  useEffect(function () {
    if (slides.length <= 1) return;
    const timer = window.setInterval(function () {
      setActiveIndex(function (prev) { return (prev + 1) % slides.length; });
    }, 4000);
    return function () { window.clearInterval(timer); };
  }, [slides]);

  const cuisines = Array.from(new Set(["All", ...restaurants.map(function (restaurant) { return restaurant.cuisine; }).filter(Boolean)]));
  const filteredRestaurants = selectedCuisine === "All"
    ? restaurants
    : restaurants.filter(function (restaurant) { return restaurant.cuisine === selectedCuisine; });

  function goPrev() {
    setActiveIndex(function (prev) { return prev === 0 ? slides.length - 1 : prev - 1; });
  }

  function goNext() {
    setActiveIndex(function (prev) { return (prev + 1) % slides.length; });
  }

  const currentSlide = slides[activeIndex] || null;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <section className="mx-auto max-w-7xl px-4 pb-8 pt-6 md:pt-8">
          {slides.length > 0 && currentSlide ? (
            <div className="relative overflow-hidden rounded-[2rem] border border-border bg-card shadow-soft">
              <div className="absolute inset-x-0 top-0 z-10 flex gap-1 p-3">
                {slides.map(function (_, index) {
                  return (
                    <div key={index} className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/25">
                      <div
                        className={"h-full rounded-full bg-white transition-all duration-500 " + (index === activeIndex ? "w-full" : "w-0")}
                      />
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={goPrev}
                className="absolute left-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={goNext}
                className="absolute right-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm"
              >
                <ChevronRight className="h-5 w-5" />
              </button>

              <div className="relative h-[420px] w-full">
                {currentSlide.type === "video" ? (
                  <video src={currentSlide.image} className="h-full w-full object-cover" autoPlay muted loop playsInline />
                ) : (
                  <img src={currentSlide.image} alt={currentSlide.title} className="h-full w-full object-cover" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
                  <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-sm">
                    <Clock3 className="h-3.5 w-3.5" /> {currentSlide.subtitle}
                  </div>
                  <h1 className="font-display text-3xl font-bold text-white md:text-5xl">{currentSlide.title}</h1>
                  <p className="mt-2 text-sm text-white/80">From {currentSlide.restaurantName}</p>
                </div>
              </div>
            </div>
          ) : null}
        </section>

        <section className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex flex-wrap gap-2">
            {cuisines.map(function (cuisine) {
              return (
                <button
                  key={cuisine}
                  type="button"
                  onClick={function () { setSelectedCuisine(cuisine); }}
                  className={"rounded-full px-3 py-1.5 text-sm font-medium transition " + (selectedCuisine === cuisine ? "bg-primary text-primary-foreground" : "border border-border bg-card text-muted-foreground hover:bg-accent")}
                >
                  {cuisine}
                </button>
              );
            })}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-8">
          {filteredRestaurants.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
              No restaurants yet — check back soon.
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredRestaurants.map(function (restaurant) {
                return (
                  <Link key={restaurant.id} to={"/food/" + restaurant.id} className="group overflow-hidden rounded-[1.5rem] border border-border bg-card shadow-soft transition hover:-translate-y-1 hover:shadow-elegant">
                    <div className="relative h-52 w-full overflow-hidden">
                      {restaurant.cover_image ? (
                        <img src={restaurant.cover_image} alt={restaurant.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                      ) : null}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                      <span className={"absolute left-3 top-3 inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold " + (restaurant.is_open ? "bg-success/15 text-success" : "bg-muted text-muted-foreground")}>
                        {restaurant.is_open ? "Open now" : "Closed"}
                      </span>
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-display text-xl font-bold text-foreground">{restaurant.name}</h3>
                          <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="h-3.5 w-3.5" /> {restaurant.area || "Local area"}, {restaurant.state}</p>
                        </div>
                        {restaurant.cuisine ? (
                          <span className="rounded-full bg-primary/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-primary">
                            {restaurant.cuisine}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
