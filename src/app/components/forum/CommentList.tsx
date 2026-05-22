import VoteWidget from "./VoteWidget";
import type { CommentWithAuthor } from "@/lib/forum";
import { formatRelativeTime } from "@/lib/forum";

type Vote = -1 | 0 | 1;

interface Props {
  comments: CommentWithAuthor[];
  myVotes: Record<string, Vote>;
  signedIn: boolean;
  myKarma: number;
}

export default function CommentList({
  comments,
  myVotes,
  signedIn,
  myKarma,
}: Props) {
  if (comments.length === 0) {
    return (
      <div className="text-[14px] text-[color:var(--muted)] italic py-6">
        No comments yet. Be the first.
      </div>
    );
  }

  // Group: top-level first, replies under their parents.
  const topLevel = comments.filter((c) => !c.parent_id);
  const replies = comments.filter((c) => c.parent_id);
  const repliesByParent = new Map<string, CommentWithAuthor[]>();
  for (const r of replies) {
    if (!r.parent_id) continue;
    const arr = repliesByParent.get(r.parent_id) ?? [];
    arr.push(r);
    repliesByParent.set(r.parent_id, arr);
  }

  return (
    <ul className="space-y-5">
      {topLevel.map((c) => {
        const childReplies = repliesByParent.get(c.id) ?? [];
        return (
          <li key={c.id}>
            <CommentRow
              comment={c}
              myVote={myVotes[c.id] ?? 0}
              signedIn={signedIn}
              myKarma={myKarma}
            />
            {childReplies.length > 0 && (
              <ul className="mt-4 pl-6 md:pl-8 border-l-2 border-[color:var(--border)] space-y-4">
                {childReplies.map((r) => (
                  <li key={r.id}>
                    <CommentRow
                      comment={r}
                      myVote={myVotes[r.id] ?? 0}
                      signedIn={signedIn}
                      myKarma={myKarma}
                      isReply
                    />
                  </li>
                ))}
              </ul>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function CommentRow({
  comment,
  myVote,
  signedIn,
  myKarma,
  isReply = false,
}: {
  comment: CommentWithAuthor;
  myVote: Vote;
  signedIn: boolean;
  myKarma: number;
  isReply?: boolean;
}) {
  return (
    <article className="flex gap-3">
      <VoteWidget
        targetType="comment"
        targetId={comment.id}
        initialUpvotes={comment.upvotes}
        initialDownvotes={comment.downvotes}
        initialMyVote={myVote}
        signedIn={signedIn}
        myKarma={myKarma}
        size="sm"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="text-[11px] tracking-[0.18em] uppercase text-[color:var(--foreground)]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {comment.author_display}
          </span>
          <span className="text-[color:var(--muted)] text-[10px]" aria-hidden>
            ·
          </span>
          <span
            className="text-[11px] tracking-[0.18em] uppercase text-[color:var(--muted)]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {formatRelativeTime(comment.created_at)}
            {comment.edited_at ? " · edited" : ""}
          </span>
          {isReply && (
            <span
              className="text-[10px] tracking-[0.18em] uppercase text-[color:var(--muted)]"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              · reply
            </span>
          )}
        </div>
        <p className="mt-2 text-[14px] md:text-[15px] leading-[1.6] text-[color:var(--foreground)] whitespace-pre-wrap break-words">
          {comment.body}
        </p>
      </div>
    </article>
  );
}
