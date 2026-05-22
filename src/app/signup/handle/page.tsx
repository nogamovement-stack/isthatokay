"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import { createClient } from "@/lib/supabase/client";

type Status = "loading" | "ready" | "checking" | "claiming" | "claimed" | "redirecting";

const USERNAME_PATTERN = /^[a-zA-Z0-9_]{3,20}$/;

export default function HandlePickerPage() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("loading");
  const [handle, setHandle] = useState("");
  const [availability, setAvailability] = useState<
    "unchecked" | "available" | "unavailable" | "invalid"
  >("unchecked");
  const [errorMsg, setErrorMsg] = useState("");

  // Bounce signed-out users to /login. Bounce users who already have a profile
  // back home (no second handle).
  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/login");
        return;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: existing } = (await (supabase as any)
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .maybeSingle()) as { data: { username: string } | null };
      if (existing) {
        router.replace("/");
        return;
      }
      setStatus("ready");
    })();
  }, [router]);

  // Debounce availability check.
  useEffect(() => {
    if (status !== "ready" && status !== "checking") return;
    if (!handle) {
      setAvailability("unchecked");
      return;
    }
    if (!USERNAME_PATTERN.test(handle)) {
      setAvailability("invalid");
      return;
    }

    setAvailability("unchecked");
    setStatus("checking");
    const timer = setTimeout(async () => {
      const supabase = createClient();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = (await (supabase as any).rpc("handle_available", {
        p_username: handle,
      })) as { data: boolean | null; error: { message: string } | null };
      if (error) {
        setAvailability("invalid");
      } else {
        setAvailability(data ? "available" : "unavailable");
      }
      setStatus("ready");
    }, 350);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handle]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (availability !== "available") return;

    setStatus("claiming");
    setErrorMsg("");

    const supabase = createClient();
    type ClaimResult = { ok: true; username: string } | { ok: false; reason: string };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = (await (supabase as any).rpc("claim_handle", {
      p_username: handle,
    })) as { data: ClaimResult | null; error: { message: string } | null };

    if (error || !data || data.ok === false) {
      const reason =
        (data && data.ok === false ? data.reason : null) || error?.message || "claim_failed";
      setErrorMsg(
        reason === "unavailable"
          ? "Just got taken. Try another."
          : `Couldn't claim that handle: ${reason}`,
      );
      setStatus("ready");
      return;
    }

    setStatus("claimed");
    // Hard redirect so the SiteHeader re-fetches the new profile.
    setTimeout(() => {
      window.location.href = "/community";
    }, 800);
  }

  if (status === "loading") {
    return (
      <>
        <SiteHeader />
        <main className="flex-1 px-5 md:px-8 py-20">
          <div className="mx-auto max-w-xl text-center text-[color:var(--muted)] text-[14px]">
            Loading…
          </div>
        </main>
        <SiteFooter />
      </>
    );
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
            One more step
          </div>

          <h1
            className="mt-6 font-serif italic leading-[0.98] tracking-[-0.02em] text-[color:var(--foreground)]"
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(40px, 7vw, 88px)",
            }}
          >
            Pick a handle.
          </h1>

          <p className="mt-6 text-[15px] md:text-[16px] leading-[1.6] text-[color:var(--foreground)]/82">
            What you want people to see when you post. 3 to 20 characters,
            letters, numbers, and underscores. No real names. Once picked,
            it&apos;s yours.
          </p>

          {status === "claimed" ? (
            <div className="mt-10 bg-[color:var(--ok-soft)] border border-[color:var(--border)] rounded-2xl p-6 md:p-7">
              <div
                className="text-[11px] tracking-[0.22em] uppercase text-[color:var(--ok)]"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                You&apos;re in
              </div>
              <p className="mt-3 text-[15px] leading-[1.6] text-[color:var(--foreground)]">
                Welcome, <strong>{handle}</strong>. Sending you to the
                community now…
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-10 flex flex-col gap-3">
              <label
                htmlFor="handle"
                className="text-[11px] tracking-[0.22em] uppercase text-[color:var(--muted)]"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Handle
              </label>
              <input
                id="handle"
                type="text"
                required
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
                disabled={status === "claiming"}
                value={handle}
                onChange={(e) => setHandle(e.target.value.trim())}
                placeholder="e.g. linewalker_22"
                maxLength={20}
                className="bg-[color:var(--background)] border border-[color:var(--border)] rounded-full px-5 py-3.5 text-[15px] text-[color:var(--foreground)] placeholder:text-[color:var(--muted)] focus:outline-none focus:border-[color:var(--accent)] transition-colors disabled:opacity-60"
              />

              <div
                className="text-[12px] tracking-[0.18em] uppercase min-h-[1em]"
                style={{
                  fontFamily: "var(--font-mono)",
                  color:
                    availability === "available"
                      ? "var(--ok)"
                      : availability === "unavailable"
                        ? "var(--danger)"
                        : availability === "invalid"
                          ? "var(--warning)"
                          : "var(--muted)",
                }}
              >
                {handle && availability === "available" && "✓ Available"}
                {handle && availability === "unavailable" && "Taken or reserved"}
                {handle && availability === "invalid" && "3-20 chars · letters, numbers, underscore"}
                {handle && status === "checking" && "Checking…"}
              </div>

              <button
                type="submit"
                disabled={availability !== "available" || status === "claiming"}
                className="mt-3 px-6 py-3.5 rounded-full bg-[color:var(--foreground)] text-[color:var(--background)] text-[12px] tracking-[0.22em] uppercase font-medium hover:bg-[color:var(--accent)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {status === "claiming" ? "Claiming…" : "Claim this handle"}
              </button>

              {errorMsg && (
                <div className="mt-2 text-[13px] text-[color:var(--danger)]">
                  {errorMsg}
                </div>
              )}
            </form>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
