/**
 * Centralized SEO Metadata Configuration
 *
 * This file contains all SEO metadata for the site including:
 * - Page titles and descriptions
 * - Open Graph tags for social sharing
 * - Twitter Card data
 * - Canonical URLs
 *
 * Update this file when adding new pages or changing content.
 */

export interface PageMetadata {
  title: string;
  description: string;
  keywords?: string[];
  ogImage?: string;
  ogType?: "website" | "article" | "profile";
  twitterCard?: "summary" | "summary_large_image";
  canonicalPath?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  noindex?: boolean; // Add noindex property
  googleSiteVerification?: string; // For GSC verification
}

// Import social links
import { SOCIAL_PROFILE_URLS } from "../../data/social-links";
import { resolveImageUrl } from "../image";

// Site-wide defaults
export const DEFAULT_METADATA = {
  siteName: "Brandon PT Davis",
  siteUrl: typeof window !== "undefined"
    ? window.location.origin
    : "https://www.brandonptdavis.com",
  author: "Brandon PT Davis",
  twitterHandle: "@brandonptdavis",
  defaultOgImage: "/og-default.jpg",
  defaultDescription:
    "Scenic and experiential designer based in Southern California, specializing in theatre, immersive environments, and narrative-driven spatial design. Over fifteen years of professional experience in regional theatre, summer stock, and experiential installations.",
  socialProfiles: SOCIAL_PROFILE_URLS,
};

