import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Play, ArrowRight } from "lucide-react";
import { SectionHeader } from "./CategoryGrid";
import { getReelItems } from "@/lib/products";

export function ReelsSection() {
  const navigate = useNavigate();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(function () {
    getReelItems(12)
      .then(function (data) {
        setItems(data || []);
      })
      .catch(function () {
        setItems([]);
      })
      .finally(function () {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return null;
  }

  if (items.length === 0) {
    return null;
  }

  function handleOpen(item: any) {
    navigate({ to: "/reels/$itemId", params: { itemId: item.id } });
  }

  function renderItem(item: any) {
    const thumb = item.type === "video" ? item.url : item.url;
    return (
      <button
        key={item.id}
        type="button"
        onClick={function () { handleOpen(item); }}
        className="group relative h-72 w-52 shrink-0 overflow-hidden rounded-[1.5rem] border border-border bg-card shadow-soft"
      >
        {item.type === "video" ? (
          <video src={thumb} className="h-full w-full object-cover transition group-hover:scale-105" muted playsInline preload="metadata" />
        ) : (
          <img src={thumb} alt={item.title} className="h-full w-full object-cover transition group-hover:scale-105" />
        )}
        {item.type === "video" ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
              <Play className="ml-1 h-5 w-5 fill-white text-white" />
            </div>
          </div>
        ) : null}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 text-left">
          <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-white/80">{item.storeName}</p>
          <p className="mt-1 line-clamp-2 text-sm font-semibold text-white">{item.title}</p>
          <div className="mt-2 flex items-center justify-between text-xs text-white/90">
            <span>₦{Number(item.price).toLocaleString()}</span>
            <span className="inline-flex items-center gap-1">
              Watch <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        </div>
      </button>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-14">
      <SectionHeader
        eyebrow="Short-form"
        title="Reels"
        subtitle="A quick mix of fresh products from SABU sellers."
      />
      <div className="mt-8 flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map(renderItem)}
      </div>
    </section>
  );
}
