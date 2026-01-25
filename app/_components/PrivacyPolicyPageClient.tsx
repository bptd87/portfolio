"use client";

import { PrivacyPolicy } from "@/src/views/PrivacyPolicy";
import { SiteShell } from "./SiteShell";
import { useLegacyNavigate } from "./useLegacyNavigate";

export default function PrivacyPolicyPageClient() {
  const onNavigate = useLegacyNavigate();

  return (
    <SiteShell currentPage="privacy-policy" onNavigate={onNavigate}>
      <PrivacyPolicy onNavigate={onNavigate} />
    </SiteShell>
  );
}
