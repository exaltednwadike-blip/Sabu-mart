import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Hero } from "@/components/site/Hero";
import { CategoryGrid } from "@/components/site/CategoryGrid";
import { ProductFeed } from "@/components/site/ProductFeed";
import { Accommodation } from "@/components/site/Accommodation";
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
        <ProductFeed />
        <Accommodation />
        <SellCTA />
        <Reviews />
        <Newsletter />
      </main>
      <SiteFooter />
    </div>
  );
}
