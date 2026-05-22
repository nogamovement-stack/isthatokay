import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-[color:var(--border)] py-12 px-5 md:px-8">
      <div className="mx-auto max-w-6xl flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div className="max-w-md">
          <div
            className="text-[11px] tracking-[0.22em] uppercase text-[color:var(--muted)] mb-3"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Is That Okay
            <span className="text-[color:var(--accent)]">?</span>
          </div>
          <p
            className="font-serif italic text-[22px] md:text-[26px] leading-[1.18] text-[color:var(--foreground)]"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Don&apos;t fight it. Don&apos;t become it. Work with it.
          </p>
          <p className="mt-4 text-[14px] text-[color:var(--muted)] leading-relaxed">
            A practice, not a movement. The work is daily. The line is yours to
            hold.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <FooterLink href="/">Manifesto</FooterLink>
          <FooterLink href="/line">The Line</FooterLink>
          <FooterLink href="/community">Community</FooterLink>
        </div>
      </div>

      <div className="mx-auto max-w-6xl mt-10 pt-6 border-t border-[color:var(--border)] flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-[12px] text-[color:var(--muted)]">
        <div style={{ fontFamily: "var(--font-mono)" }}>
          © {new Date().getFullYear()} isthatokay.org
        </div>
        <div>
          For the questions you&apos;re too embarrassed to ask.
        </div>
      </div>
    </footer>
  );
}

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="text-[12px] tracking-[0.2em] uppercase text-[color:var(--muted)] hover:text-[color:var(--accent)] transition-colors"
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {children}
    </Link>
  );
}
