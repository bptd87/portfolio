import TutorialDetailPageClient from "../../_components/TutorialDetailPageClient";
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
    params: { path: ["scenic-studio", resolvedParams.slug] },
    searchParams,
  });
}

export default async function TutorialDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await Promise.resolve(params);
  return <TutorialDetailPageClient slug={resolvedParams.slug} />;
}
