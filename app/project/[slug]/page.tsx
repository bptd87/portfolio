import ClientProjectWrapper from "../../_components/ClientProjectWrapper";
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
  try {
    return await resolveMetadataFromParams({
      params: { path: ["project", resolvedParams.slug] },
      searchParams,
    });
  } catch (e) {
    console.error("Failed to generate metadata for project:", e);
    return {
      title: "Project Not Found",
      description: "The requested project could not be found.",
    };
  }
}

export default async function ProjectDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedParams = await Promise.resolve(params);
  const resolvedSearchParams = await Promise.resolve(searchParams);
  let structuredData: any = null;
  try {
    structuredData = await resolveStructuredData(
      `/project/${resolvedParams.slug}`,
      resolvedSearchParams,
    );
  } catch (err) {
    console.error("Failed to resolve structured data:", err);
    // Continue rendering without structured data
  }

  return (
    <>
      {structuredData && <StructuredData data={structuredData} />}
      {/* Debug logging */}
      {console.log(`[ProjectPage] Rendering client component for slug: ${resolvedParams.slug}`)}
      <ClientProjectWrapper slug={resolvedParams.slug} />
    </>
  );
}
