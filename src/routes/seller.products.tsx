import { createFileRoute } from "@tanstack/react-router";
import { Search, Filter, Edit3, Trash2, Eye, MoreVertical, Plus } from "lucide-react";
import { PageHeader } from "@/components/dashboard/DashboardShell";
import headphones from "@/assets/product-headphones.jpg";
import laptop from "@/assets/product-laptop.jpg";
import bag from "@/assets/product-bag.jpg";
import watch from "@/assets/product-watch.jpg";
import phone from "@/assets/cat-phones.jpg";

export const Route = createFileRoute("/seller/products")({
  component: SellerProducts,
});

const PRODUCTS = [
  { id: 1, name: "MacBook Pro 14\" M3", sku: "MBP-14-M3-512", price: 1650000, stock: 8, sales: 12, status: "Live", image: laptop },
  { id: 2, name: "Wireless Noise-Cancelling Headphones", sku: "HP-SND-002", price: 89000, stock: 42, sales: 89, status: "Live", image: headphones },
  { id: 3, name: "Samsung Galaxy A55 · 256GB", sku: "SG-A55-256", price: 385000, stock: 15, sales: 34, status: "Live", image: phone },
  { id: 4, name: "Handcrafted Leather Tote", sku: "BAG-TR-01", price: 42500, stock: 0, sales: 156, status: "Out of stock", image: bag },
  { id: 5, name: "Sport Chronograph Watch", sku: "WCH-ORG-01", price: 28500, stock: 27, sales: 41, status: "Live", image: watch },
  { id: 6, name: "iPhone 15 Pro Max 256GB", sku: "IPH-15PM-256", price: 1250000, stock: 3, sales: 0, status: "Draft", image: phone },
];

const statusColor: Record<string, string> = {
  Live: "bg-success/10 text-success",
  "Out of stock": "bg-destructive/10 text-destructive",
  Draft: "bg-muted text-foreground",
};

function SellerProducts() {
  return (
    <div>
      <PageHeader
        title="Products"
        subtitle="Manage your inventory, pricing and listings."
        action={
          <button className="inline-flex items-center gap-2 rounded-xl gradient-brand px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft">
            <Plus className="h-4 w-4" /> Add product
          </button>
        }
      />

      <div className="rounded-2xl border border-border bg-card shadow-soft">
        <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
          <div className="flex flex-1 items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 md:max-w-sm">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input placeholder="Search products or SKUs..." className="flex-1 bg-transparent text-sm outline-none" />
          </div>
          <button className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-accent">
            <Filter className="h-3.5 w-3.5" /> Category
          </button>
          <button className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-accent">
            <Filter className="h-3.5 w-3.5" /> Status
          </button>
          <div className="ml-auto text-xs text-muted-foreground">{PRODUCTS.length} products</div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Product</th>
                <th className="px-4 py-3 text-left font-medium">SKU</th>
                <th className="px-4 py-3 text-right font-medium">Price</th>
                <th className="px-4 py-3 text-right font-medium">Stock</th>
                <th className="px-4 py-3 text-right font-medium">Sold</th>
                <th className="px-4 py-3 text-center font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {PRODUCTS.map((p) => (
                <tr key={p.id} className="border-t border-border hover:bg-accent/40">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={p.image} alt="" className="h-10 w-10 rounded-lg object-cover" />
                      <span className="font-medium">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{p.sku}</td>
                  <td className="px-4 py-3 text-right font-semibold">₦{p.price.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">{p.stock}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{p.sales}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusColor[p.status]}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground" aria-label="View"><Eye className="h-4 w-4" /></button>
                      <button className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-primary" aria-label="Edit"><Edit3 className="h-4 w-4" /></button>
                      <button className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-destructive" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
                      <button className="rounded-md p-1.5 text-muted-foreground hover:bg-accent" aria-label="More"><MoreVertical className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
