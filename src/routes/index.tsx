import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Hero } from "@/components/site/Hero";
import { CategoryGrid } from "@/components/site/CategoryGrid";
import { FeaturedSellers } from "@/components/site/FeaturedSellers";
import { ProductFeed } from "@/components/site/ProductFeed";
import { SellCTA } from "@/components/site/SellCTA";
import { Reviews } from "@/components/site/Reviews";
import { Newsletter } from "@/components/site/Newsletter";
import { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/auth";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(function () {
    getCurrentUser().then(function (user) {
      setLoggedIn(Boolean(user));
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <Hero />
        <CategoryGrid />
        <FeaturedSellers />
        <section id="product-feed">
          <ProductFeed />
        </section>
        <SellCTA />
        <Reviews />
        <Newsletter />
      </main>
      <SiteFooter />
    </div>
  );
}
