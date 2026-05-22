import { generateOgImage, OG_SIZE, OG_CONTENT_TYPE } from "./lib/og";

export const runtime = "edge";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Is That Okay? — Don't fight it. Don't become it. Work with it.";

export default async function Image() {
  return generateOgImage({
    eyebrow: "Manifesto · Is That Okay?",
    headline: "Don't fight it. Don't become it. Work with it.",
    subtitle:
      "An advocacy practice for staying human as we live with AI. Standards, the line, and the community for the questions people are too embarrassed to ask.",
  });
}
