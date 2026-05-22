import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Magic-link callback. Supabase emails users a link of the form:
 *   https://acthuman.org/auth/callback?code=<code>
 *
 * We exchange the code for a session, then route the user based on whether
 * they already have a profile (handle):
 *   - has profile  → / (or ?next=)
 *   - no profile   → /signup/handle (to pick a username)
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/";

  // Also surface Supabase's own error params if they passed through.
  // Older auth flows pass ?error= and ?error_description= in the redirect.
  const incomingError = url.searchParams.get("error");
  const incomingErrorDesc = url.searchParams.get("error_description");

  // Always resolve the origin from the request so this works on Vercel
  // preview URLs, localhost, and production simultaneously.
  const origin = url.origin;

  function bail(reason: string) {
    console.error("[auth/callback]", reason);
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(reason)}`);
  }

  if (incomingError) {
    return bail(`supabase:${incomingError}${incomingErrorDesc ? " — " + incomingErrorDesc : ""}`);
  }

  if (!code) {
    return bail("missing_code (no ?code= in callback URL — Supabase didn't redirect here with a code, probably means the magic link expired or was already used)");
  }

  const supabase = await createClient();
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    return bail(`exchange_failed: ${exchangeError.message}`);
  }

  // Session is set. Check whether this user has claimed a handle yet.
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    return bail(`get_user_failed: ${userError.message}`);
  }

  if (!user) {
    return bail("session_missing (exchange succeeded but no user — cookie likely not persisted)");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile, error: profileError } = (await (supabase as any)
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .maybeSingle()) as {
      data: { username: string } | null;
      error: { message: string } | null;
    };

  if (profileError) {
    return bail(`profile_lookup_failed: ${profileError.message}`);
  }

  if (!profile) {
    return NextResponse.redirect(`${origin}/signup/handle`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
