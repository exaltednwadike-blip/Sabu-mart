import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Wallet, TrendingUp, Clock, ArrowUpRight, ArrowDownRight, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/dashboard/DashboardShell";
import { getCurrentUser } from "@/lib/auth";
import { getWalletSummary, getWalletTransactions, getWithdrawalRequests } from "@/lib/wallet";

export const Route = createFileRoute("/seller/wallet")({
  component: SellerWallet,
});

const typeLabel: { [key: string]: string } = {
  escrow_release: "Payment received",
  withdrawal: "Withdrawal",
  refund: "Refund",
  escrow_hold: "Payment held",
};

const withdrawalStatusColor: { [key: string]: string } = {
  pending: "bg-accent-orange/15 text-accent-orange",
  paid: "bg-success/10 text-success",
  rejected: "bg-destructive/10 text-destructive",
};

type WalletTransaction = {
  id: string;
  type: string;
  amount: number;
  created_at: string;
};

type WithdrawalRequest = {
  id: string;
  amount: number;
  bank_name: string;
  account_name: string;
  account_number: string;
  status: string;
  created_at: string;
};

function SellerWallet() {
  const [summary, setSummary] = useState({ available: 0, pending: 0, totalEarned: 0 });
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(function () {
    getCurrentUser().then(function (user) {
      if (!user) return;
      Promise.all([
        getWalletSummary(user.id),
        getWalletTransactions(user.id),
        getWithdrawalRequests(user.id),
      ])
        .then(function (results) {
          setSummary(results[0]);
          setTransactions(results[1]);
          setWithdrawals(results[2]);
        })
        .finally(function () {
          setLoading(false);
        });
    });
  }, []);

  function renderTransaction(t: any) {
    const isCredit = t.type === "escrow_release" || t.type === "refund";
    return (
      <div key={t.id} className="flex items-center justify-between border-b border-border py-3 last:border-0">
        <div className="flex items-center gap-3">
          <div className={"flex h-9 w-9 items-center justify-center rounded-full " + (isCredit ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive")}>
            {isCredit ? <ArrowDownRight className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
          </div>
          <div>
            <p className="text-sm font-medium">{typeLabel[t.type] || t.type}</p>
            <p className="text-xs text-muted-foreground">{new Date(t.created_at).toLocaleDateString()}</p>
          </div>
        </div>
        <span className={"font-semibold " + (isCredit ? "text-success" : "text-destructive")}>
          {isCredit ? "+" : "-"}₦{Number(t.amount).toLocaleString()}
        </span>
      </div>
    );
  }

  function renderWithdrawal(w: any) {
    return (
      <div key={w.id} className="flex items-center justify-between border-b border-border py-3 last:border-0">
        <div>
          <p className="text-sm font-medium">₦{Number(w.amount).toLocaleString()} - {w.bank_name}</p>
          <p className="text-xs text-muted-foreground">{w.account_name} - {w.account_number}</p>
          <p className="text-xs text-muted-foreground">{new Date(w.created_at).toLocaleDateString()}</p>
        </div>
        <span className={"rounded-full px-2 py-0.5 text-[11px] font-semibold " + (withdrawalStatusColor[w.status] || "")}>
          {w.status}
        </span>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Wallet" subtitle="Track your earnings and payouts." />

      <div className="mb-6 flex items-start gap-3 rounded-2xl border border-accent-orange/30 bg-accent-orange/10 p-4 text-sm">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-accent-orange" />
        <p className="text-muted-foreground">
          <strong className="text-foreground">Withdrawals are temporarily paused</strong> while we resolve an issue with our
          payment provider. Your balance and transaction history below are unaffected and still accurate — you just can't
          request a new withdrawal right now. We'll re-enable this as soon as it's fixed.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Wallet className="h-4 w-4 text-primary" /> Available balance
          </div>
          <div className="mt-2 font-display text-2xl font-bold">₦{summary.available.toLocaleString()}</div>
          <button
            disabled
            className="mt-3 w-full cursor-not-allowed rounded-lg bg-muted py-1.5 text-xs font-semibold text-muted-foreground"
          >
            Withdrawals paused
          </button>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-4 w-4 text-accent-orange" /> Pending (in escrow)
          </div>
          <div className="mt-2 font-display text-2xl font-bold">₦{summary.pending.toLocaleString()}</div>
          <p className="mt-3 text-[11px] text-muted-foreground">Released once buyers confirm receipt</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <TrendingUp className="h-4 w-4 text-success" /> Total earned
          </div>
          <div className="mt-2 font-display text-2xl font-bold">₦{summary.totalEarned.toLocaleString()}</div>
        </div>
      </div>

      {withdrawals.length > 0 ? (
        <div className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-soft">
          <h3 className="font-semibold">Withdrawal requests</h3>
          <div className="mt-2">
            {withdrawals.map(renderWithdrawal)}
          </div>
        </div>
      ) : null}

      <div className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-soft">
        <h3 className="font-semibold">Transaction history</h3>
        {loading ? (
          <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
        ) : transactions.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">No transactions yet.</p>
        ) : (
          <div className="mt-2">
            {transactions.map(renderTransaction)}
          </div>
        )}
      </div>
    </div>
  );
}
