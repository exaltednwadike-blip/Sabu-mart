import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { getServerUser } from "./auth-server";
import { createClient as createServerClient } from "./supabase/server";

// Service-role client. Server-only — never import this file from client code.
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
// server-side session (cookies) — this can't be spoofed from the browser,
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
