import { Context, Hono, Next } from "hono";
import { createClient } from "@supabase/supabase-js";

const app = new Hono();

console.log("🚀 Edge Function Initializing...");

// Manual CORS Middleware
app.use("/*", async (c: Context, next: Next) => {
  const origin = c.req.header("Origin");

  // CORS Headers
  // If an Origin is present, we must echo it back to support credentials (cookies/auth headers)
  if (origin) {
    c.header("Access-Control-Allow-Origin", origin);
    c.header("Access-Control-Allow-Credentials", "true");
    c.header("Vary", "Origin");
  } else {
    // Fallback for non-browser requests or missing origin
    c.header("Access-Control-Allow-Origin", "*");
    // Cannot set Credentials=true with Origin=*
  }

  const allowedHeaders =
    "Content-Type, Authorization, X-Admin-Token, x-client-info, X-Client-Info, apikey";
  const allowedMethods = "GET, POST, PUT, DELETE, OPTIONS";

  c.header("Access-Control-Allow-Headers", allowedHeaders);
  c.header("Access-Control-Allow-Methods", allowedMethods);
  c.header("Access-Control-Max-Age", "86400");

  console.log(
    `📨 Request: ${c.req.method} ${c.req.url} | Origin: ${
      origin || "No Origin"
    }`,
  );

  // Handle preflight requests immediately
  if (c.req.method === "OPTIONS") {
    const headers: Record<string, string> = {
      "Access-Control-Allow-Origin": origin || "*",
      "Access-Control-Allow-Headers": allowedHeaders,
      "Access-Control-Allow-Methods": allowedMethods,
      "Access-Control-Max-Age": "86400",
      "Vary": "Origin",
    };

    if (origin) {
      headers["Access-Control-Allow-Credentials"] = "true";
    }

    return c.body(null, 204, headers);
  }

  await next();
});

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseKey);

// Data Mappers
interface ProjectInput {
  coverImage?: string;
  cover_image?: string;
  cardImage?: string;
  card_image?: string;
  clientName?: string;
  client_name?: string;
  projectOverview?: string;
  project_overview?: string;
  designNotes?: string;
  design_notes?: string;
  softwareUsed?: string[];
  software_used?: string[];
  videoUrls?: string[];
  video_urls?: string[];
  productionPhotos?: string[];
  production_photos?: string[];
  [key: string]: unknown;
}

const mapProjectToDb = (p: ProjectInput) => ({
  ...p,
  cover_image: p.coverImage || p.cover_image,
  card_image: p.cardImage || p.card_image,
  client_name: p.clientName || p.client_name,
  project_overview: p.projectOverview || p.project_overview,
  design_notes: p.designNotes || p.design_notes,
  software_used: p.softwareUsed || p.software_used,
  video_urls: p.videoUrls || p.video_urls,
  production_photos: p.productionPhotos || p.production_photos,
  seo_title: p.seoTitle || p.seo_title,
  seo_description: p.seoDescription || p.seo_description,
  seo_keywords: p.seoKeywords || p.seo_keywords,
  card_image_alt: p.cardImageAlt || p.card_image_alt,
  // Remove camelCase keys to avoid confusion/bloat if passed to DB
  coverImage: undefined,
  cardImage: undefined,
  clientName: undefined,
  projectOverview: undefined,
  designNotes: undefined,
  softwareUsed: undefined,
  videoUrls: undefined,
  productionPhotos: undefined,
  seoTitle: undefined,
  seoDescription: undefined,
  seoKeywords: undefined,
  cardImageAlt: undefined,
});

interface PostInput {
  coverImage?: string;
  cover_image?: string;
  date?: string;
  publishDate?: string;
  publish_date?: string;
  [key: string]: unknown;
}

const mapPostToDb = (p: PostInput) => ({
  ...p,
  cover_image: p.coverImage || p.cover_image,
  publish_date: p.date || p.publishDate || p.publish_date,
  coverImage: undefined,
  publishDate: undefined,
});

interface NewsInput {
  coverImage?: string;
  cover_image?: string;
  [key: string]: unknown;
}

const mapNewsToDb = (n: NewsInput) => ({
  ...n,
  cover_image: n.coverImage || n.cover_image,
  coverImage: undefined,
});

// Admin Middleware
const verifyAdminToken = async (c: Context, next: Next) => {
  const token = c.req.header("X-Admin-Token");
  console.log("🔐 Admin token check:", token ? "Token present" : "No token");

  if (c.req.method === "OPTIONS") {
    return next();
  }

  if (!token) {
    console.error("❌ No admin token provided");
    return c.json({ error: "Unauthorized - No token" }, 401);
  }

  try {
    const decoded = atob(token.trim());
    console.log("🔓 Decoded token starts with:", decoded.substring(0, 10));

    if (!decoded.startsWith("admin:")) {
      console.error("❌ Invalid token format");
      return c.json({ error: "Unauthorized - Invalid format" }, 401);
    }

    console.log("✅ Admin token validated");
  } catch (err) {
    console.error("❌ Token decode error:", err);
    return c.json({ error: "Unauthorized - Decode failed" }, 401);
  }

  await next();
};

// Health Check
app.get(
  "/make-server-74296234/health",
  (c: Context) => c.json({ status: "ok", timestamp: Date.now() }),
);

// Admin Login
app.post("/make-server-74296234/api/admin/login", async (c: Context) => {
  const { password } = await c.req.json();
  const adminPassword = Deno.env.get("ADMIN_PASSWORD");
  if (password === adminPassword) {
    return c.json({ success: true, token: btoa(`admin:${Date.now()}`) });
  }
  return c.json({ error: "Invalid password" }, 401);
});

