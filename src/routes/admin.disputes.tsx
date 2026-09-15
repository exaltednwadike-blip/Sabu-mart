import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, RotateCcw } from "lucide-react";
import { listOpenDisputes, resolveDisputeRelease, resolveDisputeRefund } from "@/lib/admin";
import { refundPayment } from "@/lib/flutterwave-server";

export const Route = createFileRoute("/admin/disputes")({
  component: AdminDisputes,
});

function AdminDisputes() {
  const [disputes, setDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  function load() {
    setLoading(true);
    listOpenDisputes()
      .then(function (data) {
        setDisputes(data);
      })
      .finally(function () {
        setLoading(false);
      });
  }

  useEffect(function () {
    load();
  }, []);

  function handleReleaseToSeller(d: any) {
    setError("");
    setBusyId(d.id);
    const item = d.order_items;
    const amount = Number(item.price) * item.quantity;
    resolveDisputeRelease(d.id, item.id, item.seller_id, amount)
      .then(function () {
        setDisputes(function (prev) { return prev.filter(function (x: any) { return x.id !== d.id; }); });
      })
      .catch(function (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      })
      .finally(function () {
        setBusyId(null);
      });
  }

  function handleRefundBuyer(d: any) {
    setError("");
    setBusyId(d.id);
    const item = d.order_items;
    const amount = Number(item.price) * item.quantity;
    const transactionId = item.orders ? item.orders.provider_transaction_id : null;

    const refundStep = transactionId
      ? refundPayment({ data: { transactionId, amount } })
      : Promise.resolve(null);

    refundStep
      .then(function () {
        return resolveDisputeRefund(d.id, item.id);
      })
      .then(function () {
        setDisputes(function (prev) { return prev.filter(function (x: any) { return x.id !== d.id; }); });
      })
      .catch(function (err) {
        setError(err instanceof Error ? err.message : "Refund failed.");
      })
      .finally(function () {
        setBusyId(null);
      });
  }

  function renderDispute(d: any) {
    const item = d.order_items;
    const amount = Number(item.price) * item.quantity;

    return (
      <div key={d.id} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold">{item.title}</h3>
            <p className="text-sm font-bold text-primary">₦{amount.toLocaleString()}</p>
            <p className="mt-2 rounded-lg bg-muted p-3 text-sm">{d.reason}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              Raised {new Date(d.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
          <button
            onClick={function () { handleRefundBuyer(d); }}
            disabled={busyId === d.id}
            className="inline-flex items-center gap-1.5 rounded-lg border border-destructive px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/5 disabled:opacity-60"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Refund buyer
          </button>
          <button
            onClick={function () { handleReleaseToSeller(d); }}
            disabled={busyId === d.id}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
          >
            <CheckCircle2 className="h-3.5 w-3.5" /> Release to seller
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold">Disputes</h1>
          <p className="text-sm text-muted-foreground">Resolve issues between buyers and sellers.</p>
        </div>
      </div>

      {error ? (
        <div className="mb-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>
      ) : null}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : disputes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
          No open disputes right now.
        </div>
      ) : (
        <div className="space-y-4">
          {disputes.map(renderDispute)}
        </div>
      )}
    </div>
  );
}
