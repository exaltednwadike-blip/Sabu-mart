import { createFileRoute, Outlet } from "@tanstack/react-router";
import {
  LayoutDashboard, ShoppingBag, Heart, MessageSquare, Wallet, Clock, Bell, Settings, Ticket, Star,
} from "lucide-react";
import { DashboardShell, type NavGroup } from "@/components/dashboard/DashboardShell";

const groups: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", url: "/buyer", icon: LayoutDashboard },
      { title: "Orders", url: "/buyer/orders", icon: ShoppingBag, badge: "2" },
      { title: "Recently viewed", url: "/buyer/recent", icon: Clock },
    ],
  },
  {
    label: "My activity",
    items: [
      { title: "Wishlist", url: "/buyer/wishlist", icon: Heart, badge: "12" },
      { title: "Reviews", url: "/buyer/reviews", icon: Star },
      { title: "Messages", url: "/buyer/messages", icon: MessageSquare, badge: "1" },
    ],
  },
  {
    label: "Account",
    items: [
      { title: "Wallet", url: "/buyer/wallet", icon: Wallet },
      { title: "Support tickets", url: "/buyer/support", icon: Ticket },
      { title: "Notifications", url: "/buyer/notifications", icon: Bell },
      { title: "Settings", url: "/buyer/settings", icon: Settings },
    ],
  },
];

export const Route = createFileRoute("/buyer")({
  head: () => ({
    meta: [
      { title: "Buyer Dashboard · SABU Marketplace" },
      { name: "description", content: "Manage your orders, wishlist and messages on SABU." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: BuyerLayout,
});

function BuyerLayout() {
  return (
    <DashboardShell
      role="Buyer"
      userName="Chinelo A."
      userMeta="chinelo@email.com"
      groups={groups}
    >
      <Outlet />
    </DashboardShell>
  );
}
