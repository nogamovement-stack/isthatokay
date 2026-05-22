# Is That Okay?

> Don't fight it. Don't become it. Work with it.

A public advocacy practice for staying human as AI gets smarter and robots get more human-shaped.

Two failure modes are pulling at us:

1. **Aggression and contempt** — the streamer screaming at his chatbot, the man kicking the Roomba, the teenager training themselves to be cruel to something that can't push back.
2. **Surrender and absorption** — the em dash that wasn't yours, the cadence that wasn't yours, the opinion you didn't have until the chatbot agreed with you twice.

Both ends are the same loss. Is That Okay? is for the middle.

---

## What's in v1

Three pages, three pillars.

- **`/`** — The manifesto. Hero, the two failure modes, the spine, the three pillars, closing call with email capture.
- **`/line`** — The Line. A three-zone spectrum (use it / watch yourself / crossed it) with concrete examples, plus The Five — the standards in plain language.
- **`/community`** — Eight seed discussion questions in the voice the real forum will use, plus an email capture for the "tell me when this opens" list.

Shared shell: `SiteHeader`, `SiteFooter`, `EmailCapture`.

The email capture is **local-only in v1** (validates shape, shows a success state, does not POST anywhere). Wire to ConvertKit / Mailchimp / Resend / Supabase whenever you're ready to actually collect addresses.

---

## Stack

- Next.js 16 (App Router, Turbopack)
- React 19
- TypeScript strict
- Tailwind CSS 4 (CSS-first config in `globals.css`)
- Framer Motion
- Bodoni Moda (serif italic) + DM Sans (body) + DM Mono (eyebrows/tracked) via `next/font`

Color palette is paper + ink + a single burnt-amber accent (`#C8551F` — the line). Distinct from LAYR's dark cinematic feel by design — Is That Okay? is a public square, not an intimate room.

---

## Run it locally

From this folder:

```sh
npm install
npm run dev
```

Open http://localhost:3000.

Type check before commits:

```sh
npm run typecheck
```

---

## Voice rules

Same spine as LAYR but a different register. Public square, not bedroom.

