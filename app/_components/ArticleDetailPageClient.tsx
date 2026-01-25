"use client";

import { DynamicArticle } from "@/src/views/scenic-insights/DynamicArticle";
import { SiteShell } from "./SiteShell";
import { useLegacyNavigate } from "./useLegacyNavigate";

export default function ArticleDetailPageClient({ slug }: { slug: string }) {
  const onNavigate = useLegacyNavigate();

  return (
    <SiteShell currentPage="blog" slug={slug} onNavigate={onNavigate}>
      <DynamicArticle slug={slug} onNavigate={onNavigate} />
    </SiteShell>
  );
}
