"use client";

import { Sitemap } from "../../../src/pages/Sitemap";
import { SiteShell } from "./SiteShell";
import { useLegacyNavigate } from "./useLegacyNavigate";

export default function SitemapPageClient() {
  const onNavigate = useLegacyNavigate();

  return (
    <SiteShell currentPage="sitemap" onNavigate={onNavigate}>
      <Sitemap onNavigate={onNavigate} />
    </SiteShell>
  );
}
