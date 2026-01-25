import ResourcesPageClient from "../_components/ResourcesPageClient";
import { resolveMetadataFromParams } from "../seo/resolve-metadata";

export async function generateMetadata({
  searchParams,
}: {
  searchParams?:
    | Record<string, string | string[] | undefined>
    | Promise<Record<string, string | string[] | undefined>>;
}) {
  return resolveMetadataFromParams({ params: { path: ["resources"] }, searchParams });
}

export default function ResourcesPage() {
  return <ResourcesPageClient />;
}
