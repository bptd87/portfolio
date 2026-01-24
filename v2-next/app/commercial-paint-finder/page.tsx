import CommercialPaintFinderPageClient from "../_components/CommercialPaintFinderPageClient";
import { resolveMetadataFromParams } from "../seo/resolve-metadata";

export async function generateMetadata({
  searchParams,
}: {
  searchParams?:
    | Record<string, string | string[] | undefined>
    | Promise<Record<string, string | string[] | undefined>>;
}) {
  return resolveMetadataFromParams({ params: { path: ["commercial-paint-finder"] }, searchParams });
}

export default function CommercialPaintFinderPage() {
  return <CommercialPaintFinderPageClient />;
}
