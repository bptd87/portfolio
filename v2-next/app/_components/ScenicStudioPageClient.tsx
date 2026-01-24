"use client";

import { ScenicStudio } from "../../../src/pages/ScenicStudio";
import { SiteShell } from "./SiteShell";
import { useLegacyNavigate } from "./useLegacyNavigate";

export default function ScenicStudioPageClient() {
  const onNavigate = useLegacyNavigate();

  return (
    <SiteShell currentPage="scenic-studio" onNavigate={onNavigate}>
      <ScenicStudio onNavigate={onNavigate} />
    </SiteShell>
  );
}
