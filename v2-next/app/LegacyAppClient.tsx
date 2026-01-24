"use client";

import App from "../../src/App";
import { ThemeProvider } from "../../src/components/ThemeProvider";
import { ErrorBoundary } from "../../src/components/ErrorBoundary";
import { SpeedInsights } from "@vercel/speed-insights/react";

export default function LegacyAppClient() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <App />
        <SpeedInsights />
      </ThemeProvider>
    </ErrorBoundary>
  );
}
