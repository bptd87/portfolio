import { projectId, publicAnonKey } from "@/src/utils/supabase/info";

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

export async function GET() {
  const url = new URL(`${SUPABASE_REST_URL}/portfolio_projects`);
  url.searchParams.set("select", "id,slug,title,description,youtube_videos,video_urls");
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

      const videos = [
        ...toArray(project.youtube_videos),
        ...toArray(project.video_urls),
      ].filter((url: string) => typeof url === "string" && url.length > 5);

      if (videos.length === 0) return "";

      const videoTags = videos
        .map((videoUrl) => {
          const isYouTube = videoUrl.includes("youtube.com") ||
            videoUrl.includes("youtu.be");
          const playerTag = isYouTube
            ? `
    <video:player_loc allow_embed="yes">${escapeXml(videoUrl)}</video:player_loc>`
            : `
    <video:content_loc>${escapeXml(videoUrl)}</video:content_loc>`;

          return `
    <video:video>
      <video:title>${escapeXml(project.title || "Project Video")}</video:title>
      <video:description>${escapeXml(project.description || "Project video")}</video:description>${playerTag}
    </video:video>`;
        })
        .join("");

      return `
  <url>
    <loc>${escapeXml(`${SITE_URL}/project/${slug}`)}</loc>${videoTags}
  </url>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${entries}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
