import NewsDetailPageClient from "../../_components/NewsDetailPageClient";
import { resolveMetadataFromParams } from "../../seo/resolve-metadata";

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedParams = await Promise.resolve(params);
  return resolveMetadataFromParams({
    params: { path: ["news", resolvedParams.slug] },
    searchParams,
  });
}

export default async function NewsArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await Promise.resolve(params);
  return <NewsDetailPageClient slug={resolvedParams.slug} />;
}
