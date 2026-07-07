import { createFileRoute } from "@tanstack/react-router";
import { Upload, X } from "lucide-react";
import { PageHeader } from "@/components/dashboard/DashboardShell";

export const Route = createFileRoute("/seller/upload")({
  component: SellerUpload,
});

function SellerUpload() {
  return (
    <div>
      <PageHeader
        title="Upload product"
        subtitle="Each listing costs ₦500 and goes live instantly after payment."
      />
      <form className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card title="Product images & video">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="flex aspect-square flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/40 text-xs text-muted-foreground transition hover:border-primary/40 hover:bg-primary/5">
                  <Upload className="mb-1 h-5 w-5" />
                  {i === 0 ? "Main image" : "Add"}
                </div>
              ))}
            </div>
          </Card>

          <Card title="Basic details">
            <div className="grid gap-4">
              <Field label="Title"><Input placeholder="e.g. MacBook Pro 14&quot; M3 · 16GB · 512GB" /></Field>
              <Field label="Description">
                <textarea rows={5} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" placeholder="Describe your product, condition, what's included..." />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Category"><Select options={["Phones", "Computers", "Fashion", "Vehicles", "Agriculture"]} /></Field>
                <Field label="Condition"><Select options={["Brand new", "Used - like new", "Used - good", "For parts"]} /></Field>
              </div>
            </div>
          </Card>

          <Card title="Pricing & stock">
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Price (₦)"><Input type="number" placeholder="0" /></Field>
              <Field label="Stock quantity"><Input type="number" placeholder="1" /></Field>
              <Field label="Delivery">
                <Select options={["Pickup only", "Delivery available", "Both"]} />
              </Field>
            </div>
            <div className="mt-3 flex flex-wrap gap-4 text-sm">
              <label className="flex items-center gap-2"><input type="checkbox" className="rounded" defaultChecked /> Negotiable</label>
              <label className="flex items-center gap-2"><input type="checkbox" className="rounded" /> Free delivery in Lagos</label>
            </div>
          </Card>

          <Card title="Location & contact">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="City"><Select options={["Lagos", "Abuja", "Port Harcourt", "Ibadan", "Kano"]} /></Field>
              <Field label="Neighbourhood"><Input placeholder="e.g. Ikeja" /></Field>
              <Field label="Phone"><Input placeholder="+234 8XX XXX XXXX" /></Field>
              <Field label="WhatsApp (optional)"><Input placeholder="+234 8XX XXX XXXX" /></Field>
            </div>
          </Card>

          <Card title="Tags">
            <div className="flex flex-wrap gap-2 rounded-lg border border-border bg-background p-2">
              {["macbook", "apple", "m3", "laptop"].map((t) => (
                <span key={t} className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                  {t} <X className="h-3 w-3 cursor-pointer" />
                </span>
              ))}
              <input placeholder="Add tag..." className="flex-1 bg-transparent px-2 text-sm outline-none" />
            </div>
          </Card>
        </div>

        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <h3 className="font-semibold">Publishing summary</h3>
            <div className="mt-4 space-y-3 border-b border-border pb-4 text-sm">
              <Row label="Listing fee" value="₦500" />
              <Row label="Duration" value="60 days" />
              <Row label="Visibility" value="Standard" />
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="font-display text-2xl font-bold text-primary">₦500</span>
            </div>
            <button type="button" className="mt-5 w-full rounded-xl gradient-brand py-3 text-sm font-semibold text-primary-foreground shadow-soft transition hover:opacity-95">
              Pay ₦500 & publish
            </button>
            <button type="button" className="mt-2 w-full rounded-xl border border-border py-3 text-sm font-medium hover:bg-accent">
              Save as draft
            </button>
            <p className="mt-3 text-[11px] text-muted-foreground">
              You'll be redirected to Paystack. On success, your product goes live immediately and you receive a receipt.
            </p>
          </div>

          <div className="mt-4 rounded-2xl border border-accent-orange/30 bg-accent-orange/5 p-4 text-xs text-foreground">
            <div className="font-semibold text-accent-orange">Boost your reach</div>
            <p className="mt-1 text-muted-foreground">
              Add sponsored placement for ₦2,000/week and appear on the homepage & category tops.
            </p>
          </div>
        </aside>
      </form>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-soft">
      <h3 className="mb-4 font-semibold">{title}</h3>
      {children}
    </section>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />;
}
function Select({ options }: { options: string[] }) {
  return (
    <select className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
      {options.map((o) => <option key={o}>{o}</option>)}
    </select>
  );
}
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
