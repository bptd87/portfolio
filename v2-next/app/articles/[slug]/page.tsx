import ArticleDetailPageClient from "../../_components/ArticleDetailPageClient";
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
    params: { path: ["articles", resolvedParams.slug] },
    searchParams,
  });
}

export default async function ArticleDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedParams = await Promise.resolve(params);
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const structuredData = await resolveStructuredData(
    `/articles/${resolvedParams.slug}`,
    resolvedSearchParams,
  );

  return (
    <>
      <StructuredData data={structuredData} />
      <ArticleDetailPageClient slug={resolvedParams.slug} />
    </>
  );
}
