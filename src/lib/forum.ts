import { createClient } from "@/lib/supabase/server";
import type {
  PostRow,
  CommentRow,
  SubRow,
  ProfileRow,
} from "@/lib/supabase/types";

/**
 * Data fetchers for the forum. All run server-side, using cookies for auth.
 * RLS handles visibility — these helpers don't filter for moderation_status
 * because the policies do.
 */

export interface SubMeta extends SubRow {}

export interface PostWithAuthor extends PostRow {
  author_username: string;
  author_display: string;
}

export interface CommentWithAuthor extends CommentRow {
  author_username: string;
  author_display: string;
}

const ACCENT_BY_SUB: Record<string, "ok" | "warning" | "danger" | "accent"> = {
  standards: "accent",
  help: "ok",
  news: "warning",
  robots: "danger",
};

export function accentForSub(slug: string) {
  return ACCENT_BY_SUB[slug] ?? "accent";
}

export async function getSub(slug: string): Promise<SubMeta | null> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = (await (supabase as any)
    .from("subs")
    .select("*")
    .eq("slug", slug)
    .maybeSingle()) as { data: SubRow | null };
  return data;
}

export async function listSubs(): Promise<SubMeta[]> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = (await (supabase as any)
    .from("subs")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })) as { data: SubRow[] | null };
  return data || [];
}

export async function listPosts(
  slug: string,
  opts: { sort?: "hot" | "new"; limit?: number } = {},
): Promise<PostWithAuthor[]> {
  const supabase = await createClient();
  const sort = opts.sort ?? "hot";
  const limit = opts.limit ?? 50;

  const orderColumn = sort === "hot" ? "hot_score" : "created_at";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = (await (supabase as any)
    .from("posts")
    .select(
      "*, profiles!posts_user_id_fkey(username, username_display)",
    )
    .eq("sub_slug", slug)
    .is("deleted_at", null)
    .eq("moderation_status", "approved")
    .order(orderColumn, { ascending: false })
    .limit(limit)) as {
    data:
      | (PostRow & {
          profiles: { username: string; username_display: string } | null;
        })[]
      | null;
    error: { message: string } | null;
  };

  if (error || !data) return [];

  return data.map((row) => ({
    ...row,
    author_username: row.profiles?.username ?? "unknown",
    author_display: row.profiles?.username_display ?? "unknown",
  }));
}

export async function getPost(id: string): Promise<PostWithAuthor | null> {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = (await (supabase as any)
    .from("posts")
    .select(
      "*, profiles!posts_user_id_fkey(username, username_display)",
    )
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle()) as {
    data:
      | (PostRow & {
          profiles: { username: string; username_display: string } | null;
        })
      | null;
  };

  if (!data) return null;
  return {
    ...data,
    author_username: data.profiles?.username ?? "unknown",
    author_display: data.profiles?.username_display ?? "unknown",
  };
}

export async function listComments(postId: string): Promise<CommentWithAuthor[]> {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = (await (supabase as any)
    .from("comments")
    .select(
      "*, profiles!comments_user_id_fkey(username, username_display)",
    )
    .eq("post_id", postId)
    .is("deleted_at", null)
    .eq("moderation_status", "approved")
    .order("created_at", { ascending: true })) as {
    data:
      | (CommentRow & {
          profiles: { username: string; username_display: string } | null;
        })[]
      | null;
  };

  if (!data) return [];
  return data.map((row) => ({
    ...row,
    author_username: row.profiles?.username ?? "unknown",
    author_display: row.profiles?.username_display ?? "unknown",
  }));
}

export async function getMyVotes(
  targetType: "post" | "comment",
  targetIds: string[],
): Promise<Record<string, 1 | -1>> {
  if (targetIds.length === 0) return {};
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return {};

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = (await (supabase as any)
    .from("votes")
    .select("target_id, vote")
    .eq("user_id", user.id)
    .eq("target_type", targetType)
    .in("target_id", targetIds)) as {
    data: { target_id: string; vote: 1 | -1 }[] | null;
  };

  const out: Record<string, 1 | -1> = {};
  (data || []).forEach((row) => {
    out[row.target_id] = row.vote;
  });
  return out;
}

export async function getMyProfile(): Promise<ProfileRow | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = (await (supabase as any)
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle()) as { data: ProfileRow | null };

  return data;
}

export function formatRelativeTime(iso: string): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diffMs = now - then;
  const sec = Math.floor(diffMs / 1000);
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d`;
  const wk = Math.floor(day / 7);
  if (wk < 4) return `${wk}w`;
  const mo = Math.floor(day / 30);
  if (mo < 12) return `${mo}mo`;
  const yr = Math.floor(day / 365);
  return `${yr}y`;
}
