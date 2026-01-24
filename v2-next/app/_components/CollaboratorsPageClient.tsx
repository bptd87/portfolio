"use client";

import { Collaborators } from "../../../src/pages/Collaborators";
import { SiteShell } from "./SiteShell";
import { useLegacyNavigate } from "./useLegacyNavigate";

export default function CollaboratorsPageClient() {
  const onNavigate = useLegacyNavigate();

  return (
    <SiteShell currentPage="collaborators" onNavigate={onNavigate}>
      <Collaborators onNavigate={onNavigate} />
    </SiteShell>
  );
}
