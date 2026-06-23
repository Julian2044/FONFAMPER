import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";

function getSupabaseUrl() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!supabaseUrl) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  }

  return supabaseUrl;
}

function getSupabasePublishableKey() {
  const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabasePublishableKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  }

  return supabasePublishableKey;
}

export function createClientBrowser() {
  return createBrowserClient<Database>(getSupabaseUrl(), getSupabasePublishableKey());
}

export const supabaseBrowserClient = createClientBrowser;
