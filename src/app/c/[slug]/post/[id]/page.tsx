import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "../../../../components/SiteHeader";
import SiteFooter from "../../../../components/SiteFooter";
import VoteWidget from "../../../../components/forum/VoteWidget";
import CommentList from "../../../../components/forum/CommentList";
import CommentForm from "../../../../components/forum/CommentForm";
import {
  getPost,
  getSub,
  listComments,
  getMyVotes,
  getMyProfile,
  accentForSub,
  formatRelativeTime,
} from "@/lib/forum";
import type { Metadata } from "next";

const ACCENT_VAR = {
  ok: "var(--ok)",
  warning: "var(--warning)",
  danger: "var(--danger)",
  accent: "var(--accent)",
} as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const post = await getPost(id);
  if (!post) return { title: "Not found" };
  return {
    title: post.title,
    description: post.body?.slice(0, 200) ?? undefined,
  };
}

type Vote = -1 | 0 | 1;

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = await params;

  const [sub, post, profile] = await Promise.all([
    getSub(slug),
    getPost(id),
    getMyProfile(),
  ]);

  if (!sub || !post || post.sub_slug !== slug) {
    notFound();
  }

  const comments = await listComments(post.id);

  // Combine post + all comment ids into a single vote lookup, then split.
  const [postVotes, commentVotes] = await Promise.all([
    getMyVotes("post", [post.id]),
    getMyVotes(
      "comment",
      comments.map((c) => c.id),
    ),
  ]);

  const signedIn = !!profile;
  const hasHandle = !!profile;
  const myKarma = profile?.karma ?? 0;
  const accent = ACCENT_VAR[accentForSub(slug)];
  const myPostVote: Vote = (postVotes[post.id] ?? 0) as Vote;

  return (
    <>
      <SiteHeader />
      <main className="flex-1 px-5 md:px-8 py-10 md:py-14">
        <div className="mx-auto max-w-3xl">
          <Link
            href={`/c/${slug}`}
            className="text-[11px] tracking-[0.22em] uppercase text-[color:var(--muted)] hover:text-[color:var(--accent)] transition-colors"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            ← /c/{slug}
          </Link>

          {/* Post */}
          <article className="mt-6 bg-[color:var(--soft)] border border-[color:var(--border)] rounded-2xl p-6 md:p-8 flex gap-5">
            <VoteWidget
              targetType="post"
              targetId={post.id}
              initialUpvotes={post.upvotes}
              initialDownvotes={post.downvotes}
              initialMyVote={myPostVote}
              signedIn={signedIn}
              myKarma={myKarma}
              size="md"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-3">
                <span
                  className="text-[10px] tracking-[0.18em] uppercase"
                  style={{ fontFamily: "var(--font-mono)", color: accent }}
                >
                  /c/{post.sub_slug}
                </span>
                <span className="text-[color:var(--muted)] text-[10px]" aria-hidden>
                  ·
                </span>
                <span
                  className="text-[10px] tracking-[0.18em] uppercase text-[color:var(--foreground)]"
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
                  {post.edited_at ? " · edited" : ""}
                </span>
              </div>

              <h1
                className="font-serif italic text-[color:var(--foreground)] leading-[1.1] tracking-[-0.01em]"
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "clamp(28px, 4.5vw, 44px)",
                }}
              >
                {post.title}
              </h1>

              {post.post_type === "link" && post.link_url && (
                <a
                  href={post.link_url}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="mt-4 inline-flex items-center gap-1.5 text-[14px] text-[color:var(--accent)] hover:underline underline-offset-4 break-all"
                >
                  <span aria-hidden>↗</span>
                  {post.link_url}
                </a>
              )}

              {post.body && (
                <div className="mt-5 text-[15px] md:text-[16px] leading-[1.65] text-[color:var(--foreground)]/90 whitespace-pre-wrap break-words">
                  {post.body}
                </div>
              )}
            </div>
          </article>

          {/* Comment form */}
          <div className="mt-8">
            {hasHandle ? (
              <CommentForm postId={post.id} signedIn={true} />
            ) : signedIn ? (
              <div className="bg-[color:var(--soft)] border border-[color:var(--border)] rounded-2xl p-5 text-[14px] text-[color:var(--foreground)]/82">
                <Link
                  href="/signup/handle"
                  className="text-[color:var(--accent)] underline underline-offset-4 hover:no-underline"
                >
                  Pick a handle
                </Link>{" "}
                to comment.
              </div>
            ) : (
              <CommentForm postId={post.id} signedIn={false} />
            )}
          </div>

          {/* Comments */}
          <div className="mt-10">
            <div
              className="text-[11px] tracking-[0.22em] uppercase text-[color:var(--muted)] mb-5"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {comments.length === 0
                ? "No comments"
                : comments.length === 1
                  ? "1 comment"
                  : `${comments.length} comments`}
            </div>
            <CommentList
              comments={comments}
              myVotes={commentVotes as Record<string, Vote>}
              signedIn={signedIn}
              myKarma={myKarma}
            />
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
