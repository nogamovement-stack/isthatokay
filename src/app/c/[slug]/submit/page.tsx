"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import SiteHeader from "../../../components/SiteHeader";
import SiteFooter from "../../../components/SiteFooter";
import { createClient } from "@/lib/supabase/client";

type PostType = "text" | "link" | "question";
type AuthState =
  | { status: "loading" }
  | { status: "signed-out" }
  | { status: "no-handle" }
  | { status: "ready"; username: string };

export default function SubmitPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const slug = params?.slug ?? "";

  const [auth, setAuth] = useState<AuthState>({ status: "loading" });
  const [postType, setPostType] = useState<PostType>("text");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          setAuth({ status: "signed-out" });
          return;
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: profile } = (await (supabase as any)
          .from("profiles")
          .select("username_display")
          .eq("id", user.id)
          .maybeSingle()) as { data: { username_display: string } | null };
        if (!profile) {
          setAuth({ status: "no-handle" });
        } else {
          setAuth({ status: "ready", username: profile.username_display });
        }
      } catch {
        setAuth({ status: "signed-out" });
      }
    })();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError(null);

    const trimmedTitle = title.trim();
    if (trimmedTitle.length < 6 || trimmedTitle.length > 280) {
      setError("Title must be 6 to 280 characters.");
      return;
    }

    if (postType === "link") {
      if (!/^https?:\/\//.test(linkUrl)) {
        setError("Link must start with http:// or https://");
        return;
      }
    } else {
      if (body.trim().length < 1 || body.trim().length > 10000) {
        setError("Body must be 1 to 10,000 characters.");
        return;
      }
    }

    setBusy(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sub_slug: slug,
          post_type: postType,
          title: trimmedTitle,
          body: postType === "link" ? undefined : body.trim(),
          link_url: postType === "link" ? linkUrl.trim() : undefined,
        }),
      });
      const data = (await res.json()) as
        | { ok: true; id: string; sub_slug: string }
        | { ok: false; reason: string; detail?: string };
      if (data.ok) {
        router.push(`/c/${data.sub_slug}/post/${data.id}`);
      } else {
        setError(data.detail || data.reason || "Post failed.");
        setBusy(false);
      }
    } catch (err) {
      setError(`Network error: ${(err as Error).message}`);
      setBusy(false);
    }
  }

  if (auth.status === "loading") {
    return (
      <>
        <SiteHeader />
        <main className="flex-1 px-5 md:px-8 py-20">
          <div className="mx-auto max-w-2xl text-center text-[color:var(--muted)]">
            Loading…
          </div>
        </main>
        <SiteFooter />
      </>
    );
  }

  if (auth.status === "signed-out") {
    return (
      <>
        <SiteHeader />
        <main className="flex-1 px-5 md:px-8 py-20">
          <div className="mx-auto max-w-2xl">
            <h1
              className="font-serif italic text-[color:var(--foreground)] leading-[1.05]"
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "clamp(28px, 4vw, 44px)",
              }}
            >
              Sign in to post.
            </h1>
            <p className="mt-4 text-[color:var(--muted)]">
              You need a handle to post in <code>/c/{slug}</code>.
            </p>
            <Link
              href="/login"
              className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[color:var(--foreground)] text-[color:var(--background)] text-[11px] tracking-[0.22em] uppercase font-medium hover:bg-[color:var(--accent)] transition-colors"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Sign in
              <span aria-hidden>→</span>
            </Link>
          </div>
        </main>
        <SiteFooter />
      </>
    );
  }

  if (auth.status === "no-handle") {
    return (
      <>
        <SiteHeader />
        <main className="flex-1 px-5 md:px-8 py-20">
          <div className="mx-auto max-w-2xl">
            <h1
              className="font-serif italic text-[color:var(--foreground)] leading-[1.05]"
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "clamp(28px, 4vw, 44px)",
              }}
            >
              Pick a handle first.
            </h1>
            <Link
              href="/signup/handle"
              className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[color:var(--foreground)] text-[color:var(--background)] text-[11px] tracking-[0.22em] uppercase font-medium hover:bg-[color:var(--accent)] transition-colors"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Pick a handle
              <span aria-hidden>→</span>
            </Link>
          </div>
        </main>
        <SiteFooter />
      </>
    );
  }

  return (
    <>
      <SiteHeader />
      <main className="flex-1 px-5 md:px-8 py-12 md:py-16">
        <div className="mx-auto max-w-2xl">
          <Link
            href={`/c/${slug}`}
            className="text-[11px] tracking-[0.22em] uppercase text-[color:var(--muted)] hover:text-[color:var(--accent)] transition-colors"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            ← /c/{slug}
          </Link>

          <h1
            className="mt-4 font-serif italic text-[color:var(--foreground)] leading-[1.05]"
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(32px, 5vw, 56px)",
            }}
          >
            New post.
          </h1>

          <form onSubmit={handleSubmit} className="mt-10 space-y-6">
            {/* Type toggle */}
            <div>
              <label
                className="text-[11px] tracking-[0.22em] uppercase text-[color:var(--muted)] block mb-3"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Type
              </label>
              <div className="flex gap-2">
                {(["text", "link", "question"] as PostType[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setPostType(t)}
                    className={[
                      "px-4 py-2 rounded-full text-[11px] tracking-[0.22em] uppercase transition-colors",
                      postType === t
                        ? "bg-[color:var(--foreground)] text-[color:var(--background)]"
                        : "border border-[color:var(--border)] text-[color:var(--muted)] hover:text-[color:var(--foreground)]",
                    ].join(" ")}
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label
                htmlFor="title"
                className="text-[11px] tracking-[0.22em] uppercase text-[color:var(--muted)] block mb-3"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {postType === "question" ? "Your question" : "Title"}
              </label>
              <input
                id="title"
                type="text"
                required
                disabled={busy}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={280}
                placeholder={
                  postType === "question"
                    ? "Is it wrong that…"
                    : postType === "link"
                      ? "What you want to say about this link"
                      : "Title of your post"
                }
                className="w-full bg-[color:var(--background)] border border-[color:var(--border)] rounded-xl px-4 py-3 text-[15px] md:text-[16px] text-[color:var(--foreground)] placeholder:text-[color:var(--muted)] focus:outline-none focus:border-[color:var(--accent)] transition-colors disabled:opacity-60"
              />
              <div
                className="mt-1 text-[10px] tracking-[0.18em] uppercase text-[color:var(--muted)]"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {title.length}/280
              </div>
            </div>

            {/* Body or link */}
            {postType === "link" ? (
              <div>
                <label
                  htmlFor="link"
                  className="text-[11px] tracking-[0.22em] uppercase text-[color:var(--muted)] block mb-3"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  URL
                </label>
                <input
                  id="link"
                  type="url"
                  required
                  disabled={busy}
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://…"
                  className="w-full bg-[color:var(--background)] border border-[color:var(--border)] rounded-xl px-4 py-3 text-[14px] text-[color:var(--foreground)] placeholder:text-[color:var(--muted)] focus:outline-none focus:border-[color:var(--accent)] transition-colors disabled:opacity-60"
                />
              </div>
            ) : (
              <div>
                <label
                  htmlFor="body"
                  className="text-[11px] tracking-[0.22em] uppercase text-[color:var(--muted)] block mb-3"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  Body
                </label>
                <textarea
                  id="body"
                  required
                  disabled={busy}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={8}
                  maxLength={10000}
                  placeholder={
                    postType === "question"
                      ? "Add context. What's the situation?"
                      : "What's on your mind?"
                  }
                  className="w-full bg-[color:var(--background)] border border-[color:var(--border)] rounded-xl px-4 py-3 text-[15px] text-[color:var(--foreground)] placeholder:text-[color:var(--muted)] focus:outline-none focus:border-[color:var(--accent)] transition-colors disabled:opacity-60 resize-y"
                />
                <div
                  className="mt-1 text-[10px] tracking-[0.18em] uppercase text-[color:var(--muted)]"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {body.length}/10000
                </div>
              </div>
            )}

            {error && (
              <div className="bg-[color:var(--danger-soft)] border border-[color:var(--danger)]/40 rounded-xl p-4">
                <div className="text-[14px] text-[color:var(--foreground)] break-all">
                  {error}
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <Link
                href={`/c/${slug}`}
                className="px-5 py-2.5 rounded-full text-[11px] tracking-[0.22em] uppercase text-[color:var(--muted)] hover:text-[color:var(--foreground)] transition-colors"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={busy}
                className="px-6 py-2.5 rounded-full bg-[color:var(--foreground)] text-[color:var(--background)] text-[11px] tracking-[0.22em] uppercase font-medium hover:bg-[color:var(--accent)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {busy ? "Posting…" : "Post"}
              </button>
            </div>
          </form>

          <p className="mt-10 text-[12px] text-[color:var(--muted)] leading-relaxed">
            Posts are owner-delete-only. You can&apos;t edit silently — edits
            show an &ldquo;edited&rdquo; timestamp. AI moderation runs on every
            submit (coming soon — for now posts go live immediately).
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
