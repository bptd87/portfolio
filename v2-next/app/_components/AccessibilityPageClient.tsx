"use client";

import { Accessibility } from "../../../src/pages/Accessibility";
import { SiteShell } from "./SiteShell";
import { useLegacyNavigate } from "./useLegacyNavigate";

export default function AccessibilityPageClient() {
  const onNavigate = useLegacyNavigate();

  return (
    <SiteShell currentPage="accessibility" onNavigate={onNavigate}>
      <Accessibility onNavigate={onNavigate} />
    </SiteShell>
  );
}
