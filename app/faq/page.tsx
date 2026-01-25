import FAQPageClient from "../_components/FAQPageClient";
import { StructuredData } from "../seo/StructuredData";
import { resolveMetadataFromParams, resolveStructuredData } from "../seo/resolve-metadata";

export async function generateMetadata({
  searchParams,
}: {
  searchParams?:
    | Record<string, string | string[] | undefined>
    | Promise<Record<string, string | string[] | undefined>>;
}) {
  return resolveMetadataFromParams({ params: { path: ["faq"] }, searchParams });
}

export default async function FAQPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const structuredData = await resolveStructuredData("/faq", resolvedSearchParams);

  return (
    <>
      <StructuredData data={structuredData} />
      <FAQPageClient />
    </>
  );
}
