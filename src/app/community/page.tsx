"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";

type Sub = {
  slug: string;
  name: string;
  tagline: string;
  body: string;
  seeds: string[];
  accent: "ok" | "warning" | "danger" | "accent";
};

const SUBS: Sub[] = [
  {
    slug: "standards",
    name: "/c/standards",
    tagline: "Standards · proposals · the canon",
    body: "Where The Five gets debated, expanded, and added to. New norms get proposed here. The community votes them in or pushes back. This is the official memory of what we hold ourselves to.",
    seeds: [
      "The Five. Proposed additions.",
      "Where you draw the line on having AI write personal messages.",
      "What \"working with it\" actually means in practice.",
    ],
    accent: "accent",
  },
  {
    slug: "help",
    name: "/c/help",
    tagline: "Honest help-seeking · no judgment",
    body: "The questions people are too embarrassed to ask. Real situations from real people. The point is naming the thing without performing.",
    seeds: [
      "Is it wrong that I yelled at Alexa?",
      "My kid kicks the Roomba. Does that matter?",
      "I think I'm using AI to avoid talking to people. Help.",
    ],
    accent: "ok",
  },
  {
    slug: "news",
    name: "/c/news",
    tagline: "What just happened · what it means",
    body: "Links and reactions to AI ethics news, industry moves, robot incidents, research worth knowing. Discussion stays grounded. No outrage farming.",
    seeds: [
      "Anthropic publishes new welfare research.",
      "Replika subscriber model changes spark relationship grief.",
      "Boston Dynamics releases new humanoid demo.",
    ],
    accent: "warning",
  },
  {
    slug: "robots",
    name: "/c/robots",
    tagline: "Humanoids · the urgent frontier",
    body: "The conversation almost nobody is having yet. Humanoid robots in the home, in service, on the street. How we treat them. Where the line moves when they look back.",
    seeds: [
      "When the humanoid robot in the home comes, what changes?",
      "Should kids be taught to say please to a robot dog?",
      "If it looks human and reacts to pain, does that change the math?",
    ],
    accent: "danger",
  },
];

const ACCENT_MAP: Record<Sub["accent"], { solid: string; soft: string }> = {
  ok: { solid: "var(--ok)", soft: "var(--ok-soft)" },
  warning: { solid: "var(--warning)", soft: "var(--warning-soft)" },
  danger: { solid: "var(--danger)", soft: "var(--danger-soft)" },
  accent: { solid: "var(--accent)", soft: "var(--accent-soft)" },
};

export default function CommunityPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <Header />
        <Subs />
        <Mechanics />
        <Closing />
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
          Community · opening now
        </div>

        <h1
          className="mt-6 font-serif italic leading-[0.98] tracking-[-0.02em] text-[color:var(--foreground)]"
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(40px, 7vw, 96px)",
          }}
        >
          Four rooms.
          <br />
          <span className="text-[color:var(--accent)]">One conversation.</span>
        </h1>

        <p className="mt-8 max-w-2xl text-[16px] md:text-[18px] leading-[1.6] text-[color:var(--foreground)]/82">
          Is That Okay? runs on four sub-communities. Pick a handle. Pick a room.
          Post a question, an answer, a link, a confession. Vote on what lands.
          Hold the line together.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4">
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-[color:var(--foreground)] text-[color:var(--background)] text-[12px] tracking-[0.22em] uppercase font-medium hover:bg-[color:var(--accent)] transition-colors"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Pick a handle, start posting
            <span aria-hidden>→</span>
          </Link>
          <Link
            href="/line"
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full border border-[color:var(--border)] text-[color:var(--foreground)] text-[12px] tracking-[0.22em] uppercase font-medium hover:border-[color:var(--accent)] hover:text-[color:var(--accent)] transition-colors"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Read the standards first
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   The four subs
   ────────────────────────────────────────────────────────────────────────── */

