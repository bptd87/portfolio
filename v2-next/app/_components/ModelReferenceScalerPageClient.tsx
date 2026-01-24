"use client";

import { ModelReferenceScaler } from "../../../src/pages/ModelReferenceScaler";
import { SiteShell } from "./SiteShell";
import { useLegacyNavigate } from "./useLegacyNavigate";

export default function ModelReferenceScalerPageClient() {
  const onNavigate = useLegacyNavigate();

  return (
    <SiteShell currentPage="model-reference-scaler" onNavigate={onNavigate}>
      <ModelReferenceScaler />
    </SiteShell>
  );
}
