"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";

/**
 * Supabase browser client. Use from Client Components and event handlers.
 * Cookies are read/written via document.cookie, kept in sync with the server
 * via middleware.ts (root) on every request.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
