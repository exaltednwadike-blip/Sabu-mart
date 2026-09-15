import { Mail, Sparkles } from "lucide-react";
import { useState } from "react";
import { subscribeToNewsletter } from "@/lib/products";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) {
      setStatus("error");
      setMessage("Please enter an email address.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      await subscribeToNewsletter(trimmed);
      setStatus("success");
      setMessage("Thanks! You're subscribed.");
      setEmail("");
    } catch (error: any) {
      setStatus("error");
      setMessage(error?.message || "Something went wrong. Please try again.");
    }
  }

  if (status === "success") {
    return (
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="rounded-3xl border border-border bg-card p-8 text-center shadow-soft md:p-12">
          <h3 className="font-display text-2xl font-bold md:text-3xl">Thanks! You're subscribed.</h3>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-16">
      <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-8 shadow-soft md:p-12">
        <div className="pointer-events-none absolute -right-10 -top-10 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-10 h-64 w-64 rounded-full bg-accent-orange/10 blur-3xl" />
        <div className="relative grid gap-6 md:grid-cols-2 md:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" /> Weekly digest
            </div>
            <h3 className="mt-3 font-display text-2xl font-bold md:text-3xl">
              Deals, drops & new listings — in your inbox.
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Get the best of SABU every Sunday. No spam, unsubscribe anytime.
            </p>
          </div>
          <form className="flex flex-col gap-2 sm:flex-row" onSubmit={handleSubmit}>
            <div className="flex flex-1 items-center gap-2 rounded-xl border border-border bg-background px-4 py-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={function (e) { setEmail(e.target.value); }}
                required
                placeholder="you@email.com"
                className="flex-1 bg-transparent text-sm outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={status === "loading"}
              className="rounded-xl gradient-brand px-6 py-3 text-sm font-semibold text-primary-foreground shadow-soft transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {status === "loading" ? "Subscribing..." : "Subscribe"}
            </button>
          </form>
        </div>
        {message ? (
          <p className={status === "error" ? "mt-4 text-sm text-red-600" : "mt-4 text-sm text-primary"}>{message}</p>
        ) : null}
      </div>
    </section>
  );
}
