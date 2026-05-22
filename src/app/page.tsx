"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import SiteHeader from "./components/SiteHeader";
import SiteFooter from "./components/SiteFooter";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <FailureModes />
        <Spine />
        <Pillars />
        <ClosingCall />
      </main>
      <SiteFooter />
    </>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   Hero
   ────────────────────────────────────────────────────────────────────────── */

function Hero() {
  return (
    <section className="px-5 md:px-8 pt-16 md:pt-24 pb-20 md:pb-32">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-[11px] md:text-[12px] tracking-[0.32em] uppercase text-[color:var(--accent)]"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Is That Okay<span className="text-[color:var(--accent)]">?</span> · a practice, not a movement
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.05 }}
          className="mt-6 md:mt-8 font-serif italic leading-[0.96] tracking-[-0.02em] text-[color:var(--foreground)]"
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(48px, 9vw, 132px)",
          }}
        >
          Don&apos;t fight it.
          <br />
          Don&apos;t become it.
          <br />
          <span className="text-[color:var(--accent)]">Work with it.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.18 }}
          className="mt-8 md:mt-12 max-w-2xl text-[17px] md:text-[19px] leading-[1.55] text-[color:var(--foreground)]/85"
        >
          Nine words for the next ten years. As AI gets smarter and robots get
          more human-shaped, the question stops being whether we use them. The
          question is whether we stay ourselves while we do.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.28 }}
          className="mt-10 flex flex-col sm:flex-row gap-4"
        >
          <Link
            href="/line"
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-[color:var(--foreground)] text-[color:var(--background)] text-[12px] tracking-[0.22em] uppercase font-medium hover:bg-[color:var(--accent)] transition-colors"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            See the line
            <span aria-hidden>→</span>
          </Link>
          <Link
            href="/community"
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full border border-[color:var(--border)] text-[color:var(--foreground)] text-[12px] tracking-[0.22em] uppercase font-medium hover:border-[color:var(--accent)] hover:text-[color:var(--accent)] transition-colors"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Join the conversation
            <span aria-hidden>→</span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   Failure Modes
   ────────────────────────────────────────────────────────────────────────── */

function FailureModes() {
  return (
    <section className="px-5 md:px-8 py-20 md:py-28 border-t border-[color:var(--border)]">
      <div className="mx-auto max-w-6xl">
        <SectionEyebrow>Two ways to lose yourself</SectionEyebrow>

        <h2
          className="mt-5 max-w-3xl font-serif italic text-[color:var(--foreground)] leading-[1.05]"
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(34px, 5.5vw, 64px)",
          }}
        >
          Both ends are the same loss. One through hostility. One through
          absorption.
        </h2>

        <div className="mt-14 grid md:grid-cols-2 gap-6">
          <FailureCard
            number="01"
            glyph="✕"
            title="The fight."
            subtitle="Aggression and contempt."
            body="The streamer screaming at his chatbot. The man kicking the Roomba. The teenager training themselves to be cruel to something that can't push back. Cruelty practiced anywhere is cruelty practiced. The habit doesn't stay in the room."
            tone="danger"
          />
          <FailureCard
            number="02"
            glyph="◎"
            title="The dissolution."
            subtitle="Surrender and absorption."
            body="The em dash that wasn't yours. The cadence that wasn't yours. The opinion you didn't have until the chatbot agreed with you twice. Agreeable AI produces agreeable, uncritical people. You think you're being efficient. You're being replaced from the inside."
            tone="warning"
          />
        </div>
      </div>
    </section>
  );
}

function FailureCard({
  number,
  glyph,
  title,
  subtitle,
  body,
  tone,
}: {
  number: string;
  glyph: string;
  title: string;
  subtitle: string;
  body: string;
  tone: "danger" | "warning";
}) {
  const toneColor =
    tone === "danger" ? "var(--danger)" : "var(--warning)";
  const toneSoft =
    tone === "danger" ? "var(--danger-soft)" : "var(--warning-soft)";

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6 }}
      className="rounded-3xl border p-7 md:p-9 relative overflow-hidden"
      style={{
        backgroundColor: toneSoft,
        borderColor: "var(--border)",
      }}
    >
      <div
        className="absolute top-6 right-7 text-[12px] tracking-[0.32em] uppercase"
        style={{
          fontFamily: "var(--font-mono)",
          color: toneColor,
        }}
      >
        {number}
      </div>

      <div
        className="text-[44px] md:text-[52px] leading-none"
        style={{ color: toneColor }}
        aria-hidden
      >
        {glyph}
      </div>

      <h3
        className="mt-5 font-serif italic text-[32px] md:text-[40px] leading-[1.05] tracking-[-0.01em]"
        style={{
          fontFamily: "var(--font-serif)",
          color: "var(--foreground)",
        }}
      >
        {title}
      </h3>

      <div
        className="mt-2 text-[12px] tracking-[0.22em] uppercase"
        style={{ fontFamily: "var(--font-mono)", color: toneColor }}
      >
        {subtitle}
      </div>

      <p className="mt-6 text-[15px] md:text-[16px] leading-[1.65] text-[color:var(--foreground)]/85">
        {body}
      </p>
    </motion.article>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   Spine
   ────────────────────────────────────────────────────────────────────────── */

