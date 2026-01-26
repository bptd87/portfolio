/**
 * Sitemap Generator
 *
 * Run this to generate a sitemap.xml file for search engines.
 * This helps Google and other search engines discover all your pages.
 *
 * Usage:
 * 1. Update the SITE_URL constant below
 * 2. Copy the output from console
 * 3. Save to /public/sitemap.xml
 *
 * Or better: Set up a build script to auto-generate this
 */

import { blogPosts } from "../../data/blog-posts";
import { projects } from "../../data/projects.deprecated";
import { vaultItems } from "../../data/vault-items";

const SITE_URL = "https://brandonptdavis.com";

interface SitemapURL {
  loc: string;
  lastmod?: string;
  changefreq?:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
  priority?: number;
}

/**
 * Generate sitemap XML
 */
export function generateSitemap(): string {
  const urls: SitemapURL[] = [];

  // Static pages (high priority)
  const staticPages = [
    { path: "/", priority: 1.0, changefreq: "weekly" as const },
    { path: "/portfolio", priority: 0.9, changefreq: "weekly" as const },
    { path: "/about", priority: 0.8, changefreq: "monthly" as const },
    { path: "/resources", priority: 0.9, changefreq: "weekly" as const },
    { path: "/software", priority: 0.8, changefreq: "monthly" as const },
    { path: "/contact", priority: 0.7, changefreq: "monthly" as const },
  ];

  staticPages.forEach((page) => {
    urls.push({
      loc: `${SITE_URL}${page.path}`,
      lastmod: new Date().toISOString().split("T")[0],
      changefreq: page.changefreq,
      priority: page.priority,
    });
  });

  // Portfolio filters
  const portfolioFilters = [
    "scenic",
    "experiential",
    "rendering",
    "documentation",
  ];
  portfolioFilters.forEach((filter) => {
    urls.push({
      loc: `${SITE_URL}/portfolio?filter=${filter}`,
      lastmod: new Date().toISOString().split("T")[0],
      changefreq: "weekly",
      priority: 0.8,
    });
  });

  // Resource pages
  const resourcePages = [
    "/articles",
    "/studio",
    "/tutorials",
    "/app-studio",
    "/scenic-vault",
    "/scenic-toolkit",
    "/architecture-scale-converter",
    "/dimension-reference",
    "/model-reference-scaler",
    "/rosco-paint-calculator",
    "/commercial-paint-finder",
    "/classical-architecture-guide",
    "/design-history-timeline",
  ];

  resourcePages.forEach((page) => {
    urls.push({
      loc: `${SITE_URL}${page}`,
      lastmod: new Date().toISOString().split("T")[0],
      changefreq: "weekly",
      priority: 0.8,
    });
  });

  // Software pages
  const softwarePages = ["/software/daedalus", "/software/sophia"];
  softwarePages.forEach((page) => {
    urls.push({
      loc: `${SITE_URL}${page}`,
      lastmod: new Date().toISOString().split("T")[0],
      changefreq: "monthly",
      priority: 0.8,
    });
  });

  // About pages
  const aboutPages = [
    "/news",
    "/cv",
    "/collaborators",
    "/creative-statement",
    "/teaching-philosophy",
    "/faq",
    "/links",
    "/sitemap",
    "/privacy-policy",
    "/terms-of-use",
    "/accessibility",
  ];
  aboutPages.forEach((page) => {
    urls.push({
      loc: `${SITE_URL}${page}`,
      lastmod: new Date().toISOString().split("T")[0],
      changefreq: "monthly",
      priority: 0.6,
    });
  });

  // Blog posts (from data)
  blogPosts.forEach((post) => {
    urls.push({
      loc: `${SITE_URL}/articles/${post.id}`,
      lastmod: post.date,
      changefreq: "monthly",
      priority: 0.7,
    });
  });

  // Projects (from data)
  projects.forEach((project) => {
    urls.push({
      loc: `${SITE_URL}/project/${project.slug || project.id}`,
      lastmod: new Date().toISOString().split("T")[0],
      changefreq: "yearly",
      priority: 0.7,
    });
  });

  // Vault items (from data)
  vaultItems.forEach((item) => {
    urls.push({
      loc: `${SITE_URL}/vault/${item.id}`,
      lastmod: new Date().toISOString().split("T")[0],
      changefreq: "monthly",
      priority: 0.6,
    });
  });

  // Generate XML
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  urls.forEach((url) => {
    xml += "  <url>\n";
    xml += `    <loc>${url.loc}</loc>\n`;
    if (url.lastmod) {
      xml += `    <lastmod>${url.lastmod}</lastmod>\n`;
    }
    if (url.changefreq) {
      xml += `    <changefreq>${url.changefreq}</changefreq>\n`;
    }
    if (url.priority !== undefined) {
      xml += `    <priority>${url.priority.toFixed(1)}</priority>\n`;
    }
    xml += "  </url>\n";
  });

  xml += "</urlset>";

  return xml;
}

/**
 * Console output for easy copy/paste
 */
export function printSitemap(): void {
  console.log("=== SITEMAP.XML ===\n");
  console.log(generateSitemap());
  console.log("\n=== END SITEMAP ===");
  console.log("\nCopy the above XML and save to /public/sitemap.xml");
  console.log("Then submit to Google Search Console");
}

// If running directly, print the sitemap
if (typeof window !== "undefined") {
  // Can be called from browser console
  (window as any).generateSitemap = printSitemap;
  console.log("Sitemap generator loaded. Run: generateSitemap()");
}
