import { Mail, Sparkles } from "lucide-react";

export function Newsletter() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16">
      <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-8 shadow-soft md:p-12">
        <div className="pointer-events-none absolute -right-10 -top-10 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-10 h-64 w-64 rounded-full bg-accent-orange/10 blur-3xl" />
        <div className="relative grid gap-6 md:grid-cols-2 md:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" /> Weekly digest
            </div>
            <h3 className="mt-3 font-display text-2xl font-bold md:text-3xl">
              Deals, drops & new listings — in your inbox.
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Join 240,000+ shoppers getting the best of SABU every Sunday. No spam, unsubscribe anytime.
            </p>
          </div>
          <form className="flex flex-col gap-2 sm:flex-row" onSubmit={(e) => e.preventDefault()}>
            <div className="flex flex-1 items-center gap-2 rounded-xl border border-border bg-background px-4 py-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <input
                type="email"
                required
                placeholder="you@email.com"
                className="flex-1 bg-transparent text-sm outline-none"
              />
            </div>
            <button className="rounded-xl gradient-brand px-6 py-3 text-sm font-semibold text-primary-foreground shadow-soft transition hover:opacity-95">
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
