import { projectId, publicAnonKey } from "../../../src/utils/supabase/info";
import { blogPosts } from "../../../src/data/blog-posts";
import { newsItems } from "../../../src/data/news";
import { TUTORIALS } from "../../../src/data/tutorials";
import { resolveImageUrl } from "../../../src/utils/image";

const SITE_URL = "https://www.brandonptdavis.com";
const SUPABASE_REST_URL = `https://${projectId}.supabase.co/rest/v1`;

const SUPABASE_HEADERS = {
  apikey: publicAnonKey,
  Authorization: `Bearer ${publicAnonKey}`,
};

const toAbsoluteUrl = (value?: string) => {
  if (!value) return undefined;
  return value.startsWith("http") ? value : `${SITE_URL}${value}`;
};

const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const toArray = (value: any) => (Array.isArray(value) ? value : []);

const collectImages = (project: any) => {
  const images = new Set<string>();
  const add = (url?: string) => {
    if (typeof url === "string" && url.length > 5) {
      const resolved = toAbsoluteUrl(url);
      if (resolved) images.add(resolved);
    }
  };

  add(project.cover_image);
  add(project.card_image);
  add(project.hero_image);

  toArray(project.production_photos).forEach(add);
  toArray(project.images).forEach(add);

  const galleries = project.galleries || {};
  toArray(galleries.hero).forEach(add);
  toArray(galleries.process).forEach(add);
  toArray(galleries.models).forEach(add);

  return Array.from(images);
};

const collectArticleImages = (article: any) => {
  const images = new Set<string>();
  const add = (url?: string) => {
    const resolved = resolveImageUrl(url);
    const absolute = resolved ? toAbsoluteUrl(resolved) : undefined;
    if (absolute) images.add(absolute);
  };

  add(article.cover_image);
  add(article.coverImage);

  return Array.from(images);
};

const collectNewsImages = (news: any) => {
  const images = new Set<string>();
  const add = (url?: string) => {
    const resolved = resolveImageUrl(url);
    const absolute = resolved ? toAbsoluteUrl(resolved) : undefined;
    if (absolute) images.add(absolute);
  };

  add(news.cover_image);
  add(news.coverImage);
  toArray(news.images).forEach((img: any) => add(img?.url));

  toArray(news.blocks).forEach((block: any) => {
    if (block?.type === "gallery") {
      toArray(block.images).forEach((img: any) => add(img?.url));
    }
  });

  return Array.from(images);
};

const collectTutorialImages = (tutorial: any) => {
  const images = new Set<string>();
  const add = (url?: string) => {
    const resolved = resolveImageUrl(url);
    const absolute = resolved ? toAbsoluteUrl(resolved) : undefined;
    if (absolute) images.add(absolute);
  };

  add(tutorial.thumbnail);
  add(tutorial.thumbnail_url);
  add(tutorial.thumbnailUrl);

  return Array.from(images);
};

const fetchPublished = async (table: string, select: string) => {
  const url = new URL(`${SUPABASE_REST_URL}/${table}`);
  url.searchParams.set("select", select);
  url.searchParams.set("published", "eq.true");

  const response = await fetch(url.toString(), {
    headers: SUPABASE_HEADERS,
    next: { revalidate: 3600 },
  });

  if (!response.ok) return [];
  return (await response.json()) as any[];
};