// Static page metadata
export const PAGE_METADATA: Record<string, PageMetadata> = {
  // HOME
  home: {
    title: "Brandon PT Davis | Scenic & Experiential Designer",
    description:
      "Scenic and experiential designer based in Southern California, specializing in theatre, immersive environments, and narrative-driven spatial design. Over fifteen years of professional experience designing for regional theatre, summer stock, and experiential installations.",
    keywords: [
      "scenic designer",
      "experiential designer",
      "Brandon PT Davis",
      "theatre set design",
      "spatial storytelling",
      "production design",
      "scenic visualization",
      "immersive environments",
      "vectorworks",
      "twinmotion",
    ],
    ogType: "website",
    twitterCard: "summary_large_image",
    canonicalPath: "/",
  },

  // PORTFOLIO
  portfolio: {
    title: "Portfolio | Scenic Design & Experiential Work",
    description:
      "Explore scenic design projects spanning theatre, opera, experiential design, and architectural visualization. From intimate black box productions to large-scale theatrical experiences.",
    keywords: [
      "scenic design portfolio",
      "theatre portfolio",
      "set design projects",
      "experiential design",
    ],
    ogType: "website",
    twitterCard: "summary_large_image",
    canonicalPath: "/portfolio",
  },

  "portfolio-scenic": {
    title: "Scenic Design Portfolio | Theatre & Opera Productions",
    description:
      "Scenic design work for theatre and opera productions. Explore detailed renderings, technical drawings, and production photos from professional theatrical work.",
    keywords: ["scenic design", "theatre design", "opera design", "set design"],
    ogType: "website",
    canonicalPath: "/portfolio?filter=scenic",
  },

  "portfolio-experiential": {
    title: "Experiential Design Portfolio | Immersive Environments",
    description:
      "Experiential design and immersive environment work blending theatrical design principles with interactive spaces.",
    keywords: [
      "experiential design",
      "immersive design",
      "environmental design",
    ],
    ogType: "website",
    canonicalPath: "/portfolio?filter=experiential",
  },

  "portfolio-rendering": {
    title: "Rendering & Visualization Portfolio | 3D Design Work",
    description:
      "Architectural visualization and 3D rendering work showcasing technical expertise in Vectorworks and digital design tools.",
    keywords: [
      "3D rendering",
      "architectural visualization",
      "vectorworks",
      "design rendering",
    ],
    ogType: "website",
    canonicalPath: "/portfolio?filter=rendering",
  },

  "portfolio-documentation": {
    title: "Design Documentation Portfolio | Technical Drawings",
    description:
      "Technical design documentation, drafting packages, and construction drawings for theatrical productions.",
    keywords: [
      "technical drawings",
      "design documentation",
      "theatrical drafting",
      "CAD drawings",
    ],
    ogType: "website",
    canonicalPath: "/portfolio?filter=documentation",
  },

  "experiential-design": {
    title: "Experiential Design | Immersive Environments",
    description:
      "Experiential design portfolio by Brandon PT Davis. Immersive brand activations, pop-up environments, and spatial storytelling that connect audiences to narrative-driven spaces.",
    keywords: [
      "experiential design",
      "immersive environments",
      "brand activations",
      "spatial storytelling",
      "environmental design",
    ],
    ogType: "website",
    canonicalPath: "/experiential-design",
  },

  rendering: {
    title: "Rendering & Visualization | 3D Design",
    description:
      "High-fidelity 3D rendering and architectural visualization for theatre, events, and spatial concepts. Vectorworks and Twinmotion workflows that communicate design intent clearly.",
    keywords: [
      "3D rendering",
      "architectural visualization",
      "vectorworks",
      "twinmotion",
      "design rendering",
    ],
    ogType: "website",
    canonicalPath: "/rendering",
  },

  "scenic-models": {
    title: "Scenic Models | Physical Scale Models",
    description:
      "Portfolio of hand-crafted scenic models for theatre and events. 1:48 and 1:25 scale models exploring proportion, material, and spatial relationships.",
    keywords: [
      "scenic models",
      "scale models",
      "physical models",
      "theatre design models",
      "model making",
    ],
    ogType: "website",
    canonicalPath: "/scenic-models",
  },

  tutorial: {
    title: "Tutorials | Scenic Studio",
    description:
      "Tutorials, guides, and workflows for scenic design, Vectorworks, and visualization tools.",
    keywords: [
      "scenic design tutorials",
      "vectorworks tutorials",
      "design workflows",
      "scenic studio",
    ],
    ogType: "website",
    canonicalPath: "/tutorial",
  },

  // ABOUT
  about: {
    title: "About | Brandon PT Davis - Scenic & Experiential Designer",
    description:
      "Brandon PT Davis is a scenic and experiential designer whose work explores the relationship between story, space, and audience. With over fifteen years of professional experience, he has designed more than forty productions across the United States. Member of United Scenic Artists Local USA 829.",
    keywords: [
      "Brandon PT Davis",
      "scenic designer bio",
      "experiential designer",
      "USA 829",
      "theatre designer",
      "Southern California designer",
    ],
    ogType: "profile",
    twitterCard: "summary_large_image",
    canonicalPath: "/about",
  },

  "creative-statement": {
    title: "Creative Statement | Scenic Storytelling Philosophy",
    description:
      "A concise creative manifesto outlining how narrative, architecture, and technology shape my scenic storytelling.",
    keywords: [
      "creative statement",
      "scenic storytelling",
      "design philosophy",
    ],
    ogType: "article",
    twitterCard: "summary_large_image",
    canonicalPath: "/creative-statement",
  },

  news: {
    title: "News | Latest Updates & Announcements",
    description:
      "Latest news, project announcements, and updates from scenic design work.",
    keywords: ["theatre news", "design news", "project updates"],
    ogType: "website",
    canonicalPath: "/news",
  },

  cv: {
    title: "Curriculum Vitae | Professional Experience",
    description:
      "Complete CV including education, professional experience, design credits, teaching history, and publications.",
    keywords: ["scenic designer cv", "theatre resume", "design credits"],
    ogType: "profile",
    canonicalPath: "/cv",
  },

  collaborators: {
    title: "Collaborators | Creative Partners & Directors",
    description:
      "Talented directors, choreographers, and creative collaborators I've had the privilege of working with throughout my career.",
    keywords: ["theatre collaborators", "creative partners", "directors"],
    ogType: "website",
    canonicalPath: "/collaborators",
  },

  "teaching-philosophy": {
    title: "Teaching Philosophy | Scenic Design Education",
    description:
      "My approach to teaching scenic design: balancing traditional craft with emerging technologies, fostering collaboration, and preparing students for careers across theatre, film, and themed entertainment.",
    keywords: [
      "scenic design teaching",
      "theatre education",
      "design pedagogy",
      "teaching philosophy",
    ],
    ogType: "article",
    canonicalPath: "/teaching-philosophy",
  },

  // RESOURCES
  resources: {
    title: "Resources | Free Tools, Tutorials & Design Articles",
    description:
      "Everything you need to elevate your scenic design practice. Free tools, video tutorials, 3D assets, and in-depth articles for theatre designers.",
    keywords: [
      "scenic design resources",
      "theatre design tools",
      "vectorworks tutorials",
      "design articles",
    ],
    ogType: "website",
    twitterCard: "summary_large_image",
    canonicalPath: "/resources",
  },

  articles: {
    title: "Articles | Design Philosophy & Tutorials",
    description:
      "Deep dives into design philosophy, technology tutorials, hardware guides, and insights from the theatrical design field.",
    keywords: [
      "scenic design blog",
      "design philosophy",
      "theatre tutorials",
      "design articles",
    ],
    ogType: "website",
    canonicalPath: "/articles",
  },

  "scenic-toolkit": {
    title: "Scenic Toolkit | Designer's Resource Library",
    description:
      "A curated resource library for scenic designers including software recommendations, materials resources, research tools, and hardware guides.",
    keywords: [
      "scenic design toolkit",
      "design resources",
      "theatre software",
      "design tools",
    ],
    ogType: "website",
    canonicalPath: "/scenic-toolkit",
  },

  "studio": {
    title: "Studio | Tutorials, Tools & Resources for Scenic Designers",
    description:
      "Your one-stop destination for scenic design resources: video tutorials, web tools, model library, and curated industry links.",
    keywords: [
      "scenic design tutorials",
      "theatre design tools",
      "scenic design resources",
      "vectorworks tutorials",
      "3D modeling",
    ],
    ogType: "website",
    canonicalPath: "/studio",
  },



  "vectorworks-vault": {
    title: "Vectorworks Vault | Free 3D Models & Venue Files",
    description:
      "Download beautiful design assets, venue files, props, and architectural elements built entirely in Vectorworks. Production-ready 3D models for scenic designers.",
    keywords: [
      "vectorworks models",
      "free 3D assets",
      "theatre venue files",
      "vectorworks downloads",
    ],
    ogType: "website",
    canonicalPath: "/vectorworks-vault",
  },

  "architecture-scale-converter": {
    title: "3D Print Scale Calculator | Theatrical Design to 3D Printing",
    description:
      "Convert theatrical and architectural dimensions to 3D printable scale. Imperial to mm with printer compatibility check. Perfect for scenic model making.",
    keywords: [
      "3D printing scale",
      "theatrical model scale",
      "architectural scale converter",
      "3D print calculator",
      "scenic design 3D printing",
    ],
    ogType: "website",
    canonicalPath: "/architecture-scale-converter",
  },

  "dimension-reference": {
    title: "Dimension Reference Guide | Theatre, Architecture & Event Design",
    description:
      "Comprehensive dimension database for scenic design. Standard sizes for furniture, flats, platforms, doors, event tables, and architectural elements.",
    keywords: [
      "scenic design dimensions",
      "hollywood flat size",
      "theatre platform dimensions",
      "furniture dimensions",
      "event table sizes",
      "architectural standards",
    ],
    ogType: "website",
    canonicalPath: "/dimension-reference",
  },

  "model-reference-scaler": {
    title: "Model Reference Scaler | Scale Photos for Model Making",
    description:
      "Scale reference photos for architectural and scenic model making. Upload images, set scale using known dimensions, arrange on 8.5×11 or 11×17 sheets, export to PDF.",
    keywords: [
      "model making",
      "scale reference",
      "architectural model",
      "scenic model",
      "photo scaling",
      "reference image scaling",
      "model builder tool",
    ],
    ogType: "website",
    canonicalPath: "/model-reference-scaler",
  },

  "rosco-paint-calculator": {
    title: "Rosco Paint Calculator | Scenic Paint Estimator",
    description:
      "Calculate exactly how much Rosco Off Broadway or Super Saturated paint you need for your scenery. Adjust for dilution ratios and coverage area.",
    keywords: [
      "paint calculator",
      "rosco paint",
      "scenic painting",
      "paint estimator",
    ],
    ogType: "website",
    canonicalPath: "/rosco-paint-calculator",
  },

  "commercial-paint-finder": {
    title: "Commercial Paint Finder | Pantone & RAL Matching",
    description:
      "Find commercial paint equivalents (Benjamin Moore, Sherwin Williams, Behr) for standard theatrical colors and Pantone/RAL codes.",
    keywords: [
      "paint matching",
      "pantone to benjamin moore",
      "theatrical paint conversion",
    ],
    ogType: "website",
    canonicalPath: "/commercial-paint-finder",
  },

  "classical-architecture-guide": {
    title: "Classical Architecture Guide | Orders & Proportions",
    description:
      "Interactive reference guide for the Five Orders of Classical Architecture. Doric, Ionic, Corinthian, Tuscan, and Composite proportions.",
    keywords: [
      "classical architecture",
      "architectural orders",
      "scenic design reference",
    ],
    ogType: "website",
    canonicalPath: "/classical-architecture-guide",
  },

  "design-history-timeline": {
    title: "Design History Timeline | Period Style Reference",
    description:
      "Interactive timeline of design history, architectural styles, and period decor for scenic designers.",
    keywords: ["design history", "period style", "architectural timeline"],
    ogType: "website",
    canonicalPath: "/design-history-timeline",
  },

  "app-studio": {
    title: "Studio | Design Tools",
    description:
      "Free web-based tools for scenic designers and technical directors. 3D printing calculators, material estimators, and technical utilities.",
    keywords: [
      "scenic design tools",
      "theatre design apps",
      "technical theatre calculator",
      "3D printing theatre",
      "scenic design software",
    ],
    ogType: "website",
    canonicalPath: "/app-studio",
  },

  "scenic-vault": {
    title: "Scenic Vault | Model Library & Downloads",
    description:
      "Download Vectorworks models, props, venue files, and reference assets curated for scenic designers.",
    keywords: [
      "vectorworks models",
      "scenic vault",
      "design assets",
      "free 3D props",
    ],
    ogType: "website",
    canonicalPath: "/scenic-vault",
  },

  // CONTACT
  contact: {
    title: "Contact | Get In Touch",
    description:
      "Get in touch to discuss scenic design projects, teaching opportunities, or speaking engagements.",
    keywords: ["contact scenic designer", "hire designer", "design inquiry"],
    ogType: "website",
    canonicalPath: "/contact",
  },

  // SEARCH
  search: {
    title: "Search | Find Projects, Articles & Resources",
    description:
      "Search across all projects, articles, and resources to find exactly what you need.",
    keywords: ["search", "find projects", "search articles"],
    ogType: "website",
    canonicalPath: "/search",
  },

  // ADMIN
  admin: {
    title: "Admin Panel | Content Management",
    description: "Administrative access for content management.",
    keywords: ["admin"],
    ogType: "website",
    canonicalPath: "/admin",
    noindex: true, // Don't index admin page
  },

  directory: {
    title: "Directory | Trusted Vendors & Shops",
    description:
      "A curated directory of trusted scenery shops, rental houses, and material vendors for the entertainment industry.",
    keywords: [
      "scenic directory",
      "vendor list",
      "scene shops",
      "prop rentals",
    ],
    ogType: "website",
    canonicalPath: "/directory",
  },

  links: {
    title: "Links | Quick Access",
    description: "Quick links to portfolios, resources, and social profiles.",
    keywords: ["links", "portfolio links", "social links"],
    ogType: "website",
    canonicalPath: "/links",
    noindex: true,
  },

  "news-article": {
    title: "News Article | Update",
    description: "Latest news update from Brandon PT Davis.",
    keywords: ["news", "update", "announcement"],
    ogType: "article",
    twitterCard: "summary_large_image",
    canonicalPath: "/news",
  },

  // LEGAL PAGES
  faq: {
    title: "FAQ | Frequently Asked Questions",
    description:
      "Frequently asked questions about scenic design work, process, collaboration opportunities, and services.",
    keywords: ["FAQ", "questions", "scenic design help"],
    ogType: "website",
    canonicalPath: "/faq",
  },

  "privacy-policy": {
    title: "Privacy Policy | How We Protect Your Data",
    description:
      "Our privacy policy outlining how we collect, use, and protect your personal information on brandonptdavis.com.",
    keywords: ["privacy policy", "data protection", "privacy"],
    ogType: "website",
    canonicalPath: "/privacy-policy",
  },

  accessibility: {
    title: "Accessibility Statement | Our Commitment to Inclusive Design",
    description:
      "Our commitment to making brandonptdavis.com accessible to all users, including those with disabilities.",
    keywords: ["accessibility", "WCAG", "inclusive design"],
    ogType: "website",
    canonicalPath: "/accessibility",
  },

  "terms-of-use": {
    title: "Terms of Use | Website Terms & Conditions",
    description:
      "Terms and conditions for using brandonptdavis.com, including copyright, usage rights, and legal disclaimers.",
    keywords: ["terms of use", "terms and conditions", "legal"],
    ogType: "website",
    canonicalPath: "/terms-of-use",
  },

  "404": {
    title: "404 - Page Not Found",
    description: "The page you're looking for doesn't exist or has been moved.",
    keywords: ["404", "not found"],
    ogType: "website",
    canonicalPath: "/404",
    noindex: true,
  },

  sitemap: {
    title: "Sitemap | Complete Site Navigation",
    description:
      "Complete sitemap of brandonptdavis.com including all pages, projects, articles, and resources.",
    keywords: ["sitemap", "site navigation", "site map"],
    ogType: "website",
    canonicalPath: "/sitemap",
  },
};

