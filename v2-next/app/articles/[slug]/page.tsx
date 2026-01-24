import ArticleDetailPageClient from "../../_components/ArticleDetailPageClient";
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
    params: { path: ["articles", resolvedParams.slug] },
    searchParams,
  });
}

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await Promise.resolve(params);
  return <ArticleDetailPageClient slug={resolvedParams.slug} />;
}
