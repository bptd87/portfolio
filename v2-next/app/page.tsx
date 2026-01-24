import HomePageClient from "./_components/HomePageClient";
import { StructuredData } from "./seo/StructuredData";
import { resolveMetadataFromParams, resolveStructuredData } from "./seo/resolve-metadata";

export async function generateMetadata({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined> | Promise<Record<string, string | string[] | undefined>>;
}) {
  return resolveMetadataFromParams({ params: { path: [] }, searchParams });
}

export default async function HomePage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const structuredData = await resolveStructuredData("/", resolvedSearchParams);

  return (
    <>
      <StructuredData data={structuredData} />
      <HomePageClient />
    </>
  );
}
