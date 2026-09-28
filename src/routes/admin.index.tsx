import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Users, Package, AlertTriangle, Banknote, ArrowUpRight, TrendingUp, Shield } from "lucide-react";
import { getAdminStats } from "@/lib/admin";
import { getMarketplaceStats } from "@/lib/products";
import { getPublicUserCount } from "@/lib/stats-server";

export const Route = createFileRoute("/admin/")({
  component: AdminOverview,
});

function AdminOverview() {
  const [stats, setStats] = useState({
    pendingApplications: 0,
    pendingProducts: 0,
    openDisputes: 0,
    pendingWithdrawals: 0,
  });
  const [loading, setLoading] = useState(true);
  const [growth, setGrowth] = useState({ userCount: 0, productCount: 0, avgRating: 0, reviewCount: 0 });
  const [growthLoading, setGrowthLoading] = useState(true);

  useEffect(function () {
    getAdminStats()
      .then(setStats)
      .finally(function () {
        setLoading(false);
      });
    Promise.all([getMarketplaceStats(), getPublicUserCount()])
      .then(function ([marketplace, userCount]) {
        setGrowth({
          userCount: userCount,
          productCount: marketplace.productCount,
          avgRating: marketplace.avgRating,
          reviewCount: marketplace.reviewCount,
        });
      })
      .finally(function () {
        setGrowthLoading(false);
      });
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold">Overview</h1>
        <p className="text-sm text-muted-foreground">A quick look at what needs your attention.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Users}
          label="Seller applications"
          value={loading ? "-" : String(stats.pendingApplications)}
          tint="primary"
          link="/admin/sellers"
        />
        <StatCard
          icon={Package}
          label="Products in review"
          value={loading ? "-" : String(stats.pendingProducts)}
          tint="orange"
          link="/admin/products"
        />
        <StatCard
          icon={AlertTriangle}
          label="Open disputes"
          value={loading ? "-" : String(stats.openDisputes)}
          tint="destructive"
        />
        <StatCard
          icon={Banknote}
          label="Pending withdrawals"
          value={loading ? "-" : String(stats.pendingWithdrawals)}
          tint="success"
        />
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <StatCard
          icon={Users}
          label="Users signed up"
          value={growthLoading ? "-" : String(growth.userCount)}
          tint="primary"
        />
        <StatCard
          icon={TrendingUp}
          label="Live listings"
          value={growthLoading ? "-" : String(growth.productCount)}
          tint="orange"
        />
        <StatCard
          icon={Shield}
          label="Buyer rating"
          value={growthLoading ? "-" : growth.reviewCount > 0 ? growth.avgRating.toFixed(1) + "/5" : "No ratings yet"}
          tint="success"
        />
      </div>

      <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-soft">
        <h2 className="font-semibold">Getting started</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Review new seller KYC applications and product listings from the sidebar. Approving a seller unlocks their
          store; approving a product makes it visible to buyers on the marketplace.
        </p>
      </div>
    </div>
  );
}

function StatCard(props: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  tint: "primary" | "orange" | "destructive" | "success";
  link?: string;
}) {
  const Icon = props.icon;
  const tintClasses: { [key: string]: string } = {
    primary: "bg-primary/10 text-primary",
    orange: "bg-accent-orange/15 text-accent-orange",
    destructive: "bg-destructive/10 text-destructive",
    success: "bg-success/10 text-success",
  };

  const content = (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-soft transition hover:shadow-elegant">
      <div className={"flex h-10 w-10 items-center justify-center rounded-xl " + tintClasses[props.tint]}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="mt-3 font-display text-2xl font-bold">{props.value}</div>
      <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
        {props.label}
        {props.link ? <ArrowUpRight className="h-3.5 w-3.5" /> : null}
      </div>
    </div>
  );

  if (props.link) {
    return <Link to={props.link}>{content}</Link>;
  }
  return content;
}
