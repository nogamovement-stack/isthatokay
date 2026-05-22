import Link from "next/link";
import SiteHeader from "./components/SiteHeader";
import SiteFooter from "./components/SiteFooter";

export const metadata = {
  title: "Not here",
};

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 px-5 md:px-8 py-24 md:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <div
            className="text-[11px] tracking-[0.32em] uppercase text-[color:var(--accent)]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            404 · Not here
          </div>

          <h1
            className="mt-6 font-serif italic leading-[0.98] tracking-[-0.02em] text-[color:var(--foreground)]"
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(48px, 9vw, 132px)",
            }}
          >
            You took a turn that doesn&apos;t exist.
          </h1>

          <p className="mt-8 max-w-xl mx-auto text-[16px] md:text-[18px] leading-[1.6] text-[color:var(--foreground)]/82">
            Not the AI&apos;s fault. Probably just a typo. The manifesto is the
            front door. The Line is where the work lives. The Community is
            where it gets discussed.
          </p>

          <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-[color:var(--foreground)] text-[color:var(--background)] text-[12px] tracking-[0.22em] uppercase font-medium hover:bg-[color:var(--accent)] transition-colors"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Back to the manifesto
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
