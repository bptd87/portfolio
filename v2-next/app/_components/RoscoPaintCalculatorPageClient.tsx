"use client";

import { RoscoPaintCalculator } from "../../../src/pages/RoscoPaintCalculator";
import { SiteShell } from "./SiteShell";
import { useLegacyNavigate } from "./useLegacyNavigate";

export default function RoscoPaintCalculatorPageClient() {
  const onNavigate = useLegacyNavigate();

  return (
    <SiteShell currentPage="rosco-paint-calculator" onNavigate={onNavigate}>
      <RoscoPaintCalculator onNavigate={onNavigate} />
    </SiteShell>
  );
}
