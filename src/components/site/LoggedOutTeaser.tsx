import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { UserPlus } from "lucide-react";
import { getTeaserImages } from "@/lib/products";

function shuffle<T>(arr: T[]): T[] {
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = copy[i];
    copy[i] = copy[j];
    copy[j] = tmp;
  }
  return copy;
}

export function LoggedOutTeaser() {
  const [images, setImages] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const timerRef = useRef<number | null>(null);

  useEffect(function () {
    getTeaserImages(30)
      .then(function (urls) {
        setImages(shuffle(urls));
      })
      .catch(function () {
        setImages([]);
      });
  }, []);

  useEffect(
    function () {
      if (images.length < 3) return;
      timerRef.current = window.setInterval(function () {
        setIndex(function (prev) {
          return (prev + 1) % images.length;
        });
      }, 3200);
      return function () {
        if (timerRef.current) window.clearInterval(timerRef.current);
      };
    },
    [images.length]
  );

  const slides = useMemo(function () {
    if (images.length === 0) return [];
    const total = images.length;
    return Array.from({ length: 3 }, function (_, slot) {
      const offset = slot - 1;
      const itemIndex = (index + offset + total) % total;
      const isCenter = slot === 1;
      return {
        image: images[itemIndex],
        left: isCenter ? "50%" : offset < 0 ? "18%" : "82%",
        scale: isCenter ? 1 : 0.86,
        blur: isCenter ? "blur(0px)" : "blur(4px)",
        opacity: isCenter ? 1 : 0.48,
        zIndex: isCenter ? 30 : 10,
      };
    });
  }, [images, index]);

  if (images.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-14 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">A glimpse inside</p>
      <h2 className="mt-2 font-display text-2xl font-bold md:text-3xl">Thousands of items, waiting for you</h2>
      <p className="mt-2 text-sm text-muted-foreground">Sign up to see prices, sellers, and message them directly.</p>

      <div className="relative mx-auto mt-10 h-[300px] w-full max-w-[980px] overflow-hidden sm:h-[390px] md:h-[430px]">
        {slides.map(function (slide, slotIndex) {
          const isCenter = slotIndex === 1;
          return (
            <Link
              key={`${slide.image}-${slotIndex}`}
              to="/signup"
              className={"group absolute top-1/2 h-[220px] w-[68%] max-w-[320px] -translate-y-1/2 overflow-hidden rounded-[2rem] border border-border/70 bg-card shadow-elegant transition-all duration-700 ease-out sm:h-[280px] md:h-[320px] " + (isCenter ? "pointer-events-auto" : "pointer-events-none")}
              style={{
                left: slide.left,
                transform: "translate(-50%, -50%) scale(" + slide.scale + ")",
                opacity: slide.opacity,
                filter: slide.blur,
                zIndex: slide.zIndex,
              }}
            >
              <img src={slide.image} alt="" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-black/0" />
              <div className="absolute inset-0 flex items-end justify-center p-4 sm:p-6">
                <span className="inline-flex items-center gap-2 rounded-xl bg-white/90 px-3 py-2 text-[11px] font-semibold text-foreground shadow-soft backdrop-blur-sm sm:text-sm">
                  <UserPlus className="h-4 w-4" /> Sign up to see this item
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        <Link
          to="/signup"
          className="inline-flex items-center justify-center gap-2 rounded-xl gradient-brand px-6 py-3 text-sm font-semibold text-primary-foreground shadow-soft transition hover:opacity-95"
        >
          Sign up to start buying
        </Link>
        <Link
          to="/login"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-6 py-3 text-sm font-semibold transition hover:bg-accent"
        >
          I already have an account
        </Link>
      </div>
    </section>
  );
}
