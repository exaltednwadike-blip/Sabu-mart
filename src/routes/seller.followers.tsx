import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { PageHeader } from "@/components/dashboard/DashboardShell";
import { getCurrentUser } from "@/lib/auth";
import { getMyFollowers } from "@/lib/sellers";

export const Route = createFileRoute("/seller/followers")({
  component: SellerFollowers,
});

function SellerFollowers() {
  const [followers, setFollowers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(function () {
    getCurrentUser().then(function (user) {
      if (!user) return;
      getMyFollowers(user.id)
        .then(setFollowers)
        .finally(function () { setLoading(false); });
    });
  }, []);

  function renderFollower(f: any) {
    const name = f.profiles && f.profiles.full_name ? f.profiles.full_name : "SABU Buyer";
    return (
      <div key={f.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
          {name.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-sm font-medium">{name}</p>
          <p className="text-xs text-muted-foreground">Following since {new Date(f.created_at).toLocaleDateString()}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Followers" subtitle="Buyers who follow your store." />

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : followers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center">
          <Users className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">No followers yet.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {followers.map(renderFollower)}
        </div>
      )}
    </div>
  );
}
