"use client";

import { DynamicArticle } from "@/src/views/scenic-insights/DynamicArticle";
import { SiteShell } from "./SiteShell";
import { useLegacyNavigate } from "./useLegacyNavigate";

export default function ArticleDetailPageClient({ slug, article, relatedArticles }: { slug: string; article?: any; relatedArticles?: any[] }) {
  const onNavigate = useLegacyNavigate();

  return (
    <SiteShell currentPage="blog" slug={slug} onNavigate={onNavigate}>
      <DynamicArticle slug={slug} onNavigate={onNavigate} article={article} relatedArticles={relatedArticles} />
    </SiteShell>
  );
}
