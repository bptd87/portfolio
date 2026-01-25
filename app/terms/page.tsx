import TermsOfUsePageClient from "../_components/TermsOfUsePageClient";
import { resolveMetadataFromParams } from "../seo/resolve-metadata";

export async function generateMetadata({
  searchParams,
}: {
  searchParams?:
    | Record<string, string | string[] | undefined>
    | Promise<Record<string, string | string[] | undefined>>;
}) {
  return resolveMetadataFromParams({ params: { path: ["terms"] }, searchParams });
}

export default function TermsPage() {
  return <TermsOfUsePageClient />;
}
