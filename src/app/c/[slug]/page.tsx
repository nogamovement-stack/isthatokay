import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import PostCard from "../../components/forum/PostCard";
import {
  getSub,
  listPosts,
  getMyVotes,
  getMyProfile,
  accentForSub,
} from "@/lib/forum";
import type { Metadata } from "next";

const ACCENT_VAR = {
  ok: "var(--ok)",
  warning: "var(--warning)",
  danger: "var(--danger)",
  accent: "var(--accent)",
} as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const sub = await getSub(slug);
  if (!sub) return { title: "Not found" };
  return {
    title: `/c/${sub.slug} · ${sub.tagline}`,
    description: sub.description,
  };
}

type Vote = -1 | 0 | 1;

export default async function SubFeedPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sort?: string }>;
}) {
  const { slug } = await params;
  const { sort } = await searchParams;
  const sortMode = sort === "new" ? "new" : "hot";

  const [sub, posts, profile] = await Promise.all([
    getSub(slug),
    listPosts(slug, { sort: sortMode }),
    getMyProfile(),
  ]);

  if (!sub) {
    notFound();
  }

  const myVotes = await getMyVotes(
    "post",
    posts.map((p) => p.id),
  );

  const signedIn = !!profile;
  const myKarma = profile?.karma ?? 0;
  const hasHandle = !!profile;

  const accent = ACCENT_VAR[accentForSub(slug)];

  return (
    <>
      <SiteHeader />
      <main className="flex-1 px-5 md:px-8 py-12 md:py-16">
        <div className="mx-auto max-w-3xl">
          {/* Header */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <span
                className="text-[18px]"
                style={{ fontFamily: "var(--font-mono)", color: accent }}
              >
                /c/{sub.slug}
              </span>
              <span className="text-[color:var(--muted)] text-[12px]" aria-hidden>
                ·
              </span>
              <span
                className="text-[11px] tracking-[0.22em] uppercase text-[color:var(--muted)]"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {sub.tagline}
              </span>
            </div>

            <h1
              className="font-serif italic leading-[1.02] tracking-[-0.01em] text-[color:var(--foreground)]"
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "clamp(32px, 5vw, 56px)",
              }}
            >
              {sub.name}
            </h1>

            <p className="mt-4 max-w-2xl text-[15px] md:text-[16px] leading-[1.6] text-[color:var(--foreground)]/82">
              {sub.description}
            </p>

            {/* Action bar */}
            <div className="mt-8 flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-1">
                <SortChip slug={sub.slug} sort="hot" active={sortMode === "hot"} />
                <SortChip slug={sub.slug} sort="new" active={sortMode === "new"} />
              </div>

              {hasHandle ? (
                <Link
                  href={`/c/${sub.slug}/submit`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[color:var(--foreground)] text-[color:var(--background)] text-[11px] tracking-[0.22em] uppercase font-medium hover:bg-[color:var(--accent)] transition-colors"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  New post <span aria-hidden>+</span>
                </Link>
              ) : signedIn ? (
                <Link
                  href="/signup/handle"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[color:var(--border)] text-[color:var(--accent)] text-[11px] tracking-[0.22em] uppercase font-medium hover:border-[color:var(--accent)] transition-colors"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  Pick a handle first
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[color:var(--border)] text-[color:var(--foreground)] text-[11px] tracking-[0.22em] uppercase font-medium hover:border-[color:var(--accent)] hover:text-[color:var(--accent)] transition-colors"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  Sign in to post
                </Link>
              )}
            </div>
          </div>

          {/* Posts */}
          {posts.length === 0 ? (
            <div className="bg-[color:var(--soft)] border border-[color:var(--border)] rounded-2xl p-8 text-center">
              <p
                className="font-serif italic text-[22px] md:text-[26px] leading-[1.2] text-[color:var(--foreground)]"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                Nobody&apos;s posted here yet.
              </p>
              <p className="mt-3 text-[14px] text-[color:var(--muted)]">
                Be first. The room fills when someone says it.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  signedIn={signedIn}
                  myVote={myVotes[post.id] ?? 0 as Vote}
                  myKarma={myKarma}
                />
              ))}
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

function SortChip({
  slug,
  sort,
  active,
}: {
  slug: string;
  sort: "hot" | "new";
  active: boolean;
}) {
  return (
    <Link
      href={sort === "hot" ? `/c/${slug}` : `/c/${slug}?sort=new`}
      className={[
        "px-3 py-1.5 text-[10px] md:text-[11px] tracking-[0.22em] uppercase rounded-full transition-colors",
        active
          ? "bg-[color:var(--foreground)] text-[color:var(--background)]"
          : "text-[color:var(--muted)] hover:text-[color:var(--foreground)]",
      ].join(" ")}
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {sort === "hot" ? "Hot" : "New"}
    </Link>
  );
}
