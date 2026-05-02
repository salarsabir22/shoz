"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getSupabasePublishableKey } from "@/lib/supabase/public";

/** Browser client for auth and realtime in Client Components. */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = getSupabasePublishableKey();
  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY / NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }
  return createBrowserClient(supabaseUrl, supabaseKey);
}
