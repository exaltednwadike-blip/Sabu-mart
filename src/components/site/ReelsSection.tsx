import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Play } from "lucide-react";
import { SectionHeader } from "./CategoryGrid";
import { getProductVideos } from "@/lib/products";

export function ReelsSection() {
  const [reels, setReels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(function () {
    getProductVideos(20)
      .then(setReels)
      .catch(function () { setReels([]); })
      .finally(function () { setLoading(false); });
  }, []);

  function renderReel(p: any) {
    const storeName = p.profiles ? p.profiles.store_name : "Seller";
    return <ReelCard key={p.id} product={p} storeName={storeName} />;
  }

  if (loading) return null;
  if (reels.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-14">
      <SectionHeader
        eyebrow="Watch"
        title="Reels"
        subtitle="Short videos straight from sellers showing off what they've got."
      />
      <div className="mt-8 flex gap-4 overflow-x-auto pb-2 no-scrollbar">
        {reels.map(renderReel)}
      </div>
    </section>
  );
}

function ReelCard({ product, storeName }: { product: any; storeName: string }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [playing, setPlaying] = useState(false);

  function handleEnter() {
    setPlaying(true);
    if (videoRef.current) {
      videoRef.current.play().catch(function () {});
    }
  }

  function handleLeave() {
    setPlaying(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }

  return (
    <Link
      to="/product/$productId"
      params={{ productId: product.id }}
      className="group relative aspect-[9/16] w-40 shrink-0 overflow-hidden rounded-2xl border border-border bg-black shadow-soft sm:w-48"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onTouchStart={handleEnter}
    >
      <video
        ref={videoRef}
        src={product.videos[0]}
        muted
        loop
        playsInline
        className="h-full w-full object-cover"
      />
      {!playing ? (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90">
            <Play className="h-4 w-4 fill-foreground text-foreground" />
          </div>
        </div>
      ) : null}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3">
        <p className="truncate text-xs font-semibold text-white">{product.title}</p>
        <p className="text-[11px] text-white/80">₦{Number(product.price).toLocaleString()} · {storeName}</p>
      </div>
    </Link>
  );
}
