"use client";

import { useState } from "react";

type Vote = -1 | 0 | 1;

interface Props {
  targetType: "post" | "comment";
  targetId: string;
  initialUpvotes: number;
  initialDownvotes: number;
  initialMyVote: Vote;
  signedIn: boolean;
  myKarma: number;
  size?: "sm" | "md";
}

const DOWNVOTE_KARMA_GATE = 50;

export default function VoteWidget({
  targetType,
  targetId,
  initialUpvotes,
  initialDownvotes,
  initialMyVote,
  signedIn,
  myKarma,
  size = "md",
}: Props) {
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [downvotes, setDownvotes] = useState(initialDownvotes);
  const [myVote, setMyVote] = useState<Vote>(initialMyVote);
  const [busy, setBusy] = useState(false);

  // Score shown is up - down. Downvotes are only visible to the voter
  // (Reddit-style — author doesn't see a counter), so we always show net.
  const score = upvotes - downvotes;

  const canDownvote = signedIn && myKarma >= DOWNVOTE_KARMA_GATE;

  async function cast(next: Vote) {
    if (!signedIn || busy) return;
    if (next === -1 && !canDownvote) return;

    // If user clicks the same direction, toggle it off.
    const finalVote: Vote = next === myVote ? 0 : next;

    // Optimistic UI
    const prevState = { upvotes, downvotes, myVote };
    setBusy(true);

    let newUp = upvotes;
    let newDown = downvotes;
    if (myVote === 1) newUp -= 1;
    if (myVote === -1) newDown -= 1;
    if (finalVote === 1) newUp += 1;
    if (finalVote === -1) newDown += 1;
    setUpvotes(newUp);
    setDownvotes(newDown);
    setMyVote(finalVote);

    try {
      const res = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target_type: targetType,
          target_id: targetId,
          vote: finalVote,
        }),
      });
      const data = (await res.json()) as
        | { ok: true; upvotes: number; downvotes: number; your_vote: number }
        | { ok: false; reason: string };
      if (data.ok) {
        // Reconcile with server-authoritative counts.
        setUpvotes(data.upvotes);
        setDownvotes(data.downvotes);
        setMyVote((data.your_vote as Vote) ?? 0);
      } else {
        // Revert.
        setUpvotes(prevState.upvotes);
        setDownvotes(prevState.downvotes);
        setMyVote(prevState.myVote);
        if (data.reason !== "cant_vote_own") {
          console.error("[VoteWidget] vote rejected:", data.reason);
        }
      }
    } catch (err) {
      // Revert.
      setUpvotes(prevState.upvotes);
      setDownvotes(prevState.downvotes);
      setMyVote(prevState.myVote);
      console.error("[VoteWidget] network error:", err);
    } finally {
      setBusy(false);
    }
  }

  const isSm = size === "sm";
  const arrowSize = isSm ? 14 : 18;
  const scoreText = isSm ? "text-[12px]" : "text-[14px]";

  return (
    <div className="flex flex-col items-center gap-1 shrink-0">
      <button
        type="button"
        disabled={!signedIn || busy}
        onClick={() => cast(1)}
        aria-label="Upvote"
        title={signedIn ? "Upvote" : "Sign in to vote"}
        className={[
          "p-1 rounded transition-colors",
          myVote === 1
            ? "text-[color:var(--accent)]"
            : "text-[color:var(--muted)] hover:text-[color:var(--foreground)]",
          !signedIn || busy ? "cursor-not-allowed opacity-60" : "cursor-pointer",
        ].join(" ")}
      >
        <Arrow direction="up" size={arrowSize} filled={myVote === 1} />
      </button>

      <span
        className={[
          scoreText,
          "tabular-nums font-medium",
          myVote === 1
            ? "text-[color:var(--accent)]"
            : myVote === -1
              ? "text-[color:var(--danger)]"
              : "text-[color:var(--foreground)]",
        ].join(" ")}
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {score}
      </span>

      <button
        type="button"
        disabled={!canDownvote || busy}
        onClick={() => cast(-1)}
        aria-label="Downvote"
        title={
          !signedIn
            ? "Sign in to vote"
            : !canDownvote
              ? `Earn ${DOWNVOTE_KARMA_GATE} karma to unlock downvotes`
              : "Downvote"
        }
        className={[
          "p-1 rounded transition-colors",
          myVote === -1
            ? "text-[color:var(--danger)]"
            : "text-[color:var(--muted)] hover:text-[color:var(--foreground)]",
          !canDownvote || busy ? "cursor-not-allowed opacity-60" : "cursor-pointer",
        ].join(" ")}
      >
        <Arrow direction="down" size={arrowSize} filled={myVote === -1} />
      </button>
    </div>
  );
}

function Arrow({
  direction,
  size,
  filled,
}: {
  direction: "up" | "down";
  size: number;
  filled: boolean;
}) {
  const points =
    direction === "up" ? "12,4 22,18 2,18" : "12,20 22,6 2,6";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={2}
      strokeLinejoin="round"
      aria-hidden
    >
      <polygon points={points} />
    </svg>
  );
}
