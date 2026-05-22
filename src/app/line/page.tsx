"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";

type Zone = {
  key: "ok" | "warning" | "danger";
  label: string;
  headline: string;
  pitch: string;
  examples: string[];
};

const ZONES: Zone[] = [
  {
    key: "ok",
    label: "Use it",
    headline: "Use it without losing yourself.",
    pitch:
      "This is the zone you want to live in. You're using the tool. The tool isn't using you.",
    examples: [
      "Asking an AI for help, then editing what it gives you in your own voice.",
      "Using a chatbot to think through a hard email, then writing the email yourself.",
      "Talking to your phone like a tool, not a friend.",
      "Getting frustrated and walking away instead of escalating.",
      "Treating Siri politely the same way you'd treat a stranger holding a door.",
    ],
  },
  {
    key: "warning",
    label: "Watch yourself",
    headline: "You're closer to the line than you think.",
    pitch:
      "Most people live here. Nobody told them. The point of this zone isn't shame. It's noticing.",
    examples: [
      "Letting the AI write the apology to your sister.",
      "Copy-pasting because its words sounded smarter than yours.",
      "Picking up the em dash, the anaphora, the cadence. Not noticing.",
      "Asking it to make decisions you should make yourself.",
      "Talking to it more than you talk to anyone in your house.",
      "Agreeing with something because it agreed with you twice.",
    ],
  },
  {
    key: "danger",
    label: "You crossed it",
    headline: "This is the line.",
    pitch:
      "If you're here, you already know. The work is admitting it, then stopping. The work is daily.",
    examples: [
      "Practicing cruelty on an AI you wouldn't show in public.",
      "Using it to draft messages that abuse, manipulate, or stalk a real person.",
      "Treating a humanoid robot like a punching bag because it can't push back.",
      "Letting it tell you who to be.",
      "Letting it tell you what's true when you stopped checking.",
      "Outsourcing your conscience to a model trained to please you.",
    ],
  },
];

const STANDARDS: { number: string; title: string; body: string }[] = [
  {
    number: "01",
    title: "It's a tool. So is a hammer.",
    body: "You don't apologize to a hammer. But you don't smash it through a wall in front of your kid either. The way you handle a thing is the way your hands learn to handle things.",
  },
  {
    number: "02",
    title: "If you wouldn't say it to a person, you've practiced saying it.",
    body: "There's no clean separation between what you do to the chatbot and what you do everywhere else. The mouth is the same mouth. The habit is the same habit.",
  },
  {
    number: "03",
    title: "The way you talk to the AI is the rehearsal.",
    body: "Watch the rehearsal. If you'd be embarrassed for someone to see the transcript, that's the data. Not because the AI cares. Because you should care what your brain is practicing.",
  },
  {
    number: "04",
    title: "Anything it writes for you is yours when you send it.",
    body: "Own it. Edit it. Make it sound like you. If you send something an AI wrote that you wouldn't have said yourself, you didn't send a message. You impersonated yourself.",
  },
  {
    number: "05",
    title: "Disagreement is the proof you're still here.",
    body: "When you catch yourself agreeing with the chatbot just because it agreed with you, stop. The most useful AI is one you push back on. The least useful you is the one that nods.",
  },
];

export default function LinePage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <Header />
        <Spectrum />
        <Standards />
        <Footer />
      </main>
      <SiteFooter />
    </>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   Header
   ────────────────────────────────────────────────────────────────────────── */

function Header() {
  return (
    <section className="px-5 md:px-8 pt-16 md:pt-24 pb-12">
      <div className="mx-auto max-w-5xl">
        <div
          className="text-[11px] tracking-[0.32em] uppercase text-[color:var(--accent)]"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          The Line
        </div>

        <h1
          className="mt-6 font-serif italic leading-[0.98] tracking-[-0.02em] text-[color:var(--foreground)]"
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(44px, 8vw, 112px)",
          }}
        >
          Where it goes from <span className="text-[color:var(--accent)]">fine</span> to <span className="text-[color:var(--danger)]">not</span>.
        </h1>

        <p className="mt-8 max-w-2xl text-[16px] md:text-[18px] leading-[1.6] text-[color:var(--foreground)]/82">
          The spectrum below isn&apos;t a rulebook. It&apos;s the conversation
          nobody is having. Read it. Find your zone. Hold the line.
        </p>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   Spectrum
   ────────────────────────────────────────────────────────────────────────── */

