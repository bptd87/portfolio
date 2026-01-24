"use client";

import { Home } from "../../../src/pages/Home";
import { SiteShell } from "./SiteShell";
import { useLegacyNavigate } from "./useLegacyNavigate";

export default function HomePageClient() {
  const onNavigate = useLegacyNavigate();
  return (
    <SiteShell currentPage="home" onNavigate={onNavigate}>
      <Home onNavigate={onNavigate} />
    </SiteShell>
  );
}
