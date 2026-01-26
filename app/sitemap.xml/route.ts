import { projectId, publicAnonKey } from "@/src/utils/supabase/info";

const SITE_URL = "https://www.brandonptdavis.com";
const SUPABASE_REST_URL = `https://${projectId}.supabase.co/rest/v1`;

const SUPABASE_HEADERS = {
  apikey: publicAnonKey,
  Authorization: `Bearer ${publicAnonKey}`,
};

const STATIC_ROUTES = [
  "/",
  "/portfolio",
  "/about",
  "/news",
  "/cv",
  "/collaborators",
  "/creative-statement",
  "/teaching-philosophy",
  "/contact",
  "/resources",
  "/articles",
  "/studio",
  "/tutorials",
  "/scenic-vault",
  "/app-studio",
  "/experiential-design",
  "/rendering",
  "/scenic-models",
  "/architecture-scale-converter",
  "/dimension-reference",
  "/model-reference-scaler",
  "/design-history-timeline",
  "/classical-architecture-guide",
  "/rosco-paint-calculator",
  "/commercial-paint-finder",
  "/search",
  "/faq",
  "/privacy-policy",
  "/accessibility",
  "/terms-of-use",
  "/directory",
  "/links",
  "/sitemap",
];

const PORTFOLIO_FILTERS = ["scenic", "experiential", "rendering", "documentation"];

const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const formatDate = (value?: string) => {
  if (!value) return new Date().toISOString().split("T")[0];
  try {
    return new Date(value).toISOString().split("T")[0];
  } catch {
    return new Date().toISOString().split("T")[0];
  }
};

const fetchPublished = async (
  table: string,
  select: string,
  order?: string,
) => {
  const url = new URL(`${SUPABASE_REST_URL}/${table}`);
  url.searchParams.set("select", select);
  url.searchParams.set("published", "eq.true");
  if (order) url.searchParams.set("order", order);

  const response = await fetch(url.toString(), {
    headers: SUPABASE_HEADERS,
    next: { revalidate: 3600 },
  });

  if (!response.ok) return [];
  return (await response.json()) as any[];
};

export async function GET() {
  const today = formatDate();
  const urls: string[] = [];

  const addUrl = (
    path: string,
    priority = "0.6",
    changefreq = "monthly",
    lastmod?: string,
  ) => {
    urls.push(`
  <url>
    <loc>${escapeXml(`${SITE_URL}${path}`)}</loc>
    <lastmod>${formatDate(lastmod)}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`);
  };

  STATIC_ROUTES.forEach((path) => addUrl(path, "0.6", "monthly", today));
  PORTFOLIO_FILTERS.forEach((filter) =>
    addUrl(`/portfolio?filter=${filter}`, "0.6", "weekly", today),
  );

  const [projects, articles, tutorials, news] = await Promise.all([
    fetchPublished("portfolio_projects", "id,slug,updated_at"),
    fetchPublished("articles", "id,slug,updated_at,published_at"),
    fetchPublished("tutorials", "id,slug,updated_at"),
    fetchPublished("news", "id,slug,updated_at,date"),
  ]);

  projects.forEach((item) => {
    const slug = item.slug || item.id;
    if (!slug) return;
    addUrl(`/project/${slug}`, "0.7", "monthly", item.updated_at);
  });

  articles.forEach((item) => {
    const slug = item.slug || item.id;
    if (!slug) return;
    addUrl(
      `/articles/${slug}`,
      "0.7",
      "weekly",
      item.updated_at || item.published_at,
    );
  });

  tutorials.forEach((item) => {
    const slug = item.slug || item.id;
    if (!slug) return;
    addUrl(`/tutorials/${slug}`, "0.6", "monthly", item.updated_at);
  });

  news.forEach((item) => {
    const slug = item.slug || item.id;
    if (!slug) return;
    addUrl(
      `/news/${slug}`,
      "0.6",
      "weekly",
      item.updated_at || item.date,
    );
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