/**
 * Generate metadata for a blog post/article
 */
export function generateArticleMetadata(article: {
  title: string;
  excerpt: string;
  coverImage?: string;
  category: string;
  date: string;
  author?: string;
  id: string;
  slug?: string;
  tags?: string[];
  updatedAt?: string;
}): PageMetadata {
  // Use article tags for keywords, fallback to category-based keywords
  const keywords = article.tags && article.tags.length > 0
    ? [
      ...article.tags.map((tag) => tag.toLowerCase()),
      "scenic design",
      "theatre design",
    ]
    : [
      article.category.toLowerCase(),
      "scenic design",
      "theatre design",
      "design article",
    ];

  // Ensure absolute URL for Open Graph
  const coverImageValue = typeof article.coverImage === "string"
    ? article.coverImage
    : (article.coverImage as any)?.url || (article.coverImage as any)?.src;
  const absoluteCoverImage = coverImageValue
    ? (coverImageValue.startsWith("http")
      ? coverImageValue
      : `${DEFAULT_METADATA.siteUrl}${coverImageValue}`)
    : undefined;

  // Use slug for canonical if available, otherwise ID
  const pathId = article.slug || article.id;

  return {
    title: `${article.title} | Articles`,
    description: article.excerpt,
    keywords: keywords,
    ogImage: absoluteCoverImage, // Always absolute URL
    ogType: "article",
    twitterCard: "summary_large_image",
    canonicalPath: `/articles/${pathId}`,
    author: article.author || DEFAULT_METADATA.author,
    publishedTime: article.date,
    modifiedTime: article.updatedAt,
  };
}