function Subs() {
  return (
    <section className="px-5 md:px-8 pb-12">
      <div className="mx-auto max-w-5xl">
        <div className="grid md:grid-cols-2 gap-5">
          {SUBS.map((sub, i) => (
            <SubCard key={sub.slug} sub={sub} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function SubCard({ sub, index }: { sub: Sub; index: number }) {
  const tone = ACCENT_MAP[sub.accent];
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: (index % 4) * 0.06 }}
    >
      <Link
        href={`/c/${sub.slug}`}
        className="block rounded-3xl border p-7 md:p-8 h-full flex flex-col hover:border-[color:var(--foreground)]/40 transition-colors"
        style={{
          backgroundColor: tone.soft,
          borderColor: "var(--border)",
        }}
      >
        <div className="flex items-center justify-between gap-3">
          <span
            className="text-[14px] md:text-[16px] tracking-tight"
            style={{
              fontFamily: "var(--font-mono)",
              color: tone.solid,
            }}
          >
            {sub.name}
          </span>
          <span
            className="text-[10px] tracking-[0.22em] uppercase text-[color:var(--muted)]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Open →
          </span>
        </div>

        <div
          className="mt-4 text-[11px] tracking-[0.22em] uppercase"
          style={{ fontFamily: "var(--font-mono)", color: tone.solid }}
        >
          {sub.tagline}
        </div>

        <p className="mt-5 text-[15px] md:text-[16px] leading-[1.6] text-[color:var(--foreground)]/85 flex-1">
          {sub.body}
        </p>

        <div className="mt-6 pt-5 border-t border-[color:var(--border)]">
          <div
            className="text-[10px] tracking-[0.22em] uppercase text-[color:var(--muted)] mb-3"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Seed threads
          </div>
          <ul className="space-y-2">
            {sub.seeds.map((seed) => (
              <li
                key={seed}
                className="flex items-start gap-3 text-[14px] leading-[1.55] text-[color:var(--foreground)]/82"
              >
                <span
                  className="shrink-0 mt-2 w-1 h-1 rounded-full"
                  style={{ backgroundColor: tone.solid }}
                  aria-hidden
                />
                <span className="font-serif italic">&ldquo;{seed}&rdquo;</span>
              </li>
            ))}
          </ul>
        </div>
      </Link>
    </motion.div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   How it works
   ────────────────────────────────────────────────────────────────────────── */

function Mechanics() {
  const items: { title: string; body: string }[] = [
    {
      title: "Pick a handle.",
      body: "Username, 3-20 characters, alphanumeric and underscore. Pick what you want. No real names required. No phone number, no driver's license, no profile photo. Magic-link sign in. No passwords ever.",
    },
    {
      title: "Post or comment in any room.",
      body: "Text, link, or question. Mark which sub it belongs in. Edit later if you change your mind. Delete your own posts anytime. You can't delete anyone else's, ever.",
    },
    {
      title: "Vote on what lands.",
      body: "Upvote what you think holds the line. Downvote opens up once you've earned 50 net karma — to keep new accounts from brigading. Vote counts are hidden on a post for its first hour so the conversation forms before the score does.",
    },
    {
      title: "Moderation is plain.",
      body: "Every post and comment runs through an AI safety classifier on submit. It only blocks hate speech, threats, doxxing, content involving minors, illegal-acts instruction, and spam. Frank discussion is the whole point. Reports are public, dispositions are public, nothing happens in the dark.",
    },
  ];

  return (
    <section className="px-5 md:px-8 py-20 md:py-28 mt-8 border-t border-[color:var(--border)]">
      <div className="mx-auto max-w-5xl">
        <div
          className="text-[11px] tracking-[0.32em] uppercase text-[color:var(--accent)]"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          How it works
        </div>

        <h2
          className="mt-5 max-w-3xl font-serif italic text-[color:var(--foreground)] leading-[1.05]"
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(32px, 5.5vw, 60px)",
          }}
        >
          The mechanics, plainly.
        </h2>

        <div className="mt-12 grid md:grid-cols-2 gap-x-12 gap-y-8">
          {items.map((m) => (
            <div key={m.title}>
              <h3
                className="font-serif italic text-[22px] md:text-[26px] leading-[1.15] tracking-[-0.01em] text-[color:var(--foreground)]"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                {m.title}
              </h3>
              <p className="mt-3 text-[15px] leading-[1.6] text-[color:var(--foreground)]/82">
                {m.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   Closing
   ────────────────────────────────────────────────────────────────────────── */

function Closing() {
  return (
    <section className="px-5 md:px-8 py-20 md:py-28 border-t border-[color:var(--border)]">
      <div className="mx-auto max-w-3xl text-center">
        <p
          className="font-serif italic text-[color:var(--foreground)] leading-[1.1]"
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(28px, 4.5vw, 44px)",
          }}
        >
          The work is daily.
          <br />
          <span className="text-[color:var(--accent)]">
            It&apos;s easier with people doing it next to you.
          </span>
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-[color:var(--foreground)] text-[color:var(--background)] text-[12px] tracking-[0.22em] uppercase font-medium hover:bg-[color:var(--accent)] transition-colors"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Open a handle
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
