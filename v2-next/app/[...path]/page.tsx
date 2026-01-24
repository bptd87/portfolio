import LegacyAppShellClient from "../LegacyAppShellClient";
import { StructuredData } from "../seo/StructuredData";
import { resolveMetadataFromParams, resolveStructuredData } from "../seo/resolve-metadata";

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ path: string[] }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  return resolveMetadataFromParams({ params, searchParams });
}

export default async function CatchAllPage({
  params,
  searchParams,
}: {
  params: Promise<{ path: string[] }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const path = `/${(resolvedParams?.path || []).join("/")}`
    .replace("//", "/") || "/";
  const structuredData = await resolveStructuredData(
    path,
    resolvedSearchParams,
  );

  return (
    <>
      <StructuredData data={structuredData} />
      <LegacyAppShellClient />
    </>
  );
}
