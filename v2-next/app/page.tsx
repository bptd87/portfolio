import HomePageClient from "./_components/HomePageClient";
import { resolveMetadataFromParams } from "./seo/resolve-metadata";

export async function generateMetadata({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined> | Promise<Record<string, string | string[] | undefined>>;
}) {
  return resolveMetadataFromParams({ params: { path: [] }, searchParams });
}

export default function HomePage() {
  return <HomePageClient />;
}
