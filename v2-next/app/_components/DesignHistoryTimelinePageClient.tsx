"use client";

import { DesignHistoryTimeline } from "@/src/views/DesignHistoryTimeline";
import { SiteShell } from "./SiteShell";
import { useLegacyNavigate } from "./useLegacyNavigate";

export default function DesignHistoryTimelinePageClient() {
  const onNavigate = useLegacyNavigate();

  return (
    <SiteShell currentPage="design-history-timeline" onNavigate={onNavigate}>
      <DesignHistoryTimeline />
    </SiteShell>
  );
}
