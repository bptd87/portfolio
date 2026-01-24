import { supabase } from "./supabase/client";

const baseUrl = "https://www.brandonptdavis.com";

const staticRoutes = [
    { path: "", priority: "1.0", changefreq: "daily" },
    { path: "/portfolio", priority: "0.9", changefreq: "weekly" },
    { path: "/articles", priority: "0.9", changefreq: "daily" },
    { path: "/about", priority: "0.8", changefreq: "monthly" },
    { path: "/contact", priority: "0.7", changefreq: "monthly" },
    { path: "/cv", priority: "0.7", changefreq: "monthly" },
    { path: "/creative-statement", priority: "0.7", changefreq: "monthly" },
    { path: "/teaching-philosophy", priority: "0.7", changefreq: "monthly" },
    { path: "/faq", priority: "0.6", changefreq: "monthly" },
    { path: "/resources", priority: "0.8", changefreq: "weekly" },
    { path: "/scenic-studio", priority: "0.7", changefreq: "weekly" },
    { path: "/scenic-vault", priority: "0.7", changefreq: "weekly" },
];

export async function SitemapXML() {
    const currentDate = new Date().toISOString();

    // Fetch published projects
    const { data: projects } = await supabase
        .from("portfolio_projects")
        .select("slug, updated_at, created_at")
        .eq("published", true)
        .order("created_at", { ascending: false });

    // Fetch published articles
    const { data: articles } = await supabase
        .from("articles")
        .select("slug, updated_at, published_at")
        .eq("published", true)
        .order("published_at", { ascending: false });

    // Generate static route URLs
    const staticUrls = staticRoutes
        .map(
            (route) => `
  <url>
    <loc>${baseUrl}${route.path}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`,
        )
        .join("");

    // Generate project URLs
    const projectUrls = (projects || [])
        .map(
            (project) => `
  <url>
    <loc>${baseUrl}/project/${project.slug}</loc>
    <lastmod>${
                project.updated_at || project.created_at || currentDate
            }</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`,
        )
        .join("");

    // Generate article URLs
    const articleUrls = (articles || [])
        .map(
            (article) => `
  <url>
    <loc>${baseUrl}/articles/${article.slug}</loc>
    <lastmod>${
                article.updated_at || article.published_at || currentDate
            }</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`,
        )
        .join("");

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrls}${projectUrls}${articleUrls}
</urlset>`;

    // Return as downloadable XML
    const blob = new Blob([sitemap], { type: "application/xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sitemap.xml";
    a.click();
    URL.revokeObjectURL(url);

    return sitemap;
}
