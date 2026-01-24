import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL ||
    "https://zuycsuajiuqsvopiioer.supabase.co";
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1eWNzdWFqaXVxc3ZvcGlpb2VyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4Mzk1ODUsImV4cCI6MjA3NzQxNTU4NX0.y7C3gkxAXQvOLRdaebj_3MRww2QjaN9fA2sCUzsdhEM";

const supabase = createClient(supabaseUrl, supabaseKey);
const SITE_URL = "https://www.brandonptdavis.com";

function escapeXml(unsafe: string): string {
    return unsafe.replace(/[<>&'"]/g, (c) => {
        switch (c) {
            case "<":
                return "&lt;";
            case ">":
                return "&gt;";
            case "&":
                return "&amp;";
            case "'":
                return "&apos;";
            case '"':
                return "&quot;";
            default:
                return c;
        }
    });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        const feedItems: any[] = [];

        // 1. Fetch News
        const { data: news } = await supabase
            .from("news")
            .select("id, title, slug, date, cover_image, excerpt")
            .eq("published", true)
            .order("date", { ascending: false });

        if (news) {
            news.forEach((item: any) => {
                feedItems.push({
                    title: item.title,
                    link: `${SITE_URL}/news/${item.slug || item.id}`,
                    description: item.excerpt || `News update: ${item.title}`,
                    pubDate: new Date(item.date).toUTCString(),
                    guid: `${SITE_URL}/news/${item.slug || item.id}`,
                    category: "News",
                });
            });
        }

        // 2. Fetch Projects
        const { data: projects } = await supabase
            .from("portfolio_projects")
            .select("id, title, slug, created_at, cover_image, description")
            .eq("published", true)
            .order("created_at", { ascending: false });

        if (projects) {
            projects.forEach((item: any) => {
                feedItems.push({
                    title: item.title,
                    link: `${SITE_URL}/project/${item.slug}`,
                    description: item.description ||
                        `New Project: ${item.title}`,
                    pubDate: new Date(item.created_at).toUTCString(),
                    guid: `${SITE_URL}/project/${item.slug}`,
                    category: "Project",
                });
            });
        }

        // 3. Fetch Articles
        const { data: articles } = await supabase
            .from("articles")
            .select(
                "id, title, slug, published_at, created_at, updated_at, cover_image, excerpt",
            )
            .eq("published", true)
            .order("published_at", { ascending: false });

        if (articles) {
            articles.forEach((item: any) => {
                feedItems.push({
                    title: item.title,
                    link: `${SITE_URL}/articles/${item.slug}`,
                    description: item.excerpt || `Article: ${item.title}`,
                    pubDate: new Date(
                        item.published_at || item.created_at || item.updated_at,
                    )
                        .toUTCString(),
                    guid: `${SITE_URL}/articles/${item.slug}`,
                    category: "Article",
                });
            });
        }

        // Sort all items by date (newest first)
        feedItems.sort((a, b) =>
            new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
        );

        // Generate RSS XML
        const rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>Brandon PT Davis</title>
  <link>${SITE_URL}</link>
  <description>Latest news, projects, and articles from scenic designer Brandon PT Davis.</description>
  <language>en-us</language>
  <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
  <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
  ${
            feedItems.map((item) => `
  <item>
    <title>${escapeXml(item.title)}</title>
    <link>${item.link}</link>
    <guid>${item.guid}</guid>
    <pubDate>${item.pubDate}</pubDate>
    <description>${escapeXml(item.description)}</description>
    <category>${item.category}</category>
  </item>`).join("")
        }
</channel>
</rss>`;

        res.setHeader("Content-Type", "application/xml");
        res.setHeader(
            "Cache-Control",
            "public, s-maxage=3600, stale-while-revalidate=86400",
        );
        return res.status(200).send(rss);
    } catch (error) {
        console.error("Error generating RSS feed:", error);
        res.status(500).send("Error generating RSS feed");
    }
}
