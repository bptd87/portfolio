import DirectoryPageClient from "../_components/DirectoryPageClient";
import { resolveMetadataFromParams } from "../seo/resolve-metadata";

export async function generateMetadata({
  searchParams,
}: {
  searchParams?:
    | Record<string, string | string[] | undefined>
    | Promise<Record<string, string | string[] | undefined>>;
}) {
  return resolveMetadataFromParams({ params: { path: ["directory"] }, searchParams });
}

export default function DirectoryPage() {
  return <DirectoryPageClient />;
}
