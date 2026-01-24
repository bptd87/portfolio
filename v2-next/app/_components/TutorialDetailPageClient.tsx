"use client";

import { DynamicTutorial } from "../../../src/pages/scenic-studio/DynamicTutorial";
import { SiteShell } from "./SiteShell";
import { useLegacyNavigate } from "./useLegacyNavigate";

export default function TutorialDetailPageClient({ slug }: { slug: string }) {
  const onNavigate = useLegacyNavigate();

  return (
    <SiteShell currentPage="tutorial" slug={slug} onNavigate={onNavigate}>
      <DynamicTutorial slug={slug} onNavigate={onNavigate} />
    </SiteShell>
  );
}
