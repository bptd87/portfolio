"use client";

import { Search } from "../../../src/pages/Search";
import { SiteShell } from "./SiteShell";
import { useLegacyNavigate } from "./useLegacyNavigate";
import { useSearchParams } from "next/navigation";

export default function SearchPageClient() {
  const onNavigate = useLegacyNavigate();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || undefined;

  return (
    <SiteShell currentPage="search" onNavigate={onNavigate}>
      <Search onNavigate={onNavigate} initialQuery={initialQuery} />
    </SiteShell>
  );
}
