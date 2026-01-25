"use client";

import { NewsArticle } from "@/src/views/news/NewsArticle";
import { SiteShell } from "./SiteShell";
import { useLegacyNavigate } from "./useLegacyNavigate";

export default function NewsDetailPageClient({ slug }: { slug: string }) {
  const onNavigate = useLegacyNavigate();

  return (
    <SiteShell currentPage="news-article" slug={slug} onNavigate={onNavigate}>
      <NewsArticle newsId={slug} onNavigate={onNavigate} />
    </SiteShell>
  );
}
