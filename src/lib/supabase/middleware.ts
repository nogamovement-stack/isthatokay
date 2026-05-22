import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "./types";

/**
 * Refreshes the Supabase session cookie on every request that passes through
 * the root middleware. Without this, server components would see a stale
 * session and auth would silently break after the access token expires.
 */
export async function updateSession(request: NextRequest) {
  // Defensive: if Supabase env vars are missing (e.g. a misconfigured deploy),
  // skip the session refresh entirely rather than crashing the request.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  try {
    const supabase = createServerClient<Database>(
    url,
    anon,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

    // IMPORTANT: do not put any code between createServerClient and getUser.
    // A simple mistake here can make it very hard to debug logout issues.
    await supabase.auth.getUser();
  } catch (err) {
    // Never crash the entire request on a session-refresh hiccup. Log it
    // (visible in Vercel runtime logs) and let the user through.
    console.error("[middleware] session refresh failed:", err);
  }

  return supabaseResponse;
}
