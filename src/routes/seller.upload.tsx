import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Upload, X, Video } from "lucide-react";
import { PageHeader } from "@/components/dashboard/DashboardShell";
import { getCurrentUser } from "@/lib/auth";
import { getCategories, createProduct, getMyProductCount, FREE_LISTING_LIMIT, MAX_PRODUCT_VIDEOS, type ListingCategory } from "@/lib/products";

export const Route = createFileRoute("/seller/upload")({
  component: SellerUpload,
});

const CONDITIONS = ["Brand new", "Used - like new", "Used - good", "For parts"];
const CITIES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT (Abuja)", "Gombe",
  "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos",
  "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto",
  "Taraba", "Yobe", "Zamfara",
];

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
  const [videos, setVideos] = useState<File[]>([]);
  const [productCount, setProductCount] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(function () {
    getCategories().then(function (cats) {
      setCategories(cats);
      if (cats.length > 0) setCategoryId(cats[0].id);
    });
    getCurrentUser().then(function (user) {
      if (!user) return;
      getMyProductCount(user.id).then(setProductCount);
    });
  }, []);

  const selectedCategory = categories.find(function (c) { return c.id === categoryId; });
  const limitReached = productCount !== null && productCount >= FREE_LISTING_LIMIT;

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    setImages(function (prev) { return [...prev, ...files].slice(0, 4); });
  }

  function removeImage(index: number) {
    setImages(function (prev) { return prev.filter(function (_, i) { return i !== index; }); });
  }

  function handleVideoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    setVideos(function (prev) { return [...prev, ...files].slice(0, MAX_PRODUCT_VIDEOS); });
  }

  function removeVideo(index: number) {
    setVideos(function (prev) { return prev.filter(function (_, i) { return i !== index; }); });
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

    if (limitReached) {
      setError("You've reached the free launch limit of " + FREE_LISTING_LIMIT + " products.");
      return;
    }
    if (!categoryId || !selectedCategory) {
      setError("Please select a category.");
      return;
    }
    if (!title.trim() || !price || !phone.trim()) {
      setError("Please fill in title, price, and phone number.");
      return;
    }

    setLoading(true);
    getCurrentUser()
      .then(function (user) {
        if (!user) {
          navigate({ to: "/login" });
          return null;
        }
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
          videos,
          listingFee: 0,
          txRef: "free-listing",
          providerTransactionId: "free-listing",
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
  }

  return (
    <div>
      <PageHeader
        title="Upload product"
        subtitle="Submit for review. Your listing goes live once approved by our team."
      />

      <div className="mb-6 rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm">
        <p className="font-semibold text-primary">Free launch offer</p>
        <p className="mt-1 text-muted-foreground">
          Every seller can list up to {FREE_LISTING_LIMIT} products for free during our launch period, no listing fee required.
          {productCount !== null ? (
            <> You've used <strong>{productCount} of {FREE_LISTING_LIMIT}</strong> free slots.</>
          ) : null}
        </p>
      </div>

      {limitReached ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
          <p className="font-semibold">You've reached the free launch limit of {FREE_LISTING_LIMIT} products.</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Paid subscription plans with higher limits are coming soon. Remove an existing listing to free up a slot, or check back soon for plan options.
          </p>
        </div>
      ) : (
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

            <Card title="Product videos (optional)">
              <p className="mb-3 text-xs text-muted-foreground">
                Upload up to {MAX_PRODUCT_VIDEOS} short videos showing your product in action. Keep clips short (under a
                minute) so they upload quickly.
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {videos.map(function (vid, i) {
                  return (
                    <div key={i} className="relative aspect-square overflow-hidden rounded-xl border border-border bg-black">
                      <video src={URL.createObjectURL(vid)} className="h-full w-full object-cover" muted />
                      <button
                        type="button"
                        onClick={function () { removeVideo(i); }}
                        className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  );
                })}
                {videos.length < MAX_PRODUCT_VIDEOS ? (
                  <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/40 text-xs text-muted-foreground transition hover:border-primary/40 hover:bg-primary/5">
                    <Video className="mb-1 h-5 w-5" />
                    Add video
                    <input type="file" accept="video/*" multiple className="hidden" onChange={handleVideoChange} />
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
              <div className="mt-3 flex flex-col gap-4 text-sm">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" checked={negotiable} onChange={function (e) { setNegotiable(e.target.checked); }} /> Negotiable
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="rounded"
                    checked={freeDeliveryLagos}
                    onChange={function (e) { setFreeDeliveryLagos(e.target.checked); }}
                  />
                  Free delivery available in Lagos
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
                <Row label="Listing fee" value="Free (launch offer)" />
                <Row label="Category" value={selectedCategory ? selectedCategory.name : "-"} />
                <Row label="Free slots used" value={productCount !== null ? productCount + " / " + FREE_LISTING_LIMIT : "-"} />
                <Row label="Status after submit" value="Pending review" />
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
                {loading ? "Submitting..." : "Submit for review"}
              </button>
              <p className="mt-3 text-[11px] text-muted-foreground">
                No payment required. An admin will manually review your listing before it goes live.
              </p>
            </div>
          </aside>
        </form>
      )}
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
