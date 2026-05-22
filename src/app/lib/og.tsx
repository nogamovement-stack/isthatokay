import { ImageResponse } from "next/og";

/**
 * Shared helper for Is That Okay? OG images. File-based via Next's
 * `opengraph-image.tsx` convention — each route can call this with its
 * own headline / eyebrow / subtitle.
 *
 * Visual language: paper background + burnt amber accent. Distinct from
 * any other product. Bodoni Moda italic + DM Mono pulled fresh at request
 * time and cached on Vercel's edge.
 */

const PAPER = "#F5F0E8";
const INK = "#1A1614";
const ACCENT = "#C8551F";
const MUTED = "#8A7A6E";
const BORDER = "#D8CCBA";

async function loadFont(family: string, weight: number, italic = false) {
  const params = new URLSearchParams({
    family: `${family}:${italic ? "ital," : ""}wght@${italic ? "1," : ""}${weight}`,
    display: "swap",
  });
  const cssRes = await fetch(`https://fonts.googleapis.com/css2?${params}&display=swap`, {
    headers: {
      // Old User-Agent makes Google return TTF (Satori needs TTF, not WOFF2).
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Safari/605.1.15",
    },
  });
  const css = await cssRes.text();
  const match = css.match(/url\((https:\/\/[^)]+\.ttf)\)/);
  if (!match) return null;
  const fontRes = await fetch(match[1]);
  return await fontRes.arrayBuffer();
}

export async function generateOgImage({
  eyebrow,
  headline,
  subtitle,
}: {
  eyebrow: string;
  headline: string;
  subtitle: string;
}) {
  // Best-effort font loading; falls back to Satori default if it fails.
  const [bodoniItalic, dmMono] = await Promise.all([
    loadFont("Bodoni+Moda", 700, true).catch(() => null),
    loadFont("DM+Mono", 500).catch(() => null),
  ]);

  const fonts: { name: string; data: ArrayBuffer; style?: "italic" | "normal"; weight: 400 | 500 | 700 }[] = [];
  if (bodoniItalic) fonts.push({ name: "Bodoni Moda", data: bodoniItalic, style: "italic", weight: 700 });
  if (dmMono) fonts.push({ name: "DM Mono", data: dmMono, weight: 500 });

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 88px",
          background: PAPER,
          backgroundImage: `
            radial-gradient(circle at 18% 24%, rgba(200, 85, 31, 0.10) 0%, transparent 38%),
            radial-gradient(circle at 82% 78%, rgba(176, 122, 46, 0.08) 0%, transparent 42%)
          `,
          position: "relative",
        }}
      >
        {/* hairline frame */}
        <div
          style={{
            position: "absolute",
            top: 36,
            left: 36,
            right: 36,
            bottom: 36,
            border: `1px solid ${BORDER}`,
            borderRadius: 4,
          }}
        />

        {/* top row — eyebrow + wordmark */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            zIndex: 1,
          }}
        >
          <div
            style={{
              fontFamily: "DM Mono, monospace",
              fontSize: 22,
              letterSpacing: "0.32em",
              textTransform: "uppercase",
              color: ACCENT,
            }}
          >
            {eyebrow}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="13" stroke={INK} strokeWidth="1.5" />
              <line x1="8" y1="16" x2="24" y2="16" stroke={ACCENT} strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            <div
              style={{
                fontFamily: "Bodoni Moda, serif",
                fontSize: 28,
                fontStyle: "italic",
                color: INK,
                display: "flex",
              }}
            >
              Is That Okay
              <span style={{ color: ACCENT }}>?</span>
            </div>
          </div>
        </div>

        {/* headline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 28,
            maxWidth: 1000,
            zIndex: 1,
          }}
        >
          <div
            style={{
              fontFamily: "Bodoni Moda, serif",
              fontStyle: "italic",
              fontWeight: 700,
              fontSize: 110,
              lineHeight: 1.02,
              letterSpacing: "-0.02em",
              color: INK,
            }}
          >
            {headline}
          </div>
          <div
            style={{
              fontFamily: "DM Mono, monospace",
              fontSize: 26,
              letterSpacing: "0.08em",
              color: MUTED,
              maxWidth: 820,
              lineHeight: 1.35,
            }}
          >
            {subtitle}
          </div>
        </div>

        {/* bottom row — domain */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            zIndex: 1,
          }}
        >
          <div
            style={{
              fontFamily: "DM Mono, monospace",
              fontSize: 16,
              letterSpacing: "0.42em",
              textTransform: "uppercase",
              color: MUTED,
            }}
          >
            ISTHATOKAY.ORG
          </div>
          <div
            style={{
              fontFamily: "DM Mono, monospace",
              fontSize: 16,
              letterSpacing: "0.32em",
              textTransform: "uppercase",
              color: MUTED,
            }}
          >
            A practice, not a movement
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: fonts.length > 0 ? fonts : undefined,
    },
  );
}

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";
