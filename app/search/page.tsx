import { Suspense } from "react";
import SearchPageClient from "../_components/SearchPageClient";
import { resolveMetadataFromParams } from "../seo/resolve-metadata";
import { SkeletonArticleGrid } from "@/src/components/skeletons/SkeletonArticleGrid";

export async function generateMetadata({
  searchParams,
}: {
  searchParams?:
  | Record<string, string | string[] | undefined>
  | Promise<Record<string, string | string[] | undefined>>;
}) {
  return resolveMetadataFromParams({ params: { path: ["search"] }, searchParams });
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SkeletonArticleGrid />}>
      <SearchPageClient />
    </Suspense>
  );
}
