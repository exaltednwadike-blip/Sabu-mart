import { ArrowLeft } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function InfoPage({
  title,
  eyebrow,
  description,
  items,
}: {
  title: string;
  eyebrow?: string;
  description?: string;
  items: Array<{
    title: string;
    body: string;
  }>;
}) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:py-16">
      <Link
        to="/"
        className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-sm font-medium text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back home
      </Link>

      <div className="mt-8 rounded-[2rem] border border-border bg-card p-6 shadow-soft md:p-10">
        {eyebrow ? (
          <div className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            {eyebrow}
          </div>
        ) : null}

        <h1 className="font-display text-3xl font-bold tracking-tight md:text-5xl">{title}</h1>

        {description ? (
          <p className="mt-4 max-w-2xl text-base text-muted-foreground md:text-lg">{description}</p>
        ) : null}

        <div className="mt-8 space-y-5">
          {items.map((item) => (
            <div key={item.title} className="rounded-2xl border border-border bg-background p-5">
              <h2 className="text-lg font-semibold text-foreground">{item.title}</h2>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
