import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

const SITE_URL = "https://www.brandonptdavis.com";

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

// Regex to extract keys from info.tsx
const PROJECT_ID_REGEX = /projectId\s*=\s*["']([^"']+)["']/;
const ANON_Key_REGEX = /publicAnonKey\s*=\s*["']([^"']+)["']/;

// Regex to extract IDs from data files (fallback)
const ID_REGEX = /id:\s*["']([^"']+)["']/g;

function getSupabaseConfig() {
    try {
        const infoPath = path.join(
            process.cwd(),
            "src/utils/supabase/info.tsx",
        );
        if (fs.existsSync(infoPath)) {
            const content = fs.readFileSync(infoPath, "utf-8");
            const projectIdMatch = content.match(PROJECT_ID_REGEX);
            const anonKeyMatch = content.match(ANON_Key_REGEX);

            if (projectIdMatch && anonKeyMatch) {
                return {
                    url: `https://${projectIdMatch[1]}.supabase.co`,
                    key: anonKeyMatch[1],
                };
            }
        }
    } catch (e) {
        console.error("Failed to read Supabase config from info.tsx", e);
    }
    return null;
}

function extractIdsFromFile(filePath: string): string[] {
    try {
        const content = fs.readFileSync(filePath, "utf-8");
        const ids: string[] = [];
        let match;
        while ((match = ID_REGEX.exec(content)) !== null) {
            ids.push(match[1]);
        }
        return ids;
    } catch (error) {
        console.warn(
            `Warning: Could not read ${filePath}`,
            (error as any).message,
        );
        return [];
    }
}

