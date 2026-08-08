import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Wallet, TrendingUp, Clock, ArrowUpRight, ArrowDownRight, X, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/dashboard/DashboardShell";
import { getCurrentUser } from "@/lib/auth";
import { getWalletSummary, getWalletTransactions, requestWithdrawal, getWithdrawalRequests } from "@/lib/wallet";
import { listBanks, resolveAccountNumber } from "@/lib/flutterwave-server";

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

type BankOption = {
  code: string;
  name: string;
};

function SellerWallet() {
  const [summary, setSummary] = useState({ available: 0, pending: 0, totalEarned: 0 });
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [banks, setBanks] = useState<BankOption[]>([]);
  const [amount, setAmount] = useState("");
  const [bankCode, setBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function load() {
    setLoading(true);
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
  }

  useEffect(function () {
    load();
  }, []);

  function openModal() {
    setModalOpen(true);
    setAccountName("");
    if (banks.length === 0) {
      listBanks({}).then(setBanks).catch(function (err) { setError(err instanceof Error ? err.message : "Could not load banks."); });
    }
  }

  function handleVerify() {
    if (!bankCode || accountNumber.length < 10) {
      setError("Select a bank and enter a valid account number.");
      return;
    }
    setError("");
    setVerifying(true);
    resolveAccountNumber({ data: { accountNumber, bankCode } })
      .then(function (result) {
        setAccountName(result.accountName);
      })
      .catch(function (err) {
        setError(err instanceof Error ? err.message : "Could not verify account.");
      })
      .finally(function () {
        setVerifying(false);
      });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const amt = Number(amount);
    const bank = banks.find(function (b: any) { return b.code === bankCode; });

    if (!amt || amt <= 0) {
      setError("Enter a valid amount.");
      return;
    }
    if (amt > summary.available) {
      setError("Amount exceeds your available balance.");
      return;
    }
    if (!accountName) {
      setError("Please verify your account details first.");
      return;
    }

    setSubmitting(true);
    requestWithdrawal(amt, bank ? bank.name : "", bankCode, accountNumber, accountName)
      .then(function () {
        setModalOpen(false);
        setAmount("");
        setBankCode("");
        setAccountNumber("");
        setAccountName("");
        load();
      })
      .catch(function (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      })
      .finally(function () {
        setSubmitting(false);
      });
  }

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

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Wallet className="h-4 w-4 text-primary" /> Available balance
          </div>
          <div className="mt-2 font-display text-2xl font-bold">₦{summary.available.toLocaleString()}</div>
          <button
            onClick={openModal}
            className="mt-3 w-full rounded-lg bg-primary/10 py-1.5 text-xs font-semibold text-primary hover:bg-primary hover:text-primary-foreground"
          >
            Withdraw
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

      {modalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-elegant">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold">Withdraw funds</h2>
              <button onClick={function () { setModalOpen(false); }} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Available: ₦{summary.available.toLocaleString()}</p>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium">Amount</label>
                <input
                  type="number"
                  value={amount}
                  onChange={function (e) { setAmount(e.target.value); }}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">Bank</label>
                <select
                  value={bankCode}
                  onChange={function (e) { setBankCode(e.target.value); setAccountName(""); }}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                >
                  <option value="">Select your bank</option>
                  {banks.map(function (b: any) {
                    return <option key={b.code} value={b.code}>{b.name}</option>;
                  })}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">Account number</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={function (e) { setAccountNumber(e.target.value); setAccountName(""); }}
                    className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                    placeholder="0123456789"
                  />
                  <button
                    type="button"
                    onClick={handleVerify}
                    disabled={verifying}
                    className="rounded-xl border border-border px-3 py-2 text-xs font-semibold hover:bg-accent disabled:opacity-60"
                  >
                    {verifying ? "Checking..." : "Verify"}
                  </button>
                </div>
              </div>

              {accountName ? (
                <div className="flex items-center gap-2 rounded-lg bg-success/10 px-3 py-2 text-sm text-success">
                  <CheckCircle2 className="h-4 w-4" /> {accountName}
                </div>
              ) : null}

              {error ? (
                <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>
              ) : null}

              <button
                type="submit"
                disabled={submitting || !accountName}
                className="w-full rounded-xl gradient-brand py-2.5 text-sm font-semibold text-primary-foreground shadow-soft hover:opacity-90 disabled:opacity-60"
              >
                {submitting ? "Submitting..." : "Request withdrawal"}
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
