import { generateOgImage, OG_SIZE, OG_CONTENT_TYPE } from "../lib/og";

export const runtime = "edge";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "The questions people are too embarrassed to ask.";

export default async function Image() {
  return generateOgImage({
    eyebrow: "Community · Is That Okay?",
    headline: "The questions people are too embarrassed to ask.",
    subtitle:
      "Standards, morality, dos and don'ts. A real forum for the conversation everyone's avoiding.",
  });
}
