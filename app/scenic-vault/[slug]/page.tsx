import ScenicVaultPageClient from "../../_components/ScenicVaultPageClient";
import { StructuredData } from "../../seo/StructuredData";
import { resolveMetadataFromParams, resolveStructuredData } from "../../seo/resolve-metadata";

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedParams = await Promise.resolve(params);
  return resolveMetadataFromParams({
    params: { path: ["scenic-vault", resolvedParams.slug] },
    searchParams,
  });
}

export default async function ScenicVaultDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedParams = await Promise.resolve(params);
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const structuredData = await resolveStructuredData(
    `/scenic-vault/${resolvedParams.slug}`,
    resolvedSearchParams,
  );

  return (
    <>
      <StructuredData data={structuredData} />
      <ScenicVaultPageClient slug={resolvedParams.slug} />
    </>
  );
}
