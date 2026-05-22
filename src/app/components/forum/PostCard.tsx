import Link from "next/link";
import VoteWidget from "./VoteWidget";
import type { PostWithAuthor } from "@/lib/forum";
import { formatRelativeTime, accentForSub } from "@/lib/forum";

type Vote = -1 | 0 | 1;

const ACCENT_VAR: Record<ReturnType<typeof accentForSub>, string> = {
  ok: "var(--ok)",
  warning: "var(--warning)",
  danger: "var(--danger)",
  accent: "var(--accent)",
};

export default function PostCard({
  post,
  signedIn,
  myVote,
  myKarma,
  showSub = false,
}: {
  post: PostWithAuthor;
  signedIn: boolean;
  myVote: Vote;
  myKarma: number;
  showSub?: boolean;
}) {
  const accent = ACCENT_VAR[accentForSub(post.sub_slug)];

  return (
    <article className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--soft)] p-5 md:p-6 flex gap-4 hover:border-[color:var(--foreground)]/40 transition-colors">
      <VoteWidget
        targetType="post"
        targetId={post.id}
        initialUpvotes={post.upvotes}
        initialDownvotes={post.downvotes}
        initialMyVote={myVote}
        signedIn={signedIn}
        myKarma={myKarma}
        size="md"
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-2">
          {showSub && (
            <Link
              href={`/c/${post.sub_slug}`}
              className="text-[10px] tracking-[0.18em] uppercase hover:underline underline-offset-2"
              style={{ fontFamily: "var(--font-mono)", color: accent }}
            >
              /c/{post.sub_slug}
            </Link>
          )}
          {showSub && (
            <span className="text-[color:var(--muted)] text-[10px]" aria-hidden>
              ·
            </span>
          )}
          <span
            className="text-[10px] tracking-[0.18em] uppercase text-[color:var(--muted)]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {post.author_display}
          </span>
          <span className="text-[color:var(--muted)] text-[10px]" aria-hidden>
            ·
          </span>
          <span
            className="text-[10px] tracking-[0.18em] uppercase text-[color:var(--muted)]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {formatRelativeTime(post.created_at)}
          </span>
          {post.post_type !== "text" && (
            <>
              <span className="text-[color:var(--muted)] text-[10px]" aria-hidden>
                ·
              </span>
              <span
                className="text-[10px] tracking-[0.18em] uppercase text-[color:var(--muted)]"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {post.post_type === "link" ? "Link" : "Question"}
              </span>
            </>
          )}
        </div>

        <Link
          href={`/c/${post.sub_slug}/post/${post.id}`}
          className="block group"
        >
          <h3
            className="font-serif italic text-[20px] md:text-[24px] leading-[1.15] tracking-[-0.01em] text-[color:var(--foreground)] group-hover:text-[color:var(--accent)] transition-colors"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {post.title}
          </h3>
        </Link>

        {post.post_type === "link" && post.link_url && (
          <a
            href={post.link_url}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="mt-2 inline-flex items-center gap-1.5 text-[13px] text-[color:var(--muted)] hover:text-[color:var(--accent)] transition-colors break-all"
          >
            <span aria-hidden>↗</span>
            {truncateUrl(post.link_url)}
          </a>
        )}

        {post.body && (
          <p className="mt-3 text-[14px] leading-[1.55] text-[color:var(--foreground)]/82 line-clamp-3">
            {post.body}
          </p>
        )}

        <div className="mt-4 flex items-center gap-4">
          <Link
            href={`/c/${post.sub_slug}/post/${post.id}`}
            className="text-[11px] tracking-[0.18em] uppercase text-[color:var(--muted)] hover:text-[color:var(--foreground)] transition-colors"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {post.comment_count === 0
              ? "Comment"
              : post.comment_count === 1
                ? "1 comment"
                : `${post.comment_count} comments`}
          </Link>
        </div>
      </div>
    </article>
  );
}

function truncateUrl(url: string): string {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    const path = u.pathname.length > 24 ? u.pathname.slice(0, 24) + "…" : u.pathname;
    return host + path;
  } catch {
    return url.length > 60 ? url.slice(0, 60) + "…" : url;
  }
}
