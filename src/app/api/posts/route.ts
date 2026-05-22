import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

/**
 * Create a post.
 *
 * Auth: required. RLS on the posts table only allows clients to insert
 * `moderation_status='needs_review'` rows; this route uses the service-role
 * client to insert as `approved` directly. v1 has no AI moderation — that's
 * the next thing to wire in. TODO: hook Gemini classifier before insert.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ ok: false, reason: "not_signed_in" }, { status: 401 });
  }

  // Verify the user has claimed a handle. Without that, the FK to profiles
  // would fail anyway, but a clearer 422 is friendlier.
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
    sub_slug?: string;
    post_type?: "text" | "link" | "question";
    title?: string;
    body?: string;
    link_url?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, reason: "bad_json" }, { status: 400 });
  }

  const sub_slug = (body.sub_slug || "").trim();
  const post_type = body.post_type || "text";
  const title = (body.title || "").trim();
  const postBody = body.body?.trim() || null;
  const link_url = body.link_url?.trim() || null;

  if (!sub_slug || !/^[a-z0-9-]{2,30}$/.test(sub_slug)) {
    return NextResponse.json({ ok: false, reason: "bad_sub_slug" }, { status: 400 });
  }
  if (title.length < 6 || title.length > 280) {
    return NextResponse.json({ ok: false, reason: "title_length" }, { status: 400 });
  }
  if (!["text", "link", "question"].includes(post_type)) {
    return NextResponse.json({ ok: false, reason: "bad_post_type" }, { status: 400 });
  }
  if (post_type === "link") {
    if (!link_url || !/^https?:\/\//.test(link_url)) {
      return NextResponse.json({ ok: false, reason: "bad_link_url" }, { status: 400 });
    }
  } else {
    if (!postBody || postBody.length < 1 || postBody.length > 10000) {
      return NextResponse.json({ ok: false, reason: "body_length" }, { status: 400 });
    }
  }

  // TODO Phase 2.5: run Gemini moderation classifier here. For now,
  // every post lands as `approved`.
  const moderation_status = "approved" as const;

  const service = createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: inserted, error } = (await (service as any)
    .from("posts")
    .insert({
      sub_slug,
      user_id: user.id,
      post_type,
      title,
      body: post_type === "link" ? null : postBody,
      link_url: post_type === "link" ? link_url : null,
      moderation_status,
    })
    .select("id, sub_slug")
    .single()) as {
    data: { id: string; sub_slug: string } | null;
    error: { message: string } | null;
  };

  if (error || !inserted) {
    console.error("[api/posts] insert failed:", error);
    return NextResponse.json(
      { ok: false, reason: "insert_failed", detail: error?.message },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    id: inserted.id,
    sub_slug: inserted.sub_slug,
  });
}
