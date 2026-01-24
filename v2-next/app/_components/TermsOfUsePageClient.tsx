"use client";

import { TermsOfUse } from "../../../src/pages/TermsOfUse";
import { SiteShell } from "./SiteShell";
import { useLegacyNavigate } from "./useLegacyNavigate";

export default function TermsOfUsePageClient() {
  const onNavigate = useLegacyNavigate();

  return (
    <SiteShell currentPage="terms-of-use" onNavigate={onNavigate}>
      <TermsOfUse onNavigate={onNavigate} />
    </SiteShell>
  );
}
