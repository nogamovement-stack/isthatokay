"use client";

import Link from "next/link";
import { useState } from "react";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import { createClient } from "@/lib/supabase/client";

type Status = "idle" | "sending" | "sent" | "error";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setErrorMsg("That email doesn't look right.");
      setStatus("error");
      return;
    }

    setStatus("sending");
    setErrorMsg("");

    const supabase = createClient();
    // Always use the current browser origin so the magic link comes back to
    // whichever environment the user clicked from (localhost, vercel preview,
    // vercel production alias, or the eventual custom domain). Removes the
    // single most common magic-link pitfall — a stale SITE_URL env var
    // pointing at a domain that doesn't resolve yet.
    const siteUrl = window.location.origin;

    const { error } = await supabase.auth.signInWithOtp({
      email: trimmed,
      options: {
        emailRedirectTo: `${siteUrl}/auth/callback`,
      },
    });

    if (error) {
      setErrorMsg(error.message);
      setStatus("error");
      return;
    }

    setStatus("sent");
  }

  return (
    <>
      <SiteHeader />
      <main className="flex-1 px-5 md:px-8 py-20 md:py-28">
        <div className="mx-auto max-w-xl">
          <div
            className="text-[11px] tracking-[0.32em] uppercase text-[color:var(--accent)]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Sign in
          </div>

          <h1
            className="mt-6 font-serif italic leading-[0.98] tracking-[-0.02em] text-[color:var(--foreground)]"
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(40px, 7vw, 88px)",
            }}
          >
            One-click in.
            <br />
            <span className="text-[color:var(--accent)]">No password.</span>
          </h1>

          <p className="mt-6 text-[15px] md:text-[16px] leading-[1.6] text-[color:var(--foreground)]/82">
            Drop your email. We&apos;ll send a one-click sign-in link. After
            that you pick a handle (any 3-20 characters, no real name) and
            you&apos;re in the room.
          </p>

          {status === "sent" ? (
            <div className="mt-10 bg-[color:var(--soft)] border border-[color:var(--border)] rounded-2xl p-6 md:p-7">
              <div
                className="text-[11px] tracking-[0.22em] uppercase text-[color:var(--accent)]"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Check your inbox
              </div>
              <p className="mt-3 text-[15px] leading-[1.6] text-[color:var(--foreground)]">
                We just sent a link to <strong>{email}</strong>. Click it from
                this device and you&apos;re in. The link expires in an hour.
              </p>
              <p className="mt-3 text-[13px] text-[color:var(--muted)]">
                If it doesn&apos;t arrive in 60 seconds, check spam. Or wrong
                email? <button onClick={() => setStatus("idle")} className="underline underline-offset-4 hover:text-[color:var(--accent)]">try a different one</button>.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="mt-10 flex flex-col gap-3"
            >
              <label
                htmlFor="email"
                className="text-[11px] tracking-[0.22em] uppercase text-[color:var(--muted)]"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                disabled={status === "sending"}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status === "error") {
                    setStatus("idle");
                    setErrorMsg("");
                  }
                }}
                placeholder="you@yours.com"
                className="bg-[color:var(--background)] border border-[color:var(--border)] rounded-full px-5 py-3.5 text-[15px] text-[color:var(--foreground)] placeholder:text-[color:var(--muted)] focus:outline-none focus:border-[color:var(--accent)] transition-colors disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={status === "sending"}
                className="mt-3 px-6 py-3.5 rounded-full bg-[color:var(--foreground)] text-[color:var(--background)] text-[12px] tracking-[0.22em] uppercase font-medium hover:bg-[color:var(--accent)] transition-colors disabled:opacity-60"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {status === "sending" ? "Sending…" : "Send me the link"}
              </button>
              {status === "error" && errorMsg && (
                <div className="text-[13px] text-[color:var(--danger)]">
                  {errorMsg}
                </div>
              )}
            </form>
          )}

          <div className="mt-12 text-[13px] text-[color:var(--muted)]">
            <Link
              href="/line"
              className="hover:text-[color:var(--accent)] transition-colors underline underline-offset-4"
            >
              Read the standards while you wait
            </Link>
            .
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
