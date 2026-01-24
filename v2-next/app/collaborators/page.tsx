import CollaboratorsPageClient from "../_components/CollaboratorsPageClient";
import { resolveMetadataFromParams } from "../seo/resolve-metadata";

export async function generateMetadata({
  searchParams,
}: {
  searchParams?:
    | Record<string, string | string[] | undefined>
    | Promise<Record<string, string | string[] | undefined>>;
}) {
  return resolveMetadataFromParams({ params: { path: ["collaborators"] }, searchParams });
}

export default function CollaboratorsPage() {
  return <CollaboratorsPageClient />;
}
