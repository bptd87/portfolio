import SitemapPageClient from "../_components/SitemapPageClient";
import { resolveMetadataFromParams } from "../seo/resolve-metadata";

export async function generateMetadata({
  searchParams,
}: {
  searchParams?:
    | Record<string, string | string[] | undefined>
    | Promise<Record<string, string | string[] | undefined>>;
}) {
  return resolveMetadataFromParams({ params: { path: ["sitemap"] }, searchParams });
}

export default function SitemapPage() {
  return <SitemapPageClient />;
}
