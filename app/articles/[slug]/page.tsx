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

import { getArticle, getAllArticles } from "@/src/lib/api";

export default async function ArticleDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedParams = await Promise.resolve(params);
  const resolvedSearchParams = await Promise.resolve(searchParams);

  // Fetch valid article and related/recent articles in parallel
  const [article, allArticles] = await Promise.all([
    getArticle(resolvedParams.slug),
    getAllArticles()
  ]);

  console.log('Server Side Article Props:', {
    slug: resolvedParams.slug,
    articleTitle: article?.title,
    tagsEdges: article?.articleTags?.edges?.length,
    categoryEdges: article?.articleCatagories?.edges?.length,
    featuredImage: article?.featuredImage?.node?.sourceUrl,
    relatedCount: allArticles?.length
  });

  const structuredData = await resolveStructuredData(
    `/articles/${resolvedParams.slug}`,
    resolvedSearchParams,
  );

  return (
    <>
      <StructuredData data={structuredData} />
      <ArticleDetailPageClient slug={resolvedParams.slug} article={article} relatedArticles={allArticles} />
    </>
  );
}
