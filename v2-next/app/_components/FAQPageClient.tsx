"use client";

import { FAQ } from "../../../src/pages/FAQ";
import { SiteShell } from "./SiteShell";
import { useLegacyNavigate } from "./useLegacyNavigate";

export default function FAQPageClient() {
  const onNavigate = useLegacyNavigate();

  return (
    <SiteShell currentPage="faq" onNavigate={onNavigate}>
      <FAQ onNavigate={onNavigate} />
    </SiteShell>
  );
}
