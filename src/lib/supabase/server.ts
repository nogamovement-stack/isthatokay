import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { createClient as createServiceRoleClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { Database } from "./types";

/**
 * Supabase server client bound to the current request's cookies.
 * Use in Server Components, Route Handlers, and Server Actions.
 *
 * RLS applies — every query runs as the authenticated user.
 */
export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // The `setAll` method was called from a Server Component which
            // can't modify cookies. Safe to ignore when middleware refreshes
            // the session for every request.
          }
        },
      },
    },
  );
}

/**
 * Service-role client. BYPASSES RLS. Server-only. Never expose to clients.
 *
 * Use sparingly — only for admin-style operations that need to read/write
 * across user boundaries (moderation actions, scheduled maintenance, etc).
 * For normal user-scoped operations, use `createClient()` above.
 */
export function createServiceClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY not set");
  }
  return createServiceRoleClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    key,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  );
}
