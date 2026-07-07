import { createFileRoute } from "@tanstack/react-router";
import { Search, Send, Paperclip, Smile, Phone, Video, MoreHorizontal, BadgeCheck } from "lucide-react";
import { PageHeader } from "@/components/dashboard/DashboardShell";

export const Route = createFileRoute("/seller/messages")({
  component: SellerMessages,
});

const THREADS = [
  { id: 1, name: "Chinelo A.", last: "Is the MacBook still available?", time: "2m", unread: 2, active: true },
  { id: 2, name: "Musa I.", last: "Delivered, thanks!", time: "1h", unread: 0 },
  { id: 3, name: "Bukola O.", last: "Can you do ₦360k?", time: "3h", unread: 1 },
  { id: 4, name: "Femi K.", last: "Order shipped ✔", time: "1d", unread: 0 },
  { id: 5, name: "Ada N.", last: "Beautiful piece 😍", time: "2d", unread: 0 },
];

const MESSAGES = [
  { from: "them", text: "Hi 👋 Is the MacBook Pro 14\" M3 still available?", time: "10:12" },
  { from: "me", text: "Hi Chinelo! Yes, we have 8 units in stock.", time: "10:14" },
  { from: "them", text: "Perfect. Does it come with a warranty?", time: "10:18" },
  { from: "me", text: "1 year international warranty + 6 months SABU protection.", time: "10:19" },
  { from: "them", text: "Great — can you deliver to Lekki today?", time: "10:22" },
];

function SellerMessages() {
  return (
    <div>
      <PageHeader title="Messages" subtitle="Chat with buyers in real time." />

      <div className="grid h-[70vh] gap-0 overflow-hidden rounded-2xl border border-border bg-card shadow-soft md:grid-cols-[320px_1fr]">
        <aside className="flex flex-col border-r border-border">
          <div className="border-b border-border p-3">
            <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input placeholder="Search conversations" className="flex-1 bg-transparent text-sm outline-none" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {THREADS.map((t) => (
              <button
                key={t.id}
                className={`flex w-full items-center gap-3 border-b border-border p-3 text-left transition hover:bg-accent/50 ${
                  t.active ? "bg-primary/5" : ""
                }`}
              >
                <div className="relative">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full gradient-brand font-display font-bold text-primary-foreground">
                    {t.name[0]}
                  </div>
                  {t.unread > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent-orange px-1 text-[10px] font-bold text-accent-orange-foreground">
                      {t.unread}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="truncate text-sm font-semibold">{t.name}</span>
                    <span className="text-[11px] text-muted-foreground">{t.time}</span>
                  </div>
                  <div className="truncate text-xs text-muted-foreground">{t.last}</div>
                </div>
              </button>
            ))}
          </div>
        </aside>

        <section className="flex flex-col">
          <header className="flex items-center gap-3 border-b border-border p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full gradient-brand font-display font-bold text-primary-foreground">
              C
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1 text-sm font-semibold">
                Chinelo A. <BadgeCheck className="h-3.5 w-3.5 text-primary" />
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-success">
                <span className="h-1.5 w-1.5 rounded-full bg-success" /> Online now
              </div>
            </div>
            <button className="rounded-lg p-2 text-muted-foreground hover:bg-accent"><Phone className="h-4 w-4" /></button>
            <button className="rounded-lg p-2 text-muted-foreground hover:bg-accent"><Video className="h-4 w-4" /></button>
            <button className="rounded-lg p-2 text-muted-foreground hover:bg-accent"><MoreHorizontal className="h-4 w-4" /></button>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto bg-muted/30 p-4">
            {MESSAGES.map((m, i) => (
              <div key={i} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm shadow-soft ${
                    m.from === "me"
                      ? "gradient-brand text-primary-foreground rounded-br-sm"
                      : "bg-card rounded-bl-sm"
                  }`}
                >
                  <div>{m.text}</div>
                  <div className={`mt-1 text-[10px] ${m.from === "me" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                    {m.time}
                  </div>
                </div>
              </div>
            ))}
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span className="inline-flex gap-0.5">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted-foreground" />
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted-foreground" style={{ animationDelay: "0.15s" }} />
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted-foreground" style={{ animationDelay: "0.3s" }} />
              </span>
              Chinelo is typing...
            </div>
          </div>

          <footer className="border-t border-border p-3">
            <div className="flex items-center gap-2 rounded-2xl border border-border bg-background px-3 py-2">
              <button className="rounded p-1 text-muted-foreground hover:text-primary"><Paperclip className="h-4 w-4" /></button>
              <input placeholder="Type a message..." className="flex-1 bg-transparent text-sm outline-none" />
              <button className="rounded p-1 text-muted-foreground hover:text-primary"><Smile className="h-4 w-4" /></button>
              <button className="flex h-8 w-8 items-center justify-center rounded-full gradient-brand text-primary-foreground">
                <Send className="h-4 w-4" />
              </button>
            </div>
          </footer>
        </section>
      </div>
    </div>
  );
}
