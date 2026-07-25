import { createClient } from "./supabase/client";

export type UserRole = "buyer" | "seller";
export type IdType = "nin" | "drivers_license" | "voters_card" | "passport";

const supabase = createClient();

export async function signUp(email: string, password: string, fullName: string, role: UserRole) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: role,
      },
      emailRedirectTo: window.location.origin + "/login",
    },
  });
  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: window.location.origin + "/auth/callback",
    },
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data.user;
}

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  if (error) throw error;
  return data;
}

export async function requestPasswordReset(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + "/reset-password",
  });
  if (error) throw error;
}

export async function updatePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
}

interface SellerApplicationInput {
  businessName: string;
  businessAddress: string;
  phone: string;
  idType: IdType;
  idNumber: string;
  idDocument: File;
}

export async function submitSellerApplication(userId: string, input: SellerApplicationInput) {
  const fileExt = input.idDocument.name.split(".").pop();
  const filePath = userId + "/" + Date.now() + "." + fileExt;

  const { error: uploadError } = await supabase.storage
    .from("seller-documents")
    .upload(filePath, input.idDocument);
  if (uploadError) throw uploadError;

  const { data, error } = await supabase
    .from("seller_applications")
    .insert({
      user_id: userId,
      business_name: input.businessName,
      business_address: input.businessAddress,
      phone: input.phone,
      id_type: input.idType,
      id_number: input.idNumber,
      id_document_url: filePath,
      status: "pending",
    })
    .select()
    .single();
  if (error) throw error;

  await supabase
    .from("profiles")
    .update({ seller_status: "pending", phone: input.phone })
    .eq("id", userId);

  return data;
}
