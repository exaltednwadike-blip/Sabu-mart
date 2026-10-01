import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Users, Ban, CheckCircle2, Trash2, Send, Search } from "lucide-react";
import { listAllUsers, setUserSuspended, deleteUserAccount, sendAdminMessage } from "@/lib/admin-server";

export const Route = createFileRoute("/admin/users")({
  component: AdminUsers,
});

function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [messageTarget, setMessageTarget] = useState<any>(null);
  const [messageTitle, setMessageTitle] = useState("");
  const [messageBody, setMessageBody] = useState("");
  const [sending, setSending] = useState(false);
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastBody, setBroadcastBody] = useState("");

  function load() {
    setLoading(true);
    listAllUsers()
      .then(setUsers)
      .finally(function () { setLoading(false); });
  }

  useEffect(function () { load(); }, []);

  function handleToggleSuspend(user: any) {
    setBusyId(user.id);
    setUserSuspended({ data: { userId: user.id, suspended: !user.suspended } })
      .then(function () {
        setUsers(function (prev) {
          return prev.map(function (u: any) { return u.id === user.id ? { ...u, suspended: !user.suspended } : u; });
        });
      })
      .finally(function () { setBusyId(null); });
  }

  function handleDelete(user: any) {
    if (!window.confirm("Permanently delete this account? This cannot be undone.")) return;
    setBusyId(user.id);
    deleteUserAccount({ data: { userId: user.id } })
      .then(function () {
        setUsers(function (prev) { return prev.filter(function (u: any) { return u.id !== user.id; }); });
      })
      .finally(function () { setBusyId(null); });
  }

  function handleSendMessage() {
    if (!messageTarget || !messageTitle.trim() || !messageBody.trim()) return;
    setSending(true);
    sendAdminMessage({ data: { title: messageTitle.trim(), message: messageBody.trim(), userId: messageTarget.id } })
      .then(function () {
        setMessageTarget(null);
        setMessageTitle("");
        setMessageBody("");
      })
      .finally(function () { setSending(false); });
  }

  function handleBroadcast() {
    if (!broadcastTitle.trim() || !broadcastBody.trim()) return;
    if (!window.confirm("Send this message to every user on SABU?")) return;
    setSending(true);
    sendAdminMessage({ data: { title: broadcastTitle.trim(), message: broadcastBody.trim(), userId: null } })
      .then(function () {
        setBroadcastOpen(false);
        setBroadcastTitle("");
        setBroadcastBody("");
      })
      .finally(function () { setSending(false); });
  }

  const filtered = users.filter(function (u: any) {
    if (!query.trim()) return true;
    const text = ((u.full_name || "") + " " + (u.store_name || "")).toLowerCase();
    return text.indexOf(query.trim().toLowerCase()) !== -1;
  });

  function renderUser(u: any) {
    return (
      <div key={u.id} className="rounded-2xl border border-border bg-card p-4 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">{u.full_name || "Unnamed user"}</span>
              {u.is_seller ? (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                  Seller{u.store_name ? ": " + u.store_name : ""}
                </span>
              ) : null}
              {u.suspended ? (
                <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-semibold text-destructive">Suspended</span>
              ) : null}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Joined {new Date(u.created_at).toLocaleDateString()}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={function () { setMessageTarget(u); }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-accent"
            >
              <Send className="h-3.5 w-3.5" /> Message
            </button>
            <button
              onClick={function () { handleToggleSuspend(u); }}
              disabled={busyId === u.id}
              className={
                "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold disabled:opacity-60 " +
                (u.suspended ? "bg-success/10 text-success hover:bg-success/20" : "bg-destructive/10 text-destructive hover:bg-destructive/20")
              }
            >
              {u.suspended ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Ban className="h-3.5 w-3.5" />}
              {u.suspended ? "Unsuspend" : "Suspend"}
            </button>
            <button
              onClick={function () { handleDelete(u); }}
              disabled={busyId === u.id}
              className="inline-flex items-center gap-1.5 rounded-lg border border-destructive px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/5 disabled:opacity-60"
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold">Users & sellers</h1>
            <p className="text-sm text-muted-foreground">Manage accounts, suspensions, and messaging.</p>
          </div>
        </div>
        <button
          onClick={function () { setBroadcastOpen(true); }}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          <Send className="h-4 w-4" /> Message all users
        </button>
      </div>

      <div className="mb-4 flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 shadow-soft sm:max-w-sm">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={function (e) { setQuery(e.target.value); }}
          placeholder="Search by name or store..."
          className="w-full bg-transparent text-sm outline-none"
        />
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
          No users found.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(renderUser)}
        </div>
      )}

      {messageTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-card p-5 shadow-elegant">
            <h3 className="font-semibold">Message {messageTarget.full_name || "user"}</h3>
            <input
              type="text"
              value={messageTitle}
              onChange={function (e) { setMessageTitle(e.target.value); }}
              placeholder="Title"
              className="mt-3 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
            <textarea
              value={messageBody}
              onChange={function (e) { setMessageBody(e.target.value); }}
              placeholder="Message"
              rows={4}
              className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
            <div className="mt-3 flex justify-end gap-2">
              <button
                onClick={function () { setMessageTarget(null); }}
                className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-accent"
              >
                Cancel
              </button>
              <button
                onClick={handleSendMessage}
                disabled={sending || !messageTitle.trim() || !messageBody.trim()}
                className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground disabled:opacity-60"
              >
                {sending ? "Sending..." : "Send"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {broadcastOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-card p-5 shadow-elegant">
            <h3 className="font-semibold">Message all users</h3>
            <p className="mt-1 text-xs text-muted-foreground">This sends a notification to every account on SABU.</p>
            <input
              type="text"
              value={broadcastTitle}
              onChange={function (e) { setBroadcastTitle(e.target.value); }}
              placeholder="Title"
              className="mt-3 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
            <textarea
              value={broadcastBody}
              onChange={function (e) { setBroadcastBody(e.target.value); }}
              placeholder="Message"
              rows={4}
              className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
            <div className="mt-3 flex justify-end gap-2">
              <button
                onClick={function () { setBroadcastOpen(false); }}
                className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-accent"
              >
                Cancel
              </button>
              <button
                onClick={handleBroadcast}
                disabled={sending || !broadcastTitle.trim() || !broadcastBody.trim()}
                className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground disabled:opacity-60"
              >
                {sending ? "Sending..." : "Send to all"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
