import AccessibilityPageClient from "../_components/AccessibilityPageClient";
import { resolveMetadataFromParams } from "../seo/resolve-metadata";

export async function generateMetadata({
  searchParams,
}: {
  searchParams?:
    | Record<string, string | string[] | undefined>
    | Promise<Record<string, string | string[] | undefined>>;
}) {
  return resolveMetadataFromParams({ params: { path: ["accessibility"] }, searchParams });
}

export default function AccessibilityPage() {
  return <AccessibilityPageClient />;
}
