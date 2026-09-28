import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Hero } from "@/components/site/Hero";
import { CategoryGrid } from "@/components/site/CategoryGrid";
import { FeaturedSellers } from "@/components/site/FeaturedSellers";
import { ProductFeed } from "@/components/site/ProductFeed";
import { LoggedOutTeaser } from "@/components/site/LoggedOutTeaser";
import { Newsletter } from "@/components/site/Newsletter";
import { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/auth";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const [checked, setChecked] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(function () {
    getCurrentUser().then(function (user) {
      setLoggedIn(Boolean(user));
      setChecked(true);
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <Hero />
        {!checked ? null : loggedIn ? (
          <>
            <CategoryGrid />
            <FeaturedSellers />
            <ProductFeed />
          </>
        ) : (
          <LoggedOutTeaser />
        )}
        <Newsletter />
      </main>
      <SiteFooter />
    </div>
  );
}
