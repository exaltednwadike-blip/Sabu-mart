import { ArrowRight, CheckCircle2, ShieldCheck, Truck, Wallet as WalletIcon, FileCheck, BadgeCheck, ListChecks } from "lucide-react";
import { Link } from "@tanstack/react-router";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";

const HANDBOOK_POINTS = [
  {
    icon: <BadgeCheck className="h-4 w-4" />,
    title: "1. Get approved",
    body: "Create your seller profile, complete your identity verification, and submit the documents SABU requires for approval. Reviews are assessed before you can publish listings.",
  },
  {
    icon: <FileCheck className="h-4 w-4" />,
    title: "2. List accurately",
    body: "Use clear photos, a truthful title, correct category, and honest pricing. Listings that misrepresent items, prices, or availability may be removed or restricted.",
  },
  {
    icon: <ListChecks className="h-4 w-4" />,
    title: "3. Follow our rules",
    body: "Only sell items allowed by Sabu's marketplace policy. Prohibited items, fake scarcity, duplicated listings, and misleading offers can lead to account restrictions.",
  },
  {
    icon: <WalletIcon className="h-4 w-4" />,
    title: "4. Handle payments and payouts",
    body: "Buyer payments are processed according to the platform's payment flow. Payouts are subject to verification, order status, and any settlement checks required by the marketplace.",
  },
  {
    icon: <Truck className="h-4 w-4" />,
    title: "5. Fulfill orders professionally",
    body: "Confirm stock before accepting orders, respond to buyer messages promptly, update fulfillment status, and keep delivery expectations realistic.",
  },
  {
    icon: <ShieldCheck className="h-4 w-4" />,
    title: "6. Protect trust",
    body: "SABU buyers rely on good communication, honest descriptions, and quick issue resolution. Repeated complaints or poor fulfillment can affect your seller standing.",
  },
];

export function SellCTA() {
  return (
    <section id="sell" className="mx-auto max-w-7xl px-4 py-16">
      <div className="relative overflow-hidden rounded-[2rem] gradient-brand p-8 shadow-elegant md:p-14">
        <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-accent-orange/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

        <div className="relative grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="text-primary-foreground">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
              For sellers
            </span>
            <h2 className="mt-4 font-display text-3xl font-bold leading-tight md:text-5xl">
              Start selling on SABU
            </h2>
            <p className="mt-4 max-w-lg text-primary-foreground/90">
              Create a seller profile, complete verification, and list products clearly and honestly. SABU is designed for trusted transactions, clear communication, and better buyer confidence.
            </p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {["ID verification required", "Clear product listings only", "Buyer communication standards", "Order fulfillment and trust"].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-primary-foreground/95">
                  <CheckCircle2 className="h-4 w-4 text-accent-orange" /> {f}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/buyer/become-seller" className="inline-flex items-center gap-2 rounded-xl bg-accent-orange px-5 py-3 text-sm font-semibold text-accent-orange-foreground shadow-orange transition hover:opacity-90">
                Become a seller <ArrowRight className="h-4 w-4" />
              </Link>
              <Dialog>
                <DialogTrigger asChild>
                  <button className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-semibold text-primary-foreground backdrop-blur transition hover:bg-white/20">
                    See seller handbook
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Seller handbook</DialogTitle>
                    <DialogDescription>
                      Everything you need to know before listing, selling, and fulfilling orders on SABU.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-2">
                    {HANDBOOK_POINTS.map((p) => (
                      <div key={p.title} className="flex gap-3">
                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          {p.icon}
                        </div>
                        <div>
                          <div className="text-sm font-semibold">{p.title}</div>
                          <p className="text-sm text-muted-foreground">{p.body}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <DialogFooter>
                    <Link
                      to="/buyer/become-seller"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent-orange px-5 py-2.5 text-sm font-semibold text-accent-orange-foreground shadow-orange transition hover:opacity-90"
                    >
                      Get started <ArrowRight className="h-4 w-4" />
                    </Link>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="relative">
            <div className="grid gap-4 sm:grid-cols-2">
              <InfoCard title="Approval" value="Required" detail="Complete profile + verification before listing" />
              <InfoCard title="Listing quality" value="Accurate" detail="Honest titles, photos, and pricing" />
              <InfoCard title="Payments" value="Platform flow" detail="Based on confirmed order status and policy" />
              <InfoCard title="Trust" value="Ongoing" detail="Good communication protects your seller reputation" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function InfoCard({ title, value, detail }: { title: string; value: string; detail: string }) {
  return (
    <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur">
      <div className="text-xs text-primary-foreground/80">{title}</div>
      <div className="mt-1 font-display text-2xl font-bold text-primary-foreground">{value}</div>
      <div className="mt-0.5 text-[11px] font-medium text-primary-foreground/80">{detail}</div>
    </div>
  );
}