// Admin Stats
app.get(
  "/make-server-74296234/api/admin/stats",
  verifyAdminToken,
  async (c: Context) => {
    try {
      const [p, a, n, t, c_res] = await Promise.all([
        supabase.from("portfolio_projects").select("*", {
          count: "exact",
          head: true,
        }),
        supabase.from("articles").select("*", { count: "exact", head: true }),
        supabase.from("news").select("*", { count: "exact", head: true }),
        supabase.from("tutorials").select("*", { count: "exact", head: true }),
        supabase.from("collaborators").select("*", {
          count: "exact",
          head: true,
        }),
      ]);
      return c.json({
        portfolio: p.count || 0,
        articles: a.count || 0,
        news: n.count || 0,
        tutorials: t.count || 0,
        collaborators: c_res.count || 0,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      return c.json({ error: message }, 500);
    }
  },
);

// ===== PROJECTS =====
app.get("/make-server-74296234/api/projects", async (c: Context) => {
  const { data, error } = await supabase.from("portfolio_projects").select("*")
    .eq("published", true).order("year", { ascending: false });
  if (error) return c.json({ error: error.message }, 500);

  // Map snake_case to camelCase for frontend
  const mapped = data?.map((
    item: {
      cover_image?: string;
      card_image?: string;
      design_notes?: string;
      seo_title?: string;
      seo_description?: string;
      seo_keywords?: string[];
      card_image_alt?: string;
      [key: string]: unknown;
    },
  ) => ({
    ...item,
    coverImage: item.cover_image,
    cardImage: item.card_image,
    designNotes: item.design_notes,
    seoTitle: item.seo_title,
    seoDescription: item.seo_description,
    seoKeywords: item.seo_keywords,
    cardImageAlt: item.card_image_alt,
  }));

  return c.json({ success: true, projects: mapped });
});

app.get("/make-server-74296234/api/projects/:slug", async (c: Context) => {
  const { data, error } = await supabase.from("portfolio_projects").select("*")
    .eq("slug", c.req.param("slug")).single();
  if (error) return c.json({ error: error.message }, 404);

  const mapped = {
    ...data,
    coverImage: data.cover_image,
    cardImage: data.card_image,
    designNotes: data.design_notes,
    seoTitle: data.seo_title,
    seoDescription: data.seo_description,
    seoKeywords: data.seo_keywords,
    cardImageAlt: data.card_image_alt,
  };

  return c.json({ success: true, project: mapped });
});

app.post("/make-server-74296234/api/projects/:id/view", async (c: Context) => {
  await supabase.rpc("increment_project_view", {
    project_id: c.req.param("id"),
  });
  const { data } = await supabase.from("portfolio_projects").select(
    "views, likes",
  ).eq("id", c.req.param("id")).single();
  return c.json({
    success: true,
    views: data?.views || 0,
    likes: data?.likes || 0,
  });
});

app.post("/make-server-74296234/api/projects/:id/like", async (c: Context) => {
  await supabase.rpc("increment_project_like", {
    project_id: c.req.param("id"),
  });
  const { data } = await supabase.from("portfolio_projects").select(
    "views, likes",
  ).eq("id", c.req.param("id")).single();
  return c.json({
    success: true,
    views: data?.views || 0,
    likes: data?.likes || 0,
  });
});

// ===== ARTICLES =====
app.get("/make-server-74296234/api/posts", async (c: Context) => {
  const { data, error } = await supabase.from("articles").select("*").eq(
    "published",
    true,
  ).order("date", { ascending: false });
  if (error) return c.json({ error: error.message }, 500);

  // Map database fields to frontend format
  const mappedPosts = data?.map((
    post: { cover_image?: string; [key: string]: unknown },
  ) => ({
    ...post,
    coverImage: post.cover_image,
  }));

  return c.json({ success: true, posts: mappedPosts });
});

app.get("/make-server-74296234/api/posts/:slug", async (c: Context) => {
  const { data, error } = await supabase.from("articles").select("*").eq(
    "slug",
    c.req.param("slug"),
  ).single();
  if (error) return c.json({ error: error.message }, 404);

  // Map database fields to frontend format
  const mappedPost = {
    ...data,
    coverImage: data.cover_image || data.coverImage,
  };

  return c.json({ success: true, post: mappedPost });
});

app.post("/make-server-74296234/api/posts/:id/view", async (c: Context) => {
  await supabase.rpc("increment_article_view", {
    article_id: c.req.param("id"),
  });
  const { data } = await supabase.from("articles").select("views, likes").eq(
    "id",
    c.req.param("id"),
  ).single();
  return c.json({
    success: true,
    views: data?.views || 0,
    likes: data?.likes || 0,
  });
});

app.post("/make-server-74296234/api/posts/:id/like", async (c: Context) => {
  await supabase.rpc("increment_article_like", {
    article_id: c.req.param("id"),
  });
  const { data } = await supabase.from("articles").select("views, likes").eq(
    "id",
    c.req.param("id"),
  ).single();
  return c.json({
    success: true,
    views: data?.views || 0,
    likes: data?.likes || 0,
  });
});

// Get related posts
app.post("/make-server-74296234/api/posts/related", async (c: Context) => {
  try {
    const { category, tags, excludeId } = await c.req.json();

    // Get articles with same category or matching tags
    let query = supabase
      .from("articles")
      .select("*")
      .eq("published", true)
      .neq("id", excludeId);

    if (category) {
      query = query.eq("category", category);
    }

    if (tags && Array.isArray(tags) && tags.length > 0) {
      query = query.overlaps("tags", tags);
    }

    // Sort by date desc
    query = query.order("date", { ascending: false }).limit(3);

    const { data, error } = await query;

    if (error) return c.json({ error: error.message }, 500);

    // Map fields
    const mapped = data?.map((
      post: { cover_image?: string; [key: string]: unknown },
    ) => ({
      ...post,
      coverImage: post.cover_image,
    }));

    return c.json({ success: true, posts: mapped || [] });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return c.json({ error: message }, 500);
  }
});

// ===== CATEGORIES =====
app.get("/make-server-74296234/api/categories/:type", async (c: Context) => {
  const type = c.req.param("type");
  const { data, error } = await supabase.from("categories").select("*").eq(
    "type",
    type,
  ).order("display_order");
  if (error) return c.json({ error: error.message }, 500);
  return c.json({ success: true, categories: data || [] });
});

app.get(
  "/make-server-74296234/api/admin/categories",
  verifyAdminToken,
  async (c: Context) => {
    const { data, error } = await supabase.from("categories").select("*").order(
      "type, name",
    );
    if (error) return c.json({ error: error.message }, 500);

    // Group by type
    const grouped = {
      portfolio:
        data?.filter((c: { type?: string; [key: string]: unknown }) =>
          c.type === "portfolio"
        ) || [],
      articles:
        data?.filter((c: { type?: string; [key: string]: unknown }) =>
          c.type === "articles"
        ) || [],
      news:
        data?.filter((c: { type?: string; [key: string]: unknown }) =>
          c.type === "news"
        ) || [],
    };

    return c.json({ success: true, categories: grouped });
  },
);

app.post(
  "/make-server-74296234/api/admin/categories/:type",
  verifyAdminToken,
  async (c: Context) => {
    const type = c.req.param("type");
    const category = await c.req.json();

    const { data, error } = await supabase.from("categories").insert({
      ...category,
      type,
    }).select().single();
    if (error) return c.json({ error: error.message }, 500);
    return c.json({ success: true, category: data });
  },
);

app.put(
  "/make-server-74296234/api/admin/categories/:type",
  verifyAdminToken,
  async (c: Context) => {
    const category = await c.req.json();
    const { error } = await supabase.from("categories").update(category).eq(
      "id",
      category.id,
    );
    if (error) return c.json({ error: error.message }, 500);
    return c.json({ success: true });
  },
);

app.delete(
  "/make-server-74296234/api/admin/categories/:type/:id",
  verifyAdminToken,
  async (c: Context) => {
    const { error } = await supabase.from("categories").delete().eq(
      "id",
      c.req.param("id"),
    );
    if (error) return c.json({ error: error.message }, 500);
    return c.json({ success: true });
  },
);

// ===== ADMIN CRUD =====
// Admin Projects
app.get(
  "/make-server-74296234/api/admin/projects",
  verifyAdminToken,
  async (c: Context) => {
    const { data, error } = await supabase.from("portfolio_projects").select(
      "*",
    ).order("created_at", { ascending: false });
    if (error) return c.json({ error: error.message }, 500);
    return c.json({ success: true, projects: data });
  },
);

app.post(
  "/make-server-74296234/api/admin/projects",
  verifyAdminToken,
  async (c: Context) => {
    const project = await c.req.json();
    const dbProject = mapProjectToDb(project);
    const { data, error } = await supabase.from("portfolio_projects").insert(
      dbProject,
    ).select().single();
    if (error) return c.json({ error: error.message }, 500);
    return c.json({ success: true, projectId: data.id });
  },
);

app.put(
  "/make-server-74296234/api/admin/projects/:id",
  verifyAdminToken,
  async (c: Context) => {
    const updates = await c.req.json();
    const dbUpdates = mapProjectToDb(updates);
    const { error } = await supabase.from("portfolio_projects").update(
      dbUpdates,
    )
      .eq("id", c.req.param("id"));
    if (error) return c.json({ error: error.message }, 500);
    return c.json({ success: true });
  },
);

app.delete(
  "/make-server-74296234/api/admin/projects/:id",
  verifyAdminToken,
  async (c: Context) => {
    const { error } = await supabase.from("portfolio_projects").delete().eq(
      "id",
      c.req.param("id"),
    );
    if (error) return c.json({ error: error.message }, 500);
    return c.json({ success: true });
  },
);

// Admin Posts
app.get(
  "/make-server-74296234/api/admin/posts",
  verifyAdminToken,
  async (c: Context) => {
    const { data, error } = await supabase.from("articles").select("*").order(
      "created_at",
      { ascending: false },
    );
    if (error) return c.json({ error: error.message }, 500);
    return c.json({ success: true, posts: data });
  },
);

app.post(
  "/make-server-74296234/api/admin/posts",
  verifyAdminToken,
  async (c: Context) => {
    const post = await c.req.json();
    const dbPost = mapPostToDb(post);
    const { data, error } = await supabase.from("articles").insert(dbPost)
      .select().single();
    if (error) return c.json({ error: error.message }, 500);
    return c.json({ success: true, postId: data.id });
  },
);

app.put(
  "/make-server-74296234/api/admin/posts/:id",
  verifyAdminToken,
  async (c: Context) => {
    const updates = await c.req.json();
    const dbUpdates = mapPostToDb(updates);
    const { error } = await supabase.from("articles").update(dbUpdates).eq(
      "id",
      c.req.param("id"),
    );
    if (error) return c.json({ error: error.message }, 500);
    return c.json({ success: true });
  },
);

app.delete(
  "/make-server-74296234/api/admin/posts/:id",
  verifyAdminToken,
  async (c: Context) => {
    const { error } = await supabase.from("articles").delete().eq(
      "id",
      c.req.param("id"),
    );
    if (error) return c.json({ error: error.message }, 500);
    return c.json({ success: true });
  },
);

// Admin News
app.get(
  "/make-server-74296234/api/admin/news",
  verifyAdminToken,
  async (c: Context) => {
    const { data, error } = await supabase.from("news").select("*").order(
      "created_at",
      { ascending: false },
    );
    if (error) return c.json({ error: error.message }, 500);
    return c.json({ success: true, news: data });
  },
);

app.post(
  "/make-server-74296234/api/admin/news",
  verifyAdminToken,
  async (c: Context) => {
    const newsItem = await c.req.json();
    const dbNews = mapNewsToDb(newsItem);
    const { data, error } = await supabase.from("news").insert(dbNews)
      .select().single();
    if (error) return c.json({ error: error.message }, 500);
    return c.json({ success: true, newsId: data.id });
  },
);

app.put(
  "/make-server-74296234/api/admin/news/:id",
  verifyAdminToken,
  async (c: Context) => {
    const updates = await c.req.json();
    const dbUpdates = mapNewsToDb(updates);
    const { error } = await supabase.from("news").update(dbUpdates).eq(
      "id",
      c.req.param("id"),
    );
    if (error) return c.json({ error: error.message }, 500);
    return c.json({ success: true });
  },
);

app.delete(
  "/make-server-74296234/api/admin/news/:id",
  verifyAdminToken,
  async (c: Context) => {
    const { error } = await supabase.from("news").delete().eq(
      "id",
      c.req.param("id"),
    );
    if (error) return c.json({ error: error.message }, 500);
    return c.json({ success: true });
  },
);

// ===== NEWS =====
app.get("/make-server-74296234/api/news", async (c: Context) => {
  const { data, error } = await supabase.from("news").select("*").eq(
    "published",
    true,
  ).order("date", { ascending: false });
  if (error) return c.json({ error: error.message }, 500);
  return c.json({ success: true, news: data });
});

app.get("/make-server-74296234/api/news/:slug", async (c: Context) => {
  const param = c.req.param("slug");
  const isUUID =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      param,
    );

  const query = supabase.from("news").select("*");

  if (isUUID) {
    query.eq("id", param);
  } else {
    query.eq("slug", param);
  }

  const { data, error } = await query.single();

  if (error) return c.json({ error: error.message }, 404);
  return c.json(data);
});

// ===== TUTORIALS =====

// deno-lint-ignore no-explicit-any
const mapTutorialToDb = (t: any) => ({
  id: t.id, // optional for insert, required for update usually
  slug: t.slug,
  title: t.title,
  description: t.description,
  category: t.category,
  thumbnail_url: t.thumbnail,
  video_url: t.videoUrl,
  publish_date: t.publishDate ? t.publishDate : null, // Ensure empty string becomes null
  content: {
    blocks: t.tutorialContent || [],
    learningObjectives: t.learningObjectives || [],
    keyShortcuts: t.keyShortcuts || [],
    keyConcepts: t.keyConcepts || [],
    commonPitfalls: t.commonPitfalls || [],
    proTips: t.proTips || [],
    resources: t.resources || [],
    relatedTutorials: t.relatedTutorials || [],
    duration: t.duration, // Redundant but keeping for safety in content blob
  },
  published: true, // Defaulting to published for now as per admin flow
  updated_at: new Date().toISOString(),
});

app.get("/make-server-74296234/api/tutorials", async (c: Context) => {
  const minimal = c.req.query("minimal") === "true";

  const { data, error } = await supabase.from("tutorials").select("*").order(
    "publish_date",
    { ascending: false },
  );
  if (error) return c.json({ error: error.message }, 500);

  // Map database fields to frontend format
  const mappedTutorials = data?.map((
    t: {
      id?: string;
      slug?: string;
      title?: string;
      description?: string;
      category?: string;
      duration?: string;
      thumbnail_url?: string;
      video_url?: string;
      publish_date?: string;
      created_at?: string;
      content?: {
        duration?: string;
        blocks?: unknown[];
        learningObjectives?: unknown[];
        keyShortcuts?: unknown[];
        keyConcepts?: unknown[];
        commonPitfalls?: unknown[];
        proTips?: unknown[];
        resources?: unknown[];
        relatedTutorials?: unknown[];
      };
      [key: string]: unknown;
    },
  ) => ({
    id: t.id,
    slug: t.slug,
    title: t.title,
    description: t.description || "",
    category: t.category || "quick-tips",
    duration: t.duration || t.content?.duration || "",
    thumbnail: t.thumbnail_url || "",
    videoUrl: t.video_url || "",
    publishDate: t.publish_date || t.created_at,
    // Return empty content for minimal list views to save bandwidth
    tutorialContent: minimal ? [] : (t.content?.blocks || t.content || []),
    learningObjectives: minimal ? [] : (t.content?.learningObjectives || []),
    keyShortcuts: minimal ? [] : (t.content?.keyShortcuts || []),
    keyConcepts: minimal ? [] : (t.content?.keyConcepts || []),
    commonPitfalls: minimal ? [] : (t.content?.commonPitfalls || []),
    proTips: minimal ? [] : (t.content?.proTips || []),
    resources: minimal ? [] : (t.content?.resources || []),
    relatedTutorials: minimal ? [] : (t.content?.relatedTutorials || []),
  }));

  return c.json({ success: true, tutorials: mappedTutorials });
});

app.get("/make-server-74296234/api/tutorials/:slug", async (c: Context) => {
  const param = c.req.param("slug");
  const isUUID =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      param,
    );

  const query = supabase.from("tutorials").select("*");

  if (isUUID) {
    query.eq("id", param);
  } else {
    query.eq("slug", param);
  }

  const { data, error } = await query.single();

  if (error) return c.json({ error: error.message }, 404);

  // Map database fields to frontend format
  const t = data;
  const mappedTutorial = {
    id: t.id,
    slug: t.slug,
    title: t.title,
    description: t.description || "",
    category: t.category || "quick-tips",
    duration: t.duration || t.content?.duration || "",
    thumbnail: t.thumbnail_url || "",
    videoUrl: t.video_url || "",
    publishDate: t.publish_date || t.created_at,
    tutorialContent: t.content?.blocks || t.content || [],
    learningObjectives: t.content?.learningObjectives || [],
    keyShortcuts: t.content?.keyShortcuts || [],
    commonPitfalls: t.content?.commonPitfalls || [],
    proTips: t.content?.proTips || [],
    resources: t.content?.resources || [],
    relatedTutorials: t.content?.relatedTutorials || [],
  };

  return c.json({ success: true, tutorial: mappedTutorial });
});

