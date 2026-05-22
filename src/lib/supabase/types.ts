/**
 * Typed Database interface matching supabase/migrations/001_forum_schema.sql.
 *
 * Manually maintained for v1. When the schema grows enough that drift becomes
 * a real risk, swap to generated types via `supabase gen types typescript`.
 */

export type Role = "member" | "mod" | "admin";
export type PostType = "text" | "link" | "question";
export type ModerationStatus = "approved" | "needs_review" | "removed";
export type ReportTargetType = "post" | "comment";
export type ReportStatus = "open" | "dismissed" | "removed";

export interface ProfileRow {
  id: string;
  username: string;
  username_display: string;
  bio: string | null;
  karma: number;
  role: Role;
  banned_at: string | null;
  created_at: string;
}

export interface SubRow {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface PostRow {
  id: string;
  sub_slug: string;
  user_id: string;
  post_type: PostType;
  title: string;
  body: string | null;
  link_url: string | null;
  upvotes: number;
  downvotes: number;
  comment_count: number;
  hot_score: number;
  moderation_status: ModerationStatus;
  moderation_reason: string | null;
  is_locked: boolean;
  deleted_at: string | null;
  edited_at: string | null;
  created_at: string;
}

export interface CommentRow {
  id: string;
  post_id: string;
  parent_id: string | null;
  user_id: string;
  body: string;
  upvotes: number;
  downvotes: number;
  moderation_status: ModerationStatus;
  moderation_reason: string | null;
  deleted_at: string | null;
  edited_at: string | null;
  created_at: string;
}

export interface VoteRow {
  user_id: string;
  target_type: ReportTargetType;
  target_id: string;
  vote: 1 | -1;
  created_at: string;
}

export interface ReportRow {
  id: string;
  reporter_id: string;
  target_type: ReportTargetType;
  target_id: string;
  reason: string;
  status: ReportStatus;
  mod_note: string | null;
  resolved_by: string | null;
  resolved_at: string | null;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: Pick<ProfileRow, "id" | "username" | "username_display"> &
          Partial<Omit<ProfileRow, "id" | "username" | "username_display">>;
        Update: Partial<Omit<ProfileRow, "id" | "created_at">>;
      };
      subs: {
        Row: SubRow;
        Insert: Pick<SubRow, "slug" | "name" | "tagline" | "description"> &
          Partial<Omit<SubRow, "slug" | "name" | "tagline" | "description">>;
        Update: Partial<Omit<SubRow, "slug" | "created_at">>;
      };
      posts: {
        Row: PostRow;
        Insert: Pick<
          PostRow,
          "sub_slug" | "user_id" | "post_type" | "title"
        > &
          Partial<Omit<PostRow, "id" | "sub_slug" | "user_id" | "post_type" | "title" | "created_at">>;
        Update: Partial<
          Omit<PostRow, "id" | "sub_slug" | "user_id" | "created_at">
        >;
      };
      comments: {
        Row: CommentRow;
        Insert: Pick<CommentRow, "post_id" | "user_id" | "body"> &
          Partial<Omit<CommentRow, "id" | "post_id" | "user_id" | "body" | "created_at">>;
        Update: Partial<Omit<CommentRow, "id" | "post_id" | "user_id" | "created_at">>;
      };
      votes: {
        Row: VoteRow;
        Insert: VoteRow;
        Update: Partial<VoteRow>;
      };
      reports: {
        Row: ReportRow;
        Insert: Pick<ReportRow, "reporter_id" | "target_type" | "target_id" | "reason"> &
          Partial<Omit<ReportRow, "id" | "reporter_id" | "target_type" | "target_id" | "reason" | "created_at">>;
        Update: Partial<Omit<ReportRow, "id" | "reporter_id" | "created_at">>;
      };
    };
    Functions: {
      handle_available: {
        Args: { p_username: string };
        Returns: boolean;
      };
      claim_handle: {
        Args: { p_username: string };
        Returns:
          | { ok: true; username: string }
          | { ok: false; reason: string };
      };
      toggle_vote: {
        Args: {
          p_target_type: ReportTargetType;
          p_target_id: string;
          p_vote: number;
        };
        Returns:
          | { ok: true; upvotes: number; downvotes: number; your_vote: number }
          | { ok: false; reason: string };
      };
    };
  };
}
