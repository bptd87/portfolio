import type { Metadata } from "next";
import {
  DEFAULT_METADATA,
  PAGE_METADATA,
  generateArticleMetadata,
  generateNewsMetadata,
  generateProjectMetadata,
  generateTutorialMetadata,
  type PageMetadata,
} from "../../../src/utils/seo/metadata";
import { blogPosts } from "../../../src/data/blog-posts";
import { newsItems } from "../../../src/data/news";
import { TUTORIALS } from "../../../src/data/tutorials";
import { projects } from "../../../src/data/projects.deprecated";
import {
  generateArticleSchema,
  generateBreadcrumbSchema,
  generateCreativeWorkSchema,
  generatePersonSchema,
  generateVideoSchema,
  generateWebSiteSchema,
} from "../../../src/utils/seo/structured-data";
import { projectId, publicAnonKey } from "../../../src/utils/supabase/info";

const SITE_URL = DEFAULT_METADATA.siteUrl || "https://www.brandonptdavis.com";
const SUPABASE_REST_URL = `https://${projectId}.supabase.co/rest/v1`;

const SUPABASE_HEADERS = {
  apikey: publicAnonKey,
  Authorization: `Bearer ${publicAnonKey}`,
};

const PROJECT_METADATA_OVERRIDES: Record<
  string,
  {
    title: string;
    description: string;
    ogImage?: string;
    cardImage?: string;
  }
> = {
  "the-glass-menagerie": {
    title: "The Glass Menagerie",
    description:
      "The Glass Menagerie at Maples Repertory Theatre, directed by Kimberly Braun, staged as a memory play shaped by Tom Wingfield’s recollection rather than a literal apartment.",
    cardImage:
      "https://zuycsuajiuqsvopiioer.supabase.co/storage/v1/object/public/projects/561341373-1396572259138873-1153848128221018463-n-1768245608582.webp",
  },
};

const normalizePath = (segments?: string[]) => {
  if (!segments || segments.length === 0) return "/";
  return `/${segments.join("/")}`;
};

const toAbsoluteUrl = (value?: string) => {
  if (!value) return undefined;
  return value.startsWith("http") ? value : `${SITE_URL}${value}`;
};

const resolveStaticKey = (path: string) => {
  if (path === "/") return "home";
  if (path === "/scenic-insights") return "articles";
  if (path.startsWith("/tag/")) return "articles";
  return path.replace("/", "");
};

const cacheWrapper = <T extends (...args: any[]) => any>(fn: T) => fn;

