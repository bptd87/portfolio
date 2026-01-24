"use client";

import { ClassicalArchitectureGuide } from "../../../src/pages/ClassicalArchitectureGuide";
import { SiteShell } from "./SiteShell";
import { useLegacyNavigate } from "./useLegacyNavigate";

export default function ClassicalArchitectureGuidePageClient() {
  const onNavigate = useLegacyNavigate();

  return (
    <SiteShell currentPage="classical-architecture-guide" onNavigate={onNavigate}>
      <ClassicalArchitectureGuide />
    </SiteShell>
  );
}
