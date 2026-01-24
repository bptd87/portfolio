import { redirect } from "next/navigation";

export default async function ScenicModelsRedirect({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await Promise.resolve(params);
  redirect(`/project/${encodeURIComponent(resolvedParams.slug)}`);
}
