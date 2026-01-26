"use client";

import { Tutorials } from "@/src/views/Tutorials";
import { SiteShell } from "./SiteShell";
import { useLegacyNavigate } from "./useLegacyNavigate";

export default function TutorialPageClient() {
  const onNavigate = useLegacyNavigate();

  return (
    <SiteShell currentPage="tutorial" onNavigate={onNavigate}>
      <Tutorials onNavigate={onNavigate} />
    </SiteShell>
  );
}
