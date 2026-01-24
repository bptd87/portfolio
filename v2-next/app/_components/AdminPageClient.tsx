"use client";

import { Admin } from "../../../src/pages/Admin";
import { SiteShell } from "./SiteShell";
import { useLegacyNavigate } from "./useLegacyNavigate";

export default function AdminPageClient() {
  const onNavigate = useLegacyNavigate();

  return (
    <SiteShell currentPage="admin" onNavigate={onNavigate}>
      <Admin onNavigate={onNavigate} />
    </SiteShell>
  );
}
