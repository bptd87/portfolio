import PrivacyPolicyPageClient from "../_components/PrivacyPolicyPageClient";
import { resolveMetadataFromParams } from "../seo/resolve-metadata";

export async function generateMetadata({
  searchParams,
}: {
  searchParams?:
    | Record<string, string | string[] | undefined>
    | Promise<Record<string, string | string[] | undefined>>;
}) {
  return resolveMetadataFromParams({ params: { path: ["privacy"] }, searchParams });
}

export default function PrivacyPage() {
  return <PrivacyPolicyPageClient />;
}
