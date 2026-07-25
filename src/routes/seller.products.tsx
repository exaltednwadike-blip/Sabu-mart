import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search, Trash2, Plus, ImageOff, PackageCheck, PackageX } from "lucide-react";
import { PageHeader } from "@/components/dashboard/DashboardShell";
import { getCurrentUser } from "@/lib/auth";
import { getMyProducts, deleteProduct, updateAvailability } from "@/lib/products";

export const Route = createFileRoute("/seller/products")({
  component: SellerProducts,
});

interface Product {
  id: string;
  title: string;
  price: number;
  stock_quantity: number;
  status: string;
  availability: string;
  images: string[];
  listing_categories?: { name: string } | null;
}

const statusColor: { [key: string]: string } = {
  published: "bg-success/10 text-success",
  pending_review: "bg-accent-orange/15 text-accent-orange",
  draft: "bg-muted text-foreground",
  rejected: "bg-destructive/10 text-destructive",
};

const statusLabel: { [key: string]: string } = {
  published: "Live",
  pending_review: "In review",
  draft: "Draft",
  rejected: "Rejected",
};

function SellerProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  function load() {
    setLoading(true);
    getCurrentUser().then(function (user) {
      if (!user) return;
      getMyProducts(user.id)
        .then(function (data) {
          setProducts(data as Product[]);
        })
        .finally(function () {
          setLoading(false);
        });
    });
  }

  useEffect(function () {
    load();
  }, []);

  function handleDelete(product: Product) {
    if (!confirm("Delete this product? This can't be undone.")) return;
    setError("");
    setBusyId(product.id);
    deleteProduct(product.id, product.images)
      .then(function () {
        setProducts(function (prev) { return prev.filter(function (p) { return p.id !== product.id; }); });
      })
      .catch(function (err) {
        setError(err instanceof Error ? err.message : "Could not delete this product.");
      })
      .finally(function () {
        setBusyId(null);
      });
  }

  function handleToggleAvailability(product: Product) {
    setBusyId(product.id);
    const next = product.availability === "sold" ? "available" : "sold";
    updateAvailability(product.id, next)
      .then(function () {
        setProducts(function (prev) {
          return prev.map(function (p) {
            return p.id === product.id ? { ...p, availability: next } : p;
          });
        });
      })
      .finally(function () {
        setBusyId(null);
      });
  }

  const filtered = products.filter(function (p) {
    return p.title.toLowerCase().includes(search.toLowerCase());
  });

  function renderRow(p: Product) {
    return (
      <tr key={p.id} className="border-t border-border hover:bg-accent/40">
        <td className="px-4 py-3">
          <div className="flex items-center gap-3">
            {p.images && p.images[0] ? (
              <img src={p.images[0]} alt="" className="h-10 w-10 rounded-lg object-cover" />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <ImageOff className="h-4 w-4" />
              </div>
            )}
            <span className="font-medium">{p.title}</span>
          </div>
        </td>
        <td className="px-4 py-3 text-xs text-muted-foreground">
          {p.listing_categories ? p.listing_categories.name : "-"}
        </td>
        <td className="px-4 py-3 text-right font-semibold">₦{Number(p.price).toLocaleString()}</td>
        <td className="px-4 py-3 text-right">{p.stock_quantity}</td>
        <td className="px-4 py-3 text-center">
          <span className={"rounded-full px-2 py-0.5 text-[11px] font-semibold " + (statusColor[p.status] ?? "")}>
            {statusLabel[p.status] ?? p.status}
          </span>
        </td>
        <td className="px-4 py-3 text-center">
          <span className={"rounded-full px-2 py-0.5 text-[11px] font-semibold " + (p.availability === "sold" ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary")}>
            {p.availability === "sold" ? "Sold" : "Available"}
          </span>
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center justify-end gap-1">
            <button
              onClick={function () { handleToggleAvailability(p); }}
              disabled={busyId === p.id}
              className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-primary disabled:opacity-60"
              aria-label="Toggle availability"
              title={p.availability === "sold" ? "Mark as available" : "Mark as sold"}
            >
              {p.availability === "sold" ? <PackageCheck className="h-4 w-4" /> : <PackageX className="h-4 w-4" />}
            </button>
            <button
              onClick={function () { handleDelete(p); }}
              disabled={busyId === p.id}
              className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-destructive disabled:opacity-60"
              aria-label="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <div>
      <PageHeader
        title="Products"
        subtitle="Manage your inventory, pricing and listings."
        action={
          <Link
            to="/seller/upload"
            className="inline-flex items-center gap-2 rounded-xl gradient-brand px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft"
          >
            <Plus className="h-4 w-4" /> Add product
          </Link>
        }
      />

      {error ? (
        <div className="mb-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>
      ) : null}

      <div className="rounded-2xl border border-border bg-card shadow-soft">
        <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
          <div className="flex flex-1 items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 md:max-w-sm">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={function (e) { setSearch(e.target.value); }}
              placeholder="Search products..."
              className="flex-1 bg-transparent text-sm outline-none"
            />
          </div>
          <div className="ml-auto text-xs text-muted-foreground">{filtered.length} products</div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            No products yet. <Link to="/seller/upload" className="font-semibold text-primary hover:underline">Upload your first one</Link>.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Product</th>
                  <th className="px-4 py-3 text-left font-medium">Category</th>
                  <th className="px-4 py-3 text-right font-medium">Price</th>
                  <th className="px-4 py-3 text-right font-medium">Stock</th>
                  <th className="px-4 py-3 text-center font-medium">Status</th>
                  <th className="px-4 py-3 text-center font-medium">Availability</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(renderRow)}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
