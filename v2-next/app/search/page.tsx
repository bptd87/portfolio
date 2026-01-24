import { Suspense } from "react";
import SearchPageClient from "../_components/SearchPageClient";
import { resolveMetadataFromParams } from "../seo/resolve-metadata";
import { PageLoader } from "../../../src/components/PageLoader";

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
    <Suspense fallback={<PageLoader />}>
      <SearchPageClient />
    </Suspense>
  );
}