app.post(
  "/make-server-74296234/api/admin/tutorials",
  verifyAdminToken,
  async (c: Context) => {
    try {
      const tutorial = await c.req.json();
      console.log("Creating tutorial:", tutorial.title);

      const dbTutorial = mapTutorialToDb(tutorial);

      // If ID is provided and looks like UUID, use it, otherwise let DB generate or ignore
      // Frontend often sends Date.now() string for new IDs which is NOT UUID.
      // We should sanitize ID. If it's not UUID, let DB generate one.
      const isUUID =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          tutorial.id,
        );
      if (!isUUID) {
        delete dbTutorial.id;
      }

      const { data, error } = await supabase.from("tutorials").insert(
        dbTutorial,
      )
        .select().single();

      if (error) {
        console.error("Create tutorial error:", error);
        return c.json({ error: error.message }, 500);
      }
      return c.json({ success: true, tutorialId: data.id });
    } catch (err) {
      console.error("Exception creating tutorial:", err);
      const message = err instanceof Error ? err.message : "Unknown error";
      return c.json({ error: message }, 500);
    }
  },
);

app.put(
  "/make-server-74296234/api/admin/tutorials/:id",
  verifyAdminToken,
  async (c: Context) => {
    try {
      const id = c.req.param("id");
      const updates = await c.req.json();
      console.log("Updating tutorial:", id);

      const dbUpdates = mapTutorialToDb(updates);
      // Ensure we don't change ID
      delete dbUpdates.id;

      const { error } = await supabase.from("tutorials").update(dbUpdates).eq(
        "id",
        id,
      );

      if (error) {
        console.error("Update tutorial error:", error);
        return c.json({ error: error.message }, 500);
      }
      return c.json({ success: true });
    } catch (err) {
      console.error("Exception updating tutorial:", err);
      const message = err instanceof Error ? err.message : "Unknown error";
      return c.json({ error: message }, 500);
    }
  },
);

