import { createFileRoute } from "@tanstack/react-router";
import { Construction, ArrowLeft } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard/DashboardShell";

// Placeholder for remaining dashboard sub-pages linked from sidebars
export const Route = createFileRoute("/seller/analytics")({
  component: () => <Coming title="Analytics" back="/seller" />,
});

export function Coming({ title, back }: { title: string; back: string }) {
  return (
    <div>
      <PageHeader title={title} />
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-16 text-center shadow-soft">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Construction className="h-6 w-6" />
        </div>
        <h2 className="mt-4 font-display text-xl font-semibold">Coming soon</h2>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          This section is being built. In the meantime, explore the rest of your dashboard.
        </p>
        <Link to={back} className="mt-5 inline-flex items-center gap-2 rounded-xl gradient-brand px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft">
          <ArrowLeft className="h-4 w-4" /> Back to dashboard
        </Link>
      </div>
    </div>
  );
}
