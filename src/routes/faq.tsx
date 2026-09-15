import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/faq")({
  component: FAQPage,
});

function FAQPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <div className="rounded-[2rem] border border-border bg-card p-8 shadow-soft">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">FAQ</p>
        <h1 className="mt-3 font-display text-3xl font-bold md:text-5xl">How SABU works</h1>
        <div className="mt-6 space-y-4 text-sm text-muted-foreground">
          <p>Buyers and sellers connect directly to arrange pricing, payment, and delivery.</p>
          <p>Sellers list products or services and buyers can message them for quick direct contact.</p>
          <p>For food ordering, browse available restaurants and arrange your order with the vendor.</p>
        </div>
      </div>
    </div>
  );
}
