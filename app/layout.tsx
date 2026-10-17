import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { pageDescription, pageTitle, siteName, siteUrl } from "./site";
import "./globals.css";

// Fonts aren't preloaded: text paints at once in next/font's size-matched fallback (display: swap), so the
// font files needn't compete with the first paint.
const inter = Inter({
  preload: false,
  subsets: ["latin"],
  weight: ["300", "500", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: pageTitle,
  description: pageDescription,
  alternates: { canonical: "/" },
  openGraph: { type: "website", url: "/", siteName, title: pageTitle, description: pageDescription },
};

const websiteJsonLd = { "@context": "https://schema.org", "@type": "WebSite", name: siteName, url: siteUrl };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
        {children}
      </body>
    </html>
  );
}