/**
 * Generate metadata for a portfolio project
 */
export function generateProjectMetadata(project: {
  title: string;
  subtitle?: string;
  description?: string;
  heroImage?: string;
  cardImage?: string;
  year?: string | number;
  venue?: string;
  slug: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  ogImage?: string;
}): PageMetadata {
  // Use custom SEO fields if provided, otherwise generate defaults
  const title = project.seoTitle ||
    `${project.title} | Scenic Design Portfolio`;

  const descriptionValue = typeof project.description === "string"
    ? project.description
    : "";

  const description = project.seoDescription ||
    descriptionValue.substring(0, 160) ||
    `${project.title}${
      project.subtitle ? ": " + project.subtitle : ""
    }. Scenic design for ${project.venue || "theatrical production"}${
      project.year ? " (" + project.year + ")" : ""
    }.`;

  const keywords = project.seoKeywords && project.seoKeywords.length > 0
    ? project.seoKeywords
    : [
      "scenic design",
      project.title.toLowerCase(),
      "theatre production",
      "set design",
    ];

  const image = project.ogImage || project.heroImage || project.cardImage;
  const imageValue = resolveImageUrl(image as any);

  // Ensure absolute URL for Open Graph
  const absoluteImage = imageValue
    ? (imageValue.startsWith("http")
      ? imageValue
      : `${DEFAULT_METADATA.siteUrl}${imageValue}`)
    : undefined;

  return {
    title,
    description: description.substring(0, 160),
    keywords,
    ogImage: absoluteImage, // Always absolute URL for social sharing
    ogType: "article",
    twitterCard: "summary_large_image",
    canonicalPath: `/project/${project.slug}`,
  };
}

