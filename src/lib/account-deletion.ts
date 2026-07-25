import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { getServerUser } from "./auth-server";
import { createServerClient } from "./supabase/server";

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

function extractStoragePath(publicUrl: string, bucket: string): string | null {
  const marker = `/storage/v1/object/public/${bucket}/`;
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return null;
  return publicUrl.slice(idx + marker.length);
}

export const checkAccountDeletionBlockers = createServerFn({ method: "GET" }).handler(
  async () => {
    const user = await getServerUser();
    if (!user) throw new Error("Not authenticated");

    const supabase = await createServerClient();
    const { data, error } = await supabase.rpc("check_account_deletion_blockers", {
      p_user_id: user.id,
    });
    if (error) throw new Error(error.message);

    return { blockers: (data ?? []) as string[] };
  }
);

export const deleteMyAccount = createServerFn({ method: "POST" })
  .validator((d: { confirmation: string }) => d)
  .handler(async ({ data }) => {
    if (data.confirmation !== "DELETE") {
      throw new Error("Confirmation text did not match");
    }

    const user = await getServerUser();
    if (!user) throw new Error("Not authenticated");

    const supabase = await createServerClient();

    const { data: blockers, error: blockErr } = await supabase.rpc(
      "check_account_deletion_blockers",
      { p_user_id: user.id }
    );
    if (blockErr) throw new Error(blockErr.message);
    if (blockers && blockers.length > 0) {
      throw new Error(`Cannot delete account: ${blockers.join("; ")}`);
    }

    const admin = getAdminClient();

    // Clean up product images (unpaid/draft listings only, since paid ones
    // would already have blocked deletion above).
    const { data: products } = await supabase
      .from("products")
      .select("images")
      .eq("seller_id", user.id);

    const imagePaths = (products ?? [])
      .flatMap((p) => (p.images as string[] | null) ?? [])
      .map((url) => extractStoragePath(url, "product-images"))
      .filter((p): p is string => !!p);

    if (imagePaths.length > 0) {
      await admin.storage.from("product-images").remove(imagePaths);
    }

    // seller-documents is a private bucket — id_document_url is likely a
    // storage path already rather than a public URL. Adjust this block to
    // match however you actually store that reference.
    const { data: application } = await supabase
      .from("seller_applications")
      .select("id_document_url")
      .eq("id", user.id)
      .maybeSingle();

    if (application?.id_document_url) {
      const docPath =
        extractStoragePath(application.id_document_url, "seller-documents") ??
        application.id_document_url;
      await admin.storage.from("seller-documents").remove([docPath]);
    }

    const { error: delErr } = await supabase.rpc("delete_own_account_data", {
      p_user_id: user.id,
    });
    if (delErr) throw new Error(delErr.message);

    const { error: authErr } = await admin.auth.admin.deleteUser(user.id);
    if (authErr) throw new Error(authErr.message);

    return { success: true };
  });
