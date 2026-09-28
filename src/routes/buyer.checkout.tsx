import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MapPin, Phone, Home, MessageCircle } from "lucide-react";
import { PageHeader } from "@/components/dashboard/DashboardShell";
import { getCurrentUser } from "@/lib/auth";
import { getCart } from "@/lib/cart";
import { logWhatsappClick } from "@/lib/products";

export const Route = createFileRoute("/buyer/checkout")({
  component: BuyerCheckout,
});

const CITIES = ["Lagos", "Abuja", "Port Harcourt", "Ibadan", "Kano"];

function groupBySeller(items: any[]) {
  const map: Record<string, any> = {};
  items.forEach(function (item: any) {
    const p = item.products;
    const key = String(p.seller_id);
    if (!map[key]) {
      map[key] = {
        sellerId: key,
        name: (p.profiles && p.profiles.store_name) || "Seller",
        number: p.whatsapp || p.phone || "",
        items: [],
      };
    }
    map[key].items.push(item);
  });
  return Object.values(map);
}

function BuyerCheckout() {
  const navigate = useNavigate();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [address, setAddress] = useState("");
  const [city, setCity] = useState(CITIES[0]);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");


  useEffect(function () {
    getCurrentUser()
      .then(function (user) {
        if (!user) {
          navigate({ to: "/login" });
          return [];
        }
        setEmail(user.email || "");
        return getCart(user.id);
      })
      .then(function (data) {
        if (!data || data.length === 0) {
          navigate({ to: "/buyer/cart" });
          return;
        }
        setItems(data);
      })
      .finally(function () {
        setLoading(false);
      });
  }, []);

  const subtotal = items.reduce(function (sum: number, item: any) {
    return sum + Number(item.products.price) * item.quantity;
  }, 0);

  function handleOrderOnWhatsApp(group: any) {
    setError("");
    if (!address.trim() || !phone.trim()) {
      setError("Please fill in your delivery address and phone number.");
      return;
    }
    const cleaned = String(group.number).replace(/[^0-9]/g, "");
    if (!cleaned) {
      setError(group.name + " has no WhatsApp number on file.");
      return;
    }
    let total = 0;
    const lines = group.items.map(function (item: any) {
      const line = Number(item.products.price) * item.quantity;
      total += line;
      return "- " + item.quantity + " x " + item.products.title + " (₦" + line.toLocaleString() + ")";
    });
    const text =
      "Hello " + group.name + ", I would like to order on SABU:\n" +
      lines.join("\n") + "\n" +
      "Total: ₦" + total.toLocaleString() + "\n" +
      "Delivery: " + address.trim() + ", " + city + "\n" +
      "Phone: " + phone.trim();
    group.items.forEach(function (item: any) {
      logWhatsappClick(item.products.id, item.products.seller_id).catch(function () {});
    });
    window.open("https://wa.me/" + cleaned + "?text=" + encodeURIComponent(text), "_blank");
  }

  function handlePlaceOrder(e: React.FormEvent) {
    e.preventDefault();
  }


  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading...</p>;
  }

  return (
    <div>
      <PageHeader title="Checkout" subtitle="Confirm your delivery details, then send your order to each seller on WhatsApp." />

      <form onSubmit={handlePlaceOrder} className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <h3 className="mb-4 flex items-center gap-2 font-semibold">
              <MapPin className="h-4 w-4 text-primary" /> Delivery details
            </h3>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium">
                  <Home className="h-3.5 w-3.5" /> Delivery address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={function (e) { setAddress(e.target.value); }}
                  placeholder="Street address, area..."
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">City</label>
                  <select
                    value={city}
                    onChange={function (e) { setCity(e.target.value); }}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
                  >
                    {CITIES.map(function (c) { return <option key={c}>{c}</option>; })}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium">
                    <Phone className="h-3.5 w-3.5" /> Phone number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={function (e) { setPhone(e.target.value); }}
                    placeholder="080X XXX XXXX"
                    className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <h3 className="mb-4 font-semibold">Items ({items.length})</h3>
            <div className="space-y-3">
              {items.map(function (item: any) {
                const product = item.products;
                const image = product.images && product.images.length > 0 ? product.images[0] : null;
                return (
                  <div key={item.id} className="flex items-center gap-3 border-b border-border pb-3 last:border-0 last:pb-0">
                    {image ? (
                      <img src={image} alt="" className="h-12 w-12 rounded-lg object-cover" />
                    ) : (
                      <div className="h-12 w-12 rounded-lg bg-muted" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{product.title}</p>
                      <p className="text-xs text-muted-foreground">Qty {item.quantity}</p>
                    </div>
                    <span className="text-sm font-semibold">₦{(Number(product.price) * item.quantity).toLocaleString()}</span>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <aside className="rounded-2xl border border-border bg-card p-6 shadow-soft lg:sticky lg:top-20 lg:self-start">
          <h3 className="font-semibold">Order total</h3>
          <div className="mt-4 flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium">₦{subtotal.toLocaleString()}</span>
          </div>
          <div className="mt-4 flex justify-between border-t border-border pt-4">
            <span className="font-semibold">Total</span>
            <span className="font-display text-xl font-bold text-primary">₦{subtotal.toLocaleString()}</span>
          </div>

          {error ? (
            <div className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>
          ) : null}

          <div className="mt-5 space-y-3">
            {groupBySeller(items).map(function (group: any) {
              return (
                <button
                  key={group.sellerId}
                  type="button"
                  onClick={function () { handleOrderOnWhatsApp(group); }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl gradient-brand py-3 text-sm font-semibold text-primary-foreground shadow-soft transition hover:opacity-90"
                >
                  <MessageCircle className="h-4 w-4" /> Order from {group.name} on WhatsApp
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground">
            Payment and delivery are arranged directly with each seller.
          </p>
        </aside>
      </form>
    </div>
  );
}
