import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { Providers } from "@/components/layout/providers";
import { NavBar } from "@/components/layout/nav-bar";
import { EmberTrailProvider } from "@/components/features/gamification/ember-trail-provider";
import { TitleUpdater } from "@/components/layout/title-updater";
import { SeoJsonLd } from "@/components/seo-json-ld";
import { getBaseUrl } from "@/lib/baseUrl";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

const appUrl = getBaseUrl();

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),

  title: {
    default: "Smarana | Spaced Repetition for Algorithms",
    template: "%s | Smarana",
  },

  description:
    "Smarana helps you retain algorithm patterns using spaced repetition. Track solved problems, review on schedule, and build long-term recall.",

  applicationName: "Smarana",
  authors: [{ name: "Jash Karangiya" }],
  creator: "Jash Karangiya",
  publisher: "Smarana",

  alternates: {
    canonical: "/",
  },

  openGraph: {
    type: "website",
    url: appUrl,
    siteName: "Smarana",
    title: "Smarana — Spaced Repetition for Algorithms",
    description:
      "A spaced repetition layer for algorithms: retain patterns, schedule reviews, and stay consistent.",
    images: [
      {
        url: "/og/og.png",
        width: 1200,
        height: 630,
        alt: "Smarana — Spaced Repetition for Algorithms",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Smarana — Spaced Repetition for Algorithms",
    description:
      "Retain algorithm patterns with spaced repetition. Reviews, streaks, and a focused workflow.",
    images: ["/og/og.png"],
  },

  icons: {
    icon: [
      { url: "/favicon-32x32.png?v=4", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png?v=4", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png?v=4", sizes: "180x180", type: "image/png" },
    ],
  },
  verification: {
    google: "mC1RPMzXJ-NpiRO96RVsb5aRTmmcCg53x0xukbmc_-M",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`} suppressHydrationWarning>
        <SeoJsonLd />
        <Providers>
          <EmberTrailProvider>
            <TitleUpdater />
            <NavBar />
            <main>{children}</main>
            <Analytics />
          </EmberTrailProvider>
        </Providers>
      </body>
    </html>
  );
}
