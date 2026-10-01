import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { getServerUser, checkIsAdmin } from "@/lib/auth-server";
import { LayoutDashboard, BarChart3, Users, UserCog, Package, Utensils, ShoppingBag, Banknote, AlertTriangle } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

const groups = [
  {
    label: "General",
    items: [
      { title: "Overview", url: "/admin", icon: LayoutDashboard },
      { title: "Analytics", url: "/admin/analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Catalog",
    items: [
      { title: "Sellers", url: "/admin/sellers", icon: Users },
      { title: "Users", url: "/admin/users", icon: UserCog },
      { title: "Products", url: "/admin/products", icon: Package },
      { title: "Restaurants", url: "/admin/restaurants", icon: Utensils },
    ],
  },
  {
    label: "Operations",
    items: [
      { title: "Food orders", url: "/admin/food-orders", icon: ShoppingBag },
      { title: "Withdrawals", url: "/admin/withdrawals", icon: Banknote },
      { title: "Disputes", url: "/admin/disputes", icon: AlertTriangle },
    ],
  },
];

export const Route = createFileRoute("/admin")({
  beforeLoad: function () {
    return getServerUser().then(function (user) {
      if (!user) {
        throw redirect({ to: "/login" });
      }
      return checkIsAdmin({ data: user.id }).then(function (admin) {
        if (!admin) {
          throw redirect({ to: "/buyer" });
        }
      });
    });
  },
  head: function () {
    return {
      meta: [
        { title: "Admin - SABU Marketplace" },
        { name: "robots", content: "noindex" },
      ],
    };
  },
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <DashboardShell role="Admin" userName="Admin" userMeta="Control panel" groups={groups}>
      <Outlet />
    </DashboardShell>
  );
}
