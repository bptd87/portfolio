import { redirect } from "next/navigation";

export default async function ScenicStudioRedirect({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await Promise.resolve(params);
  redirect(`/tutorial/${encodeURIComponent(resolvedParams.slug)}`);
}
