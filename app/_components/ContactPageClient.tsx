"use client";

import { Contact } from "@/src/views/Contact";
import { SiteShell } from "./SiteShell";
import { useLegacyNavigate } from "./useLegacyNavigate";

export default function ContactPageClient() {
  const onNavigate = useLegacyNavigate();

  return (
    <SiteShell currentPage="contact" onNavigate={onNavigate}>
      <Contact />
    </SiteShell>
  );
}
