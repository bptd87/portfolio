import RoscoPaintCalculatorPageClient from "../_components/RoscoPaintCalculatorPageClient";
import { resolveMetadataFromParams } from "../seo/resolve-metadata";

export async function generateMetadata({
  searchParams,
}: {
  searchParams?:
    | Record<string, string | string[] | undefined>
    | Promise<Record<string, string | string[] | undefined>>;
}) {
  return resolveMetadataFromParams({ params: { path: ["rosco-paint-calculator"] }, searchParams });
}

export default function RoscoPaintCalculatorPage() {
  return <RoscoPaintCalculatorPageClient />;
}
