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
  const articles = await getAllArticles();

  return (
    <Suspense fallback={<SkeletonArticleGrid />}>
      <ArticlesPageClient articles={articles} />
    </Suspense>
  );
}
