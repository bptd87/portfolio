"use client";

import { TeachingPhilosophy } from "../../../src/pages/TeachingPhilosophy";
import { SiteShell } from "./SiteShell";
import { useLegacyNavigate } from "./useLegacyNavigate";

export default function TeachingPhilosophyPageClient() {
  const onNavigate = useLegacyNavigate();

  return (
    <SiteShell currentPage="teaching-philosophy" onNavigate={onNavigate}>
      <TeachingPhilosophy onNavigate={onNavigate} />
    </SiteShell>
  );
}
