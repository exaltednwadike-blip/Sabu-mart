import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getServerUser } from "@/lib/auth-server";
import { getCurrentUser, getProfile } from "@/lib/auth";
import {
  LayoutDashboard, ShoppingBag, Heart, Clock, Bell, Settings, Ticket, Star, ShoppingCart,
} from "lucide-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

const groups = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", url: "/buyer", icon: LayoutDashboard },
      { title: "Cart", url: "/buyer/cart", icon: ShoppingCart },
      { title: "Orders", url: "/buyer/orders", icon: ShoppingBag },
      { title: "Food Orders", url: "/buyer/food-orders", icon: ShoppingBag },
      { title: "Recently viewed", url: "/buyer/recent", icon: Clock },
    ],
  },
  {
    label: "My activity",
    items: [
      { title: "Wishlist", url: "/buyer/wishlist", icon: Heart },
      { title: "Reviews", url: "/buyer/reviews", icon: Star },
    ],
  },
  {
    label: "Account",
    items: [
      { title: "Support tickets", url: "/buyer/support", icon: Ticket },
      { title: "Notifications", url: "/buyer/notifications", icon: Bell },
      { title: "Settings", url: "/buyer/settings", icon: Settings },
    ],
  },
];

export const Route = createFileRoute("/buyer")({
  beforeLoad: function () {
    return getServerUser().then(function (user) {
      if (!user) {
        throw redirect({ to: "/login" });
      }
    });
  },
  head: function () {
    return {
      meta: [
        { title: "Buyer Dashboard - SABU Marketplace" },
        { name: "description", content: "Manage your orders, wishlist and messages on SABU." },
        { name: "robots", content: "noindex" },
      ],
    };
  },
  component: BuyerLayout,
});

function BuyerLayout() {
  const [userName, setUserName] = useState("Loading...");
  const [userMeta, setUserMeta] = useState("");

  useEffect(function () {
    getCurrentUser().then(function (user) {
      if (!user) return;
      getProfile(user.id)
        .then(function (profile) {
          setUserName(profile.full_name || user.email || "Buyer");
          setUserMeta(user.email || "");
        })
        .catch(function () {
          setUserName(user.email || "Buyer");
          setUserMeta(user.email || "");
        });
    });
  }, []);

  return (
    <DashboardShell role="Buyer" userName={userName} userMeta={userMeta} groups={groups}>
      <Outlet />
    </DashboardShell>
  );
}
