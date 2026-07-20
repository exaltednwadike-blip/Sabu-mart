import { createServerFn } from "@tanstack/react-start";
import { createClient } from "./supabase/server";

export const getServerUser = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return data.user;
});

export const getServerProfile = createServerFn({ method: "GET" })
  .validator((userId: string) => userId)
  .handler(async ({ data: userId }) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    if (error) throw error;
    return data;
  });

export const checkIsAdmin = createServerFn({ method: "GET" })
  .validator((userId: string) => userId)
  .handler(async ({ data: userId }) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("admins")
      .select("id")
      .eq("id", userId)
      .maybeSingle();
    if (error) return false;
    return !!data;
  });
