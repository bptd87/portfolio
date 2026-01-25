"use client";

import { Resources } from "@/src/views/Resources";
import { SiteShell } from "./SiteShell";
import { useLegacyNavigate } from "./useLegacyNavigate";

export default function ResourcesPageClient() {
  const onNavigate = useLegacyNavigate();

  return (
    <SiteShell currentPage="resources" onNavigate={onNavigate}>
      <Resources onNavigate={onNavigate} />
    </SiteShell>
  );
}
