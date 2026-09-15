import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Banknote, CheckCircle2, XCircle } from "lucide-react";
import { listPendingWithdrawals, markWithdrawalPaid, rejectWithdrawal } from "@/lib/admin";
import { processPayout } from "@/lib/flutterwave-server";

export const Route = createFileRoute("/admin/withdrawals")({
  component: AdminWithdrawals,
});

function AdminWithdrawals() {
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  function load() {
    setLoading(true);
    listPendingWithdrawals()
      .then(function (data) {
        setWithdrawals(data);
      })
      .finally(function () {
        setLoading(false);
      });
  }

  useEffect(function () {
    load();
  }, []);

  function handlePay(w: any) {
    setError("");
    setBusyId(w.id);
    processPayout({
      data: {
        withdrawalId: w.id,
        accountNumber: w.account_number,
        bankCode: w.bank_code,
        accountName: w.account_name,
        amount: w.amount,
      },
    })
      .then(function (result) {
        return markWithdrawalPaid(w.id, result.transferId, result.reference);
      })
      .then(function () {
        setWithdrawals(function (prev) { return prev.filter(function (x: any) { return x.id !== w.id; }); });
      })
      .catch(function (err) {
        setError(err instanceof Error ? err.message : "Payout failed.");
      })
      .finally(function () {
        setBusyId(null);
      });
  }

  function handleReject(w: any) {
    const note = prompt("Reason for rejecting this withdrawal:");
    if (!note || !note.trim()) return;
    setBusyId(w.id);
    rejectWithdrawal(w.id, w.seller_id, w.amount, note.trim())
      .then(function () {
        setWithdrawals(function (prev) { return prev.filter(function (x: any) { return x.id !== w.id; }); });
      })
      .finally(function () {
        setBusyId(null);
      });
  }

  function renderWithdrawal(w: any) {
    const storeName = w.profiles && w.profiles.store_name ? w.profiles.store_name : "Seller";
    return (
      <div key={w.id} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold">{storeName}</h3>
            <p className="text-sm font-bold text-primary">₦{Number(w.amount).toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">{w.bank_name} - {w.account_number}</p>
            <p className="text-xs text-muted-foreground">{w.account_name}</p>
            <p className="mt-1 text-xs text-muted-foreground">{new Date(w.created_at).toLocaleDateString()}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={function () { handlePay(w); }}
              disabled={busyId === w.id}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
            >
              <CheckCircle2 className="h-3.5 w-3.5" /> {busyId === w.id ? "Processing..." : "Pay via Flutterwave"}
            </button>
            <button
              onClick={function () { handleReject(w); }}
              disabled={busyId === w.id}
              className="inline-flex items-center gap-1.5 rounded-lg border border-destructive px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/5 disabled:opacity-60"
            >
              <XCircle className="h-3.5 w-3.5" /> Reject
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/10 text-success">
          <Banknote className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold">Withdrawals</h1>
          <p className="text-sm text-muted-foreground">Approve pending payouts to sellers.</p>
        </div>
      </div>

      {error ? (
        <div className="mb-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>
      ) : null}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : withdrawals.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
          No pending withdrawals right now.
        </div>
      ) : (
        <div className="space-y-4">
          {withdrawals.map(renderWithdrawal)}
        </div>
      )}
    </div>
  );
}
