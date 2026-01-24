import { redirect } from "next/navigation";

export default async function TagRedirect({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const resolvedParams = await Promise.resolve(params);
  const tag = encodeURIComponent(resolvedParams.tag);
  redirect(`/articles?tag=${tag}`);
}