app.delete(
  "/make-server-74296234/api/admin/tutorials/:id",
  verifyAdminToken,
  async (c: Context) => {
    try {
      const id = c.req.param("id");
      console.log("Deleting tutorial:", id);

      const { error } = await supabase.from("tutorials").delete().eq("id", id);

      if (error) {
        console.error("Delete tutorial error:", error);
        return c.json({ error: error.message }, 500);
      }
      return c.json({ success: true });
    } catch (err) {
      console.error("Exception deleting tutorial:", err);
      const message = err instanceof Error ? err.message : "Unknown error";
      return c.json({ error: message }, 500);
    }
  },
);

// ===== MEDIA UPLOAD =====
app.post(
  "/make-server-74296234/api/admin/upload",
  verifyAdminToken,
  async (c: Context) => {
    try {
      const body = await c.req.parseBody();
      const file = body["file"] || body["image"]; // Modified to check for 'image' as well
      const bucket = body["bucket"] as string || "blog";
      const path = body["path"] as string || "";

      // Debugging: Log what we received
      console.log("Upload request body keys:", Object.keys(body));

      if (!file || typeof file === "string" || Array.isArray(file)) {
        return c.json({
          error: "Invalid file uploaded",
          debug: {
            keys: Object.keys(body),
            contentType: c.req.header("content-type"),
            fileType: typeof file,
            isArray: Array.isArray(file),
          },
        }, 400);
      }

      // At this point typescript knows 'file' is a File object because we eliminated string and array
      const uploadedFile = file as unknown as File; // Hono types can be tricky, safe cast

      const fileName = `${path ? path + "/" : ""}${Date.now()}-${
        uploadedFile.name.replace(/[^a-zA-Z0-9.-]/g, "_")
      }`;

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, uploadedFile, {
          contentType: uploadedFile.type,
          upsert: false,
        });

      if (error) {
        console.error("Upload error:", error);
        return c.json({ error: error.message }, 500);
      }

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      return c.json({ success: true, url: publicUrl });
    } catch (err) {
      console.error("Server upload error:", err);
      const message = err instanceof Error ? err.message : "Unknown error";
      return c.json({ error: message }, 500);
    }
  },
);

