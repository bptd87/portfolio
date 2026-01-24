import DesignHistoryTimelinePageClient from "../_components/DesignHistoryTimelinePageClient";
import { resolveMetadataFromParams } from "../seo/resolve-metadata";

export async function generateMetadata({
  searchParams,
}: {
  searchParams?:
    | Record<string, string | string[] | undefined>
    | Promise<Record<string, string | string[] | undefined>>;
}) {
  return resolveMetadataFromParams({ params: { path: ["design-history-timeline"] }, searchParams });
}

export default function DesignHistoryTimelinePage() {
  return <DesignHistoryTimelinePageClient />;
}
