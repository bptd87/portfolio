import { redirect } from "next/navigation";

export default async function ExperientialDesignRedirect({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await Promise.resolve(params);
  redirect(`/project/${encodeURIComponent(resolvedParams.slug)}`);
}