// ===== COLLABORATORS =====
app.get("/make-server-74296234/api/collaborators", async (c: Context) => {
  const { data, error } = await supabase.from("collaborators").select("*");
  if (error) return c.json({ error: error.message }, 500);
  return c.json({ success: true, collaborators: data });
});

app.post(
  "/make-server-74296234/api/collaborators",
  verifyAdminToken,
  async (c: Context) => {
    const collaborator = await c.req.json();
    const { data, error } = await supabase.from("collaborators").insert(
      collaborator,
    ).select().single();
    if (error) return c.json({ error: error.message }, 500);
    return c.json({ success: true, collaboratorId: data.id });
  },
);

app.put(
  "/make-server-74296234/api/collaborators/:id",
  verifyAdminToken,
  async (c: Context) => {
    const updates = await c.req.json();
    const { error } = await supabase.from("collaborators").update(updates).eq(
      "id",
      c.req.param("id"),
    );
    if (error) return c.json({ error: error.message }, 500);
    return c.json({ success: true });
  },
);

app.delete(
  "/make-server-74296234/api/collaborators/:id",
  verifyAdminToken,
  async (c: Context) => {
    const { error } = await supabase.from("collaborators").delete().eq(
      "id",
      c.req.param("id"),
    );
    if (error) return c.json({ error: error.message }, 500);
    return c.json({ success: true });
  },
);

// ===== SETTINGS =====
app.get("/make-server-74296234/api/settings", async (c: Context) => {
  const { data } = await supabase.from("site_configuration").select("value").eq(
    "key",
    "site_settings",
  ).single();
  return c.json({ settings: data?.value || {} });
});

