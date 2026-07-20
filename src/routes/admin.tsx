import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { getServerUser, checkIsAdmin } from "@/lib/auth-server";
import { AdminShell } from "@/components/dashboard/AdminShell";

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
    <AdminShell>
      <Outlet />
    </AdminShell>
  );
}
