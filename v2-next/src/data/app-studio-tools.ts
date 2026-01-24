export type AppStudioTool = {
  id: string;
  title: string;
  description: string;
  route: string;
  category: string;
};

export const APP_STUDIO_TOOLS: AppStudioTool[] = [
  {
    id: "dimension-reference",
    title: "Dimension Reference",
    description:
      "Comprehensive database of standard dimensions for furniture, scenic flats, platforms, and architectural elements.",
    route: "dimension-reference",
    category: "Reference",
  },
  {
    id: "design-history-timeline",
    title: "Design History Timeline",
    description:
      "Interactive archive of architectural and artistic movements from 3000 BCE to present.",
    route: "design-history-timeline",
    category: "Reference",
  },
  {
    id: "classical-architecture-guide",
    title: "Classical Architecture",
    description:
      "Comprehensive guide to classical orders, molding profiles, and pediment types.",
    route: "classical-architecture-guide",
    category: "Reference",
  },
  {
    id: "architecture-scale-converter",
    title: "Scale Calculator",
    description:
      "Convert theatrical dimensions to 3D printable scale. Input imperial, get mm output.",
    route: "architecture-scale-converter",
    category: "Calculation",
  },
  {
    id: "rosco-paint-calculator",
    title: "Rosco Paint Calculator",
    description: "Calculate Rosco paint mixing formulas with precision measurements.",
    route: "rosco-paint-calculator",
    category: "Calculation",
  },
  {
    id: "commercial-paint-finder",
    title: "Commercial Paint Finder",
    description: "Find commercial paint matches for theatrical colors and formulas.",
    route: "commercial-paint-finder",
    category: "Calculation",
  },
  {
    id: "model-reference-scaler",
    title: "Model Reference Scaler",
    description:
      "Scale reference photos for model making. Upload images, set scale, export to PDF.",
    route: "model-reference-scaler",
    category: "Design",
  },
];