app.post(
  "/make-server-74296234/api/admin/settings",
  verifyAdminToken,
  async (c: Context) => {
    const settings = await c.req.json();
    const { error } = await supabase.from("site_configuration").upsert({
      key: "site_settings",
      value: settings,
    });
    if (error) return c.json({ error: error.message }, 500);
    return c.json({ success: true, settings });
  },
);

// ===== AI GENERATION =====

app.post(
  "/make-server-74296234/api/admin/expand-notes",
  verifyAdminToken,
  async (c: Context) => {
    try {
      const { notes, context } = await c.req.json();
      const apiKey = Deno.env.get("OPENAI_API_KEY");

      if (!apiKey) {
        return c.json({ error: "OpenAI configuration missing" }, 500);
      }

      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o",
            messages: [
              {
                role: "system",
                content: `You are a professional design portfolio copywriter. 
                                Expand the provided bullet points into a detailed, professional paragraph (~300 words). 
                                Focus on technical details, artistic intent, and design process. 
                                Maintain a professional, sophisticated tone suitable for a scenic design portfolio.
                                Return ONLY a JSON object with a single key "expandedNotes" containing the array of expanded strings (one per note group).`,
              },
              {
                role: "user",
                content: `Context: ${
                  context || "Scenic Design Portfolio"
                }\n\nNotes to expand:\n${JSON.stringify(notes)}`,
              },
            ],
            response_format: { type: "json_object" },
          }),
        },
      );

      const data = await response.json();
      if (data.error) throw new Error(data.error.message);

      const result = JSON.parse(data.choices[0].message.content);
      return c.json({ success: true, expandedNotes: result.expandedNotes });
    } catch (err) {
      console.error("AI Notes Error:", err);
      return c.json({
        error: err instanceof Error ? err.message : "Generation failed",
      }, 500);
    }
  },
);

app.post(
  "/make-server-74296234/api/admin/generate-tags",
  verifyAdminToken,
  async (c: Context) => {
    try {
      const { imageUrl, context } = await c.req.json();
      const apiKey = Deno.env.get("OPENAI_API_KEY");

      if (!apiKey) return c.json({ error: "OpenAI key missing" }, 500);

      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o",
            messages: [
              {
                role: "system",
                content:
                  "Analyze this image for Brandon PT Davis's scenic design portfolio. Generate 10-15 highly descriptive tags. Focus on: VISUAL TEXTURES, LIGHTING EFFECTS, ARCHITECTURAL STYLE, and MOOD. Avoid generic terms like 'scenic-design' or 'theatre'. Return ONLY JSON with a 'tags' array.",
              },
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: context
                      ? `Context: ${context}`
                      : "Analyze this image.",
                  },
                  { type: "image_url", image_url: { url: imageUrl } },
                ],
              },
            ],
            response_format: { type: "json_object" },
          }),
        },
      );

      const data = await response.json();
      const result = JSON.parse(data.choices[0].message.content);
      return c.json({ success: true, tags: result.tags });
    } catch (_err) {
      return c.json({ error: "Vision analysis failed" }, 500);
    }
  },
);

app.post(
  "/make-server-74296234/api/admin/ai/analyze-image",
  verifyAdminToken,
  async (c: Context) => {
    try {
      const { imageUrl, context } = await c.req.json();
      const apiKey = Deno.env.get("OPENAI_API_KEY");

      if (!apiKey) return c.json({ error: "OpenAI key missing" }, 500);

      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o",
            messages: [
              {
                role: "system",
                content:
                  "Write concise, accessible alt text for Brandon PT Davis's scenic design portfolio image. 1–2 sentences, max 125 characters. Include production name and venue if known in context; include 'Brandon PT Davis' only if provided in context. Focus on visible scenic elements, materials, and spatial composition. No marketing claims. Return ONLY JSON: {\"result\": \"...\"}.",
              },
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: context || "Scenic design image",
                  },
                  { type: "image_url", image_url: { url: imageUrl } },
                ],
              },
            ],
            response_format: { type: "json_object" },
          }),
        },
      );

      const data = await response.json();
      const result = JSON.parse(data.choices[0].message.content);
      return c.json({ success: true, result: result.result });
    } catch (_err) {
      return c.json({ error: "Image analysis failed" }, 500);
    }
  },
);

// Stub for select-thumbnail if needed (logic usually handled client-side or separate service, but adding endpoint to prevent 404)
app.post(
  "/make-server-74296234/api/admin/select-thumbnail",
  verifyAdminToken,
  (c: Context) => {
    return c.json({
      success: false,
      error: "Not implemented on server-side. Use client-side canvas.",
    });
  },
);
app.post(
  "/make-server-74296234/api/admin/ai/seo-tags",
  verifyAdminToken,
  async (c: Context) => {
    try {
      const { title, content } = await c.req.json();
      const apiKey = Deno.env.get("OPENAI_API_KEY");

      if (!apiKey) {
        return c.json({ error: "OpenAI configuration missing" }, 500);
      }

      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o",
            messages: [
              {
                role: "system",
                content:
                  "You are an SEO strategist for Brandon PT Davis, a scenic & experiential designer. Generate 8-12 high-intent SEO tags. REQUIREMENTS: include 'Brandon PT Davis' and at least 2 of: scenic design, experiential design, theatre set design, production design, immersive environments. Include any specific production names, venues/locations, design styles, and materials if present. Use lowercase unless a proper name. No hashtags. Return ONLY JSON: {\"tags\": [..] }.",
              },
              {
                role: "user",
                content: `Title: ${title}\n\nContent: ${content}`,
              },
            ],
            response_format: { type: "json_object" },
          }),
        },
      );

      const data = await response.json();
      if (data.error) throw new Error(data.error.message);

      const result = JSON.parse(data.choices[0].message.content);
      // Handle both "tags": [...] object or direct array if model deviates
      const tags = result.tags || result.keywords ||
        (Array.isArray(result) ? result : []);

      return c.json({ success: true, tags, note: "Generated by AI" });
    } catch (err) {
      console.error("AI Tags Error:", err);
      return c.json({
        error: err instanceof Error ? err.message : "Generation failed",
      }, 500);
    }
  },
);

