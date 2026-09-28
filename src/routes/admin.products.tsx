import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, ImageOff, Package } from "lucide-react";
import { listPendingProducts, publishProduct, rejectProduct, evaluateProductFlags } from "@/lib/admin";
import { AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/admin/products")({
  component: AdminProducts,
});

function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  function load() {
    setLoading(true);
    listPendingProducts()
      .then(function (data) {
        const sorted = [...data].sort(function (a: any, b: any) {
          return evaluateProductFlags(b).length - evaluateProductFlags(a).length;
        });
        setProducts(sorted);
      })
      .finally(function () {
        setLoading(false);
      });
  }

  useEffect(function () {
    load();
  }, []);

  function handlePublish(id: string) {
    setBusyId(id);
    publishProduct(id)
      .then(function () {
        setProducts(function (prev) { return prev.filter(function (p: any) { return p.id !== id; }); });
      })
      .finally(function () {
        setBusyId(null);
      });
  }

  function handleReject(id: string) {
    setBusyId(id);
    rejectProduct(id)
      .then(function () {
        setProducts(function (prev) { return prev.filter(function (p: any) { return p.id !== id; }); });
      })
      .finally(function () {
        setBusyId(null);
      });
  }

  function renderProduct(p: any) {
    const flags = evaluateProductFlags(p);
    return (
      <div key={p.id} className={"rounded-2xl border bg-card p-5 shadow-soft " + (flags.length > 0 ? "border-destructive/40" : "border-border")}>
        {flags.length > 0 ? (
          <div className="mb-3 flex flex-wrap items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
            {flags.map(function (f: string) {
              return <span key={f} className="rounded-full bg-destructive/10 px-2 py-0.5 text-[11px] font-medium text-destructive">{f}</span>;
            })}
          </div>
        ) : null}
        <div className="flex flex-wrap items-center gap-4">
          {p.images && p.images[0] ? (
            <img src={p.images[0]} alt="" className="h-16 w-16 rounded-xl object-cover" />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-muted text-muted-foreground">
              <ImageOff className="h-5 w-5" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold">{p.title}</h3>
            <p className="text-xs text-muted-foreground">
              {p.listing_categories ? p.listing_categories.name : "Uncategorized"} - {p.city}
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-sm">
              <span className="font-bold text-primary">₦{Number(p.price).toLocaleString()}</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-semibold text-success">
                Listing fee paid - ₦{Number(p.listing_fee).toLocaleString()}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={function () { handlePublish(p.id); }}
              disabled={busyId === p.id}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
            >
              <CheckCircle2 className="h-3.5 w-3.5" /> Approve & publish
            </button>
            <button
              onClick={function () { handleReject(p.id); }}
              disabled={busyId === p.id}
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
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-orange/15 text-accent-orange">
          <Package className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold">Products in review</h1>
          <p className="text-sm text-muted-foreground">Listing fee already paid - review content before publishing.</p>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
          No products awaiting review right now.
        </div>
      ) : (
        <div className="space-y-4">
          {products.map(renderProduct)}
        </div>
      )}
    </div>
  );
}
