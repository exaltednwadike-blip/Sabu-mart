import { Logo } from "@/components/brand/Logo";
import { Facebook, Instagram, Twitter } from "lucide-react";
import { Link } from "@tanstack/react-router";

const cols = [
  {
    title: "Company",
    items: [{ label: "About SABU", to: "/" }],
  },
  {
    title: "Marketplace",
    items: [{ label: "Become a Seller", to: "/signup" }, { label: "Seller Handbook", to: "/buyer/become-seller" }],
  },
  {
    title: "Support",
    items: [{ label: "Help Center", to: "/faq" }, { label: "Contact", to: "/faq" }, { label: "Track Order", to: "/buyer/orders" }, { label: "Report a Listing", to: "/faq" }, { label: "FAQ", to: "/faq" }],
  },
  {
    title: "Legal",
    items: [{ label: "Privacy", to: "/faq" }, { label: "Terms", to: "/faq" }],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-gradient-to-b from-background to-secondary/50">
      <div className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid gap-10 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <Logo />
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              Africa's premium multi-vendor marketplace. Buy, sell, rent, book services and connect
              directly with verified sellers — all in one place.
            </p>
            <div className="mt-6 flex gap-2">
              {[{ Icon: Facebook, href: "https://www.facebook.com" }, { Icon: Instagram, href: "https://www.instagram.com" }, { Icon: Twitter, href: "https://x.com" }].map(function (item) {
                return (
                  <a key={item.href} href={item.href} target="_blank" rel="noreferrer" className="rounded-lg border border-border bg-card p-2 text-muted-foreground transition hover:bg-primary hover:text-primary-foreground">
                    <item.Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {cols.map(function (c) {
            return (
              <div key={c.title}>
                <h4 className="mb-4 text-sm font-semibold text-foreground">{c.title}</h4>
                <ul className="space-y-2.5">
                  {c.items.map(function (i) {
                    return (
                      <li key={i.label}>
                        <Link to={i.to} className="text-sm text-muted-foreground transition hover:text-primary">
                          {i.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 text-xs text-muted-foreground md:flex-row">
          <p>© 2026 SABU Marketplace. All rights reserved.</p>
          <p className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" /> All systems operational · Naira (₦)
          </p>
        </div>
      </div>
    </footer>
  );
}
