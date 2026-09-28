import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Users, Package, Eye, MessageCircle } from "lucide-react";
import { getAdminAnalytics } from "@/lib/admin-server";

export const Route = createFileRoute("/admin/analytics")({
  component: AdminAnalytics,
});

function AdminAnalytics() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(function () {
    getAdminAnalytics()
      .then(setData)
      .finally(function () { setLoading(false); });
  }, []);

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading analytics...</p>;
  }
  if (!data) {
    return <p className="text-sm text-muted-foreground">Could not load analytics.</p>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold">Business analytics</h1>
        <p className="text-sm text-muted-foreground">Growth and engagement over the last 30 days.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard icon={Users} label="Active sellers" value={String(data.activeSellerCount)} />
        <StatCard icon={Eye} label="Product views (30d)" value={String(data.totalViews)} />
        <StatCard icon={MessageCircle} label="WhatsApp clicks (30d)" value={String(data.totalWhatsappClicks)} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <h3 className="font-semibold">Signups over time</h3>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.signupsOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" fontSize={11} />
                <YAxis fontSize={11} allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#00897B" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <h3 className="font-semibold">Listings over time</h3>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.listingsOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" fontSize={11} />
                <YAxis fontSize={11} allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#F97316" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-soft">
        <h3 className="font-semibold">Category breakdown</h3>
        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.categoryBreakdown}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" fontSize={11} />
              <YAxis fontSize={11} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#00897B" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function StatCard(props: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  const Icon = props.icon;
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <div className="mt-3 font-display text-2xl font-bold">{props.value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{props.label}</div>
    </div>
  );
}
