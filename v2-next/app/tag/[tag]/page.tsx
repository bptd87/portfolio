import TagPageClient from "../../_components/TagPageClient";
import { resolveMetadataFromParams } from "../../seo/resolve-metadata";

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ tag: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedParams = await Promise.resolve(params);
  return resolveMetadataFromParams({
    params: { path: ["tag", resolvedParams.tag] },
    searchParams,
  });
}

export default async function TagPage({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const resolvedParams = await Promise.resolve(params);
  return <TagPageClient tag={resolvedParams.tag} />;
}
