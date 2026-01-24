import ScenicStudioPageClient from "../_components/ScenicStudioPageClient";
import { resolveMetadataFromParams } from "../seo/resolve-metadata";

export async function generateMetadata({
  searchParams,
}: {
  searchParams?:
    | Record<string, string | string[] | undefined>
    | Promise<Record<string, string | string[] | undefined>>;
}) {
  return resolveMetadataFromParams({ params: { path: ["scenic-studio"] }, searchParams });
}

export default function ScenicStudioPage() {
  return <ScenicStudioPageClient />;
}
