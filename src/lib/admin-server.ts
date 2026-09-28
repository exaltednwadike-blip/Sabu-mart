import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { getServerUser } from "./auth-server";
import { createClient as createServerClient } from "./supabase/server";

// Service-role client. Server-only â€” never import this file from client code.
function getAdminClient() {
  const url = process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY or VITE_SUPABASE_URL");
  }
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// Confirms the caller is a real, currently-logged-in admin using their
// server-side session (cookies) â€” this can't be spoofed from the browser,
// unlike a client-side check alone.
async function requireAdmin() {
  const user = await getServerUser();
  if (!user) throw new Error("Not authenticated.");

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("admins")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();
  if (error || !data) throw new Error("Not authorized. Admins only.");

  return user;
}

export const getAdminAnalytics = createServerFn({ method: "GET" }).handler(async function () {
  await requireAdmin();
  const admin = getAdminClient();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);
  const cutoffIso = cutoff.toISOString();

  const [profilesResult, productsResult, viewsResult, clicksResult, categoryResult] = await Promise.all([
    admin.from("profiles").select("created_at, is_seller, seller_status").gte("created_at", cutoffIso),
    admin.from("products").select("created_at").gte("created_at", cutoffIso),
    admin.from("product_views").select("id", { count: "exact", head: true }),
    admin.from("whatsapp_clicks").select("id", { count: "exact", head: true }),
    admin.from("products").select("listing_categories(name)"),
  ]);

  function groupByDay(rows: any[]) {
    const byDay: { [key: string]: number } = {};
    rows.forEach(function (row: any) {
      const day = new Date(row.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
      byDay[day] = (byDay[day] || 0) + 1;
    });
    return Object.keys(byDay).map(function (day) { return { day, count: byDay[day] }; });
  }

  const profiles = profilesResult.data || [];
  const activeSellerCount = profiles.filter(function (p: any) {
    return p.is_seller && p.seller_status === "approved";
  }).length;

  const categoryRows = categoryResult.data || [];
  const byCategory: { [key: string]: number } = {};
  categoryRows.forEach(function (row: any) {
    const name = row.listing_categories ? row.listing_categories.name : "Uncategorized";
    byCategory[name] = (byCategory[name] || 0) + 1;
  });

  return {
    signupsOverTime: groupByDay(profiles),
    listingsOverTime: groupByDay(productsResult.data || []),
    activeSellerCount,
    totalViews: viewsResult.count ?? 0,
    totalWhatsappClicks: clicksResult.count ?? 0,
    categoryBreakdown: Object.keys(byCategory).map(function (name) { return { name, count: byCategory[name] }; }),
  };
});

export const approveSellerApplication = createServerFn({ method: "POST" })
  .validator((data: { applicationId: string; applicantUserId: string; businessName: string }) => data)
  .handler(async ({ data }) => {
    await requireAdmin();
    const admin = getAdminClient();

    const { error: appError } = await admin
      .from("seller_applications")
      .update({ status: "approved", reviewed_at: new Date().toISOString() })
      .eq("id", data.applicationId);
    if (appError) throw new Error("Could not update application: " + appError.message);

    const { error: profileError } = await admin
      .from("profiles")
      .update({ seller_status: "approved", is_seller: true, store_name: data.businessName })
      .eq("id", data.applicantUserId);
    if (profileError) throw new Error("Could not update seller profile: " + profileError.message);

    return { success: true };
  });

export const rejectSellerApplication = createServerFn({ method: "POST" })
  .validator((data: { applicationId: string; applicantUserId: string; reason: string }) => data)
  .handler(async ({ data }) => {
    await requireAdmin();
    const admin = getAdminClient();

    const { error: appError } = await admin
      .from("seller_applications")
      .update({
        status: "rejected",
        rejection_reason: data.reason,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", data.applicationId);
    if (appError) throw new Error("Could not update application: " + appError.message);

    const { error: profileError } = await admin
      .from("profiles")
      .update({ seller_status: "rejected" })
      .eq("id", data.applicantUserId);
    if (profileError) throw new Error("Could not update seller profile: " + profileError.message);

    return { success: true };
  });
