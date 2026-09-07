import { createClient } from "@/lib/supabase/client";

const STORAGE_KEY = "sabu-newsletter-subscribers";

export async function saveNewsletterSubscriber(email: string) {
  const normalized = email.trim().toLowerCase();
  if (!normalized) {
    throw new Error("Please enter your email address.");
  }

  const supabase = createClient();

  try {
    const { error } = await supabase.from("newsletter_subscribers").insert({ email: normalized });
    if (!error) return { saved: true, source: "database" };
    if (error.code !== "42P01" && error.code !== "42703") {
      throw error;
    }
  } catch (error) {
    // Fall back to local storage until a real email platform or table is connected.
    console.warn("Newsletter database insert unavailable, falling back to local storage.", error);
  }

  try {
    const current = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") as string[];
    const next = current.includes(normalized) ? current : [normalized, ...current];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next.slice(0, 500)));
    return { saved: true, source: "localStorage" };
  } catch (error) {
    console.error("Unable to save newsletter subscriber.", error);
    throw new Error("We could not save your email right now. Please try again.");
  }
}
