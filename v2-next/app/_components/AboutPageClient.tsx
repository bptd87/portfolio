"use client";

import { About } from "../../../src/pages/About";
import { SiteShell } from "./SiteShell";
import { useLegacyNavigate } from "./useLegacyNavigate";

export default function AboutPageClient() {
  const onNavigate = useLegacyNavigate();

  return (
    <SiteShell currentPage="about" onNavigate={onNavigate}>
      <About onNavigate={onNavigate} />
    </SiteShell>
  );
}
