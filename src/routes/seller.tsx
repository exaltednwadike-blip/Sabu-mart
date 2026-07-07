import { createFileRoute, Outlet } from "@tanstack/react-router";
import {
  LayoutDashboard, Package, ShoppingCart, MessageSquare, Wallet, BarChart3,
  Star, Users, Bell, Settings, Upload, TrendingUp,
} from "lucide-react";
import { DashboardShell, type NavGroup } from "@/components/dashboard/DashboardShell";

const groups: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", url: "/seller", icon: LayoutDashboard },
      { title: "Analytics", url: "/seller/analytics", icon: BarChart3 },
      { title: "Performance", url: "/seller/performance", icon: TrendingUp },
    ],
  },
  {
    label: "Store",
    items: [
      { title: "Products", url: "/seller/products", icon: Package, badge: "42" },
      { title: "Upload product", url: "/seller/upload", icon: Upload },
      { title: "Orders", url: "/seller/orders", icon: ShoppingCart, badge: "7" },
      { title: "Reviews", url: "/seller/reviews", icon: Star },
      { title: "Followers", url: "/seller/followers", icon: Users },
    ],
  },
  {
    label: "Finance & Comms",
    items: [
      { title: "Wallet", url: "/seller/wallet", icon: Wallet },
      { title: "Messages", url: "/seller/messages", icon: MessageSquare, badge: "3" },
      { title: "Notifications", url: "/seller/notifications", icon: Bell },
      { title: "Settings", url: "/seller/settings", icon: Settings },
    ],
  },
];

export const Route = createFileRoute("/seller")({
  head: () => ({
    meta: [
      { title: "Seller Dashboard · SABU Marketplace" },
      { name: "description", content: "Manage products, orders, wallet, and customers on SABU." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SellerLayout,
});

function SellerLayout() {
  return (
    <DashboardShell
      role="Seller"
      userName="TechPro Store"
      userMeta="Verified · Lagos"
      groups={groups}
    >
      <Outlet />
    </DashboardShell>
  );
}
