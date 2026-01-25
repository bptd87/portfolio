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
