"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS: { href: string; label: string }[] = [
  { href: "/", label: "Manifesto" },
  { href: "/line", label: "The Line" },
  { href: "/community", label: "Community" },
];

export default function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 backdrop-blur-md bg-[color:var(--background)]/82 border-b border-[color:var(--border)]">
      <div className="mx-auto max-w-6xl px-5 md:px-8 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 group"
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
                  "px-3 py-2 text-[11px] md:text-[12px] tracking-[0.18em] uppercase rounded-full transition-colors",
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
        </nav>
      </div>
    </header>
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
