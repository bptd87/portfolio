"use client";

import { BlogFormatter } from "@/src/views/BlogFormatter";
import { SiteShell } from "./SiteShell";
import { useLegacyNavigate } from "./useLegacyNavigate";

export default function BlogFormatterPageClient() {
  const onNavigate = useLegacyNavigate();

  return (
    <SiteShell currentPage="blog-formatter" onNavigate={onNavigate}>
      <BlogFormatter />
    </SiteShell>
  );
}
