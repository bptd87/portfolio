"use client";

import { StudioNew } from "../../../src/pages/StudioNew";
import { SiteShell } from "./SiteShell";
import { useLegacyNavigate } from "./useLegacyNavigate";

export default function StudioPageClient() {
  const onNavigate = useLegacyNavigate();

  return (
    <SiteShell currentPage="studio" onNavigate={onNavigate}>
      <StudioNew onNavigate={onNavigate} />
    </SiteShell>
  );
}
