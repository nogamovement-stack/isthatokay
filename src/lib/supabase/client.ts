"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";

/**
 * Supabase browser client. Use from Client Components and event handlers.
 * Cookies are read/written via document.cookie, kept in sync with the server
 * via middleware.ts (root) on every request.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    // Crash loudly in the browser console with a clear message rather than
    // a cryptic "Cannot read properties of undefined" from inside Supabase.
    throw new Error(
      "Supabase env vars missing in client bundle. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel → Project Settings → Environment Variables, then redeploy.",
    );
  }
  return createBrowserClient<Database>(url, anon);
}
