"use client";

import { ProjectDetailNew } from "../../../src/pages/ProjectDetailNew";
import { SiteShell } from "./SiteShell";
import { useLegacyNavigate } from "./useLegacyNavigate";

export default function ProjectDetailPageClient({ slug }: { slug: string }) {
  const onNavigate = useLegacyNavigate();

  return (
    <SiteShell currentPage="project" slug={slug} onNavigate={onNavigate}>
      <ProjectDetailNew slug={slug} onNavigate={onNavigate} />
    </SiteShell>
  );
}