function escapeXml(unsafe: string): string {
    return (unsafe || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}

async function generate() {
    console.log("Generating sitemap.xml...");
    const urls: SitemapURL[] = [];
    const today = new Date().toISOString().split("T")[0];

    // 1. Static Pages
    const staticPages = [
        { path: "/", priority: 1.0, changefreq: "weekly" as const },
        { path: "/portfolio", priority: 0.9, changefreq: "weekly" as const },
        { path: "/about", priority: 0.8, changefreq: "monthly" as const },
        { path: "/resources", priority: 0.9, changefreq: "weekly" as const },
        { path: "/software", priority: 0.8, changefreq: "monthly" as const },
        { path: "/contact", priority: 0.7, changefreq: "monthly" as const },
    ];
    staticPages.forEach((p) =>
        urls.push({
            loc: `${SITE_URL}${p.path}`,
            lastmod: today,
            changefreq: p.changefreq,
            priority: p.priority,
        })
    );

    // 2. Portfolio Filters
    ["scenic", "experiential", "rendering", "documentation"].forEach(
        (filter) => {
            urls.push({
                loc: `${SITE_URL}/portfolio?filter=${filter}`,
                lastmod: today,
                changefreq: "weekly",
                priority: 0.8,
            });
        },
    );

    // 3. Resource Pages (The ones user reported missing)
    const resourcePages = [
        "/experiential-design",
        "/rendering",
        "/scenic-models",
        "/directory",
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
    resourcePages.forEach((p) =>
        urls.push({
            loc: `${SITE_URL}${p}`,
            lastmod: today,
            changefreq: "weekly",
            priority: 0.8,
        })
    );

    // 4. Software & About Pages
    ["/software/daedalus", "/software/sophia"].forEach((p) =>
        urls.push({
            loc: `${SITE_URL}${p}`,
            lastmod: today,
            changefreq: "monthly",
            priority: 0.8,
        })
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
    ].forEach((p) =>
        urls.push({
            loc: `${SITE_URL}${p}`,
            lastmod: today,
            changefreq: "monthly",
            priority: 0.6,
        })
    );

    // 5. Dynamic Content from Supabase
    const config = getSupabaseConfig();
    const dbProjects = new Set<string>();
    const dbArticles = new Set<string>();

    if (config) {
        console.log("Connecting to Supabase...");
        const supabase = createClient(config.url, config.key);

        // Image Sitemap Accumulator
        let imageSitemapContent = "";
        let videoSitemapContent = "";

        // Fetch Projects
        try {
            const { data: projects, error } = await supabase
                .from("portfolio_projects")
                .select(
                    "id, slug, updated_at, title, card_image, description, youtube_videos, galleries, tags, category",
                )
                .eq("published", true);

            if (!error && projects) {
                console.log(`Fetched ${projects.length} projects from DB.`);
                projects.forEach((p) => {
                    const slug = p.slug || p.id;
                    if (slug) {
                        dbProjects.add(slug);
                        const loc = `${SITE_URL}/project/${slug}`;
                        urls.push({
                            loc: loc,
                            lastmod: p.updated_at
                                ? p.updated_at.split("T")[0]
                                : today,
                            changefreq: "yearly",
                            priority: 0.7,
                        });

                        // Add to Image Sitemap
                        interface ImageEntry {
                            loc: string;
                            title: string;
                            caption?: string;
                        }
                        const imageEntries: ImageEntry[] = [];

                        // 1. Card Image
                        if (
                            p.card_image &&
                            typeof p.card_image === "string" &&
                            p.card_image.length > 5
                        ) {
                            imageEntries.push({
                                loc: p.card_image,
                                title: p.title || "Project Image",
                            });
                        }

                        // Helper to safely extract text from string or object
                        const getText = (item: any): string => {
                            if (!item) return "";
                            if (typeof item === "string") return item;
                            if (typeof item === "object" && item.caption) {
                                return item.caption;
                            }
                            if (typeof item === "object" && item.altText) {
                                return item.altText;
                            }
                            return "";
                        };

                        // 2. Gallery Images
                        if (p.galleries) {
                            // Hero (Renderings)
                            if (Array.isArray(p.galleries.hero)) {
                                p.galleries.hero.forEach(
                                    (img: string, i: number) => {
                                        if (
                                            typeof img === "string" &&
                                            img.length > 5
                                        ) {
                                            const alt = getText(
                                                p.galleries.heroAlt?.[i],
                                            );
                                            const cap = getText(
                                                p.galleries.heroCaptions?.[i],
                                            );
                                            imageEntries.push({
                                                loc: img,
                                                title: alt ||
                                                    p.title ||
                                                    "Rendering",
                                                caption: cap,
                                            });
                                        }
                                    },
                                );
                            }
                            // Process (Production Photos)
                            if (Array.isArray(p.galleries.process)) {
                                p.galleries.process.forEach(
                                    (img: string, i: number) => {
                                        if (
                                            typeof img === "string" &&
                                            img.length > 5
                                        ) {
                                            const alt = getText(
                                                p.galleries.processAlt?.[i],
                                            );
                                            const cap = getText(
                                                p.galleries.processCaptions
                                                    ?.[i],
                                            );
                                            imageEntries.push({
                                                loc: img,
                                                title: alt ||
                                                    p.title ||
                                                    "Production Photo",
                                                caption: cap,
                                            });
                                        }
                                    },
                                );
                            }
                        }

                        if (imageEntries.length > 0) {
                            imageSitemapContent += `
  <url>
    <loc>${loc}</loc>`;
                            imageEntries.forEach((entry) => {
                                const safeTitle = escapeXml(entry.title);
                                const safeCaption = entry.caption
                                    ? escapeXml(entry.caption)
                                    : "";
                                imageSitemapContent += `
    <image:image>
      <image:loc>${escapeXml(entry.loc)}</image:loc>
      <image:title>${safeTitle}</image:title>${
                                    safeCaption
                                        ? `
      <image:caption>${safeCaption}</image:caption>`
                                        : ""
                                }
    </image:image>`;
                            });
                            imageSitemapContent += `
  </url>`;
                        }

                        // Add to Video Sitemap
                        if (
                            Array.isArray(p.youtube_videos) &&
                            p.youtube_videos.length > 0 &&
                            p.card_image
                        ) {
                            const safeTitle = escapeXml(
                                p.title || "Project Video",
                            );
                            const safeDesc = escapeXml(
                                p.description || p.title || "",
                            );

                            let tagsXml = "";
                            if (p.category) {
                                tagsXml += `\n      <video:category>${
                                    escapeXml(p.category)
                                }</video:category>`;
                            }
                            if (
                                p.tags &&
                                Array.isArray(p.tags) &&
                                p.tags.length > 0
                            ) {
                                p.tags.slice(0, 32).forEach((tag: string) => {
                                    tagsXml += `\n      <video:tag>${
                                        escapeXml(tag)
                                    }</video:tag>`;
                                });
                            }

                            p.youtube_videos.forEach((v: any) => {
                                let videoUrl = "";
                                if (typeof v === "string") videoUrl = v;
                                else if (typeof v === "object" && v.url) {
                                    videoUrl = v.url;
                                }

                                if (videoUrl && videoUrl.length > 5) {
                                    videoSitemapContent += `
  <url>
    <loc>${loc}</loc>
    <video:video>
      <video:thumbnail_loc>${escapeXml(p.card_image)}</video:thumbnail_loc>
      <video:title>${safeTitle}</video:title>
      <video:description>${safeDesc}</video:description>
      <video:player_loc>${escapeXml(videoUrl)}</video:player_loc>${tagsXml}
    </video:video>
  </url>`;
                                }
                            });
                        }
                    }
                });
            } else {
                console.error("Error fetching projects:", error);
            }
        } catch (e) {
            console.error("Exception fetching projects:", e);
        }

        // Fetch Articles
        // Fetch Articles
        try {
            const { data: articles, error } = await supabase
                .from("articles")
                .select(
                    "id, slug, updated_at, title, cover_image, excerpt, content, category, tags",
                )
                .eq("published", true);

            if (!error && articles) {
                console.log(`Fetched ${articles.length} articles from DB.`);
                articles.forEach((a) => {
                    const slug = a.slug || a.id;
                    if (slug) {
                        dbArticles.add(slug);
                        const loc = `${SITE_URL}/articles/${slug}`;
                        urls.push({
                            loc: loc,
                            lastmod: a.updated_at
                                ? a.updated_at.split("T")[0]
                                : today,
                            changefreq: "monthly",
                            priority: 0.7,
                        });

                        // Add to Image Sitemap
                        if (
                            a.cover_image &&
                            typeof a.cover_image === "string" &&
                            a.cover_image.length > 5
                        ) {
                            const safeTitle = escapeXml(
                                a.title || "Article Image",
                            );
                            imageSitemapContent += `
  <url>
    <loc>${loc}</loc>
    <image:image>
      <image:loc>${escapeXml(a.cover_image)}</image:loc>
      <image:title>${safeTitle}</image:title>
    </image:image>
  </url>`;
                        }

                        // Add to Video Sitemap
                        if (Array.isArray(a.content)) {
                            // Find video blocks
                            const videos = a.content.filter(
                                (b: any) =>
                                    b.type === "video" &&
                                    b.content &&
                                    typeof b.content === "string",
                            );

                            if (videos.length > 0 && a.cover_image) {
                                const safeTitle = escapeXml(
                                    a.title || "Video",
                                );
                                const safeDesc = escapeXml(
                                    a.excerpt || a.title || "",
                                );

                                let tagsXml = "";
                                if (a.category) {
                                    tagsXml += `\n      <video:category>${
                                        escapeXml(a.category)
                                    }</video:category>`;
                                }
                                if (
                                    a.tags &&
                                    Array.isArray(a.tags) &&
                                    a.tags.length > 0
                                ) {
                                    a.tags.slice(0, 32).forEach(
                                        (tag: string) => {
                                            tagsXml += `\n      <video:tag>${
                                                escapeXml(tag)
                                            }</video:tag>`;
                                        },
                                    );
                                }

                                videos.forEach((v: any) => {
                                    videoSitemapContent += `
  <url>
    <loc>${loc}</loc>
    <video:video>
      <video:thumbnail_loc>${escapeXml(a.cover_image)}</video:thumbnail_loc>
      <video:title>${safeTitle}</video:title>
      <video:description>${safeDesc}</video:description>
      <video:player_loc>${escapeXml(v.content)}</video:player_loc>${tagsXml}
    </video:video>
  </url>`;
                                });
                            }
                        }
                    }
                });
            } else {
                console.error("Error fetching articles:", error);
            }
        } catch (e) {
            console.error("Exception fetching articles:", e);
        }

        // Fetch Tutorials
        try {
            const { data: tutorials, error } = await supabase
                .from("tutorials")
                .select(
                    "id, slug, updated_at, title, thumbnail_url, description, video_url, content, category, tags",
                )
                .eq("published", true);

            if (!error && tutorials) {
                console.log(`Fetched ${tutorials.length} tutorials from DB.`);
                tutorials.forEach((t) => {
                    const slug = t.slug || t.id;
                    if (slug) {
                        const loc = `${SITE_URL}/scenic-studio/${slug}`;
                        urls.push({
                            loc: loc,
                            lastmod: t.updated_at
                                ? t.updated_at.split("T")[0]
                                : today,
                            changefreq: "monthly",
                            priority: 0.7,
                        });

                        // Add to Image Sitemap
                        if (
                            t.thumbnail_url &&
                            typeof t.thumbnail_url === "string" &&
                            t.thumbnail_url.length > 5
                        ) {
                            const safeTitle = escapeXml(
                                t.title || "Tutorial Image",
                            );
                            imageSitemapContent += `
  <url>
    <loc>${loc}</loc>
    <image:image>
      <image:loc>${escapeXml(t.thumbnail_url)}</image:loc>
      <image:title>${safeTitle}</image:title>
    </image:image>
  </url>`;
                        }

                        // Add to Video Sitemap
                        const videos: any[] = [];

                        // 1. Top-level Video URL
                        if (
                            t.video_url &&
                            typeof t.video_url === "string" &&
                            t.video_url.length > 5
                        ) {
                            videos.push({ content: t.video_url });
                        }

                        // 2. Content Blocks
                        if (
                            Array.isArray(t.content) ||
                            (t.content && Array.isArray(t.content.blocks))
                        ) {
                            // Handle both raw array and { blocks: [...] } structure
                            const blocks = Array.isArray(t.content)
                                ? t.content
                                : t.content.blocks;

                            // Find video blocks
                            const contentVideos = blocks.filter(
                                (b: any) =>
                                    b.type === "video" &&
                                    b.content &&
                                    typeof b.content === "string",
                            );
                            videos.push(...contentVideos);
                        }

                        // Deduplicate by URL
                        const uniqueVideos = Array.from(
                            new Set(videos.map((v) => v.content)),
                        ).map((url) => videos.find((v) => v.content === url));

                        if (uniqueVideos.length > 0 && t.thumbnail_url) {
                            const safeTitle = escapeXml(t.title || "Video");
                            const safeDesc = escapeXml(
                                t.description || t.title || "",
                            );

                            let tagsXml = "";
                            if (t.category) {
                                tagsXml += `\n      <video:category>${
                                    escapeXml(t.category)
                                }</video:category>`;
                            }
                            if (
                                t.tags &&
                                Array.isArray(t.tags) &&
                                t.tags.length > 0
                            ) {
                                t.tags.slice(0, 32).forEach((tag: string) => {
                                    tagsXml += `\n      <video:tag>${
                                        escapeXml(tag)
                                    }</video:tag>`;
                                });
                            }

                            uniqueVideos.forEach((v: any) => {
                                videoSitemapContent += `
  <url>
    <loc>${loc}</loc>
    <video:video>
      <video:thumbnail_loc>${escapeXml(t.thumbnail_url)}</video:thumbnail_loc>
      <video:title>${safeTitle}</video:title>
      <video:description>${safeDesc}</video:description>
      <video:player_loc>${escapeXml(v.content)}</video:player_loc>${tagsXml}
    </video:video>
  </url>`;
                            });
                        }
                    }
                });
            } else {
                console.error("Error fetching tutorials:", error);
            }
        } catch (e) {
            console.error("Exception fetching tutorials:", e);
        }

        // Fetch News (for Image Sitemap /news entry)
        try {
            const { data: newsItems, error } = await supabase
                .from("news")
                .select("title, cover_image, images")
                .eq("published", true);

            if (!error && newsItems && newsItems.length > 0) {
                console.log(
                    `Fetched ${newsItems.length} news items for image sitemap check.`,
                );

                let newsImagesXML = "";
                let addedNewsImagesCount = 0;

                newsItems.forEach((item) => {
                    const safeTitle = escapeXml(item.title || "News Image");
                    const imageUrls = [];

                    if (
                        item.cover_image &&
                        typeof item.cover_image === "string" &&
                        item.cover_image.length > 5
                    ) {
                        imageUrls.push(item.cover_image);
                    }
                    if (item.images) {
                        if (Array.isArray(item.images)) {
                            item.images.forEach((img) => {
                                if (
                                    typeof img === "string" &&
                                    img.length > 5
                                ) {
                                    imageUrls.push(img);
                                }
                            });
                        } else if (
                            typeof item.images === "string" &&
                            item.images.length > 5
                        ) {
                            imageUrls.push(item.images);
                        }
                    }

                    imageUrls.forEach((url) => {
                        newsImagesXML += `
    <image:image>
      <image:loc>${escapeXml(url)}</image:loc>
      <image:title>${safeTitle}</image:title>
    </image:image>`;
                        addedNewsImagesCount++;
                    });
                });

                if (addedNewsImagesCount > 0) {
                    imageSitemapContent += `
  <url>
    <loc>${SITE_URL}/news</loc>${newsImagesXML}
  </url>`;
                    console.log(
                        `Added ${addedNewsImagesCount} news images to sitemap.`,
                    );
                }
            }
        } catch (e) {
            console.error("Exception fetching news:", e);
        }

        // Write Image Sitemap
        if (imageSitemapContent.length > 0) {
            const imageSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${imageSitemapContent}
</urlset>`;
            fs.writeFileSync(
                path.join(process.cwd(), "public", "image-sitemap.xml"),
                imageSitemap,
            );
            console.log("image-sitemap.xml generated!");
        }

        // Write Video Sitemap
        if (videoSitemapContent.length > 0) {
            const videoSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${videoSitemapContent}
</urlset>`;
            fs.writeFileSync(
                path.join(process.cwd(), "public", "video-sitemap.xml"),
                videoSitemap,
            );
            console.log("video-sitemap.xml generated!");
        }
    } else {
        console.warn("Could not load Supabase config, skipping DB fetch.");
    }

    // 6. Fallback/Supplement with Static Files (Disabled to prevent duplicates/malformed URLs)
    // Projects and Articles are now fully managed in Supabase.
    /*
    const staticProjectIds = extractIdsFromFile(
        path.join(process.cwd(), "src/data/projects.deprecated.ts"),
    );
    // ... (rest of logic commented out)
    // Articles
    const staticArticleIds = extractIdsFromFile(
        path.join(process.cwd(), "src/data/blog-posts.ts"),
    );
    // ... (rest of logic commented out)
    */
    console.log("Skipping static file content fallback (DB source of truth).");

    // Vault (Always static for now)
    const vaultIds = extractIdsFromFile(
        path.join(process.cwd(), "src/data/vault-items.ts"),
    );
    vaultIds.forEach((id) => {
        urls.push({
            loc: `${SITE_URL}/vault/${id}`,
            lastmod: today,
            changefreq: "monthly",
            priority: 0.6,
        });
    });

    // 7. Generate XML
    let xml = '<?xml version="1.0" encoding="UTF-8"?>';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

    urls.forEach((url) => {
        xml += "<url>";
        xml += `<loc>${url.loc.trim()}</loc>`;
        if (url.lastmod) xml += `<lastmod>${url.lastmod}</lastmod>`;
        if (url.changefreq) {
            xml += `<changefreq>${url.changefreq}</changefreq>`;
        }
        if (url.priority !== undefined) {
            xml += `<priority>${url.priority.toFixed(1)}</priority>`;
        }
        xml += "</url>";
    });
    xml += "</urlset>";

    // Write file
    const publicDir = path.resolve("public");
    if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
    }
    const sitemapPath = path.join(publicDir, "sitemap.xml");
    fs.writeFileSync(sitemapPath, xml);
    console.log(
        `✅ Sitemap generated successfully at ${sitemapPath} with ${urls.length} URLs.`,
    );
}

generate().catch(console.error);
