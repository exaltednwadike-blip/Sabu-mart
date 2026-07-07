import { ArrowRight, CheckCircle2, Wallet, TrendingUp, Users } from "lucide-react";

export function SellCTA() {
  return (
    <section id="sell" className="mx-auto max-w-7xl px-4 py-16">
      <div className="relative overflow-hidden rounded-[2rem] gradient-brand p-8 shadow-elegant md:p-14">
        <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-accent-orange/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

        <div className="relative grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="text-primary-foreground">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
              For sellers
            </span>
            <h2 className="mt-4 font-display text-3xl font-bold leading-tight md:text-5xl">
              Start selling on SABU for just <span className="text-accent-orange">₦500</span>.
            </h2>
            <p className="mt-4 max-w-lg text-primary-foreground/90">
              List a product, get approved instantly, and reach millions of buyers. No hidden fees.
              Get paid straight to your wallet with next-day withdrawals.
            </p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {["Instant approval", "Free storefront", "Buyer chat & escrow", "Verified badge"].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-primary-foreground/95">
                  <CheckCircle2 className="h-4 w-4 text-accent-orange" /> {f}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#register" className="inline-flex items-center gap-2 rounded-xl bg-accent-orange px-5 py-3 text-sm font-semibold text-accent-orange-foreground shadow-orange transition hover:opacity-90">
                Become a seller <ArrowRight className="h-4 w-4" />
              </a>
              <a href="#learn" className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-semibold text-primary-foreground backdrop-blur transition hover:bg-white/20">
                See seller handbook
              </a>
            </div>
          </div>

          <div className="relative">
            <div className="grid gap-4 sm:grid-cols-2">
              <StatCard icon={<Wallet />} label="Avg. seller earnings" value="₦412K" trend="+18% MoM" />
              <StatCard icon={<Users />} label="Active buyers" value="1.8M" trend="+9% WoW" />
              <StatCard icon={<TrendingUp />} label="Listing views (30d)" value="24.6K" trend="+31%" />
              <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur">
                <div className="text-xs text-primary-foreground/80">Listing fee</div>
                <div className="mt-1 font-display text-3xl font-bold text-primary-foreground">₦500</div>
                <div className="mt-1 text-[11px] text-primary-foreground/70">Per product · one-time</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatCard({ icon, label, value, trend }: { icon: React.ReactNode; label: string; value: string; trend: string }) {
  return (
    <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur">
      <div className="flex items-center gap-2 text-primary-foreground/80 text-xs">
        <span className="[&>svg]:h-4 [&>svg]:w-4">{icon}</span> {label}
      </div>
      <div className="mt-1 font-display text-2xl font-bold text-primary-foreground">{value}</div>
      <div className="mt-0.5 text-[11px] font-medium text-accent-orange">{trend}</div>
    </div>
  );
}
