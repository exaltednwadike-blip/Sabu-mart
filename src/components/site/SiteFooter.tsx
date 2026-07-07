import { Logo } from "@/components/brand/Logo";
import { Facebook, Instagram, Twitter, Youtube, Apple, Smartphone } from "lucide-react";

const cols = [
  {
    title: "Company",
    items: ["About SABU", "Careers", "Press", "Blog", "Investors", "Sustainability"],
  },
  {
    title: "Marketplace",
    items: ["Become a Seller", "Seller Handbook", "Advertise", "Bulk Orders", "Verified Stores"],
  },
  {
    title: "Accommodation",
    items: ["List a Property", "Hotels", "Short Lets", "Student Housing", "Trust & Safety"],
  },
  {
    title: "Support",
    items: ["Help Center", "Contact", "Track Order", "Returns", "Report a Listing", "FAQ"],
  },
  {
    title: "Legal",
    items: ["Privacy", "Terms", "Refund Policy", "Cookies", "Community Guidelines"],
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
            <div className="mt-6 flex gap-3">
              <a className="flex items-center gap-2 rounded-xl bg-foreground px-4 py-2.5 text-sm font-medium text-background transition hover:opacity-90" href="#">
                <Apple className="h-5 w-5" />
                <div className="text-left leading-tight">
                  <div className="text-[10px] opacity-70">Download on</div>
                  <div className="font-semibold">App Store</div>
                </div>
              </a>
              <a className="flex items-center gap-2 rounded-xl bg-foreground px-4 py-2.5 text-sm font-medium text-background transition hover:opacity-90" href="#">
                <Smartphone className="h-5 w-5" />
                <div className="text-left leading-tight">
                  <div className="text-[10px] opacity-70">Get it on</div>
                  <div className="font-semibold">Google Play</div>
                </div>
              </a>
            </div>
            <div className="mt-6 flex gap-2">
              {[Facebook, Instagram, Twitter, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="rounded-lg border border-border p-2 text-muted-foreground transition hover:bg-primary hover:text-primary-foreground">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {cols.map((c) => (
            <div key={c.title}>
              <h4 className="mb-4 text-sm font-semibold text-foreground">{c.title}</h4>
              <ul className="space-y-2.5">
                {c.items.map((i) => (
                  <li key={i}>
                    <a href="#" className="text-sm text-muted-foreground transition hover:text-primary">
                      {i}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 text-xs text-muted-foreground md:flex-row">
          <p>© 2026 SABU Marketplace. All rights reserved.</p>
          <p className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-success" /> All systems operational · Naira (₦)
          </p>
        </div>
      </div>
    </footer>
  );
}
