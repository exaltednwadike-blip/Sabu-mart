import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getServerUser, getServerProfile } from "@/lib/auth-server";
import { getCurrentUser, getProfile } from "@/lib/auth";
import { getMyProducts } from "@/lib/products";
import { getSellerOrderItems } from "@/lib/cart";
import {
  LayoutDashboard, Package, ShoppingCart, BarChart3,
  Star, Users, Bell, Settings, Upload, TrendingUp,
} from "lucide-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export const Route = createFileRoute("/seller")({
  beforeLoad: function () {
    return getServerUser().then(function (user) {
      if (!user) {
        throw redirect({ to: "/login" });
      }
      return getServerProfile({ data: user.id }).then(function (profile) {
        if (profile.seller_status !== "approved") {
          throw redirect({ to: "/buyer" });
        }
      });
    });
  },
  head: function () {
    return {
      meta: [
        { title: "Seller Dashboard - SABU Marketplace" },
        { name: "description", content: "Manage products, orders, wallet, and customers on SABU." },
        { name: "robots", content: "noindex" },
      ],
    };
  },
  component: SellerLayout,
});

function SellerLayout() {
  const [storeName, setStoreName] = useState("Loading...");
  const [userMeta, setUserMeta] = useState("");
  const [productCount, setProductCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);

  useEffect(function () {
    getCurrentUser().then(function (user) {
      if (!user) return;
      getProfile(user.id)
        .then(function (profile) {
          setStoreName(profile.store_name || profile.full_name || "My Store");
          setUserMeta("Verified seller");
        })
        .catch(function () {
          setStoreName("My Store");
        });

      getMyProducts(user.id).then(function (products) {
        const live = (products || []).filter(function (p: any) { return p.status === "published"; }).length;
        setProductCount(live);
      });

      getSellerOrderItems(user.id).then(function (items) {
        const pending = (items || []).filter(function (item: any) {
          return item.seller_status === "pending" || item.seller_status === "confirmed";
        }).length;
        setOrderCount(pending);
      });
    });
  }, []);

  const groups = [
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
        { title: "Products", url: "/seller/products", icon: Package, badge: productCount > 0 ? String(productCount) : undefined },
        { title: "Upload product", url: "/seller/upload", icon: Upload },
        { title: "Orders", url: "/seller/orders", icon: ShoppingCart, badge: orderCount > 0 ? String(orderCount) : undefined },
        { title: "Reviews", url: "/seller/reviews", icon: Star },
        { title: "Followers", url: "/seller/followers", icon: Users },
      ],
    },
    {
      label: "Finance & Comms",
      items: [
        { title: "Notifications", url: "/seller/notifications", icon: Bell },
        { title: "Settings", url: "/seller/settings", icon: Settings },
      ],
    },
  ];

  return (
    <DashboardShell role="Seller" userName={storeName} userMeta={userMeta} groups={groups}>
      <Outlet />
    </DashboardShell>
  );
}
