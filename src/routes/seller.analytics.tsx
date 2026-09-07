import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { BarChart3, TrendingUp, Package, Eye, Heart } from "lucide-react";
import { PageHeader } from "@/components/dashboard/DashboardShell";
import { getCurrentUser } from "@/lib/auth";
import { getRevenueOverTime, getTopProducts, getCategoryBreakdown, getProductViewsAndLikes } from "@/lib/analytics";

export const Route = createFileRoute("/seller/analytics")({
  component: SellerAnalytics,
});

function SellerAnalytics() {
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [viewStats, setViewStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(function () {
    getCurrentUser().then(function (user) {
      if (!user) return;
      Promise.all([
        getRevenueOverTime(user.id, 30),
        getTopProducts(user.id, 5),
        getCategoryBreakdown(user.id),
        getProductViewsAndLikes(user.id),
      ])
        .then(function (results) {
          setRevenueData(results[0]);
          setTopProducts(results[1]);
          setCategories(results[2]);
          setViewStats(results[3]);
        })
        .finally(function () {
          setLoading(false);
        });
    });
  }, []);

  const totalRevenue = revenueData.reduce(function (sum: number, d: any) { return sum + d.revenue; }, 0);
  const totalViews = viewStats.reduce(function (sum: number, p: any) { return sum + p.views; }, 0);
  const totalLikes = viewStats.reduce(function (sum: number, p: any) { return sum + p.likes; }, 0);

  function renderTopProduct(p: any, i: number) {
    return (
      <div key={p.title} className="flex items-center justify-between border-b border-border py-3 last:border-0">
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
            {i + 1}
          </span>
          <div>
            <p className="text-sm font-medium">{p.title}</p>
            <p className="text-xs text-muted-foreground">{p.units} sold</p>
          </div>
        </div>
        <span className="font-semibold text-primary">₦{p.revenue.toLocaleString()}</span>
      </div>
    );
  }

  function renderViewStat(p: any) {
    return (
      <div key={p.id} className="flex items-center justify-between border-b border-border py-3 last:border-0">
        <p className="text-sm font-medium">{p.title}</p>
        <div className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1 text-muted-foreground">
            <Eye className="h-3.5 w-3.5" /> {p.views}
          </span>
          <span className="flex items-center gap-1 text-muted-foreground">
            <Heart className="h-3.5 w-3.5" /> {p.likes}
          </span>
        </div>
      </div>
    );
  }

  function renderCategory(c: any) {
    return (
      <div key={c.name} className="flex items-center justify-between border-b border-border py-3 last:border-0">
        <span className="text-sm">{c.name}</span>
        <span className="text-sm font-semibold">{c.count} listing{c.count !== 1 ? "s" : ""}</span>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Analytics" subtitle="Real performance data from your store." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <TrendingUp className="h-4 w-4 text-success" /> Revenue (last 30 days)
          </div>
          <div className="mt-2 font-display text-2xl font-bold">₦{totalRevenue.toLocaleString()}</div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Package className="h-4 w-4 text-primary" /> Products listed
          </div>
          <div className="mt-2 font-display text-2xl font-bold">
            {categories.reduce(function (sum: number, c: any) { return sum + c.count; }, 0)}
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Eye className="h-4 w-4 text-primary" /> Total product views
          </div>
          <div className="mt-2 font-display text-2xl font-bold">{totalViews.toLocaleString()}</div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Heart className="h-4 w-4 text-destructive" /> Total likes
          </div>
          <div className="mt-2 font-display text-2xl font-bold">{totalLikes.toLocaleString()}</div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-soft">
        <h3 className="mb-4 flex items-center gap-2 font-semibold">
          <BarChart3 className="h-4 w-4 text-primary" /> Revenue over time
        </h3>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : revenueData.length === 0 ? (
          <p className="text-sm text-muted-foreground">No revenue yet in the last 30 days.</p>
        ) : (
          <div style={{ width: "100%", height: 250 }}>
            <ResponsiveContainer>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={function (value: any) { return "₦" + Number(value).toLocaleString(); }} />
                <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <h3 className="mb-2 font-semibold">Top products</h3>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : topProducts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No sales yet.</p>
          ) : (
            topProducts.map(renderTopProduct)
          )}
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <h3 className="mb-2 font-semibold">Listings by category</h3>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : categories.length === 0 ? (
            <p className="text-sm text-muted-foreground">No products yet.</p>
          ) : (
            categories.map(renderCategory)
          )}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-soft">
        <h3 className="mb-2 flex items-center gap-2 font-semibold">
          <Eye className="h-4 w-4 text-primary" /> Views &amp; likes by product
        </h3>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : viewStats.length === 0 ? (
          <p className="text-sm text-muted-foreground">No products yet.</p>
        ) : (
          viewStats.map(renderViewStat)
        )}
      </div>
    </div>
  );
}
