import { Suspense } from "react";
import PortfolioPageClient from "../_components/PortfolioPageClient";
import { resolveMetadataFromParams } from "../seo/resolve-metadata";
import { SkeletonPortfolio } from "@/src/components/skeletons/SkeletonPortfolio";

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
    <Suspense fallback={<SkeletonPortfolio />}>
      <PortfolioPageClient />
    </Suspense>
  );
}
