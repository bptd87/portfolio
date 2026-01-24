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

const toArray = (value: any) => (Array.isArray(value) ? value : []);

const collectImages = (project: any) => {
  const images = new Set<string>();
  const add = (url?: string) => {
    if (typeof url === "string" && url.length > 5) images.add(url);
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

  const entries = projects
    .map((project) => {
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
    })
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
