"use client";

import { Portfolio } from "@/src/views/Portfolio";
import { SiteShell } from "./SiteShell";
import { useLegacyNavigate } from "./useLegacyNavigate";
import { useSearchParams } from "next/navigation";
import { PortfolioErrorBoundary } from "./PortfolioErrorBoundary";

export default function PortfolioPageClient() {
  const onNavigate = useLegacyNavigate();
  const searchParams = useSearchParams();
  const initialFilter = searchParams.get("filter") || undefined;
  const initialTag = searchParams.get("tag") || undefined;

  return (
    <PortfolioErrorBoundary>
      <SiteShell currentPage="portfolio" onNavigate={onNavigate}>
        <Portfolio
          onNavigate={onNavigate}
          initialFilter={initialFilter}
          initialTag={initialTag}
        />
      </SiteShell>
    </PortfolioErrorBoundary>
  );
}
