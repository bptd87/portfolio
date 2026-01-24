import ProjectDetailPageClient from "../../_components/ProjectDetailPageClient";
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
    params: { path: ["project", resolvedParams.slug] },
    searchParams,
  });
}

export default async function ScenicModelsProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await Promise.resolve(params);
  return <ProjectDetailPageClient slug={resolvedParams.slug} />;
}
