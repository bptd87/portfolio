import CreativeStatementPageClient from "../_components/CreativeStatementPageClient";
import { resolveMetadataFromParams } from "../seo/resolve-metadata";

export async function generateMetadata({
  searchParams,
}: {
  searchParams?:
    | Record<string, string | string[] | undefined>
    | Promise<Record<string, string | string[] | undefined>>;
}) {
  return resolveMetadataFromParams({ params: { path: ["creative-statement"] }, searchParams });
}

export default function CreativeStatementPage() {
  return <CreativeStatementPageClient />;
}
