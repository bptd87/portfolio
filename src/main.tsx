import { createRoot } from "react-dom/client";
import { SpeedInsights } from "@vercel/speed-insights/react";
import App from "./App";
import "./index.css";
import { ErrorBoundary } from "./components/ErrorBoundary";

import { ThemeProvider } from "./components/ThemeProvider";

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <ThemeProvider>
      <App />
      <SpeedInsights />
    </ThemeProvider>
  </ErrorBoundary>
);
