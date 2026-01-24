import StudioPageClient from "../_components/StudioPageClient";
import { resolveMetadataFromParams } from "../seo/resolve-metadata";

export async function generateMetadata({
  searchParams,
}: {
  searchParams?:
    | Record<string, string | string[] | undefined>
    | Promise<Record<string, string | string[] | undefined>>;
}) {
  return resolveMetadataFromParams({ params: { path: ["studio"] }, searchParams });
}

export default function StudioPage() {
  return <StudioPageClient />;
}
