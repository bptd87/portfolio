import ModelReferenceScalerPageClient from "../_components/ModelReferenceScalerPageClient";
import { resolveMetadataFromParams } from "../seo/resolve-metadata";

export async function generateMetadata({
  searchParams,
}: {
  searchParams?:
    | Record<string, string | string[] | undefined>
    | Promise<Record<string, string | string[] | undefined>>;
}) {
  return resolveMetadataFromParams({ params: { path: ["model-reference-scaler"] }, searchParams });
}

export default function ModelReferenceScalerPage() {
  return <ModelReferenceScalerPageClient />;
}
