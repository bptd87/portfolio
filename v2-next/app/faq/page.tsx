import FAQPageClient from "../_components/FAQPageClient";
import { resolveMetadataFromParams } from "../seo/resolve-metadata";

export async function generateMetadata({
  searchParams,
}: {
  searchParams?:
    | Record<string, string | string[] | undefined>
    | Promise<Record<string, string | string[] | undefined>>;
}) {
  return resolveMetadataFromParams({ params: { path: ["faq"] }, searchParams });
}

export default function FAQPage() {
  return <FAQPageClient />;
}
