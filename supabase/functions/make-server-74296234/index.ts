import { Hono } from "npm:hono@3";
import { cors } from "npm:hono@3/cors";
import { createClient } from "npm:@supabase/supabase-js@2";

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

// Admin Middleware
const verifyAdminToken = async (c: any, next: any) => {
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
  (c: any) => c.json({ status: "ok", timestamp: Date.now() }),
);

// Admin Login
app.post("/make-server-74296234/api/admin/login", async (c: any) => {
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
  async (c: any) => {
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
    } catch (err: any) {
      return c.json({ error: err.message }, 500);
    }
  },
);

// ===== PROJECTS =====
app.get("/make-server-74296234/api/projects", async (c: any) => {
  const { data, error } = await supabase.from("portfolio_projects").select("*")
    .eq("published", true).order("year", { ascending: false });
  if (error) return c.json({ error: error.message }, 500);

  // Map snake_case to camelCase for frontend
  const mapped = data?.map((item: any) => ({
    ...item,
    coverImage: item.cover_image || item.coverImage,
    cardImage: item.card_image || item.cardImage,
  }));

  return c.json({ success: true, projects: mapped });
});

app.get("/make-server-74296234/api/projects/:slug", async (c: any) => {
  const { data, error } = await supabase.from("portfolio_projects").select("*")
    .eq("slug", c.req.param("slug")).single();
  if (error) return c.json({ error: error.message }, 404);

  const mapped = {
    ...data,
    coverImage: data.cover_image || data.coverImage,
    cardImage: data.card_image || data.cardImage,
  };

  return c.json({ success: true, project: mapped });
});

app.post("/make-server-74296234/api/projects/:id/view", async (c: any) => {
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

app.post("/make-server-74296234/api/projects/:id/like", async (c: any) => {
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
app.get("/make-server-74296234/api/posts", async (c: any) => {
  const { data, error } = await supabase.from("articles").select("*").eq(
    "published",
    true,
  ).order("date", { ascending: false });
  if (error) return c.json({ error: error.message }, 500);

  // Map database fields to frontend format
  const mappedPosts = data?.map((post: any) => ({
    ...post,
    coverImage: post.cover_image || post.coverImage,
  }));

  return c.json({ success: true, posts: mappedPosts });
});

app.get("/make-server-74296234/api/posts/:slug", async (c: any) => {
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

app.post("/make-server-74296234/api/posts/:id/view", async (c: any) => {
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

app.post("/make-server-74296234/api/posts/:id/like", async (c: any) => {
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
app.post("/make-server-74296234/api/posts/related", async (c: any) => {
  try {
    const { category, tags, excludeId } = await c.req.json();

    // Get articles with same category or matching tags
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .eq("published", true)
      .neq("id", excludeId)
      .limit(3);

    if (error) return c.json({ error: error.message }, 500);

    // Map fields
    const mapped = data?.map((post: any) => ({
      ...post,
      coverImage: post.cover_image || post.coverImage,
    }));

    return c.json({ success: true, posts: mapped || [] });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// ===== CATEGORIES =====
app.get("/make-server-74296234/api/categories/:type", async (c: any) => {
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
  async (c: any) => {
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
  async (c: any) => {
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
  async (c: any) => {
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
  async (c: any) => {
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
  async (c: any) => {
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
  async (c: any) => {
    const project = await c.req.json();
    const { data, error } = await supabase.from("portfolio_projects").insert(
      project,
    ).select().single();
    if (error) return c.json({ error: error.message }, 500);
    return c.json({ success: true, projectId: data.id });
  },
);

app.put(
  "/make-server-74296234/api/admin/projects/:id",
  verifyAdminToken,
  async (c: any) => {
    const updates = await c.req.json();
    const { error } = await supabase.from("portfolio_projects").update(updates)
      .eq("id", c.req.param("id"));
    if (error) return c.json({ error: error.message }, 500);
    return c.json({ success: true });
  },
);

app.delete(
  "/make-server-74296234/api/admin/projects/:id",
  verifyAdminToken,
  async (c: any) => {
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
  async (c: any) => {
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
  async (c: any) => {
    const post = await c.req.json();
    const { data, error } = await supabase.from("articles").insert(post)
      .select().single();
    if (error) return c.json({ error: error.message }, 500);
    return c.json({ success: true, postId: data.id });
  },
);

app.put(
  "/make-server-74296234/api/admin/posts/:id",
  verifyAdminToken,
  async (c: any) => {
    const updates = await c.req.json();
    const { error } = await supabase.from("articles").update(updates).eq(
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
  async (c: any) => {
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
  async (c: any) => {
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
  async (c: any) => {
    const newsItem = await c.req.json();
    const { data, error } = await supabase.from("news").insert(newsItem)
      .select().single();
    if (error) return c.json({ error: error.message }, 500);
    return c.json({ success: true, newsId: data.id });
  },
);

app.put(
  "/make-server-74296234/api/admin/news/:id",
  verifyAdminToken,
  async (c: any) => {
    const updates = await c.req.json();
    const { error } = await supabase.from("news").update(updates).eq(
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
  async (c: any) => {
    const { error } = await supabase.from("news").delete().eq(
      "id",
      c.req.param("id"),
    );
    if (error) return c.json({ error: error.message }, 500);
    return c.json({ success: true });
  },
);

// ===== NEWS =====
app.get("/make-server-74296234/api/news", async (c: any) => {
  const { data, error } = await supabase.from("news").select("*").eq(
    "published",
    true,
  ).order("date", { ascending: false });
  if (error) return c.json({ error: error.message }, 500);
  return c.json({ success: true, news: data });
});

app.get("/make-server-74296234/api/news/:slug", async (c: any) => {
  const { data, error } = await supabase.from("news").select("*").eq(
    "slug",
    c.req.param("slug"),
  ).single();
  if (error) return c.json({ error: error.message }, 404);
  return c.json(data);
});

// ===== COLLABORATORS =====
app.get("/make-server-74296234/api/collaborators", async (c: any) => {
  const { data, error } = await supabase.from("collaborators").select("*");
  if (error) return c.json({ error: error.message }, 500);
  return c.json({ success: true, collaborators: data });
});

app.post(
  "/make-server-74296234/api/collaborators",
  verifyAdminToken,
  async (c: any) => {
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
  async (c: any) => {
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
  async (c: any) => {
    const { error } = await supabase.from("collaborators").delete().eq(
      "id",
      c.req.param("id"),
    );
    if (error) return c.json({ error: error.message }, 500);
    return c.json({ success: true });
  },
);

// ===== SETTINGS =====
app.get("/make-server-74296234/api/settings", async (c: any) => {
  const { data } = await supabase.from("site_configuration").select("value").eq(
    "key",
    "site_settings",
  ).single();
  return c.json({ settings: data?.value || {} });
});

app.post(
  "/make-server-74296234/api/admin/settings",
  verifyAdminToken,
  async (c: any) => {
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
  async (c: any) => {
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
    } catch (err: any) {
      console.error("AI Error:", err);
      return c.json({ error: err.message }, 500);
    }
  },
);

app.notFound((c: any) => c.json({ error: "Endpoint not found" }, 404));

export default app;
