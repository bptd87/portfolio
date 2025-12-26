import { Context, Hono, Next } from "hono";
import { cors } from "hono/cors";
import { createClient } from "@supabase/supabase-js";

const app = new Hono();

// Enable CORS for all routes
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization", "X-Admin-Token"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

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
  // Remove camelCase keys to avoid confusion/bloat if passed to DB
  coverImage: undefined,
  cardImage: undefined,
  clientName: undefined,
  projectOverview: undefined,
  designNotes: undefined,
  softwareUsed: undefined,
  videoUrls: undefined,
  productionPhotos: undefined,
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
  const mapped = data?.map((item) => ({
    ...item,
    coverImage: item.cover_image,
    cardImage: item.card_image,
    designNotes: item.design_notes,
  }));

  return c.json({ success: true, projects: mapped });
});

app.get("/make-server-74296234/api/projects/:slug", async (c: Context) => {
  const { data, error } = await supabase.from("portfolio_projects").select("*")
    .eq("slug", c.req.param("slug")).single();
  if (error) return c.json({ error: error.message }, 404);

  const mapped = {
    ...data,
    coverImage: data.cover_image || data.coverImage,
    cardImage: data.card_image || data.cardImage,
    designNotes: data.design_notes || data.designNotes,
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
  const mappedPosts = data?.map((post) => ({
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
    const mapped = data?.map((post) => ({
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
      portfolio: data?.filter((c) => c.type === "portfolio") || [],
      articles: data?.filter((c) => c.type === "articles") || [],
      news: data?.filter((c) => c.type === "news") || [],
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

app.notFound((c: Context) => c.json({ error: "Endpoint not found" }, 404));

export default app;
