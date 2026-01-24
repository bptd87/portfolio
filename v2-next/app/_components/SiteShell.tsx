"use client";

import type { ComponentType, ReactNode } from "react";
import React, { useEffect, useState } from "react";
import { DesktopNav } from "@/src/components/DesktopNav";
import { MobileNav } from "@/src/components/MobileNav";
import { Footer } from "@/src/components/Footer";
import { AnalyticsTracker } from "@/src/components/AnalyticsTracker";
import { RedirectHandler } from "@/src/components/RedirectHandler";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/react";
import { ThemeProvider } from "@/src/components/ThemeProvider";

// Dynamically loaded HelmetProvider - null until client-side
let HelmetProviderCompat: ComponentType<{ children: ReactNode }> | null = null;

interface SiteShellProps {
  currentPage: string;
  onNavigate: (page: string, slug?: string) => void;
  slug?: string | null;
  children: React.ReactNode;
}

export function SiteShell({ currentPage, onNavigate, slug, children }: SiteShellProps) {
  const [helmetReady, setHelmetReady] = useState(false);

  useEffect(() => {
    // Dynamically import react-helmet-async only on client
    import("react-helmet-async").then((mod) => {
      HelmetProviderCompat = mod.HelmetProvider as unknown as ComponentType<{ children: ReactNode }>;
      setHelmetReady(true);
    });
  }, []);

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

  const content = (
      <>
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
        {/* Toaster temporarily disabled - was causing React context issues in SSR */}
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
      </>
  );

  return (
    <ThemeProvider>
      {helmetReady && HelmetProviderCompat ? (
        <HelmetProviderCompat>
          {content}
        </HelmetProviderCompat>
      ) : (
        content
      )}
    </ThemeProvider>
  );
}
