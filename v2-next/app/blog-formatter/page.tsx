import BlogFormatterPageClient from "../_components/BlogFormatterPageClient";
import { resolveMetadataFromParams } from "../seo/resolve-metadata";

export async function generateMetadata({
  searchParams,
}: {
  searchParams?:
    | Record<string, string | string[] | undefined>
    | Promise<Record<string, string | string[] | undefined>>;
}) {
  return resolveMetadataFromParams({ params: { path: ["blog-formatter"] }, searchParams });
}

export default function BlogFormatterPage() {
  return <BlogFormatterPageClient />;
}
