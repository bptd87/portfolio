"use client";

import { DimensionReferenceNewV2 } from "../../../src/pages/DimensionReferenceNewV2";
import { SiteShell } from "./SiteShell";
import { useLegacyNavigate } from "./useLegacyNavigate";

export default function DimensionReferencePageClient() {
  const onNavigate = useLegacyNavigate();

  return (
    <SiteShell currentPage="dimension-reference" onNavigate={onNavigate}>
      <DimensionReferenceNewV2 onNavigate={onNavigate} />
    </SiteShell>
  );
}
