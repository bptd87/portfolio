"use client";

import { ScenicInsights } from "@/src/views/ScenicInsights";
import { SiteShell } from "./SiteShell";
import { useLegacyNavigate } from "./useLegacyNavigate";
import { useSearchParams } from "next/navigation";

export default function ArticlesPageClient({ articles }: { articles: any[] }) {
  const onNavigate = useLegacyNavigate();
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || undefined;
  const initialTag = searchParams.get("tag") || undefined;

  return (
    <SiteShell currentPage="articles" onNavigate={onNavigate}>
      <ScenicInsights
        onNavigate={onNavigate}
        initialCategory={initialCategory}
        initialTag={initialTag}
        articles={articles}
      />
    </SiteShell>
  );
}
