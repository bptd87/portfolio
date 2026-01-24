"use client";

import type { ComponentType } from "react";
import App from "../../src/App";
import { ThemeProvider } from "../../src/components/ThemeProvider";
import { ErrorBoundary } from "../../src/components/ErrorBoundary";
import { SpeedInsights } from "@vercel/speed-insights/react";

const ErrorBoundaryCompat = ErrorBoundary as unknown as ComponentType<any>;

export default function LegacyAppClient() {
  return (
    <ErrorBoundaryCompat>
      <ThemeProvider>
        <App />
        <SpeedInsights />
      </ThemeProvider>
    </ErrorBoundaryCompat>
  );
}