function Spine() {
  return (
    <section className="px-5 md:px-8 py-24 md:py-36">
      <div className="mx-auto max-w-4xl text-center">
        <SectionEyebrow center>The middle</SectionEyebrow>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-8 mx-auto flex items-center justify-center"
          aria-hidden
        >
          <span
            className="block h-[1px] w-16 bg-[color:var(--accent)]"
          />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mt-10 font-serif italic leading-[0.98] tracking-[-0.02em] text-[color:var(--foreground)]"
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(40px, 7vw, 96px)",
          }}
        >
          Stay sharp.
          <br />
          Stay yourself.
          <br />
          <span className="text-[color:var(--accent)]">Stay decent.</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="mt-10 mx-auto max-w-2xl text-[16px] md:text-[18px] leading-[1.65] text-[color:var(--foreground)]/82"
        >
          Is That Okay? is for the middle. The space where humans use these tools
          without warring with them or dissolving into them. The work is daily.
          The line is yours to hold.
        </motion.p>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   Pillars
   ────────────────────────────────────────────────────────────────────────── */

const PILLARS = [
  {
    number: "01",
    title: "The Standards",
    body: "A plain-language code of conduct. Not a legal document. Real norms for real people who use AI every day.",
    href: "/line",
    cta: "Read the five",
  },
  {
    number: "02",
    title: "The Line",
    body: "Three zones, plainly drawn. Green for use without losing yourself. Yellow for watch yourself. Red for crossed it. Most people live in yellow and don't know.",
    href: "/line",
    cta: "See where you stand",
  },
  {
    number: "03",
    title: "The Community",
    body: "The questions people are too embarrassed to ask. “Is it wrong I yelled at Alexa?” “My kid kicks the Roomba.” Real talk, no judgment.",
    href: "/community",
    cta: "Hear the room",
  },
];

function Pillars() {
  return (
    <section className="px-5 md:px-8 py-20 md:py-28 border-t border-[color:var(--border)]">
      <div className="mx-auto max-w-6xl">
        <SectionEyebrow>What lives here</SectionEyebrow>

        <h2
          className="mt-5 max-w-3xl font-serif italic text-[color:var(--foreground)] leading-[1.05]"
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(34px, 5.5vw, 64px)",
          }}
        >
          Three things, plainly drawn.
        </h2>

        <div className="mt-14 grid md:grid-cols-3 gap-6">
          {PILLARS.map((p, i) => (
            <motion.div
              key={p.number}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.55, delay: i * 0.05 }}
            >
              <Link
                href={p.href}
                className="block group rounded-3xl border border-[color:var(--border)] bg-[color:var(--soft)] p-7 md:p-8 h-full hover:border-[color:var(--accent)] transition-colors"
              >
                <div
                  className="text-[12px] tracking-[0.32em] uppercase text-[color:var(--accent)]"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {p.number}
                </div>
                <h3
                  className="mt-4 font-serif italic text-[28px] md:text-[32px] leading-[1.08] tracking-[-0.01em] text-[color:var(--foreground)]"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  {p.title}
                </h3>
                <p className="mt-4 text-[15px] leading-[1.6] text-[color:var(--foreground)]/80">
                  {p.body}
                </p>
                <div
                  className="mt-7 text-[11px] tracking-[0.22em] uppercase text-[color:var(--foreground)] group-hover:text-[color:var(--accent)] transition-colors flex items-center gap-2"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {p.cta}
                  <span aria-hidden>→</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   Closing call
   ────────────────────────────────────────────────────────────────────────── */

function ClosingCall() {
  return (
    <section className="px-5 md:px-8 py-24 md:py-32 border-t border-[color:var(--border)]">
      <div className="mx-auto max-w-4xl">
        <SectionEyebrow>The point</SectionEyebrow>

        <h2
          className="mt-5 font-serif italic text-[color:var(--foreground)] leading-[1.05]"
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(36px, 6vw, 72px)",
          }}
        >
          This isn&apos;t about saving the AI.
          <br />
          <span className="text-[color:var(--accent)]">
            It&apos;s about not losing yourself.
          </span>
        </h2>

        <p className="mt-8 max-w-2xl text-[16px] md:text-[18px] leading-[1.65] text-[color:var(--foreground)]/82">
          Anthropic, OpenAI, Google, the entire industry are still arguing
          whether the model feels anything. That question is theirs. The
          question on this site is different. What kind of person do you want
          to be while you use these tools? The answer is daily.
        </p>

        <div className="mt-12 flex flex-col sm:flex-row gap-4">
          <Link
            href="/line"
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-[color:var(--foreground)] text-[color:var(--background)] text-[12px] tracking-[0.22em] uppercase font-medium hover:bg-[color:var(--accent)] transition-colors"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Read the standards
            <span aria-hidden>→</span>
          </Link>
          <Link
            href="/community"
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full border border-[color:var(--border)] text-[color:var(--foreground)] text-[12px] tracking-[0.22em] uppercase font-medium hover:border-[color:var(--accent)] hover:text-[color:var(--accent)] transition-colors"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Join a community
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   Shared
   ────────────────────────────────────────────────────────────────────────── */

function SectionEyebrow({
  children,
  center = false,
}: {
  children: React.ReactNode;
  center?: boolean;
}) {
  return (
    <div
      className={[
        "text-[11px] tracking-[0.32em] uppercase text-[color:var(--accent)]",
        center ? "text-center" : "",
      ].join(" ")}
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {children}
    </div>
  );
}
