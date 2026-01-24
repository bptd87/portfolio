import AppStudioPageClient from "../_components/AppStudioPageClient";
import { StructuredData } from "../seo/StructuredData";
import { resolveMetadataFromParams, resolveStructuredData } from "../seo/resolve-metadata";

export async function generateMetadata({
  searchParams,
}: {
  searchParams?:
    | Record<string, string | string[] | undefined>
    | Promise<Record<string, string | string[] | undefined>>;
}) {
  return resolveMetadataFromParams({ params: { path: ["app-studio"] }, searchParams });
}

export default async function AppStudioPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const structuredData = await resolveStructuredData(
    "/app-studio",
    resolvedSearchParams,
  );

  return (
    <>
      <StructuredData data={structuredData} />
      <AppStudioPageClient />
    </>
  );
}
