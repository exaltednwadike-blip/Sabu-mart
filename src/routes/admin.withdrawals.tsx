import { createFileRoute } from "@tanstack/react-router";
import { Banknote, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/admin/withdrawals")({
  component: AdminWithdrawals,
});

function AdminWithdrawals() {
  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Banknote className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold">Withdrawals</h1>
          <p className="text-sm text-muted-foreground">Review and pay out seller withdrawal requests.</p>
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-2xl border border-accent-orange/30 bg-accent-orange/10 p-6 text-sm">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-accent-orange" />
        <div>
          <p className="font-semibold text-foreground">Withdrawals are temporarily paused</p>
          <p className="mt-1 text-muted-foreground">
            We're resolving an issue with our payment provider (Flutterwave). Seller payouts can't be processed right now.
            This page will be re-enabled once the issue is fixed — no withdrawal requests are being lost in the meantime.
          </p>
        </div>
      </div>
    </div>
  );
}
