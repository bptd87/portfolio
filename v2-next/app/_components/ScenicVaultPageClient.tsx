"use client";

import { ScenicVault } from "@/src/views/ScenicVault";
import { SiteShell } from "./SiteShell";
import { useLegacyNavigate } from "./useLegacyNavigate";

export default function ScenicVaultPageClient({ slug }: { slug?: string }) {
  const onNavigate = useLegacyNavigate();

  return (
    <SiteShell currentPage="scenic-vault" onNavigate={onNavigate}>
      <ScenicVault onNavigate={onNavigate} initialSlug={slug} />
    </SiteShell>
  );
}
