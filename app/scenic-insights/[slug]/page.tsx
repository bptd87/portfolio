import { redirect } from "next/navigation";

export default async function ScenicInsightsRedirect({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await Promise.resolve(params);
  redirect(`/articles/${encodeURIComponent(resolvedParams.slug)}`);
}