const fetchSupabaseRow = cacheWrapper(async (table: string, slug: string) => {
  const url = new URL(`${SUPABASE_REST_URL}/${table}`);
  url.searchParams.set("select", "*");
  url.searchParams.set("or", `(slug.eq.${slug},id.eq.${slug})`);
  url.searchParams.set("limit", "1");

  try {
    const response = await fetch(url.toString(), {
      headers: SUPABASE_HEADERS,
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as any[];
    const item = data?.[0];
    if (!item) return null;
    if (typeof item.published === "boolean" && item.published === false) {
      return null;
    }
    return item;
  } catch {
    return null;
  }
});

const resolveDynamicMetadata = async (path: string) => {
  if (path.startsWith("/project/")) {
    const slug = path.replace("/project/", "");
    const supabaseProject = await fetchSupabaseRow("portfolio_projects", slug);
    if (supabaseProject) {
      return generateProjectMetadata({
        title: supabaseProject.title || supabaseProject.name || "Project",
        description:
          supabaseProject.seo_description ||
          supabaseProject.description ||
          supabaseProject.excerpt ||
          "",
        heroImage: supabaseProject.cover_image || supabaseProject.card_image,
        cardImage: supabaseProject.card_image || supabaseProject.cover_image,
        year: supabaseProject.year,
        venue: supabaseProject.venue,
        slug: supabaseProject.slug || supabaseProject.id || slug,
        seoTitle: supabaseProject.seo_title,
        seoDescription: supabaseProject.seo_description,
        seoKeywords: supabaseProject.seo_keywords,
        ogImage: supabaseProject.og_image,
      });
    }

    const override = PROJECT_METADATA_OVERRIDES[slug];
    if (override) {
      return generateProjectMetadata({
        title: override.title,
        description: override.description,
        heroImage: override.cardImage,
        cardImage: override.cardImage,
        ogImage: override.ogImage,
        slug,
      });
    }

    const project = projects.find((item) => item.id === slug || item.slug === slug);
    return project
      ? generateProjectMetadata({
          title: project.title,
          description: project.description,
          heroImage: project.cardImage,
          cardImage: project.cardImage,
          year: project.year,
          venue: project.venue,
          slug,
        })
      : undefined;
  }

  if (path.startsWith("/articles/")) {
    const slug = path.replace("/articles/", "");
    const supabaseArticle = await fetchSupabaseRow("articles", slug);
    if (supabaseArticle) {
      return generateArticleMetadata({
        title: supabaseArticle.seo_title || supabaseArticle.title || "Article",
        excerpt:
          supabaseArticle.seo_description ||
          supabaseArticle.excerpt ||
          supabaseArticle.summary ||
          "",
        coverImage: supabaseArticle.cover_image,
        category: supabaseArticle.category || "Article",
        date:
          supabaseArticle.publish_date ||
          supabaseArticle.published_at ||
          supabaseArticle.created_at ||
          new Date().toISOString(),
        author: supabaseArticle.author || DEFAULT_METADATA.author,
        id: supabaseArticle.id || slug,
        slug: supabaseArticle.slug || slug,
        tags: supabaseArticle.tags || [],
        updatedAt:
          supabaseArticle.last_modified ||
          supabaseArticle.updated_at ||
          supabaseArticle.published_at,
      });
    }

    const article = blogPosts.find((post) => post.slug === slug || post.id === slug);
    return article
      ? generateArticleMetadata({
          title: article.title,
          excerpt: article.excerpt,
          coverImage: article.coverImage,
          category: article.category,
          date: article.date,
          author: DEFAULT_METADATA.author,
          id: article.id,
          slug: article.slug,
          tags: article.tags,
          updatedAt: article.lastModified,
        })
      : undefined;
  }

  if (path.startsWith("/scenic-studio/") || path.startsWith("/studio/tutorial/")) {
    const slug = path.replace("/scenic-studio/", "").replace("/studio/tutorial/", "");
    const supabaseTutorial = await fetchSupabaseRow("tutorials", slug);
    if (supabaseTutorial) {
      return generateTutorialMetadata({
        title: supabaseTutorial.title || "Tutorial",
        description: supabaseTutorial.description || "",
        thumbnail:
          supabaseTutorial.thumbnail_url ||
          supabaseTutorial.thumbnail ||
          supabaseTutorial.cover_image,
        category: supabaseTutorial.category || "tutorial",
        slug: supabaseTutorial.slug || supabaseTutorial.id || slug,
      });
    }

    const tutorial = TUTORIALS.find((item) => item.slug === slug || item.id === slug);
    return tutorial
      ? generateTutorialMetadata({
          title: tutorial.title,
          description: tutorial.description,
          thumbnail: tutorial.thumbnail,
          category: tutorial.category,
          slug: tutorial.slug,
        })
      : undefined;
  }

  if (path.startsWith("/news/")) {
    const slug = path.replace("/news/", "");
    const supabaseNews = await fetchSupabaseRow("news", slug);
    if (supabaseNews) {
      return generateNewsMetadata({
        title: supabaseNews.seo_title || supabaseNews.title || "News",
        excerpt:
          supabaseNews.seo_description ||
          supabaseNews.excerpt ||
          supabaseNews.summary ||
          "",
        coverImage: supabaseNews.cover_image,
        category: supabaseNews.category || "News",
        date: supabaseNews.date || supabaseNews.published_at || supabaseNews.created_at,
        lastModified:
          supabaseNews.last_modified ||
          supabaseNews.updated_at ||
          supabaseNews.published_at ||
          supabaseNews.date,
        id: supabaseNews.id || slug,
        slug: supabaseNews.slug || slug,
        tags: supabaseNews.tags || [],
      });
    }

    const news = newsItems.find((item) => item.slug === slug || item.id === slug);
    return news
      ? generateNewsMetadata({
          title: news.title,
          excerpt: news.excerpt,
          coverImage: news.coverImage,
          category: news.category,
          date: news.date,
          lastModified: news.lastModified,
          id: news.id,
          slug: news.slug,
          tags: news.tags,
        })
      : undefined;
  }

  return undefined;
};

const resolveStaticMetadata = (
  path: string,
  searchParams?: Record<string, string | string[] | undefined>
) => {
  if (path === "/portfolio") {
    const filter = searchParams?.filter;
    if (typeof filter === "string") {
      const key = `portfolio-${filter}`;
      if (PAGE_METADATA[key]) return PAGE_METADATA[key];
    }
    return PAGE_METADATA.portfolio;
  }

  const key = resolveStaticKey(path);
  return PAGE_METADATA[key] || PAGE_METADATA["404"];
};

export const resolveMetadata = async (
  path: string,
  searchParams?: Record<string, string | string[] | undefined>
): Promise<PageMetadata> => {
  return (
    (await resolveDynamicMetadata(path)) || resolveStaticMetadata(path, searchParams)
  );
};

export const toNextMetadata = (metadata: PageMetadata): Metadata => {
  const canonicalPath = metadata.canonicalPath || "/";
  const canonical = new URL(canonicalPath, SITE_URL).toString();
  const title = metadata.title.includes(DEFAULT_METADATA.siteName)
    ? metadata.title
    : `${metadata.title} | ${DEFAULT_METADATA.siteName} - Scenic Designer`;

  const imageUrl = toAbsoluteUrl(metadata.ogImage) || `${SITE_URL}/og-default.jpg`;

  return {
    title,
    description: metadata.description,
    keywords: metadata.keywords,
    alternates: {
      canonical,
    },
    authors: [{ name: metadata.author || DEFAULT_METADATA.author }],
    openGraph: {
      title,
      description: metadata.description,
      url: canonical,
      siteName: DEFAULT_METADATA.siteName,
      type: metadata.ogType || "website",
      images: imageUrl ? [{ url: imageUrl }] : undefined,
    },
    twitter: {
      card: metadata.twitterCard || "summary_large_image",
      title,
      description: metadata.description,
      images: imageUrl ? [imageUrl] : undefined,
    },
    robots: metadata.noindex ? { index: false, follow: false } : undefined,
    other: metadata.googleSiteVerification
      ? { "google-site-verification": metadata.googleSiteVerification }
      : undefined,
  };
};

const buildBreadcrumbs = (path: string) => {
  const segments = path.split("/").filter(Boolean);
  const crumbs = [{ name: "Home", url: SITE_URL }];
  let current = "";

  segments.forEach((segment) => {
    current += `/${segment}`;
    const name = segment.replace(/-/g, " ");
    crumbs.push({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      url: `${SITE_URL}${current}`,
    });
  });

  return crumbs;
};

export const resolveStructuredData = async (
  path: string,
  searchParams?: Record<string, string | string[] | undefined>
) => {
  const schemas: Record<string, unknown>[] = [];
  const metadata = await resolveMetadata(path, searchParams);
  const canonicalPath = metadata.canonicalPath || path;
  const canonical = new URL(canonicalPath, SITE_URL).toString();

  schemas.push(
    generatePersonSchema({
      name: DEFAULT_METADATA.siteName,
      jobTitle: "Scenic Designer",
      description: DEFAULT_METADATA.defaultDescription,
      url: SITE_URL,
      sameAs: DEFAULT_METADATA.socialProfiles,
    }),
  );

  if (path === "/") {
    schemas.push(
      generateWebSiteSchema({
        name: DEFAULT_METADATA.siteName,
        url: SITE_URL,
        description: DEFAULT_METADATA.defaultDescription,
        searchUrl: `${SITE_URL}/search`,
      }),
    );
  }

  schemas.push(generateBreadcrumbSchema(buildBreadcrumbs(canonicalPath)));

  if (path.startsWith("/articles/")) {
    const slug = path.replace("/articles/", "");
    const article = (await fetchSupabaseRow("articles", slug)) ||
      blogPosts.find((post) => post.slug === slug || post.id === slug);
    if (article) {
      schemas.push(
        generateArticleSchema({
          title: article.title || article.seo_title || "Article",
          description:
            article.excerpt ||
            article.seo_description ||
            article.summary ||
            DEFAULT_METADATA.defaultDescription,
          image: toAbsoluteUrl(article.cover_image || article.coverImage),
          datePublished:
            article.publish_date ||
            article.published_at ||
            article.created_at ||
            article.date ||
            new Date().toISOString(),
          dateModified:
            article.last_modified ||
            article.updated_at ||
            article.lastModified ||
            article.published_at ||
            article.date ||
            new Date().toISOString(),
          author: article.author || DEFAULT_METADATA.author,
          url: canonical,
          publisher: {
            name: DEFAULT_METADATA.siteName,
            logo: `${SITE_URL}/og-default.jpg`,
          },
        }),
      );
    }
  }

  if (path.startsWith("/project/")) {
    const slug = path.replace("/project/", "");
    const project = (await fetchSupabaseRow("portfolio_projects", slug)) ||
      projects.find((item) => item.id === slug || item.slug === slug);
    if (project) {
      schemas.push(
        generateCreativeWorkSchema({
          name: project.title || project.name || "Project",
          description: project.description || project.seo_description || "",
          image: toAbsoluteUrl(project.card_image || project.cover_image || project.cardImage),
          dateCreated: project.year ? String(project.year) : undefined,
          creator: DEFAULT_METADATA.author,
          url: canonical,
          genre: project.subcategory || project.category || "Scenic Design",
          keywords: project.tags || project.seo_keywords,
        }),
      );
    }
  }

  if (path.startsWith("/scenic-studio/") || path.startsWith("/studio/tutorial/")) {
    const slug = path.replace("/scenic-studio/", "").replace("/studio/tutorial/", "");
    const tutorial = (await fetchSupabaseRow("tutorials", slug)) ||
      TUTORIALS.find((item) => item.slug === slug || item.id === slug);
    if (tutorial) {
      schemas.push(
        generateVideoSchema({
          name: tutorial.title || "Tutorial",
          description: tutorial.description || "",
          thumbnailUrl:
            tutorial.thumbnail_url ||
            tutorial.thumbnail ||
            tutorial.cover_image,
          uploadDate:
            tutorial.publish_date ||
            tutorial.published_at ||
            tutorial.publishDate ||
            tutorial.created_at,
          contentUrl: tutorial.video_url || tutorial.videoUrl,
          embedUrl: tutorial.video_url || tutorial.videoUrl,
        }),
      );
    }
  }

  if (path.startsWith("/news/")) {
    const slug = path.replace("/news/", "");
    const news = (await fetchSupabaseRow("news", slug)) ||
      newsItems.find((item) => item.slug === slug || item.id === slug);
    if (news) {
      schemas.push(
        generateArticleSchema({
          title: news.title || news.seo_title || "News",
          description:
            news.excerpt ||
            news.seo_description ||
            news.summary ||
            DEFAULT_METADATA.defaultDescription,
          image: toAbsoluteUrl(news.cover_image || news.coverImage),
          datePublished:
            news.date ||
            news.published_at ||
            news.created_at ||
            new Date().toISOString(),
          dateModified:
            news.last_modified ||
            news.updated_at ||
            news.lastModified ||
            news.date ||
            new Date().toISOString(),
          author: DEFAULT_METADATA.author,
          url: canonical,
          publisher: {
            name: DEFAULT_METADATA.siteName,
            logo: `${SITE_URL}/og-default.jpg`,
          },
        }),
      );
    }
  }

  return schemas;
};

export const resolveMetadataFromParams = async ({
  params,
  searchParams,
}: {
  params?: { path?: string[] } | Promise<{ path?: string[] }>;
  searchParams?:
    | Record<string, string | string[] | undefined>
    | Promise<Record<string, string | string[] | undefined>>;
}) => {
  const resolvedParams = await Promise.resolve(params);
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const path = normalizePath(resolvedParams?.path);
  const metadata = await resolveMetadata(path, resolvedSearchParams);
  return toNextMetadata(metadata);
};
