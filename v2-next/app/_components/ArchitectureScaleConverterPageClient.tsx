"use client";

import { ArchitectureScaleConverter } from "@/src/views/ArchitectureScaleConverter";
import { SiteShell } from "./SiteShell";
import { useLegacyNavigate } from "./useLegacyNavigate";

export default function ArchitectureScaleConverterPageClient() {
  const onNavigate = useLegacyNavigate();

  return (
    <SiteShell currentPage="architecture-scale-converter" onNavigate={onNavigate}>
      <ArchitectureScaleConverter onNavigate={onNavigate} />
    </SiteShell>
  );
}