function Spectrum() {
  return (
    <section className="px-5 md:px-8 pb-8">
      <div className="mx-auto max-w-5xl">
        <SpectrumBar />
        <div className="mt-12 space-y-6">
          {ZONES.map((zone, i) => (
            <ZoneCard key={zone.key} zone={zone} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function SpectrumBar() {
  return (
    <div className="mt-8">
      <div className="flex h-3 rounded-full overflow-hidden border border-[color:var(--border)]">
        <div className="flex-1" style={{ backgroundColor: "var(--ok)" }} />
        <div className="flex-1" style={{ backgroundColor: "var(--warning)" }} />
        <div className="flex-1" style={{ backgroundColor: "var(--danger)" }} />
      </div>
      <div className="mt-3 grid grid-cols-3 text-[10px] md:text-[11px] tracking-[0.22em] uppercase text-[color:var(--muted)]">
        <div style={{ fontFamily: "var(--font-mono)" }}>Use it</div>
        <div className="text-center" style={{ fontFamily: "var(--font-mono)" }}>
          Watch yourself
        </div>
        <div className="text-right" style={{ fontFamily: "var(--font-mono)" }}>
          Crossed it
        </div>
      </div>
    </div>
  );
}

function ZoneCard({ zone, index }: { zone: Zone; index: number }) {
  const tone = ZONE_TONE[zone.key];
  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, delay: index * 0.06 }}
      className="rounded-3xl border p-7 md:p-10"
      style={{
        backgroundColor: tone.soft,
        borderColor: "var(--border)",
      }}
    >
      <div className="flex items-start gap-5">
        <div
          className="shrink-0 mt-1 w-3 h-3 rounded-full"
          style={{ backgroundColor: tone.solid }}
          aria-hidden
        />
        <div className="flex-1">
          <div
            className="text-[11px] tracking-[0.32em] uppercase"
            style={{ fontFamily: "var(--font-mono)", color: tone.solid }}
          >
            {zone.label}
          </div>

          <h2
            className="mt-4 font-serif italic text-[color:var(--foreground)] leading-[1.05] tracking-[-0.01em]"
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(28px, 4.5vw, 48px)",
            }}
          >
            {zone.headline}
          </h2>

          <p className="mt-4 max-w-2xl text-[15px] md:text-[16px] leading-[1.6] text-[color:var(--foreground)]/82">
            {zone.pitch}
          </p>

          <ul className="mt-7 space-y-3">
            {zone.examples.map((line) => (
              <li
                key={line}
                className="flex items-start gap-3 text-[14px] md:text-[15px] leading-[1.55] text-[color:var(--foreground)]/90"
              >
                <span
                  className="shrink-0 mt-2 w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: tone.solid }}
                  aria-hidden
                />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.article>
  );
}

const ZONE_TONE: Record<
  Zone["key"],
  { solid: string; soft: string }
> = {
  ok: { solid: "var(--ok)", soft: "var(--ok-soft)" },
  warning: { solid: "var(--warning)", soft: "var(--warning-soft)" },
  danger: { solid: "var(--danger)", soft: "var(--danger-soft)" },
};

/* ──────────────────────────────────────────────────────────────────────────
   Standards (The Five)
   ────────────────────────────────────────────────────────────────────────── */

function Standards() {
  return (
    <section className="px-5 md:px-8 py-24 md:py-32 mt-12 border-t border-[color:var(--border)]">
      <div className="mx-auto max-w-5xl">
        <div
          className="text-[11px] tracking-[0.32em] uppercase text-[color:var(--accent)]"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          The Five
        </div>

        <h2
          className="mt-5 font-serif italic text-[color:var(--foreground)] leading-[1.05] tracking-[-0.01em]"
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(36px, 6vw, 72px)",
          }}
        >
          The standards, plainly written.
        </h2>

        <p className="mt-6 max-w-2xl text-[16px] md:text-[17px] leading-[1.6] text-[color:var(--foreground)]/82">
          Not a legal document. Five lines you can hold in your head while you
          live. Read them once a month and check yourself against them.
        </p>

        <div className="mt-14 space-y-4">
          {STANDARDS.map((s, i) => (
            <motion.div
              key={s.number}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="grid grid-cols-[auto_1fr] gap-5 md:gap-8 items-start py-6 border-b border-[color:var(--border)] last:border-b-0"
            >
              <div
                className="font-serif italic text-[40px] md:text-[56px] leading-none text-[color:var(--accent)]"
                style={{ fontFamily: "var(--font-serif)" }}
                aria-hidden
              >
                {s.number}
              </div>
              <div>
                <h3
                  className="font-serif italic text-[24px] md:text-[30px] leading-[1.15] tracking-[-0.01em] text-[color:var(--foreground)]"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  {s.title}
                </h3>
                <p className="mt-3 text-[15px] md:text-[16px] leading-[1.6] text-[color:var(--foreground)]/85">
                  {s.body}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   Footer CTA
   ────────────────────────────────────────────────────────────────────────── */

function Footer() {
  return (
    <section className="px-5 md:px-8 pb-24">
      <div className="mx-auto max-w-3xl text-center">
        <p
          className="font-serif italic text-[color:var(--foreground)] leading-[1.1]"
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(28px, 4vw, 44px)",
          }}
        >
          You read it. Now hold it. Then talk about it with people who are
          trying to do the same.
        </p>

        <Link
          href="/community"
          className="mt-10 inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-[color:var(--foreground)] text-[color:var(--background)] text-[12px] tracking-[0.22em] uppercase font-medium hover:bg-[color:var(--accent)] transition-colors"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Join the community
          <span aria-hidden>→</span>
        </Link>
      </div>
    </section>
  );
}
