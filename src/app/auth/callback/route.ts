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

  // Always resolve the origin from the request so this works on Vercel
  // preview URLs, localhost, and production simultaneously.
  const origin = url.origin;

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  const supabase = await createClient();
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(exchangeError.message)}`,
    );
  }

  // Session is set. Check whether this user has claimed a handle yet.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${origin}/login?error=session_missing`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    return NextResponse.redirect(`${origin}/signup/handle`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
