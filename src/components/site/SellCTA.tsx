import { ArrowRight, CheckCircle2, MessageSquareText, ShieldCheck, Sparkles, Wallet, FileCheck, BadgeCheck } from "lucide-react";
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
    icon: <FileCheck className="h-4 w-4" />,
    title: "Getting approved",
    body: "Submit your ID for a manual review before your store is approved.",
  },
  {
    icon: <BadgeCheck className="h-4 w-4" />,
    title: "Listing fee",
    body: "Free during launch, up to 10 products. No commission and no in-app fees.",
  },
  {
    icon: <MessageSquareText className="h-4 w-4" />,
    title: "How buyers reach you",
    body: "Buyers message you directly on WhatsApp and you arrange payment and delivery together.",
  },
  {
    icon: <Sparkles className="h-4 w-4" />,
    title: "Managing your listings",
    body: "Add, edit or remove listings anytime. Removing a listing frees up a slot.",
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
              Start selling on SABU for free.
            </h2>
            <p className="mt-4 max-w-lg text-primary-foreground/90">
              List up to 10 products free during our launch period. Buyers reach you directly on
              WhatsApp to arrange payment and delivery — no commission, no in-app fees.
            </p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {["Fast admin review", "Free storefront", "Direct buyer contact", "Verified badge"].map(function (f) {
                return (
                  <li key={f} className="flex items-center gap-2 text-sm text-primary-foreground/95">
                    <CheckCircle2 className="h-4 w-4 text-accent-orange" /> {f}
                  </li>
                );
              })}
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
                    <DialogTitle>Selling on SABU</DialogTitle>
                    <DialogDescription>
                      A quick rundown before you get started.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-2">
                    {HANDBOOK_POINTS.map(function (p) {
                      return (
                        <div key={p.title} className="flex gap-3">
                          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            {p.icon}
                          </div>
                          <div>
                            <div className="text-sm font-semibold">{p.title}</div>
                            <p className="text-sm text-muted-foreground">{p.body}</p>
                          </div>
                        </div>
                      );
                    })}
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
              <InfoTile icon={<Wallet className="h-4 w-4" />} label="Listing fee" value="Free" detail="Up to 10 products, launch offer" />
              <InfoTile icon={<ShieldCheck className="h-4 w-4" />} label="Commission" value="0%" detail="Keep everything you sell for" />
              <div className="sm:col-span-2 rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur">
                <div className="text-xs text-primary-foreground/80">How it works</div>
                <div className="mt-2 text-sm font-medium text-primary-foreground/95">
                  Buyers message you directly on WhatsApp to buy — You arrange payment and delivery together
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function InfoTile({ icon, label, value, detail }: { icon: React.ReactNode; label: string; value: string; detail: string }) {
  return (
    <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur">
      <div className="flex items-center gap-2 text-xs text-primary-foreground/80">
        <span className="[&>svg]:h-4 [&>svg]:w-4">{icon}</span> {label}
      </div>
      <div className="mt-2 font-display text-2xl font-bold text-primary-foreground">{value}</div>
      <div className="mt-1 text-[11px] text-primary-foreground/75">{detail}</div>
    </div>
  );
}
