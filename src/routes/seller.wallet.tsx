import { createFileRoute } from "@tanstack/react-router";
import { Wallet as WalletIcon, ArrowDownLeft, ArrowUpRight, CreditCard, TrendingUp, Download } from "lucide-react";
import { PageHeader, StatCard } from "@/components/dashboard/DashboardShell";

export const Route = createFileRoute("/seller/wallet")({
  component: SellerWallet;
});

const TX = [
  { id: 1, kind: "Payout", note: "Order #SBU-24817 · MacBook Pro", amount: +1567500, date: "Today, 10:26" },
  { id: 2, kind: "Payout", note: "Order #SBU-24812 · Headphones ×2", amount: +169100, date: "Today, 08:14" },
  { id: 3, kind: "Withdrawal", note: "GTBank ****4218", amount: -500000, date: "Yesterday, 17:02" },
  { id: 4, kind: "Fee", note: "Listing fee · iPhone 15 Pro Max", amount: -500, date: "Yesterday, 12:11" },
  { id: 5, kind: "Payout", note: "Order #SBU-24798 · Sport Watch", amount: +27075, date: "Yesterday, 09:22" },
  { id: 6, kind: "Refund", note: "Order #SBU-24788 · Cancelled by buyer", amount: -1250000, date: "3 days ago" },
];

function SellerWallet() {
  return (
    <div>
      <PageHeader
        title="Wallet"
        subtitle="Your earnings, payouts and withdrawals."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="relative overflow-hidden rounded-2xl gradient-brand p-6 text-primary-foreground shadow-elegant lg:col-span-2">
          <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-accent-orange/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-10 -left-6 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest opacity-80">
              <WalletIcon className="h-4 w-4" /> Available balance
            </div>
            <div className="mt-3 font-display text-5xl font-bold">₦412,880.50</div>
            <div className="mt-2 text-sm opacity-90">≈ $278.14 · Next payout: instant</div>
            <div className="mt-6 flex flex-wrap gap-2">
              <button className="inline-flex items-center gap-2 rounded-xl bg-accent-orange px-4 py-2 text-sm font-semibold text-accent-orange-foreground shadow-orange">
                <ArrowDownLeft className="h-4 w-4" /> Withdraw
              </button>
              <button className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur hover:bg-white/25">
                <CreditCard className="h-4 w-4" /> Add payment method
              </button>
              <button className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur hover:bg-white/25">
                <Download className="h-4 w-4" /> Statement
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          <StatCard label="Earnings (30d)" value="₦7.78M" trend="+24%" icon={TrendingUp} tint="primary" />
          <StatCard label="Pending settlement" value="₦148,200" icon={ArrowDownLeft} tint="orange" />
          <StatCard label="Withdrawn (30d)" value="₦5.20M" icon={ArrowUpRight} tint="success" />
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card shadow-soft">
        <div className="flex items-center justify-between border-b border-border p-5">
          <div>
            <h3 className="font-semibold">Transaction history</h3>
            <p className="text-xs text-muted-foreground">All wallet activity</p>
          </div>
          <button className="text-xs font-semibold text-primary hover:underline">View all</button>
        </div>
        <div className="divide-y divide-border">
          {TX.map((t) => (
            <div key={t.id} className="flex items-center gap-4 p-4">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                t.amount > 0 ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
              }`}>
                {t.amount > 0 ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium">{t.kind}</div>
                <div className="truncate text-xs text-muted-foreground">{t.note}</div>
              </div>
              <div className="text-right">
                <div className={`font-semibold ${t.amount > 0 ? "text-success" : "text-destructive"}`}>
                  {t.amount > 0 ? "+" : "-"}₦{Math.abs(t.amount).toLocaleString()}
                </div>
                <div className="text-[11px] text-muted-foreground">{t.date}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
