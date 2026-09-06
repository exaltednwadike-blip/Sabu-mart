import { useEffect, useRef, useState } from "react";
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
  const [visible, setVisible] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
      if (images.length === 0) return;
      timerRef.current = setInterval(function () {
        setVisible(false);
        setTimeout(function () {
          setIndex(function (prev) { return (prev + 1) % images.length; });
          setVisible(true);
        }, 400);
      }, 2800);
      return function () {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    },
    [images.length]
  );

  if (images.length === 0) return null;

  return (
    <section className="mx-auto max-w-3xl px-4 py-14 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">A glimpse inside</p>
      <h2 className="mt-2 font-display text-2xl font-bold md:text-3xl">Thousands of items, waiting for you</h2>
      <p className="mt-2 text-sm text-muted-foreground">Sign up to see prices, sellers, and message them directly.</p>

      <Link
        to="/signup"
        className="group relative mx-auto mt-8 block aspect-[4/3] max-w-md overflow-hidden rounded-[2rem] border border-border shadow-elegant"
      >
        <img
          src={images[index]}
          alt=""
          className={"h-full w-full object-cover transition-opacity duration-500 " + (visible ? "opacity-100" : "opacity-0")}
        />
        <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/60 via-black/0 to-black/0 p-6 opacity-0 transition group-hover:opacity-100">
          <span className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-foreground">
            <UserPlus className="h-4 w-4" /> Sign up to see this item
          </span>
        </div>
      </Link>

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
