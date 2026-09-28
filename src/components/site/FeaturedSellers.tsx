import { Link } from "@tanstack/react-router";
import { Store, ArrowRight } from "lucide-react";
import { SectionHeader } from "./CategoryGrid";

export function FeaturedSellers() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <SectionHeader
        eyebrow="Top sellers"
        title="Discover sellers"
        subtitle="Browse all approved stores on SABU."
      />
      <Link
        to="/sellers"
        className="mt-6 inline-flex items-center gap-2 rounded-xl gradient-brand px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-soft transition hover:opacity-90"
      >
        <Store className="h-4 w-4" /> Browse sellers <ArrowRight className="h-4 w-4" />
      </Link>
    </section>
  );
}
