import ArchitectureScaleConverterPageClient from "../_components/ArchitectureScaleConverterPageClient";
import { resolveMetadataFromParams } from "../seo/resolve-metadata";

export async function generateMetadata({
  searchParams,
}: {
  searchParams?:
    | Record<string, string | string[] | undefined>
    | Promise<Record<string, string | string[] | undefined>>;
}) {
  return resolveMetadataFromParams({ params: { path: ["architecture-scale-converter"] }, searchParams });
}

export default function ArchitectureScaleConverterPage() {
  return <ArchitectureScaleConverterPageClient />;
}
