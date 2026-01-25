"use client";

import { ScenicInsights } from "@/src/views/ScenicInsights";
import { SiteShell } from "./SiteShell";
import { useLegacyNavigate } from "./useLegacyNavigate";

type TagPageClientProps = {
  tag: string;
};

export default function TagPageClient({ tag }: TagPageClientProps) {
  const onNavigate = useLegacyNavigate();

  return (
    <SiteShell currentPage="articles" onNavigate={onNavigate}>
      <ScenicInsights onNavigate={onNavigate} initialTag={tag} />
    </SiteShell>
  );
}
