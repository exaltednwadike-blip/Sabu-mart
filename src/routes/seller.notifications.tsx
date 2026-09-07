import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bell, Check } from "lucide-react";
import { PageHeader } from "@/components/dashboard/DashboardShell";
import { getCurrentUser } from "@/lib/auth";
import { getNotifications, markAsRead, markAllAsRead } from "@/lib/notifications";

export const Route = createFileRoute("/seller/notifications")({
  component: SellerNotifications,
});

function SellerNotifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  function load() {
    setLoading(true);
    getCurrentUser().then(function (user) {
      if (!user) return;
      setUserId(user.id);
      getNotifications(user.id, 50)
        .then(setNotifications)
        .finally(function () { setLoading(false); });
    });
  }

  useEffect(function () {
    load();
  }, []);

  function handleClick(n: any) {
    if (!n.read) {
      markAsRead(n.id).then(load);
    }
    if (n.link) navigate({ to: n.link });
  }

  function handleMarkAllRead() {
    if (!userId) return;
    markAllAsRead(userId).then(load);
  }

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return mins + "m ago";
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return hrs + "h ago";
    return Math.floor(hrs / 24) + "d ago";
  }

  function renderNotification(n: any) {
    return (
      <button
        key={n.id}
        onClick={function () { handleClick(n); }}
        className={"flex w-full flex-col items-start gap-1 rounded-xl border border-border p-4 text-left transition hover:bg-accent " + (n.read ? "bg-card" : "bg-primary/5")}
      >
        <div className="flex w-full items-center justify-between gap-2">
          <span className="text-sm font-semibold">{n.title}</span>
          {!n.read ? <span className="h-2 w-2 shrink-0 rounded-full bg-primary" /> : null}
        </div>
        {n.message ? <span className="text-sm text-muted-foreground">{n.message}</span> : null}
        <span className="text-xs text-muted-foreground">{timeAgo(n.created_at)}</span>
      </button>
    );
  }

  const unreadCount = notifications.filter(function (n: any) { return !n.read; }).length;

  return (
    <div>
      <PageHeader
        title="Notifications"
        subtitle="Updates about your orders, payments and store activity."
        action={
          unreadCount > 0 ? (
            <button
              onClick={handleMarkAllRead}
              className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-semibold hover:bg-accent"
            >
              <Check className="h-4 w-4" /> Mark all read
            </button>
          ) : null
        }
      />

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : notifications.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center">
          <Bell className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">No notifications yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(renderNotification)}
        </div>
      )}
    </div>
  );
}
