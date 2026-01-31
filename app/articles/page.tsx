import { Suspense } from "react";
import ArticlesPageClient from "../_components/ArticlesPageClient";
import { resolveMetadataFromParams } from "../seo/resolve-metadata";
import { SkeletonArticleGrid } from "@/src/components/skeletons/SkeletonArticleGrid";
import { getAllArticles } from "@/src/lib/api";

export async function generateMetadata({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined> | Promise<Record<string, string | string[] | undefined>>;
}) {
  return resolveMetadataFromParams({ params: { path: ["articles"] }, searchParams });
}

export default async function ArticlesPage() {
  let articles = [];

  try {
    articles = await getAllArticles();
  } catch (error) {
    console.error('Failed to fetch articles:', error);
    // Return empty array on error - page will still render
    articles = [];
  }

  return (
    <Suspense fallback={<SkeletonArticleGrid />}>
      <ArticlesPageClient articles={articles || []} />
    </Suspense>
  );
}
