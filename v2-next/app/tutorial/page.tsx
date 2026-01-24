import TutorialPageClient from "../_components/TutorialPageClient";
import { resolveMetadataFromParams } from "../seo/resolve-metadata";

export async function generateMetadata({
  searchParams,
}: {
  searchParams?:
    | Record<string, string | string[] | undefined>
    | Promise<Record<string, string | string[] | undefined>>;
}) {
  return resolveMetadataFromParams({ params: { path: ["tutorial"] }, searchParams });
}

export default function TutorialPage() {
  return <TutorialPageClient />;
}
