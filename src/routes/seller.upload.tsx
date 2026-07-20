import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Upload, X } from "lucide-react";
import { PageHeader } from "@/components/dashboard/DashboardShell";
import { getCurrentUser } from "@/lib/auth";
import { getCategories, createProduct, type ListingCategory } from "@/lib/products";
import { verifyPaystackPayment } from "@/lib/paystack-server";

export const Route = createFileRoute("/seller/upload")({
  component: SellerUpload,
});

const CONDITIONS = ["Brand new", "Used - like new", "Used - good", "For parts"];
const CITIES = ["Lagos", "Abuja", "Port Harcourt", "Ibadan", "Kano"];

declare global {
  interface Window {
    PaystackPop: any;
  }
}

function loadPaystackScript() {
  return new Promise(function (resolve) {
    if (window.PaystackPop) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.onload = function () { resolve(true); };
    document.body.appendChild(script);
  });
}

function SellerUpload() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<ListingCategory[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [condition, setCondition] = useState(CONDITIONS[0]);
  const [price, setPrice] = useState("");
  const [stockQuantity, setStockQuantity] = useState("1");
  const [deliveryOption, setDeliveryOption] = useState<"pickup_only" | "delivery_available" | "both">("both");
  const [negotiable, setNegotiable] = useState(true);
  const [freeDeliveryLagos, setFreeDeliveryLagos] = useState(false);
  const [city, setCity] = useState(CITIES[0]);
  const [neighbourhood, setNeighbourhood] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(function () {
    getCategories().then(function (cats) {
      setCategories(cats);
      if (cats.length > 0) setCategoryId(cats[0].id);
    });
    getCurrentUser().then(function (user) {
      if (user) setEmail(user.email || "");
    });
    loadPaystackScript();
  }, []);

  const selectedCategory = categories.find(function (c) { return c.id === categoryId; });

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    setImages(function (prev) { return [...prev, ...files].slice(0, 4); });
  }

  function removeImage(index: number) {
    setImages(function (prev) { return prev.filter(function (_, i) { return i !== index; }); });
  }

  function addTag() {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t)) setTags(function (prev) { return [...prev, t]; });
    setTagInput("");
  }

  function removeTag(tag: string) {
    setTags(function (prev) { return prev.filter(function (t) { return t !== tag; }); });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!categoryId || !selectedCategory) {
      setError("Please select a category.");
      return;
    }
    if (!title.trim() || !price || !phone.trim()) {
      setError("Please fill in title, price, and phone number.");
      return;
    }
    if (!window.PaystackPop) {
      setError("Payment system is still loading. Please try again in a moment.");
      return;
    }

    setLoading(true);
    const reference = "sabu_listing_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8);

    const handler = window.PaystackPop.setup({
      key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
      email: email,
      amount: Math.round(selectedCategory.listing_fee * 100),
      currency: "NGN",
      ref: reference,
      callback: function () {
        getCurrentUser()
          .then(function (user) {
            if (!user) {
              navigate({ to: "/login" });
              return null;
            }
            return verifyPaystackPayment({ data: reference }).then(function () {
              return createProduct(user.id, {
                title: title.trim(),
                description: description.trim(),
                categoryId,
                condition,
                price: Number(price),
                stockQuantity: Number(stockQuantity),
                deliveryOption,
                negotiable,
                freeDeliveryLagos,
                city,
                neighbourhood: neighbourhood.trim(),
                phone: phone.trim(),
                whatsapp: whatsapp.trim(),
                tags,
                images,
                listingFee: selectedCategory.listing_fee,
                paystackReference: reference,
              });
            });
          })
          .then(function (result) {
            if (result) {
              navigate({ to: "/seller/products" });
            }
          })
          .catch(function (err) {
            setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
            setLoading(false);
          });
      },
      onClose: function () {
        setLoading(false);
      },
    });

    handler.openIframe();
  }

  return (
    <div>
      <PageHeader
        title="Upload product"
        subtitle="Pay the listing fee to submit for review. Your listing goes live once approved."
      />
      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card title="Product images">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {images.map(function (img, i) {
                return (
                  <div key={i} className="relative aspect-square overflow-hidden rounded-xl border border-border">
                    <img src={URL.createObjectURL(img)} alt="" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={function () { removeImage(i); }}
                      className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                );
              })}
              {images.length < 4 ? (
                <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/40 text-xs text-muted-foreground transition hover:border-primary/40 hover:bg-primary/5">
                  <Upload className="mb-1 h-5 w-5" />
                  {images.length === 0 ? "Main image" : "Add"}
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageChange} />
                </label>
              ) : null}
            </div>
          </Card>

          <Card title="Basic details">
            <div className="grid gap-4">
              <Field label="Title">
                <Input value={title} onChange={function (e) { setTitle(e.target.value); }} placeholder="e.g. MacBook Pro 14&quot; M3 - 16GB - 512GB" />
              </Field>
              <Field label="Description">
                <textarea
                  rows={5}
                  value={description}
                  onChange={function (e) { setDescription(e.target.value); }}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  placeholder="Describe your product, condition, what's included..."
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Category">
                  <select
                    value={categoryId}
                    onChange={function (e) { setCategoryId(e.target.value); }}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  >
                    {categories.map(function (c) {
                      return <option key={c.id} value={c.id}>{c.name}</option>;
                    })}
                  </select>
                </Field>
                <Field label="Condition">
                  <select
                    value={condition}
                    onChange={function (e) { setCondition(e.target.value); }}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  >
                    {CONDITIONS.map(function (c) { return <option key={c}>{c}</option>; })}
                  </select>
                </Field>
              </div>
            </div>
          </Card>

          <Card title="Pricing & stock">
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Price (Naira)">
                <Input type="number" value={price} onChange={function (e) { setPrice(e.target.value); }} placeholder="0" />
              </Field>
              <Field label="Stock quantity">
                <Input type="number" value={stockQuantity} onChange={function (e) { setStockQuantity(e.target.value); }} placeholder="1" />
              </Field>
              <Field label="Delivery">
                <select
                  value={deliveryOption}
                  onChange={function (e) { setDeliveryOption(e.target.value as typeof deliveryOption); }}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                >
                  <option value="pickup_only">Pickup only</option>
                  <option value="delivery_available">Delivery available</option>
                  <option value="both">Both</option>
                </select>
              </Field>
            </div>
            <div className="mt-3 flex flex-wrap gap-4 text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded" checked={negotiable} onChange={function (e) { setNegotiable(e.target.checked); }} /> Negotiable
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded" checked={freeDeliveryLagos} onChange={function (e) { setFreeDeliveryLagos(e.target.checked); }} /> Free delivery in Lagos
              </label>
            </div>
          </Card>

          <Card title="Location & contact">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="City">
                <select
                  value={city}
                  onChange={function (e) { setCity(e.target.value); }}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                >
                  {CITIES.map(function (c) { return <option key={c}>{c}</option>; })}
                </select>
              </Field>
              <Field label="Neighbourhood">
                <Input value={neighbourhood} onChange={function (e) { setNeighbourhood(e.target.value); }} placeholder="e.g. Ikeja" />
              </Field>
              <Field label="Phone">
                <Input value={phone} onChange={function (e) { setPhone(e.target.value); }} placeholder="+234 8XX XXX XXXX" />
              </Field>
              <Field label="WhatsApp (optional)">
                <Input value={whatsapp} onChange={function (e) { setWhatsapp(e.target.value); }} placeholder="+234 8XX XXX XXXX" />
              </Field>
            </div>
          </Card>

          <Card title="Tags">
            <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-background p-2">
              {tags.map(function (t) {
                return (
                  <span key={t} className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                    {t} <X className="h-3 w-3 cursor-pointer" onClick={function () { removeTag(t); }} />
                  </span>
                );
              })}
              <input
                value={tagInput}
                onChange={function (e) { setTagInput(e.target.value); }}
                onKeyDown={function (e) { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                placeholder="Add tag..."
                className="flex-1 bg-transparent px-2 text-sm outline-none"
              />
            </div>
          </Card>
        </div>

        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <h3 className="font-semibold">Publishing summary</h3>
            <div className="mt-4 space-y-3 border-b border-border pb-4 text-sm">
              <Row label="Listing fee" value={selectedCategory ? "₦" + selectedCategory.listing_fee.toLocaleString() : "-"} />
              <Row label="Category" value={selectedCategory ? selectedCategory.name : "-"} />
              <Row label="Status after payment" value="Pending review" />
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="font-display text-2xl font-bold text-primary">
                {selectedCategory ? "₦" + selectedCategory.listing_fee.toLocaleString() : "-"}
              </span>
            </div>

            {error ? (
              <div className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="mt-5 w-full rounded-xl gradient-brand py-3 text-sm font-semibold text-primary-foreground shadow-soft transition hover:opacity-95 disabled:opacity-60"
            >
              {loading ? "Processing..." : "Pay & submit for review"}
            </button>
            <p className="mt-3 text-[11px] text-muted-foreground">
              Payment secures your review slot. An admin will still manually review your listing before it goes live.
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
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
