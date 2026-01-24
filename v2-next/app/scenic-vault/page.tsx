import ScenicVaultPageClient from "../_components/ScenicVaultPageClient";
import { resolveMetadataFromParams } from "../seo/resolve-metadata";

export async function generateMetadata({
  searchParams,
}: {
  searchParams?:
    | Record<string, string | string[] | undefined>
    | Promise<Record<string, string | string[] | undefined>>;
}) {
  return resolveMetadataFromParams({ params: { path: ["scenic-vault"] }, searchParams });
}

export default function ScenicVaultPage() {
  return <ScenicVaultPageClient />;
}
