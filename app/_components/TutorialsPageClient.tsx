"use client";

import { Tutorials } from "@/src/views/Tutorials";
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