/**
 * Generate metadata for a tutorial/video
 */
export function generateTutorialMetadata(tutorial: {
  title: string;
  description: string;
  thumbnail?: string;
  category?: string;
  slug: string;
}): PageMetadata {
  const thumbnailValue = resolveImageUrl(tutorial.thumbnail);
  const absoluteThumbnail = thumbnailValue
    ? (thumbnailValue.startsWith("http")
      ? thumbnailValue
      : `${DEFAULT_METADATA.siteUrl}${thumbnailValue}`)
    : undefined;

  return {
    title: `${tutorial.title} | Studio`,
    description: tutorial.description,
    keywords: [
      "vectorworks tutorial",
      "scenic design tutorial",
      tutorial.category?.toLowerCase() || "design tutorial",
    ],
    ogImage: absoluteThumbnail,
    ogType: "article",
    twitterCard: "summary_large_image",
    canonicalPath: `/tutorial/${tutorial.slug}`,
  };
}

/**
 * Generate metadata for a vault item
 */
export function generateVaultItemMetadata(item: {
  title: string;
  description: string;
  previewImage?: string;
  category?: string;
  slug: string;
}): PageMetadata {
  return {
    title: `${item.title} | Vectorworks Vault`,
    description: item.description,
    keywords: [
      "vectorworks download",
      "free 3D model",
      item.category?.toLowerCase() || "design asset",
    ],
    ogImage: item.previewImage,
    ogType: "website",
    twitterCard: "summary_large_image",
    canonicalPath: `/scenic-vault/${item.slug}`,
  };
}

