"use client";

import { ScenicVault } from "../../../src/pages/ScenicVault";
import { SiteShell } from "./SiteShell";
import { useLegacyNavigate } from "./useLegacyNavigate";

export default function ScenicVaultPageClient() {
  const onNavigate = useLegacyNavigate();

  return (
    <SiteShell currentPage="scenic-vault" onNavigate={onNavigate}>
      <ScenicVault onNavigate={onNavigate} />
    </SiteShell>
  );
}
