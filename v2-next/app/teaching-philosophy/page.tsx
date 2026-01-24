import TeachingPhilosophyPageClient from "../_components/TeachingPhilosophyPageClient";
import { resolveMetadataFromParams } from "../seo/resolve-metadata";

export async function generateMetadata({
  searchParams,
}: {
  searchParams?:
    | Record<string, string | string[] | undefined>
    | Promise<Record<string, string | string[] | undefined>>;
}) {
  return resolveMetadataFromParams({ params: { path: ["teaching-philosophy"] }, searchParams });
}

export default function TeachingPhilosophyPage() {
  return <TeachingPhilosophyPageClient />;
}