app.post(
  "/make-server-74296234/api/admin/ai/seo-description",
  verifyAdminToken,
  async (c: Context) => {
    try {
      const { title, content } = await c.req.json();
      const apiKey = Deno.env.get("OPENAI_API_KEY");

      if (!apiKey) {
        return c.json({ error: "OpenAI configuration missing" }, 500);
      }

      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o",
            messages: [
              {
                role: "system",
                content:
                  "You are writing SEO meta descriptions for Brandon PT Davis (scenic & experiential designer). Write a clear, market-facing description (140–160 chars). RULES: 1) Include 'Brandon PT Davis' and 'scenic design' plus 'theatre' if relevant. 2) Use concrete details from the content; avoid fluff. 3) If a venue/location is mentioned, include it. 4) Professional, architectural tone. 5) No hype or unverifiable claims. Return ONLY the text.",
              },
              {
                role: "user",
                content: `Title: ${title}\n\nContent: ${content}`,
              },
            ],
          }),
        },
      );

      const data = await response.json();
      if (data.error) throw new Error(data.error.message);

      return c.json({
        success: true,
        description: data.choices[0].message.content,
        note: "Generated by AI",
      });
    } catch (err) {
      console.error("AI Desc Error:", err);
      return c.json({
        error: err instanceof Error ? err.message : "Generation failed",
      }, 500);
    }
  },
);

app.post(
  "/make-server-74296234/api/admin/ai/seo-read-time",
  verifyAdminToken,
  async (c: Context) => {
    try {
      const { title, content } = await c.req.json();
      const apiKey = Deno.env.get("OPENAI_API_KEY");

      if (!apiKey) {
        return c.json({ error: "OpenAI configuration missing" }, 500);
      }

      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o",
            messages: [
              {
                role: "system",
                content:
                  "Calculate the read time for the following article. Return valid JSON with a single key 'readTime' (e.g., '5 min read').",
              },
              {
                role: "user",
                content: `Title: ${title}\n\nContent: ${content}`,
              },
            ],
            response_format: { type: "json_object" },
          }),
        },
      );

      const data = await response.json();
      if (data.error) throw new Error(data.error.message);

      const result = JSON.parse(data.choices[0].message.content);
      return c.json({
        success: true,
        readTime: result.readTime || "5 min read",
      });
    } catch (err) {
      console.error("AI Read Time Error:", err);
      return c.json({
        error: err instanceof Error ? err.message : "Generation failed",
      }, 500);
    }
  },
);

app.post(
  "/make-server-74296234/api/admin/ai/generate-excerpt",
  verifyAdminToken,
  async (c: Context) => {
    try {
      const { title, content } = await c.req.json();
      const apiKey = Deno.env.get("OPENAI_API_KEY");

      if (!apiKey) {
        return c.json({ error: "OpenAI configuration missing" }, 500);
      }

      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o",
            messages: [
              {
                role: "system",
                content:
                  "You are writing a short excerpt to market Brandon PT Davis's articles. Write a clear, professional summary (140–170 chars, max 200) that mentions scenic design or experiential design when relevant, and include 'Brandon PT Davis' if it fits naturally. Use active voice, no hype, no clichés. Return JSON: {\"excerpt\": \"...\"}.",
              },
              {
                role: "user",
                content: `Title: ${title}\n\nContent: ${content}`,
              },
            ],
            response_format: { type: "json_object" },
          }),
        },
      );

      const data = await response.json();
      if (data.error) throw new Error(data.error.message);

      const result = JSON.parse(data.choices[0].message.content);
      return c.json({
        success: true,
        excerpt: result.excerpt || "",
      });
    } catch (err) {
      console.error("AI Excerpt Error:", err);
      return c.json({
        error: err instanceof Error ? err.message : "Generation failed",
      }, 500);
    }
  },
);
app.post(
  "/make-server-74296234/api/admin/ai/generate",
  verifyAdminToken,
  async (c: Context) => {
    try {
      const { prompt } = await c.req.json();
      const apiKey = Deno.env.get("OPENAI_API_KEY");

      if (!apiKey) {
        return c.json({ error: "OpenAI configuration missing" }, 500);
      }

      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 500,
          }),
        },
      );

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message);
      }

      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error("Invalid response from AI provider");
      }

      return c.json({
        success: true,
        result: data.choices[0].message.content.trim(),
      });
    } catch (err) {
      console.error("AI Error:", err);
      const message = err instanceof Error ? err.message : "Unknown error";
      return c.json({ error: message }, 500);
    }
  },
);

// ===== NEW AI ENDPOINTS =====
app.post(
  "/make-server-74296234/api/admin/generate-description",
  verifyAdminToken,
  async (c: Context) => {
    try {
      const { title, category, venue, year, imageUrls } = await c.req.json();
      const apiKey = Deno.env.get("OPENAI_API_KEY");

      if (!apiKey) return c.json({ error: "OpenAI key missing" }, 500);

      const prompt =
        `Write a professional, 2-paragraph scenic design portfolio description for "${title}" (${category}, ${year}). Venue: ${venue}. 
      Context: The description should focus on the artistic intent, key scenic elements, and how the design supported the narrative. Use a sophisticated, architectural tone.
      Return ONLY a JSON object with a single key "description" containing the text.`;

      interface MessageContent {
        type: "text" | "image_url";
        text?: string;
        image_url?: { url: string };
      }

      interface OpenAIMessage {
        role: "system" | "user" | "assistant";
        content: string | MessageContent[];
      }

      const messages: OpenAIMessage[] = [
        {
          role: "system",
          content: "You are a professional portfolio copywriter.",
        },
        { role: "user", content: prompt },
      ];

      // Add visual context if images are provided
      if (imageUrls && imageUrls.length > 0) {
        messages.push({
          role: "user",
          content: [
            {
              type: "text",
              text: "Here are some reference images of the design:",
            },
            ...imageUrls.map((url: string) => ({
              type: "image_url",
              image_url: { url },
            })),
          ],
        });
      }

      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o",
            messages,
            response_format: { type: "json_object" },
          }),
        },
      );

      const data = await response.json();
      const result = JSON.parse(data.choices[0].message.content);
      return c.json({ success: true, description: result.description });
    } catch (_err) {
      return c.json({ error: "Description generation failed" }, 500);
    }
  },
);

