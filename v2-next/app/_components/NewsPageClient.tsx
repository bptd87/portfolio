"use client";

import { News } from "@/src/views/News";
import { SiteShell } from "./SiteShell";
import { useLegacyNavigate } from "./useLegacyNavigate";

export default function NewsPageClient() {
  const onNavigate = useLegacyNavigate();

  return (
    <SiteShell currentPage="news" onNavigate={onNavigate}>
      <News onNavigate={onNavigate} />
    </SiteShell>
  );
}