export async function GET() {
  const url = new URL(`${SUPABASE_REST_URL}/portfolio_projects`);
  url.searchParams.set(
    "select",
    "id,slug,title,cover_image,card_image,hero_image,production_photos,images,galleries",
  );
  url.searchParams.set("published", "eq.true");

  const response = await fetch(url.toString(), {
    headers: SUPABASE_HEADERS,
    next: { revalidate: 3600 },
  });

  const projects = response.ok ? ((await response.json()) as any[]) : [];

  const [articles, tutorials, news] = await Promise.all([
    fetchPublished("articles", "id,slug,title,cover_image"),
    fetchPublished("tutorials", "id,slug,title,thumbnail,thumbnail_url"),
    fetchPublished("news", "id,slug,title,cover_image,images,blocks"),
  ]);

  const entries = [
    ...projects.map((project) => {
      const slug = project.slug || project.id;
      if (!slug) return "";
      const images = collectImages(project)
        .map(
          (img) => `
    <image:image>
      <image:loc>${escapeXml(img)}</image:loc>
      <image:title>${escapeXml(project.title || "Project")}</image:title>
    </image:image>`,
        )
        .join("");

      if (!images) return "";

      return `
  <url>
    <loc>${escapeXml(`${SITE_URL}/project/${slug}`)}</loc>${images}
  </url>`;
    }),
    ...articles.map((article) => {
      const slug = article.slug || article.id;
      if (!slug) return "";
      const images = collectArticleImages(article)
        .map(
          (img) => `
    <image:image>
      <image:loc>${escapeXml(img)}</image:loc>
      <image:title>${escapeXml(article.title || "Article")}</image:title>
    </image:image>`,
        )
        .join("");

      if (!images) return "";

      return `
  <url>
    <loc>${escapeXml(`${SITE_URL}/articles/${slug}`)}</loc>${images}
  </url>`;
    }),
    ...blogPosts.map((article) => {
      const slug = article.slug || article.id;
      if (!slug) return "";
      const images = collectArticleImages(article)
        .map(
          (img) => `
    <image:image>
      <image:loc>${escapeXml(img)}</image:loc>
      <image:title>${escapeXml(article.title || "Article")}</image:title>
    </image:image>`,
        )
        .join("");

      if (!images) return "";

      return `
  <url>
    <loc>${escapeXml(`${SITE_URL}/articles/${slug}`)}</loc>${images}
  </url>`;
    }),
    ...tutorials.map((tutorial) => {
      const slug = tutorial.slug || tutorial.id;
      if (!slug) return "";
      const images = collectTutorialImages(tutorial)
        .map(
          (img) => `
    <image:image>
      <image:loc>${escapeXml(img)}</image:loc>
      <image:title>${escapeXml(tutorial.title || "Tutorial")}</image:title>
    </image:image>`,
        )
        .join("");

      if (!images) return "";

      return `
  <url>
    <loc>${escapeXml(`${SITE_URL}/scenic-studio/${slug}`)}</loc>${images}
  </url>`;
    }),
    ...TUTORIALS.map((tutorial) => {
      const slug = tutorial.slug || tutorial.id;
      if (!slug) return "";
      const images = collectTutorialImages(tutorial)
        .map(
          (img) => `
    <image:image>
      <image:loc>${escapeXml(img)}</image:loc>
      <image:title>${escapeXml(tutorial.title || "Tutorial")}</image:title>
    </image:image>`,
        )
        .join("");

      if (!images) return "";

      return `
  <url>
    <loc>${escapeXml(`${SITE_URL}/scenic-studio/${slug}`)}</loc>${images}
  </url>`;
    }),
    ...news.map((item) => {
      const slug = item.slug || item.id;
      if (!slug) return "";
      const images = collectNewsImages(item)
        .map(
          (img) => `
    <image:image>
      <image:loc>${escapeXml(img)}</image:loc>
      <image:title>${escapeXml(item.title || "News")}</image:title>
    </image:image>`,
        )
        .join("");

      if (!images) return "";

      return `
  <url>
    <loc>${escapeXml(`${SITE_URL}/news/${slug}`)}</loc>${images}
  </url>`;
    }),
    ...newsItems.map((item) => {
      const slug = item.slug || item.id;
      if (!slug) return "";
      const images = collectNewsImages(item)
        .map(
          (img) => `
    <image:image>
      <image:loc>${escapeXml(img)}</image:loc>
      <image:title>${escapeXml(item.title || "News")}</image:title>
    </image:image>`,
        )
        .join("");

      if (!images) return "";

      return `
  <url>
    <loc>${escapeXml(`${SITE_URL}/news/${slug}`)}</loc>${images}
  </url>`;
    }),
  ]
    .filter(Boolean)
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${entries}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
