import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL ||
    "https://zuycsuajiuqsvopiioer.supabase.co";
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1eWNzdWFqaXVxc3ZvcGlpb2VyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4Mzk1ODUsImV4cCI6MjA3NzQxNTU4NX0.y7C3gkxAXQvOLRdaebj_3MRww2QjaN9fA2sCUzsdhEM";

const supabase = createClient(supabaseUrl, supabaseKey);
const SITE_URL = "https://www.brandonptdavis.com";

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        const urls: string[] = [];
        const today = new Date().toISOString().split("T")[0];

        // Helper to add URL
        const addUrl = (
            loc: string,
            priority: string,
            changefreq: string,
            lastmod?: string,
        ) => {
            urls.push(`
  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod || today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`);
        };

        // 1. Static Pages
        const staticPages = [
            { path: "/", priority: "1.0", changefreq: "weekly" },
            { path: "/portfolio", priority: "0.9", changefreq: "weekly" },
            { path: "/about", priority: "0.8", changefreq: "monthly" },
            { path: "/resources", priority: "0.9", changefreq: "weekly" },
            { path: "/software", priority: "0.8", changefreq: "monthly" },
            { path: "/contact", priority: "0.7", changefreq: "monthly" },
        ];
        staticPages.forEach((p) =>
            addUrl(SITE_URL + p.path, p.priority, p.changefreq)
        );

        // 2. Portfolio Filters
        ["scenic", "experiential", "rendering", "documentation"].forEach(
            (filter) => {
                addUrl(
                    `${SITE_URL}/portfolio?filter=${filter}`,
                    "0.8",
                    "weekly",
                );
            },
        );

        // 3. Resource Pages
        const resourcePages = [
            "/articles",
            "/studio",
            "/scenic-studio",
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
        resourcePages.forEach((p) => addUrl(SITE_URL + p, "0.8", "weekly"));

        // 4. Software & Other Pages
        ["/software/daedalus", "/software/sophia"].forEach((p) =>
            addUrl(SITE_URL + p, "0.8", "monthly")
        );
        [
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
            "/directory",
        ].forEach((p) => addUrl(SITE_URL + p, "0.6", "monthly"));

        // 5. Vault Items (Hardcoded IDs from src/data/vault-items.ts)
        const vaultIds = [
            "stephens-warehouse",
            "stephens-makclanburg",
            "mizzou-rhynsburger",
        ];
        vaultIds.forEach((id) =>
            addUrl(`${SITE_URL}/vault/${id}`, "0.6", "monthly")
        );

        // 6. Dynamic Content from Supabase
        const dbProjects = new Set<string>();
        const dbArticles = new Set<string>();

        // Fetch Projects
        const { data: projects } = await supabase
            .from("portfolio_projects")
            .select("id, slug, updated_at")
            .eq("published", true);

        if (projects) {
            projects.forEach((p: any) => {
                const slug = p.slug || p.id;
                if (slug) {
                    dbProjects.add(slug);
                    addUrl(
                        `${SITE_URL}/project/${slug}`,
                        "0.7",
                        "yearly",
                        p.updated_at ? p.updated_at.split("T")[0] : today,
                    );
                }
            });
        }

        // Fetch Articles
        const { data: articles } = await supabase
            .from("articles")
            .select("id, slug, updated_at") // Note: using updated_at or published_at
            .eq("published", true);

        if (articles) {
            articles.forEach((a: any) => {
                const slug = a.slug || a.id;
                if (slug) {
                    dbArticles.add(slug);
                    addUrl(
                        `${SITE_URL}/articles/${slug}`,
                        "0.7",
                        "monthly",
                        a.updated_at ? a.updated_at.split("T")[0] : today,
                    );
                }
            });
        }

        // Fetch Tutorials
        const dbTutorials = new Set<string>();
        const { data: tutorials } = await supabase
            .from("tutorials")
            .select("id, slug, updated_at")
            .eq("published", true);

        if (tutorials) {
            tutorials.forEach((t: any) => {
                const slug = t.slug || t.id;
                if (slug) {
                    dbTutorials.add(slug);
                    addUrl(
                        `${SITE_URL}/scenic-studio/${slug}`,
                        "0.7",
                        "monthly",
                        t.updated_at ? t.updated_at.split("T")[0] : today,
                    );
                }
            });
        }

        // Fetch News
        const { data: news } = await supabase
            .from("news")
            .select("id, slug, updated_at, date")
            .eq("published", true);

        if (news) {
            news.forEach((n: any) => {
                const slug = n.slug || n.id;
                if (slug) {
                    addUrl(
                        `${SITE_URL}/news/${slug}`,
                        "0.7",
                        "monthly",
                        n.updated_at
                            ? n.updated_at.split("T")[0]
                            : (n.date ? n.date.split("T")[0] : today),
                    );
                }
            });
        }

        // Static Tutorials Fallback
        const staticTutorials = [
            "creating-2d-drafting-from-3d-model",
            "footloose-walkthrough",
            "coraline-walkthrough",
            "lysistrata-walkthrough",
            "camera-tool-rendering",
            "custom-page-layouts",
            "trim-profiles-polyline",
        ];
        staticTutorials.forEach((slug) => {
            if (!dbTutorials.has(slug)) {
                addUrl(`${SITE_URL}/scenic-studio/${slug}`, "0.6", "monthly");
            }
        });

        // 7. Legacy/Static Content (Not in DB)
        const legacyProjects: string[] = []; // 'red-line-cafe' confirmed in DB
        legacyProjects.forEach((id) => {
            if (!dbProjects.has(id)) {
                addUrl(`${SITE_URL}/project/${id}`, "0.6", "yearly");
            }
        });

        const legacyArticles = [
            "scenic-design-vision",
            "themed-entertainment-evolution",
        ];
        legacyArticles.forEach((id) => {
            if (!dbArticles.has(id)) {
                addUrl(`${SITE_URL}/articles/${id}`, "0.6", "monthly");
            }
        });

        // 8. Generate Final XML
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("")}
</urlset>`;

        res.setHeader("Content-Type", "application/xml");
        // Cache for 1 hour to balance fresh content vs performance
        res.setHeader(
            "Cache-Control",
            "public, s-maxage=3600, stale-while-revalidate=86400",
        );
        res.setHeader("Pragma", "public");

        return res.status(200).send(xml);
    } catch (error) {
        console.error("Error generating sitemap:", error);
        res.status(500).send("Error generating sitemap");
    }
}
