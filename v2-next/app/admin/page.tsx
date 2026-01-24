import AdminPageClient from "../_components/AdminPageClient";
import { resolveMetadataFromParams } from "../seo/resolve-metadata";

export async function generateMetadata() {
  return resolveMetadataFromParams({ params: { path: ["admin"] } });
}

export default function AdminPage() {
  return <AdminPageClient />;
}
