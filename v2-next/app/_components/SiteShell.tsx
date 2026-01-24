"use client";

import React from "react";
import { DesktopNav } from "../../../src/components/DesktopNav";
import { MobileNav } from "../../../src/components/MobileNav";
import { Footer } from "../../../src/components/Footer";
import { AnalyticsTracker } from "../../../src/components/AnalyticsTracker";
import { RedirectHandler } from "../../../src/components/RedirectHandler";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/react";
import { ThemeProvider } from "../../../src/components/ThemeProvider";
import { HelmetProvider } from "react-helmet-async";

interface SiteShellProps {
  currentPage: string;
  onNavigate: (page: string, slug?: string) => void;
  slug?: string | null;
  children: React.ReactNode;
}

export function SiteShell({ currentPage, onNavigate, slug, children }: SiteShellProps) {
  const hideChrome = currentPage === "admin" || currentPage === "links";
  const hideFooter = hideChrome || currentPage === "home";
  const forceBackground = [
    "project",
    "blog",
    "articles",
    "scenic-insights",
    "news-article",
    "portfolio",
    "scenic-studio",
    "scenic-vault",
    "app-studio",
    "directory",
    "about",
    "creative-statement",
    "teaching-philosophy",
    "collaborators",
    "experiential-design",
    "rendering",
    "scenic-models",
  ].includes(currentPage);

  return (
    <ThemeProvider>
      <HelmetProvider>
        <style>{`
          .app-mobile-nav { display: block; }
          .app-desktop-nav { display: none; }
          @media (min-width: 1024px) {
            .app-mobile-nav { display: none; }
            .app-desktop-nav { display: block; }
          }
          body.mobile-nav-open main,
          body.mobile-nav-open .app-desktop-nav {
            visibility: hidden !important;
          }
        `}</style>
        <Toaster richColors />
        <AnalyticsTracker currentPage={currentPage} slug={slug || undefined} />
        <RedirectHandler onNavigate={onNavigate} />
        <Analytics />

      {!hideChrome && (
        <>
          <div className="app-mobile-nav">
            <MobileNav currentPage={currentPage} onNavigate={onNavigate} />
          </div>
          <div className="app-desktop-nav">
            <DesktopNav
              currentPage={
                currentPage === "project"
                  ? "portfolio"
                  : currentPage === "blog"
                    ? "articles"
                    : currentPage === "scenic-insights"
                      ? "articles"
                      : currentPage === "tutorial"
                        ? "scenic-studio"
                        : currentPage
              }
              onNavigate={onNavigate}
              forceBackground={forceBackground}
            />
          </div>
        </>
      )}

        <div
          className={`transition-colors duration-300 w-full overflow-x-hidden ${
            currentPage === "home" ? "h-screen overflow-hidden" : "min-h-screen"
          }`}
        >
          <main className={currentPage === "home" ? "h-full" : ""}>
            {children}
          </main>
          {!hideFooter && (
            <div className="relative z-50 bg-background">
              <Footer onNavigate={onNavigate} />
            </div>
          )}
        </div>
      </HelmetProvider>
    </ThemeProvider>
  );
}
