"use client";

import { useState } from "react";

type Status = "idle" | "submitting" | "success" | "error";

export default function EmailCapture({
  eyebrow = "Tell me when this opens",
  description = "No spam. One email when the community goes live. That's it.",
  cta = "Save my seat",
}: {
  eyebrow?: string;
  description?: string;
  cta?: string;
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;
    // Basic shape check; backend wiring is intentionally deferred.
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setStatus("error");
      return;
    }
    setStatus("submitting");
    // Local-only confirmation for v1. Wire to a real list provider when ready.
    setTimeout(() => {
      setStatus("success");
    }, 400);
  }

  return (
    <div className="bg-[color:var(--soft)] border border-[color:var(--border)] rounded-2xl p-6 md:p-8">
      <div
        className="text-[11px] tracking-[0.22em] uppercase text-[color:var(--accent)]"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {eyebrow}
      </div>

      <p className="mt-3 text-[15px] md:text-[16px] text-[color:var(--foreground)] leading-relaxed">
        {description}
      </p>

      {status === "success" ? (
        <div className="mt-5 flex items-center gap-3 text-[14px] text-[color:var(--ok)]">
          <span
            className="text-[16px]"
            aria-hidden
          >
            ◐
          </span>
          You&apos;re in. Watch your inbox.
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="mt-5 flex flex-col sm:flex-row gap-3"
        >
          <input
            type="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (status === "error") setStatus("idle");
            }}
            placeholder="you@yours.com"
            aria-label="Email"
            className="flex-1 bg-[color:var(--background)] border border-[color:var(--border)] rounded-full px-5 py-3 text-[14px] text-[color:var(--foreground)] placeholder:text-[color:var(--muted)] focus:outline-none focus:border-[color:var(--accent)] transition-colors"
          />
          <button
            type="submit"
            disabled={status === "submitting"}
            className="px-6 py-3 rounded-full bg-[color:var(--foreground)] text-[color:var(--background)] text-[12px] tracking-[0.2em] uppercase font-medium disabled:opacity-60 hover:bg-[color:var(--accent)] transition-colors"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {status === "submitting" ? "Sending…" : cta}
          </button>
        </form>
      )}

      {status === "error" && (
        <div className="mt-3 text-[13px] text-[color:var(--danger)]">
          That email doesn&apos;t look right. Try again.
        </div>
      )}
    </div>
  );
}