app.post(
  "/make-server-74296234/api/admin/generate-bulk-tags",
  verifyAdminToken,
  async (c: Context) => {
    try {
      const { imageUrls, context } = await c.req.json();
      const apiKey = Deno.env.get("OPENAI_API_KEY");

      if (!apiKey) return c.json({ error: "OpenAI key missing" }, 500);

      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o",
            messages: [
              {
                role: "system",
                content:
                  "Generate 15-20 highly descriptive tags for this scenic design project. Focus deeply on: MATERIALS (e.g. 'rusted-steel', 'sheer-fabric'), LIGHTING MOOD (e.g. 'shadowy', 'neon-saturated'), and ARCHITECTURAL DETAILS (e.g. 'cornice', 'scaffolding'). Avoid generic terms. Return ONLY a JSON object with a 'tags' array of strings.",
              },
              {
                role: "user",
                content: [
                  { type: "text", text: `Context: ${context}` },
                  ...imageUrls.slice(0, 5).map((url: string) => ({
                    type: "image_url",
                    image_url: { url },
                  })),
                ],
              },
            ],
            response_format: { type: "json_object" },
          }),
        },
      );

      const data = await response.json();
      const result = JSON.parse(data.choices[0].message.content);
      return c.json({ success: true, tags: result.tags });
    } catch (_err) {
      return c.json({ error: "Tag generation failed" }, 500);
    }
  },
);

app.post(
  "/make-server-74296234/api/admin/generate-alt-text",
  verifyAdminToken,
  async (c: Context) => {
    try {
      const { imageUrl, context } = await c.req.json();
      const apiKey = Deno.env.get("OPENAI_API_KEY");
      if (!apiKey) return c.json({ error: "OpenAI key missing" }, 500);

      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o",
            messages: [
              {
                role: "system",
                content:
                  "Generate concise, accessible alt text (max 125 chars) for a Brandon PT Davis scenic design image. Include production/venue if provided in context; include 'Brandon PT Davis' only if present in context. No marketing language.",
              },
              {
                role: "user",
                content: [{
                  type: "text",
                  text: context ? `Context: ${context}` : "",
                }, { type: "image_url", image_url: { url: imageUrl } }],
              },
            ],
          }),
        },
      );

      const data = await response.json();
      return c.json({
        success: true,
        altText: data.choices[0].message.content,
      });
    } catch (_err) {
      return c.json({ error: "Alt text generation failed" }, 500);
    }
  },
);

app.post(
  "/make-server-74296234/api/admin/generate-caption",
  verifyAdminToken,
  async (c: Context) => {
    try {
      const { imageUrl, context } = await c.req.json();
      const apiKey = Deno.env.get("OPENAI_API_KEY");
      if (!apiKey) return c.json({ error: "OpenAI key missing" }, 500);

      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o",
            messages: [
              {
                role: "system",
                content:
                  "Write a professional, architectural caption for a Brandon PT Davis portfolio image. Use concrete visual details; include production/venue if present in context. One sentence. Return ONLY JSON with key 'caption'.",
              },
              {
                role: "user",
                content: [{
                  type: "text",
                  text: context ? `Context: ${context}` : "",
                }, { type: "image_url", image_url: { url: imageUrl } }],
              },
            ],
            response_format: { type: "json_object" },
          }),
        },
      );

      const data = await response.json();
      const result = JSON.parse(data.choices[0].message.content);
      return c.json({ success: true, caption: result.caption });
    } catch (_err) {
      return c.json({ error: "Caption generation failed" }, 500);
    }
  },
);

// ===== CONTACT =====
app.post("/make-server-74296234/api/contact", async (c: Context) => {
  try {
    const { name, email, projectType, message } = await c.req.json();
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!resendApiKey) {
      console.error("Missing RESEND_API_KEY");
      return c.json(
        { error: "Server configuration error - Missing API Key" },
        500,
      );
    }

    // Try to send email via Resend
    // Note: 'from' address must be a verified domain in Resend.
    // If not verified, use 'onboarding@resend.dev' BUT this only sends to the verified account email.
    // Assuming 'contact@brandonptdavis.com' is verified or we use the onboarding default if testing.
    // For safety in this specific portfolio context, we'll try the domain first.

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "Portfolio Form <onboarding@resend.dev>",
        to: ["brandon@brandonptdavis.com"],
        reply_to: email,
        subject: `New Inquiry: ${name} (${projectType || "General"})`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="border-bottom: 2px solid #eee; padding-bottom: 10px;">New Contact Form Submission</h2>
            <p><strong>From:</strong> ${name} (<a href="mailto:${email}">${email}</a>)</p>
            <p><strong>Project Type:</strong> ${
          projectType || "Not specified"
        }</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="white-space: pre-wrap; color: #333;">${message}</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 12px; color: #666;">Sent from brandonptdavis.com</p>
          </div>
        `,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Resend API failed:", errorText);
      throw new Error("Email provider rejected request: " + errorText);
    }

    const data = await res.json();
    return c.json({ success: true, id: data.id });
  } catch (err) {
    console.error("Contact API Critical Error:", err);
    return c.json({
      error: err instanceof Error ? err.message : "Internal Server Error",
    }, 500);
  }
});

app.notFound((c: Context) => c.json({ error: "Endpoint not found" }, 404));

Deno.serve(app.fetch);
