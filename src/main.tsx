import type { ComponentType } from "react";
import { createRoot } from "react-dom/client";
import { SpeedInsights } from "@vercel/speed-insights/react";
import App from "./App";
import "./index.css";
import { ErrorBoundary } from "./components/ErrorBoundary";

import { ThemeProvider } from "./components/ThemeProvider";

const ErrorBoundaryCompat = ErrorBoundary as unknown as ComponentType<any>;

createRoot(document.getElementById("root")!).render(
  <ErrorBoundaryCompat>
    <ThemeProvider>
      <App />
      <SpeedInsights />
    </ThemeProvider>
  </ErrorBoundaryCompat>
);
