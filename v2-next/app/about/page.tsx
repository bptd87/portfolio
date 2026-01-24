import AboutPageClient from "../_components/AboutPageClient";
import { StructuredData } from "../seo/StructuredData";
import { resolveMetadataFromParams, resolveStructuredData } from "../seo/resolve-metadata";

export async function generateMetadata({
  searchParams,
}: {
  searchParams?:
    | Record<string, string | string[] | undefined>
    | Promise<Record<string, string | string[] | undefined>>;
}) {
  return resolveMetadataFromParams({ params: { path: ["about"] }, searchParams });
}

export default async function AboutPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const structuredData = await resolveStructuredData("/about", resolvedSearchParams);

  return (
    <>
      <StructuredData data={structuredData} />
      <AboutPageClient />
    </>
  );
}
