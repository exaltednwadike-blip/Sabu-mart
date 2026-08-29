import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/admin/disputes")({
  component: AdminDisputes,
});

function AdminDisputes() {
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

      <div className="flex items-start gap-3 rounded-2xl border border-accent-orange/30 bg-accent-orange/10 p-6 text-sm">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-accent-orange" />
        <div>
          <p className="font-semibold text-foreground">Dispute resolution is temporarily paused</p>
          <p className="mt-1 text-muted-foreground">
            We're resolving an issue with our payment provider (Flutterwave), which this flow depends on for buyer refunds.
            This page will be re-enabled once the issue is fixed. No open disputes are being lost in the meantime.
          </p>
        </div>
      </div>
    </div>
  );
}
