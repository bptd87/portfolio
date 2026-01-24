import { Suspense } from "react";
import ArticlesPageClient from "../_components/ArticlesPageClient";
import { resolveMetadataFromParams } from "../seo/resolve-metadata";
import { PageLoader } from "../../../src/components/PageLoader";

export async function generateMetadata({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined> | Promise<Record<string, string | string[] | undefined>>;
}) {
  return resolveMetadataFromParams({ params: { path: ["articles"] }, searchParams });
}

export default function ArticlesPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <ArticlesPageClient />
    </Suspense>
  );
}
