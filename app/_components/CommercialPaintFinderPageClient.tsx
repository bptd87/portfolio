"use client";

import { CommercialPaintFinder } from "@/src/views/CommercialPaintFinder";
import { SiteShell } from "./SiteShell";
import { useLegacyNavigate } from "./useLegacyNavigate";

export default function CommercialPaintFinderPageClient() {
  const onNavigate = useLegacyNavigate();

  return (
    <SiteShell currentPage="commercial-paint-finder" onNavigate={onNavigate}>
      <CommercialPaintFinder onNavigate={onNavigate} />
    </SiteShell>
  );
}
