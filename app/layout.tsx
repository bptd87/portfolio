import type { Metadata } from "next";
import { VT323, Playfair_Display, DM_Sans } from 'next/font/google';
import "./globals.css";

const vt323 = VT323({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-pixel',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.brandonptdavis.com"),
  title: {
    default: "Brandon PT Davis | Scenic & Experiential Designer",
    template: "%s | Brandon PT Davis"
  },
  description: "Scenic and experiential designer based in Southern California, specializing in theatre, immersive environments, and narrative-driven spatial design. Member of USA 829.",
  keywords: ["Scenic Design", "Experiential Design", "Theatre Design", "Set Design", "Brandon PT Davis"],
  authors: [{ name: "Brandon PT Davis" }],
  creator: "Brandon PT Davis",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.brandonptdavis.com",
    siteName: "Brandon PT Davis",
    images: [
      {
        url: "/og-default.jpg",
        width: 1200,
        height: 630,
        alt: "Brandon PT Davis - Scenic & Experiential Design"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Brandon PT Davis | Scenic & Experiential Designer",
    description: "Scenic and experiential designer based in Southern California.",
    images: ["/og-default.jpg"],
    creator: "@brandonptdavis"
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${vt323.variable} ${playfair.variable} ${dmSans.variable}`}>
      {/* Force background color to avoid white flash in dark mode */}
      <body className="bg-background text-foreground antialiased">{children}</body>
    </html>
  );
}
