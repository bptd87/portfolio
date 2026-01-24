import LinksPageClient from "../_components/LinksPageClient";
import { resolveMetadataFromParams } from "../seo/resolve-metadata";

export async function generateMetadata({
  searchParams,
}: {
  searchParams?:
    | Record<string, string | string[] | undefined>
    | Promise<Record<string, string | string[] | undefined>>;
}) {
  return resolveMetadataFromParams({ params: { path: ["links"] }, searchParams });
}

export default function LinksPage() {
  return <LinksPageClient />;
}
