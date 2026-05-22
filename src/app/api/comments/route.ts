import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

/**
 * Create a comment. One level deep only (enforced by enforce_comment_depth
 * trigger in migration 001). Service-role insert as `approved` for v1;
 * Gemini moderation classifier wires in next pass.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ ok: false, reason: "not_signed_in" }, { status: 401 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = (await (supabase as any)
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .maybeSingle()) as { data: { username: string } | null };
  if (!profile) {
    return NextResponse.json({ ok: false, reason: "no_handle" }, { status: 422 });
  }

  let body: {
    post_id?: string;
    parent_id?: string | null;
    body?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, reason: "bad_json" }, { status: 400 });
  }

  const post_id = (body.post_id || "").trim();
  const parent_id = body.parent_id || null;
  const commentBody = (body.body || "").trim();

  if (!post_id) {
    return NextResponse.json({ ok: false, reason: "missing_post_id" }, { status: 400 });
  }
  if (!commentBody || commentBody.length < 1 || commentBody.length > 5000) {
    return NextResponse.json({ ok: false, reason: "body_length" }, { status: 400 });
  }

  // TODO Phase 2.5: Gemini moderation classifier here.
  const moderation_status = "approved" as const;

  const service = createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: inserted, error } = (await (service as any)
    .from("comments")
    .insert({
      post_id,
      parent_id,
      user_id: user.id,
      body: commentBody,
      moderation_status,
    })
    .select("id")
    .single()) as {
    data: { id: string } | null;
    error: { message: string } | null;
  };

  if (error || !inserted) {
    console.error("[api/comments] insert failed:", error);
    return NextResponse.json(
      { ok: false, reason: "insert_failed", detail: error?.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, id: inserted.id });
}
