import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Ticket, MessageSquare, CheckCircle2 } from "lucide-react";
import { listAllTickets, respondToTicket, TicketStatus } from "@/lib/support";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const CATEGORY_LABELS: { [key: string]: string } = {
  delivery: "Delivery issue",
  product_quality: "Product quality",
  seller_conduct: "Seller conduct",
  payment: "Payment issue",
  app_issue: "App issue / bug",
  other: "Other",
};

const STATUS_STYLES: { [key: string]: string } = {
  open: "bg-accent-orange/10 text-accent-orange",
  in_review: "bg-primary/10 text-primary",
  resolved: "bg-success/10 text-success",
  closed: "bg-muted text-muted-foreground",
};

const FILTERS: { label: string; value: TicketStatus | "all" }[] = [
  { label: "Open", value: "open" },
  { label: "In review", value: "in_review" },
  { label: "Resolved", value: "resolved" },
  { label: "Closed", value: "closed" },
  { label: "All", value: "all" },
];

export const Route = createFileRoute("/admin/support")({
  component: AdminSupport,
});

function AdminSupport() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [filter, setFilter] = useState<TicketStatus | "all">("open");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [responses, setResponses] = useState<{ [key: string]: string }>({});
  const [error, setError] = useState("");

  function load() {
    setLoading(true);
    listAllTickets(filter === "all" ? undefined : filter)
      .then(function (data) {
        setTickets(data);
      })
      .finally(function () {
        setLoading(false);
      });
  }

  useEffect(function () {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  function handleRespond(ticket: any, status: TicketStatus) {
    const response = responses[ticket.id] || "";
    if (!response.trim() && (status === "resolved" || status === "closed")) {
      setError("Add a response before resolving or closing a ticket.");
      return;
    }
    setError("");
    setBusyId(ticket.id);
    respondToTicket(ticket.id, response.trim(), status)
      .then(function () {
        setTickets(function (prev) { return prev.filter(function (t: any) { return t.id !== ticket.id; }); });
      })
      .catch(function (err) {
        setError(err instanceof Error ? err.message : "Could not update ticket.");
      })
      .finally(function () {
        setBusyId(null);
      });
  }

  function renderTicket(t: any) {
    const buyerName = t.profiles ? t.profiles.full_name : "Buyer";
    return (
      <div key={t.id} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold">{t.subject}</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {buyerName} &middot; {CATEGORY_LABELS[t.category] || t.category} &middot; {new Date(t.created_at).toLocaleDateString()}
            </p>
          </div>
          <span className={"rounded-full px-3 py-1 text-xs font-semibold capitalize " + (STATUS_STYLES[t.status] || "bg-muted text-muted-foreground")}>
            {t.status.replace("_", " ")}
          </span>
        </div>
        <p className="mt-3 rounded-lg bg-muted p-3 text-sm">{t.description}</p>
        {t.admin_response ? (
          <div className="mt-3 flex items-start gap-2 rounded-lg bg-primary/5 p-3 text-sm">
            <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <p className="text-muted-foreground">{t.admin_response}</p>
          </div>
        ) : null}

        {t.status !== "resolved" && t.status !== "closed" ? (
          <div className="mt-4 space-y-2 border-t border-border pt-4">
            <Textarea
              value={responses[t.id] || ""}
              onChange={function (e) {
                setResponses(function (prev) {
                  return Object.assign({}, prev, { [t.id]: e.target.value });
                });
              }}
              placeholder="Write a response to the buyer..."
              rows={2}
            />
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={busyId === t.id}
                onClick={function () { handleRespond(t, "in_review"); }}
              >
                Mark in review
              </Button>
              <Button
                size="sm"
                disabled={busyId === t.id}
                onClick={function () { handleRespond(t, "resolved"); }}
                className="gap-1.5"
              >
                <CheckCircle2 className="h-3.5 w-3.5" /> Resolve
              </Button>
              <Button
                size="sm"
                variant="ghost"
                disabled={busyId === t.id}
                onClick={function () { handleRespond(t, "closed"); }}
              >
                Close
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Ticket className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold">Support tickets</h1>
          <p className="text-sm text-muted-foreground">Review and respond to buyer complaints.</p>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map(function (f) {
          return (
            <button
              key={f.value}
              onClick={function () { setFilter(f.value); }}
              className={
                "rounded-full px-3 py-1.5 text-xs font-semibold transition " +
                (filter === f.value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent")
              }
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {error ? (
        <div className="mb-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>
      ) : null}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : tickets.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
          No tickets in this view.
        </div>
      ) : (
        <div className="space-y-4">{tickets.map(renderTicket)}</div>
      )}
    </div>
  );
}
