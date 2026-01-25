"use client";

import { Links } from "@/src/views/Links";
import { SiteShell } from "./SiteShell";
import { useLegacyNavigate } from "./useLegacyNavigate";

export default function LinksPageClient() {
  const onNavigate = useLegacyNavigate();

  return (
    <SiteShell currentPage="links" onNavigate={onNavigate}>
      <Links onNavigate={onNavigate} />
    </SiteShell>
  );
}
