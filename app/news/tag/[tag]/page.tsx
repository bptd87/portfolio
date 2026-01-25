import { redirect } from "next/navigation";

export default async function NewsTagRedirect({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const resolvedParams = await Promise.resolve(params);
  const tag = encodeURIComponent(resolvedParams.tag);
  redirect(`/news?tag=${tag}`);
}
