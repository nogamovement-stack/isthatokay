"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Props {
  postId: string;
  signedIn: boolean;
}

export default function CommentForm({ postId, signedIn }: Props) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!signedIn) {
    return (
      <div className="bg-[color:var(--soft)] border border-[color:var(--border)] rounded-2xl p-5 text-[14px] text-[color:var(--foreground)]/82">
        <Link
          href="/login"
          className="text-[color:var(--accent)] underline underline-offset-4 hover:no-underline"
        >
          Sign in
        </Link>{" "}
        to comment.
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = body.trim();
    if (!text || text.length < 1 || text.length > 5000) {
      setError("Body must be 1–5000 characters.");
      return;
    }
    setBusy(true);
    setError(null);

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post_id: postId, body: text }),
      });
      const data = (await res.json()) as
        | { ok: true; id: string }
        | { ok: false; reason: string; detail?: string };
      if (data.ok) {
        setBody("");
        router.refresh();
      } else {
        setError(data.detail || data.reason || "Comment failed to post.");
      }
    } catch (err) {
      setError(`Network error: ${(err as Error).message}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[color:var(--soft)] border border-[color:var(--border)] rounded-2xl p-4 md:p-5"
    >
      <label
        htmlFor="comment-body"
        className="text-[11px] tracking-[0.22em] uppercase text-[color:var(--muted)]"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        Add a comment
      </label>
      <textarea
        id="comment-body"
        value={body}
        onChange={(e) => {
          setBody(e.target.value);
          if (error) setError(null);
        }}
        rows={4}
        maxLength={5000}
        disabled={busy}
        placeholder="What lands? Or what doesn't?"
        className="mt-3 w-full bg-[color:var(--background)] border border-[color:var(--border)] rounded-xl px-4 py-3 text-[14px] md:text-[15px] text-[color:var(--foreground)] placeholder:text-[color:var(--muted)] focus:outline-none focus:border-[color:var(--accent)] transition-colors resize-y disabled:opacity-60"
      />
      <div className="mt-3 flex items-center justify-between gap-3">
        <span
          className="text-[10px] tracking-[0.18em] uppercase text-[color:var(--muted)]"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {body.length}/5000
        </span>
        <button
          type="submit"
          disabled={busy || body.trim().length === 0}
          className="px-5 py-2.5 rounded-full bg-[color:var(--foreground)] text-[color:var(--background)] text-[11px] tracking-[0.22em] uppercase font-medium hover:bg-[color:var(--accent)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {busy ? "Posting…" : "Post comment"}
        </button>
      </div>
      {error && (
        <div className="mt-3 text-[13px] text-[color:var(--danger)]">{error}</div>
      )}
    </form>
  );
}
