import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FileCheck, CheckCircle2, XCircle, ExternalLink, Users } from "lucide-react";
import { listApplications, approveApplication, rejectApplication, getDocumentUrl } from "@/lib/admin";

export const Route = createFileRoute("/admin/sellers")({
  component: AdminSellers,
});

function AdminSellers() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  function load() {
    setLoading(true);
    listApplications("pending")
      .then(function (data) {
        setApplications(data);
      })
      .finally(function () {
        setLoading(false);
      });
  }

  useEffect(function () {
    load();
  }, []);

  function handleApprove(app: any) {
    setBusyId(app.id);
    approveApplication(app.id, app.user_id, app.business_name)
      .then(function () {
        setApplications(function (prev) { return prev.filter(function (a: any) { return a.id !== app.id; }); });
      })
      .finally(function () {
        setBusyId(null);
      });
  }

  function handleReject(app: any) {
    if (!rejectionReason.trim()) return;
    setBusyId(app.id);
    rejectApplication(app.id, app.user_id, rejectionReason.trim())
      .then(function () {
        setApplications(function (prev) { return prev.filter(function (a: any) { return a.id !== app.id; }); });
        setRejectingId(null);
        setRejectionReason("");
      })
      .finally(function () {
        setBusyId(null);
      });
  }

  function handleViewDocument(path: string) {
    getDocumentUrl(path).then(function (url) {
      window.open(url, "_blank");
    });
  }

  function renderApp(app: any) {
    const initial = app.business_name ? app.business_name.charAt(0).toUpperCase() : "S";
    return (
      <div key={app.id} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl gradient-brand font-display text-lg font-bold text-primary-foreground">
              {initial}
            </div>
            <div>
              <h3 className="font-semibold">{app.business_name}</h3>
              <p className="text-sm text-muted-foreground">{app.business_address}</p>
              <p className="mt-1 text-sm">{app.phone}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {app.id_type.replace("_", " ").toUpperCase()} - {app.id_number}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Submitted {new Date(app.submitted_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          <button
            onClick={function () { handleViewDocument(app.id_document_url); }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-accent"
          >
            <FileCheck className="h-3.5 w-3.5" /> View ID document <ExternalLink className="h-3 w-3" />
          </button>
        </div>

        {rejectingId === app.id ? (
          <div className="mt-4 space-y-2 border-t border-border pt-4">
            <input
              type="text"
              value={rejectionReason}
              onChange={function (e) { setRejectionReason(e.target.value); }}
              placeholder="Reason for rejection..."
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
            <div className="flex gap-2">
              <button
                onClick={function () { handleReject(app); }}
                disabled={busyId === app.id || !rejectionReason.trim()}
                className="rounded-lg bg-destructive px-3 py-1.5 text-xs font-semibold text-destructive-foreground disabled:opacity-60"
              >
                Confirm rejection
              </button>
              <button
                onClick={function () { setRejectingId(null); setRejectionReason(""); }}
                className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-accent"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-4 flex gap-2 border-t border-border pt-4">
            <button
              onClick={function () { handleApprove(app); }}
              disabled={busyId === app.id}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
            >
              <CheckCircle2 className="h-3.5 w-3.5" /> Approve
            </button>
            <button
              onClick={function () { setRejectingId(app.id); }}
              disabled={busyId === app.id}
              className="inline-flex items-center gap-1.5 rounded-lg border border-destructive px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/5 disabled:opacity-60"
            >
              <XCircle className="h-3.5 w-3.5" /> Reject
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Users className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold">Seller applications</h1>
          <p className="text-sm text-muted-foreground">Review KYC submissions and approve new sellers.</p>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : applications.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
          No pending applications right now.
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map(renderApp)}
        </div>
      )}
    </div>
  );
}
