import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Phone, MessageCircle, Info } from "lucide-react";
import { PageHeader } from "@/components/dashboard/DashboardShell";
import { getCurrentUser } from "@/lib/auth";
import { getCart } from "@/lib/cart";

export const Route = createFileRoute("/buyer/checkout")({
  component: BuyerCheckout,
});

function toWhatsappLink(number: string) {
  const digits = number.replace(/[^\d]/g, "");
  return "https://wa.me/" + digits;
}

function BuyerCheckout() {
  const navigate = useNavigate();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(function () {
    getCurrentUser()
      .then(function (user) {
        if (!user) {
          navigate({ to: "/login" });
          return [];
        }
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

  function renderItem(item: any) {
    const product = item.products;
    const image = product.images && product.images.length > 0 ? product.images[0] : null;
    const storeName = product.profiles ? product.profiles.store_name : "Seller";
    return (
      <div key={item.id} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <div className="flex items-center gap-3">
          {image ? (
            <img src={image} alt="" className="h-14 w-14 rounded-lg object-cover" />
          ) : (
            <div className="h-14 w-14 rounded-lg bg-muted" />
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{product.title}</p>
            <p className="text-xs text-muted-foreground">Qty {item.quantity} &middot; {storeName}</p>
          </div>
          <span className="font-semibold">₦{(Number(product.price) * item.quantity).toLocaleString()}</span>
        </div>
        <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
          {product.phone ? (
            <a
              href={"tel:" + product.phone}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition hover:bg-muted"
            >
              <Phone className="h-3.5 w-3.5" /> Call {product.phone}
            </a>
          ) : null}
          {product.whatsapp ? (
            <a
              href={toWhatsappLink(product.whatsapp)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-success/30 bg-success/10 px-3 py-1.5 text-xs font-medium text-success transition hover:bg-success/20"
            >
              <MessageCircle className="h-3.5 w-3.5" /> WhatsApp seller
            </a>
          ) : null}
          {!product.phone && !product.whatsapp ? (
            <p className="text-xs text-muted-foreground">No contact details available for this seller.</p>
          ) : null}
        </div>
      </div>
    );
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading...</p>;
  }

  return (
    <div>
      <PageHeader title="Checkout" subtitle="Contact each seller directly to arrange payment and delivery." />

      <div className="mb-6 flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <p className="text-muted-foreground">
          <strong className="text-foreground">Online checkout is temporarily paused</strong> while we resolve an issue with our
          payment provider. Please reach out to each seller below using their phone number or WhatsApp to arrange payment and delivery directly.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {items.map(renderItem)}
        </div>

        <aside className="rounded-2xl border border-border bg-card p-6 shadow-soft lg:sticky lg:top-20 lg:self-start">
          <h3 className="font-semibold">Order summary</h3>
          <div className="mt-4 flex justify-between text-sm">
            <span className="text-muted-foreground">Items ({items.length})</span>
            <span className="font-medium">₦{subtotal.toLocaleString()}</span>
          </div>
          <div className="mt-4 flex justify-between border-t border-border pt-4">
            <span className="font-semibold">Estimated total</span>
            <span className="font-display text-xl font-bold text-primary">₦{subtotal.toLocaleString()}</span>
          </div>
          <p className="mt-4 text-[11px] text-muted-foreground">
            This total is an estimate only. Confirm final pricing and delivery cost directly with each seller.
          </p>
          <button
            type="button"
            onClick={function () { navigate({ to: "/buyer/cart" }); }}
            className="mt-5 w-full rounded-xl border border-border py-3 text-sm font-semibold transition hover:bg-muted"
          >
            Back to cart
          </button>
        </aside>
      </div>
    </div>
  );
}
