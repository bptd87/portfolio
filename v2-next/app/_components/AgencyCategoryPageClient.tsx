"use client";

import React from "react";
import { AgencyCategoryPage } from "../../../src/pages/AgencyCategoryPage";
import { SiteShell } from "./SiteShell";
import { useLegacyNavigate } from "./useLegacyNavigate";

interface AgencyCategoryPageClientProps {
  categorySlug: string;
  title: string;
  subtitle: string;
  description: string;
  seoDescription?: string;
  detailedContent?: React.ReactNode;
  heroImage?: string;
  initialProjectSlug?: string | null;
}

export default function AgencyCategoryPageClient({
  categorySlug,
  title,
  subtitle,
  description,
  seoDescription,
  detailedContent,
  heroImage,
  initialProjectSlug,
}: AgencyCategoryPageClientProps) {
  const onNavigate = useLegacyNavigate();

  return (
    <SiteShell currentPage={categorySlug} onNavigate={onNavigate} slug={initialProjectSlug}>
      <AgencyCategoryPage
        categorySlug={categorySlug}
        title={title}
        subtitle={subtitle}
        description={description}
        seoDescription={seoDescription}
        detailedContent={detailedContent}
        heroImage={heroImage}
        initialProjectSlug={initialProjectSlug}
        onNavigate={onNavigate}
      />
    </SiteShell>
  );
}
