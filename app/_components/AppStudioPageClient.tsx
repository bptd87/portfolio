"use client";

import { AppStudio } from "@/src/views/AppStudio";
import { SiteShell } from "./SiteShell";
import { useLegacyNavigate } from "./useLegacyNavigate";

export default function AppStudioPageClient() {
  const onNavigate = useLegacyNavigate();

  return (
    <SiteShell currentPage="app-studio" onNavigate={onNavigate}>
      <AppStudio onNavigate={onNavigate} />
    </SiteShell>
  );
}
