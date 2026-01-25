import ClassicalArchitectureGuidePageClient from "../_components/ClassicalArchitectureGuidePageClient";
import { resolveMetadataFromParams } from "../seo/resolve-metadata";

export async function generateMetadata({
  searchParams,
}: {
  searchParams?:
    | Record<string, string | string[] | undefined>
    | Promise<Record<string, string | string[] | undefined>>;
}) {
  return resolveMetadataFromParams({ params: { path: ["classical-architecture-guide"] }, searchParams });
}

export default function ClassicalArchitectureGuidePage() {
  return <ClassicalArchitectureGuidePageClient />;
}
