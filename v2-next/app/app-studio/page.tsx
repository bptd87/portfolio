import AppStudioPageClient from "../_components/AppStudioPageClient";
import { resolveMetadataFromParams } from "../seo/resolve-metadata";

export async function generateMetadata({
  searchParams,
}: {
  searchParams?:
    | Record<string, string | string[] | undefined>
    | Promise<Record<string, string | string[] | undefined>>;
}) {
  return resolveMetadataFromParams({ params: { path: ["app-studio"] }, searchParams });
}

export default function AppStudioPage() {
  return <AppStudioPageClient />;
}
