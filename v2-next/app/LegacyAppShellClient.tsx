"use client";

import dynamic from "next/dynamic";

const LegacyAppClient = dynamic(() => import("./LegacyAppClient"), {
  ssr: false,
});

export default function LegacyAppShellClient() {
  return <LegacyAppClient />;
}
