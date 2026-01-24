import { projectId, publicAnonKey } from "../../../src/utils/supabase/info";

const SITE_URL = "https://www.brandonptdavis.com";
const SUPABASE_REST_URL = `https://${projectId}.supabase.co/rest/v1`;

const SUPABASE_HEADERS = {
  apikey: publicAnonKey,
  Authorization: `Bearer ${publicAnonKey}`,
};

const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const fetchPublished = async (table: string, select: string, order: string) => {
  const url = new URL(`${SUPABASE_REST_URL}/${table}`);
  url.searchParams.set("select", select);
  url.searchParams.set("published", "eq.true");
  url.searchParams.set("order", order);

  const response = await fetch(url.toString(), {
    headers: SUPABASE_HEADERS,
    next: { revalidate: 3600 },
  });

  if (!response.ok) return [];
  return (await response.json()) as any[];
};

export async function GET() {
  const [news, projects, articles] = await Promise.all([
    fetchPublished("news", "id,title,slug,date,excerpt", "date.desc"),
    fetchPublished(
      "portfolio_projects",
      "id,title,slug,created_at,description",
      "created_at.desc",
    ),
    fetchPublished(
      "articles",
      "id,title,slug,published_at,created_at,updated_at,excerpt",
      "published_at.desc",
    ),
  ]);

  const feedItems = [
    ...news.map((item) => ({
      title: item.title,
      link: `${SITE_URL}/news/${item.slug || item.id}`,
      description: item.excerpt || `News update: ${item.title}`,
      pubDate: new Date(item.date).toUTCString(),
      guid: `${SITE_URL}/news/${item.slug || item.id}`,
      category: "News",
    })),
    ...projects.map((item) => ({
      title: item.title,
      link: `${SITE_URL}/project/${item.slug || item.id}`,
      description: item.description || `New Project: ${item.title}`,
      pubDate: new Date(item.created_at).toUTCString(),
      guid: `${SITE_URL}/project/${item.slug || item.id}`,
      category: "Project",
    })),
    ...articles.map((item) => ({
      title: item.title,
      link: `${SITE_URL}/articles/${item.slug || item.id}`,
      description: item.excerpt || `Article: ${item.title}`,
      pubDate: new Date(
        item.published_at || item.created_at || item.updated_at,
      ).toUTCString(),
      guid: `${SITE_URL}/articles/${item.slug || item.id}`,
      category: "Article",
    })),
  ];

  feedItems.sort((a, b) =>
    new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime(),
  );

  const rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>Brandon PT Davis</title>
  <link>${SITE_URL}</link>
  <description>Latest news, projects, and articles from Brandon PT Davis.</description>
  <language>en-us</language>
  <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
  <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
  ${feedItems
    .map(
      (item) => `
  <item>
    <title>${escapeXml(item.title)}</title>
    <link>${item.link}</link>
    <guid>${item.guid}</guid>
    <pubDate>${item.pubDate}</pubDate>
    <description>${escapeXml(item.description)}</description>
    <category>${item.category}</category>
  </item>`,
    )
    .join("")}
</channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
