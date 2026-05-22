"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const LINKS: { href: string; label: string }[] = [
  { href: "/", label: "Manifesto" },
  { href: "/line", label: "The Line" },
  { href: "/community", label: "Community" },
];

type AuthState =
  | { status: "loading" }
  | { status: "signed-out" }
  | { status: "no-handle" }
  | { status: "signed-in"; username: string };

export default function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [auth, setAuth] = useState<AuthState>({ status: "loading" });

  useEffect(() => {
    const supabase = createClient();

    let cancelled = false;

    async function resolveAuth() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (cancelled) return;

      if (!user) {
        setAuth({ status: "signed-out" });
        return;
      }

      // Cast through any — @supabase/ssr typed .from() resolves to `never`
      // in this overload, a known issue with their type generics. Same shim
      // LAYR uses across its surface.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: profile } = (await (supabase as any)
        .from("profiles")
        .select("username_display")
        .eq("id", user.id)
        .maybeSingle()) as { data: { username_display: string } | null };

      if (cancelled) return;

      if (profile?.username_display) {
        setAuth({ status: "signed-in", username: profile.username_display });
      } else {
        setAuth({ status: "no-handle" });
      }
    }

    resolveAuth();

    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      resolveAuth();
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setAuth({ status: "signed-out" });
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-30 backdrop-blur-md bg-[color:var(--background)]/82 border-b border-[color:var(--border)]">
      <div className="mx-auto max-w-6xl px-5 md:px-8 h-16 flex items-center justify-between gap-3">
        <Link
          href="/"
          className="flex items-center gap-2 group shrink-0"
          aria-label="Is That Okay? home"
        >
          <Wordmark />
          <span
            className="font-serif italic text-[19px] md:text-[20px] tracking-tight text-[color:var(--foreground)]"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Is That Okay
            <span className="text-[color:var(--accent)]">?</span>
          </span>
        </Link>

        <nav className="flex items-center gap-1 md:gap-2">
          {LINKS.slice(1).map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={[
                  "px-2 md:px-3 py-2 text-[10px] md:text-[12px] tracking-[0.18em] uppercase rounded-full transition-colors",
                  active
                    ? "text-[color:var(--accent)]"
                    : "text-[color:var(--muted)] hover:text-[color:var(--foreground)]",
                ].join(" ")}
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {l.label}
              </Link>
            );
          })}

          <span className="hidden md:inline-block w-px h-4 bg-[color:var(--border)] mx-2" />

          <AuthSlot auth={auth} onSignOut={handleSignOut} />
        </nav>
      </div>
    </header>
  );
}

function AuthSlot({
  auth,
  onSignOut,
}: {
  auth: AuthState;
  onSignOut: () => void;
}) {
  if (auth.status === "loading") {
    return (
      <span
        className="px-3 py-2 text-[10px] md:text-[12px] tracking-[0.18em] uppercase text-[color:var(--muted)] opacity-60"
        style={{ fontFamily: "var(--font-mono)" }}
        aria-hidden
      >
        ◌
      </span>
    );
  }

  if (auth.status === "signed-out") {
    return (
      <Link
        href="/login"
        className="px-3 py-2 text-[10px] md:text-[12px] tracking-[0.18em] uppercase rounded-full text-[color:var(--foreground)] hover:text-[color:var(--accent)] transition-colors"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        Sign in
      </Link>
    );
  }

  if (auth.status === "no-handle") {
    return (
      <Link
        href="/signup/handle"
        className="px-3 py-2 text-[10px] md:text-[12px] tracking-[0.18em] uppercase rounded-full text-[color:var(--accent)] hover:underline underline-offset-4"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        Pick a handle
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <span
        className="px-2 md:px-3 py-2 text-[10px] md:text-[12px] tracking-[0.04em] text-[color:var(--foreground)]"
        style={{ fontFamily: "var(--font-mono)" }}
        title={`Signed in as ${auth.username}`}
      >
        {auth.username}
      </span>
      <button
        onClick={onSignOut}
        className="px-2 md:px-3 py-2 text-[10px] md:text-[12px] tracking-[0.18em] uppercase rounded-full text-[color:var(--muted)] hover:text-[color:var(--danger)] transition-colors"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        Sign out
      </button>
    </div>
  );
}

function Wordmark() {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle
        cx="16"
        cy="16"
        r="13"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.85"
      />
      <line
        x1="8"
        y1="16"
        x2="24"
        y2="16"
        stroke="var(--accent)"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
