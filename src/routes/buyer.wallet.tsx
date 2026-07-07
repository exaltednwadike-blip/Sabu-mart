import { createFileRoute } from "@tanstack/react-router";
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, Plus, Gift } from "lucide-react";
import { PageHeader, StatCard } from "@/components/dashboard/DashboardShell";

export const Route = createFileRoute("/buyer/wallet")({
  component: BuyerWallet,
});

const TX = [
  { kind: "Refund", note: "Order #SBU-24601 · Cancelled", amount: +385000, date: "Yesterday" },
  { kind: "Payment", note: "Order #SBU-24817 · MacBook", amount: -1650000, date: "Today" },
  { kind: "Top-up", note: "Card ****4218", amount: +50000, date: "3 days ago" },
  { kind: "Reward", note: "SABU Perks · Silver tier", amount: +2500, date: "1 week ago" },
];

function BuyerWallet() {
  return (
    <div>
      <PageHeader title="Wallet" subtitle="Fund your wallet for faster checkout." />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="relative overflow-hidden rounded-2xl gradient-brand p-6 text-primary-foreground shadow-elegant lg:col-span-2">
          <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-accent-orange/30 blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest opacity-80">
              <WalletIcon className="h-4 w-4" /> Wallet balance
            </div>
            <div className="mt-3 font-display text-5xl font-bold">₦18,500.00</div>
            <div className="mt-2 text-sm opacity-90">Use at checkout for instant payment</div>
            <div className="mt-6 flex flex-wrap gap-2">
              <button className="inline-flex items-center gap-2 rounded-xl bg-accent-orange px-4 py-2 text-sm font-semibold text-accent-orange-foreground shadow-orange">
                <Plus className="h-4 w-4" /> Top up
              </button>
              <button className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur hover:bg-white/25">
                <ArrowUpRight className="h-4 w-4" /> Send to bank
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          <StatCard label="SABU Perks" value="2,480 pts" trend="Silver" icon={Gift} tint="orange" />
          <StatCard label="Spent (30d)" value="₦1.98M" icon={ArrowUpRight} tint="primary" />
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card shadow-soft">
        <div className="border-b border-border p-5">
          <h3 className="font-semibold">Recent transactions</h3>
        </div>
        <div className="divide-y divide-border">
          {TX.map((t, i) => (
            <div key={i} className="flex items-center gap-4 p-4">
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