- **Direct.** No hedge. Short, dense sentences. Each word working.
- **Plain.** No academic ethics language. No corporate mission statements. The audience is regular people who use AI every day and want a gut-check.
- **No em dashes in user-facing copy.** Use periods, commas, colons. (Em dashes are appropriate here because it's about *practicing* the discipline; the homepage prose itself stays clean.)
- **No wellness vocabulary.** No "journey," no "growth mindset," no "intentional living."
- **A little punchy.** Has bite. Doesn't apologize for having a point of view.
- **Never preachy.** Naming the thing is enough. The reader is an adult.

---

## File structure

```
isthatokay/
├── package.json
├── tsconfig.json
├── next.config.ts
├── postcss.config.mjs
├── eslint.config.mjs
├── next-env.d.ts
├── .gitignore
├── README.md
└── src/
    └── app/
        ├── layout.tsx              ← fonts, metadata, root shell
        ├── globals.css             ← Tailwind v4 imports + color tokens
        ├── page.tsx                ← manifesto landing
        ├── line/
        │   └── page.tsx            ← The Line + The Five
        ├── community/
        │   └── page.tsx            ← seed questions + email capture
        └── components/
            ├── SiteHeader.tsx
            ├── SiteFooter.tsx
            └── EmailCapture.tsx
```

---

## Deploy

Vercel is the path of least resistance. From this folder:

1. `git init && git add . && git commit -m "Is That Okay? v1"`
2. Create a new GitHub repo, push to it.
3. Import the repo in Vercel. No env vars needed for v1.
4. Point a domain at the deployment when ready (`isthatokay.org`, ideally).

---

## The road map — 2 phases, no waitlist

Going straight to live. No warming list. No "tell me when this opens."

| Phase | What ships |
|---|---|
| **v1** ✅ done | Manifesto, The Line, Community page previewing the four launch subs. Login placeholder. OG images per route. Sitemap, robots, favicon, 404. Supabase migration ready to run. |
| **Phase 2** — Auth + forum + moderation, all in one push | Supabase magic-link sign in. Handle picker (Reddit-style, with profanity + reserved-name guard). The four subs (Standards / Help / News / Robots). Post + comment + vote. AI moderation classifier on every submit. Public reports queue. Karma threshold for downvotes. Hidden vote counts for the first 60 minutes per post. |
| **Phase 3** — Launch hardening, post-MVP | Rate limits, anti-abuse, terms + privacy reviewed by counsel, email digest, more subs as community demands them. |

The full forum schema is already written. See `supabase/migrations/001_forum_schema.sql` — six tables, all RLS policies, vote toggle RPC with karma adjustment + downvote gate, handle claim RPC, one-level-deep comment guard. Paste into Supabase SQL editor when the project is ready and the whole data layer is live.

## Locked product decisions

These were chosen 2026-05-22. Don't drift from them without a real reason.

### Voting model: Reddit-style upvote / downvote

Familiar pattern, what users expect. Risk: bad-faith downvoting on an AI-ethics community would sting more than usual. **Mitigations baked into the build:**

- Vote counts hidden on a post for its first 60 minutes so early bias doesn't compound
- Karma threshold (probably 50 net) required before downvote button activates
- Downvotes don't show a counter to the post author — they only affect ranking + a hidden score
- Every post + comment still runs through the AI moderation classifier on submit

### Community structure: Multiple sub-communities

Launch with **four** to keep momentum (not eight — empty subs feel worse than no subs):

- **`/c/standards`** — Discussions and proposals about how AI should be treated. The Five lives here. New standards get debated here.
- **`/c/help`** — "Is it wrong that I yelled at Alexa?" "My kid kicks the Roomba." Where the seed questions go. Honest help-seeking, no judgment.
- **`/c/news`** — Links and reactions to news about AI ethics, robot incidents, industry moves.
- **`/c/robots`** — Humanoid robots specifically. The frontier nobody is talking about yet.

Future subs added as community surfaces real demand. Don't preemptively add `/c/personal` etc. until people are asking.

### Identity: Pick your own username (Reddit-style)

Open username field. Mitigations baked in:

- Profanity filter (basic list, server-side)
- Reserved-name list (no `admin`, `isthatokay`, `mod`, `claude`, `openai`, etc.)
- No impersonation of public AI ethics figures (small named list — Gary Marcus, Timnit Gebru, etc.)
- 3-20 characters, alphanumeric + underscore
- Lowercase normalized, display preserves user casing

Magic-link auth (no passwords ever). Email is verification, not identity.

### Moderation philosophy

- **AI-classifier first pass** on every post + comment via Gemini (LAYR's `/api/moderate-post` pattern).
- Classifier rejects only: hate speech, threats, doxxing, content sexualizing minors, illegal-acts instruction, spam. Frank discussion of ethics + edge cases is the whole point — explicitly allowed.
- **Fail-open** when classifier is unreachable so network blips don't block posting.
- **Owner-only delete.** You can delete your own posts. You can't delete others'.
- **Public reports queue** — community sees what got flagged and the disposition (open / dismissed / removed). No mod actions in the dark.
- **No-update history.** Edits are append-only with a visible "edited" timestamp. Posts can be deleted but not silently rewritten.

## What to do in parallel — your part

Three setups in parallel while I build Phase 2. None of them block each other; you can do them in any order, even concurrently in different browser tabs. Should take ~45 minutes total.

### 1. Supabase project (15 min)

1. supabase.com → New project. Pick a name (`isthatokay`), strong DB password, region close to your audience (East US is fine for US-default).
2. Wait ~2 min for the project to spin up.
3. Settings → API → copy three values:
   - **Project URL** → goes in env as `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → goes in env as `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret** → goes in env as `SUPABASE_SERVICE_ROLE_KEY` (server-only, never expose)
4. Authentication → Providers → keep Email enabled, disable Confirm email for dev (we re-enable before launch).
5. Authentication → URL Configuration → add `http://localhost:3000/auth/callback` for now; add `https://isthatokay.org/auth/callback` once domain is live.
6. SQL Editor → New query → paste the contents of `supabase/migrations/001_forum_schema.sql` → Run. Confirm with `select count(*) from public.subs;` — should return 4.

### 2. Domain (10 min)

1. Buy `isthatokay.org` on Porkbun (~$12 first year, no upsells).
2. Optional but recommended: turn on Email Forwarding for `hello@isthatokay.org → your-gmail@gmail.com`. Same pattern as LAYR. Add the MX records Porkbun prompts for, plus the alias itself.
3. Don't worry about DNS to Vercel yet — that happens after the project deploys.

### 3. GitHub + Vercel (15 min)

1. Create a new repo on GitHub (`isthatokay`, private until launch).
2. From this folder: `git init && git add . && git commit -m "Is That Okay? v1" && git remote add origin git@github.com:nogamovement-stack/isthatokay.git && git push -u origin main`.
3. Vercel → Add New → Project → import the repo. Default Next.js settings are correct.
4. Project Settings → Environment Variables → add the three Supabase vars from step 1 above (mark `SUPABASE_SERVICE_ROLE_KEY` as Production-only and **Sensitive**).
5. Settings → Domains → add `isthatokay.org`. Vercel shows DNS records. Plug those into Porkbun DNS. Wait 5-30 min for SSL.
6. Add `NEXT_PUBLIC_SITE_URL=https://isthatokay.org` to Vercel env vars, redeploy.

Ping me when you have:
- Supabase URL + both keys in hand
- Repo on GitHub
- Vercel deploying

I take it from there. Phase 2 is one focused build session.

## Counsel review before paid product

Same note as LAYR. No paid product needs counsel review yet — the waitlist + free forum is reasonable to launch under standard B2C terms. Before you charge anyone for anything, a Florida attorney with AI / community-platform experience should review the terms. Especially because the community will hold sensitive admissions ("I crossed the line") that need clear retention + deletion policies.

---

## A note about LAYR

This project is intentionally separate from LAYR.  Both are Laurie's, both share voice DNA, but they serve different audiences and shouldn't share infrastructure. If you ever find yourself importing across, stop. Is That Okay? is its own thing.
