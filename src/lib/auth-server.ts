import { createServerFn } from "@tanstack/react-start";
import { createClient } from "./supabase/server";
import dns from "node:dns";

const DISPOSABLE_DOMAINS = [
  "mailinator.com", "tempmail.com", "temp-mail.org", "guerrillamail.com",
  "10minutemail.com", "yopmail.com", "trashmail.com", "fakeinbox.com",
  "throwawaymail.com", "getnada.com", "sharklasers.com",
];

export const verifyEmailDomain = createServerFn({ method: "GET" })
  .validator((email: string) => email)
  .handler(async ({ data: email }) => {
    const domain = (email.split("@")[1] || "").toLowerCase().trim();
    if (!domain) return { valid: false, reason: "Please enter a valid email address." };

    if (DISPOSABLE_DOMAINS.indexOf(domain) !== -1) {
      return { valid: false, reason: "Temporary/disposable email addresses aren't allowed." };
    }

    try {
      const records = await dns.promises.resolveMx(domain);
      if (!records || records.length === 0) {
        return { valid: false, reason: "This email domain can't receive mail. Please check for typos." };
      }
      return { valid: true, reason: "" };
    } catch (e) {
      return { valid: false, reason: "This email domain doesn't exist. Please check for typos." };
    }
  });

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
