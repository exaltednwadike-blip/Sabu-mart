import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Ticket, Send, Clock, MessageSquare } from "lucide-react";
import { PageHeader } from "@/components/dashboard/DashboardShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getCurrentUser } from "@/lib/auth";
import { getMyOrders } from "@/lib/cart";
import { submitTicket, getBuyerTickets, TicketCategory } from "@/lib/support";

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

export const Route = createFileRoute("/buyer/support")({
  component: BuyerSupport,
});

function BuyerSupport() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [category, setCategory] = useState<TicketCategory>("delivery");
  const [orderId, setOrderId] = useState<string>("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  function load(uid: string) {
    setLoading(true);
    Promise.all([getMyOrders(uid), getBuyerTickets(uid)])
      .then(function (results) {
        setOrders(results[0] || []);
        setTickets(results[1] || []);
      })
      .finally(function () {
        setLoading(false);
      });
  }

  useEffect(function () {
    getCurrentUser().then(function (user) {
      if (!user) {
        navigate({ to: "/login" });
        return;
      }
      setUserId(user.id);
      load(user.id);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;
    if (!subject.trim() || !description.trim()) {
      setError("Please fill in a subject and description.");
      return;
    }
    setError("");
    setSubmitting(true);
    submitTicket({
      buyerId: userId,
      orderId: orderId || null,
      category,
      subject: subject.trim(),
      description: description.trim(),
    })
      .then(function () {
        setSubject("");
        setDescription("");
        setOrderId("");
        setCategory("delivery");
        setSuccess(true);
        setTimeout(function () { setSuccess(false); }, 3000);
        load(userId);
      })
      .catch(function (err) {
        setError(err instanceof Error ? err.message : "Could not submit complaint.");
      })
      .finally(function () {
        setSubmitting(false);
      });
  }

  function renderTicket(t: any) {
    return (
      <div key={t.id} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold">{t.subject}</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {CATEGORY_LABELS[t.category] || t.category} &middot; {new Date(t.created_at).toLocaleDateString()}
            </p>
          </div>
          <span className={"rounded-full px-3 py-1 text-xs font-semibold capitalize " + (STATUS_STYLES[t.status] || "bg-muted text-muted-foreground")}>
            {t.status.replace("_", " ")}
          </span>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">{t.description}</p>
        {t.admin_response ? (
          <div className="mt-3 flex items-start gap-2 rounded-lg bg-muted p-3 text-sm">
            <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <div>
              <p className="text-xs font-semibold text-foreground">SABU support</p>
              <p className="text-muted-foreground">{t.admin_response}</p>
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Support tickets" subtitle="Raise a complaint or issue and track its status." />

      <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <h3 className="mb-4 flex items-center gap-2 font-semibold">
          <Ticket className="h-4 w-4 text-primary" /> Raise a complaint
        </h3>
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>Category</Label>
            <Select value={category} onValueChange={function (v) { setCategory(v as TicketCategory); }}>
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(CATEGORY_LABELS).map(function (key) {
                  return (
                    <SelectItem key={key} value={key}>
                      {CATEGORY_LABELS[key]}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Related order (optional)</Label>
            <Select value={orderId} onValueChange={setOrderId}>
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="No specific order" />
              </SelectTrigger>
              <SelectContent>
                {orders.map(function (o: any) {
                  return (
                    <SelectItem key={o.id} value={o.id}>
                      Order from {new Date(o.created_at).toLocaleDateString()}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2">
            <Label>Subject</Label>
            <Input
              value={subject}
              onChange={function (e) { setSubject(e.target.value); }}
              placeholder="Brief summary of your issue"
              className="mt-1.5"
            />
          </div>
          <div className="md:col-span-2">
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={function (e) { setDescription(e.target.value); }}
              placeholder="Tell us what happened..."
              rows={4}
              className="mt-1.5"
            />
          </div>
          {error ? <p className="text-sm text-destructive md:col-span-2">{error}</p> : null}
          {success ? (
            <p className="text-sm text-success md:col-span-2">Complaint submitted. We&apos;ll get back to you soon.</p>
          ) : null}
          <div className="md:col-span-2">
            <Button type="submit" disabled={submitting} className="gap-2">
              <Send className="h-4 w-4" /> {submitting ? "Submitting..." : "Submit complaint"}
            </Button>
          </div>
        </form>
      </div>

      <div className="mt-6">
        <h3 className="mb-4 flex items-center gap-2 font-semibold">
          <Clock className="h-4 w-4 text-primary" /> Your tickets
        </h3>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : tickets.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
            No complaints raised yet.
          </div>
        ) : (
          <div className="space-y-4">{tickets.map(renderTicket)}</div>
        )}
      </div>
    </div>
  );
}
