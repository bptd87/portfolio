"use client";

import { CreativeStatement } from "../../../src/pages/CreativeStatement";
import { SiteShell } from "./SiteShell";
import { useLegacyNavigate } from "./useLegacyNavigate";

export default function CreativeStatementPageClient() {
  const onNavigate = useLegacyNavigate();

  return (
    <SiteShell currentPage="creative-statement" onNavigate={onNavigate}>
      <CreativeStatement onNavigate={onNavigate} />
    </SiteShell>
  );
}
