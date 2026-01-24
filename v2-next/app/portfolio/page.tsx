import { Suspense } from "react";
import PortfolioPageClient from "../_components/PortfolioPageClient";
import { resolveMetadataFromParams } from "../seo/resolve-metadata";
import { PageLoader } from "../../../src/components/PageLoader";

export async function generateMetadata({
  searchParams,
}: {
  searchParams?:
    | Record<string, string | string[] | undefined>
    | Promise<Record<string, string | string[] | undefined>>;
}) {
  return resolveMetadataFromParams({ params: { path: ["portfolio"] }, searchParams });
}

export default function PortfolioPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <PortfolioPageClient />
    </Suspense>
  );
}
