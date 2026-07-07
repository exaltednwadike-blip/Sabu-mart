import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Hero } from "@/components/site/Hero";
import { CategoryGrid } from "@/components/site/CategoryGrid";
import { ProductGrid } from "@/components/site/ProductGrid";
import { Accommodation } from "@/components/site/Accommodation";
import { FeaturedSellers } from "@/components/site/FeaturedSellers";
import { SellCTA } from "@/components/site/SellCTA";
import { Reviews } from "@/components/site/Reviews";
import { Newsletter } from "@/components/site/Newsletter";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <Hero />
        <CategoryGrid />
        <ProductGrid eyebrow="Limited time" title="⚡ Flash deals" subtitle="Hand-picked deals refreshed every 6 hours." variant="flash" />
        <FeaturedSellers />
        <ProductGrid eyebrow="Trending" title="Trending products" subtitle="What buyers are loving on SABU right now." />
        <Accommodation />
        <SellCTA />
        <ProductGrid eyebrow="Just landed" title="Recently added" subtitle="Fresh listings from verified sellers across Nigeria." />
        <Reviews />
        <Newsletter />
      </main>
      <SiteFooter />
    </div>
  );
}
