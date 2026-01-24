import DimensionReferencePageClient from "../_components/DimensionReferencePageClient";
import { resolveMetadataFromParams } from "../seo/resolve-metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  searchParams,
}: {
  searchParams?:
    | Record<string, string | string[] | undefined>
    | Promise<Record<string, string | string[] | undefined>>;
}) {
  return resolveMetadataFromParams({ params: { path: ["dimension-reference"] }, searchParams });
}

export default function DimensionReferencePage() {
  return <DimensionReferencePageClient />;
}
