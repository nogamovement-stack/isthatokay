import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, DM_Sans, DM_Mono } from "next/font/google";
import "./globals.css";

const bodoni = Bodoni_Moda({
  variable: "--font-bodoni",
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  weight: ["400", "500"],
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#F5F0E8",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const SITE_URL = "https://isthatokay.org";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Is That Okay? — Don't fight it. Don't become it. Work with it.",
    template: "%s · Is That Okay?",
  },
  description:
    "An advocacy practice for staying human as we live with AI. Standards, the line, and a community for the questions people are too embarrassed to ask.",
  applicationName: "Is That Okay?",
  keywords: [
    "AI ethics",
    "human dignity",
    "AI advocacy",
    "ethical AI use",
    "humanoid robot ethics",
    "AI and humanity",
  ],
  openGraph: {
    type: "website",
    siteName: "Is That Okay?",
    title: "Is That Okay? — Don't fight it. Don't become it. Work with it.",
    description:
      "Two failure modes are pulling at us. Aggression on one end. Surrender on the other. Is That Okay? is for the middle.",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "Is That Okay?",
    description:
      "Don't fight it. Don't become it. Work with it.",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bodoni.variable} ${dmSans.variable} ${dmMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