/**
 * Generate metadata for a news item
 */
export function generateNewsMetadata(newsItem: {
  title: string;
  excerpt: string;
  coverImage?: string;
  category: string;
  date: string;
  lastModified: string;
  id: string;
  slug?: string;
  tags?: string[];
}): PageMetadata {
  // Use news tags for keywords, fallback to category-based keywords
  const keywords = newsItem.tags && newsItem.tags.length > 0
    ? [
      ...newsItem.tags.map((tag) => tag.toLowerCase()),
      "scenic design",
      "theatre news",
    ]
    : [
      newsItem.category.toLowerCase(),
      "scenic design",
      "theatre news",
      "design updates",
    ];

  // Use slug for canonical if available, otherwise ID
  const pathId = newsItem.slug || newsItem.id;

  const coverImageValue = resolveImageUrl(newsItem.coverImage);
  const absoluteCoverImage = coverImageValue
    ? (coverImageValue.startsWith("http")
      ? coverImageValue
      : `${DEFAULT_METADATA.siteUrl}${coverImageValue}`)
    : undefined;

  return {
    title: `${newsItem.title} | News`,
    description: newsItem.excerpt,
    keywords: keywords,
    ogImage: absoluteCoverImage,
    ogType: "article",
    twitterCard: "summary_large_image",
    canonicalPath: `/news/${pathId}`,
    author: DEFAULT_METADATA.author,
    publishedTime: newsItem.date,
    modifiedTime: newsItem.lastModified,
  };
}
