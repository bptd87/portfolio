"use client";

import { Directory } from "../../../src/pages/Directory";
import { SiteShell } from "./SiteShell";
import { useLegacyNavigate } from "./useLegacyNavigate";

export default function DirectoryPageClient() {
  const onNavigate = useLegacyNavigate();

  return (
    <SiteShell currentPage="directory" onNavigate={onNavigate}>
      <Directory />
    </SiteShell>
  );
}
