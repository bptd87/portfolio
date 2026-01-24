"use client";

import { ScenicStudio } from "../../../src/pages/ScenicStudio";
import { SiteShell } from "./SiteShell";
import { useLegacyNavigate } from "./useLegacyNavigate";

export default function TutorialPageClient() {
  const onNavigate = useLegacyNavigate();

  return (
    <SiteShell currentPage="tutorial" onNavigate={onNavigate}>
      <ScenicStudio onNavigate={onNavigate} />
    </SiteShell>
  );
}
