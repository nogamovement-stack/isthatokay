import { generateOgImage, OG_SIZE, OG_CONTENT_TYPE } from "../lib/og";

export const runtime = "edge";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "The Line — Where it goes from fine to not.";

export default async function Image() {
  return generateOgImage({
    eyebrow: "The Line · Is That Okay?",
    headline: "Where it goes from fine to not.",
    subtitle:
      "Three zones, plainly drawn. Use it. Watch yourself. Crossed it. Plus the five standards in plain language.",
  });
}
