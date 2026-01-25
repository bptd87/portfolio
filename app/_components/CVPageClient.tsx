"use client";

import { CV } from "@/src/views/CV";
import { SiteShell } from "./SiteShell";
import { useLegacyNavigate } from "./useLegacyNavigate";

export default function CVPageClient() {
  const onNavigate = useLegacyNavigate();

  return (
    <SiteShell currentPage="cv" onNavigate={onNavigate}>
      <CV />
    </SiteShell>
  );
}
