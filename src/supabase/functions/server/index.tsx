import { Hono } from "npm:hono@3";
import { cors } from "npm:hono@3/cors";
import { createClient } from "npm:@supabase/supabase-js@2";

const app = new Hono();

// Enable CORS for all routes
app.use("/*", cors({
  origin: "*",
  allowHeaders: ["Content-Type", "Authorization", "X-Admin-Token"],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  exposeHeaders: ["Content-Length"],
  maxAge: 600,
}));

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseKey);

// Admin Middleware
const verifyAdminToken = async (c: any, next: any) => {
  const token = c.req.header('X-Admin-Token');
  if (!token) return c.json({ error: 'Unauthorized' }, 401);
  try {
    const decoded = atob(token.trim());
    if (!decoded.startsWith('admin:')) return c.json({ error: 'Unauthorized' }, 401);
  } catch {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  await next();
};

// Health Check
app.get("/make-server-74296234/health", (c) => c.json({ status: "ok", timestamp: Date.now() }));

// Admin Login
app.post("/make-server-74296234/api/admin/login", async (c) => {
  const { password } = await c.req.json();
  const adminPassword = Deno.env.get('ADMIN_PASSWORD');
  if (password === adminPassword) {
    return c.json({ success: true, token: btoa(`admin:${Date.now()}`) });
  }
  return c.json({ error: 'Invalid password' }, 401);
});

// Admin Stats
app.get("/make-server-74296234/api/admin/stats", async (c) => {
  try {
    const [p, a, n, t, c_res] = await Promise.all([
      supabase.from('portfolio_projects').select('*', { count: 'exact', head: true }),
      supabase.from('articles').select('*', { count: 'exact', head: true }),
      supabase.from('news').select('*', { count: 'exact', head: true }),
      supabase.from('tutorials').select('*', { count: 'exact', head: true }),
      supabase.from('collaborators').select('*', { count: 'exact', head: true }),
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
});

// ===== PROJECTS =====
app.get("/make-server-74296234/api/projects", async (c) => {
  const { data, error } = await supabase.from('portfolio_projects').select('*').eq('published', true).order('year', { ascending: false });
  if (error) return c.json({ error: error.message }, 500);
  return c.json({ success: true, projects: data });
});

app.get("/make-server-74296234/api/projects/:slug", async (c) => {
  const { data, error } = await supabase.from('portfolio_projects').select('*').eq('slug', c.req.param('slug')).single();
  if (error) return c.json({ error: error.message }, 404);
  return c.json({ success: true, project: data });
});

app.post("/make-server-74296234/api/projects/:id/view", async (c) => {
  await supabase.rpc('increment_project_view', { project_id: c.req.param('id') });
  const { data } = await supabase.from('portfolio_projects').select('views, likes').eq('id', c.req.param('id')).single();
  return c.json({ success: true, views: data?.views || 0, likes: data?.likes || 0 });
});

app.post("/make-server-74296234/api/projects/:id/like", async (c) => {
  // Direct update fallback to ensure working counter
  const { data } = await supabase.from('portfolio_projects').select('likes').eq('id', c.req.param('id')).single();
  const currentLikes = data?.likes || 0;
  const newLikes = currentLikes + 1;
  await supabase.from('portfolio_projects').update({ likes: newLikes }).eq('id', c.req.param('id'));
  return c.json({ success: true, likes: newLikes });
});

app.post("/make-server-74296234/api/projects/:id/unlike", async (c) => {
  const { data } = await supabase.from('portfolio_projects').select('likes').eq('id', c.req.param('id')).single();
  const currentLikes = data?.likes || 0;
  const newLikes = Math.max(0, currentLikes - 1);
  if (currentLikes > 0) {
    await supabase.from('portfolio_projects').update({ likes: newLikes }).eq('id', c.req.param('id'));
  }
  return c.json({ success: true, likes: newLikes });
});

// ===== ARTICLES =====
app.get("/make-server-74296234/api/posts", async (c) => {
  const { data, error } = await supabase.from('articles').select('*').order('date', { ascending: false });
  if (error) return c.json({ error: error.message }, 500);
  return c.json({ success: true, posts: data });
});

app.get("/make-server-74296234/api/posts/:slug", async (c) => {
  const { data, error } = await supabase.from('articles').select('*').eq('slug', c.req.param('slug')).single();
  if (error) return c.json({ error: error.message }, 404);
  return c.json({ success: true, post: data });
});

app.post("/make-server-74296234/api/posts/:id/view", async (c) => {
  // Direct update for views
  const { data } = await supabase.from('articles').select('views').eq('id', c.req.param('id')).single();
  const currentViews = data?.views || 0;
  await supabase.from('articles').update({ views: currentViews + 1 }).eq('id', c.req.param('id'));
  return c.json({ success: true, views: currentViews + 1 });
});

app.post("/make-server-74296234/api/posts/:id/like", async (c) => {
  // Direct update for likes
  const { data } = await supabase.from('articles').select('likes').eq('id', c.req.param('id')).single();
  const currentLikes = data?.likes || 0;
  const newLikes = currentLikes + 1;
  await supabase.from('articles').update({ likes: newLikes }).eq('id', c.req.param('id'));
  return c.json({ success: true, likes: newLikes });
});

app.post("/make-server-74296234/api/posts/:id/unlike", async (c) => {
  // Fallback decrement since no RPC exists
  const { data } = await supabase.from('articles').select('likes').eq('id', c.req.param('id')).single();
  const currentLikes = data?.likes || 0;
  if (currentLikes > 0) {
    await supabase.from('articles').update({ likes: currentLikes - 1 }).eq('id', c.req.param('id'));
  }
  return c.json({ success: true, likes: Math.max(0, currentLikes - 1) });
});

// ===== ADMIN CRUD (Generic Helper Concept or Explicit Routes) =====
// Admin Projects
app.get("/make-server-74296234/api/admin/projects", verifyAdminToken, async (c) => {
  const { data, error } = await supabase.from('portfolio_projects').select('*').order('created_at', { ascending: false });
  if (error) return c.json({ error: error.message }, 500);
  return c.json({ success: true, projects: data });
});

app.post("/make-server-74296234/api/admin/projects", verifyAdminToken, async (c) => {
  const project = await c.req.json();
  const { data, error } = await supabase.from('portfolio_projects').insert(project).select().single();
  if (error) return c.json({ error: error.message }, 500);
  return c.json({ success: true, projectId: data.id });
});

app.put("/make-server-74296234/api/admin/projects/:id", verifyAdminToken, async (c) => {
  const updates = await c.req.json();
  const { error } = await supabase.from('portfolio_projects').update(updates).eq('id', c.req.param('id'));
  if (error) return c.json({ error: error.message }, 500);
  return c.json({ success: true });
});

app.delete("/make-server-74296234/api/admin/projects/:id", verifyAdminToken, async (c) => {
  const { error } = await supabase.from('portfolio_projects').delete().eq('id', c.req.param('id'));
  if (error) return c.json({ error: error.message }, 500);
  return c.json({ success: true });
});

// Admin Posts
app.get("/make-server-74296234/api/admin/posts", verifyAdminToken, async (c) => {
  const { data, error } = await supabase.from('articles').select('*').order('created_at', { ascending: false });
  if (error) return c.json({ error: error.message }, 500);
  return c.json({ success: true, posts: data });
});

app.post("/make-server-74296234/api/admin/posts", verifyAdminToken, async (c) => {
  const post = await c.req.json();
  const { data, error } = await supabase.from('articles').insert(post).select().single();
  if (error) return c.json({ error: error.message }, 500);
  return c.json({ success: true, postId: data.id });
});

app.put("/make-server-74296234/api/admin/posts/:id", verifyAdminToken, async (c) => {
  const updates = await c.req.json();
  const { error } = await supabase.from('articles').update(updates).eq('id', c.req.param('id'));
  if (error) return c.json({ error: error.message }, 500);
  return c.json({ success: true });
});

app.delete("/make-server-74296234/api/admin/posts/:id", verifyAdminToken, async (c) => {
  const { error } = await supabase.from('articles').delete().eq('id', c.req.param('id'));
  if (error) return c.json({ error: error.message }, 500);
  return c.json({ success: true });
});

// === Placeholder for Part 2 ===
// ===== NEWS =====
app.get("/make-server-74296234/api/news", async (c) => {
  const { data, error } = await supabase.from('news').select('*').order('date', { ascending: false });
  if (error) return c.json({ error: error.message }, 500);
  return c.json({ success: true, news: data });
});

app.get("/make-server-74296234/api/news/:slug", async (c) => {
  const { data, error } = await supabase.from('news').select('*').eq('slug', c.req.param('slug')).single();
  if (error) return c.json({ error: error.message }, 404);
  return c.json(data);
});

// Admin News
app.get("/make-server-74296234/api/admin/news", verifyAdminToken, async (c) => {
  const { data, error } = await supabase.from('news').select('*').order('date', { ascending: false });
  if (error) return c.json({ error: error.message }, 500);
  return c.json({ success: true, news: data });
});

app.post("/make-server-74296234/api/admin/news", verifyAdminToken, async (c) => {
  const news = await c.req.json();
  const { data, error } = await supabase.from('news').insert(news).select().single();
  if (error) return c.json({ error: error.message }, 500);
  return c.json({ success: true, newsId: data.id });
});

app.put("/make-server-74296234/api/admin/news/:id", verifyAdminToken, async (c) => {
  const updates = await c.req.json();
  const { error } = await supabase.from('news').update(updates).eq('id', c.req.param('id'));
  if (error) return c.json({ error: error.message }, 500);
  return c.json({ success: true });
});

app.delete("/make-server-74296234/api/admin/news/:id", verifyAdminToken, async (c) => {
  const { error } = await supabase.from('news').delete().eq('id', c.req.param('id'));
  if (error) return c.json({ error: error.message }, 500);
  return c.json({ success: true });
});

// ===== TUTORIALS =====
app.get("/make-server-74296234/api/tutorials", async (c) => {
  const { data, error } = await supabase.from('tutorials').select('*').order('publish_date', { ascending: false });
  if (error) return c.json({ error: error.message }, 500);
  return c.json({ tutorials: data });
});

app.post("/make-server-74296234/api/tutorials", async (c) => {
  // Check admin token or secret
  const adminToken = c.req.header('X-Admin-Token');
  const importSecret = c.req.header('X-Import-Secret');
  if (!adminToken && importSecret !== 'temp-secret-123') return c.json({ error: 'Unauthorized' }, 401);

  const tutorial = await c.req.json();
  const { data, error } = await supabase.from('tutorials').upsert(tutorial).select().single();
  if (error) return c.json({ error: error.message }, 500);
  return c.json({ success: true, tutorial: data });
});

app.put("/make-server-74296234/api/tutorials", async (c) => {
  const adminToken = c.req.header('X-Admin-Token');
  if (!adminToken) return c.json({ error: 'Unauthorized' }, 401);
  const tutorial = await c.req.json();
  const { error } = await supabase.from('tutorials').upsert(tutorial);
  if (error) return c.json({ error: error.message }, 500);
  return c.json({ success: true });
});

app.delete("/make-server-74296234/api/tutorials/:id", async (c) => {
  const adminToken = c.req.header('X-Admin-Token');
  if (!adminToken) return c.json({ error: 'Unauthorized' }, 401);
  const { error } = await supabase.from('tutorials').delete().eq('id', c.req.param('id'));
  if (error) return c.json({ error: error.message }, 500);
  return c.json({ success: true });
});

app.get("/make-server-74296234/api/tutorial-categories", async (c) => {
  const { data } = await supabase.from('site_configuration').select('value').eq('key', 'tutorial_categories').single();
  // Default categories if none exist
  const defaultCategories = [
    { id: 'quick-tips', name: 'Quick Tips', description: 'Short, focused tutorials on specific techniques' },
    { id: 'walkthroughs', name: 'Project Walkthroughs', description: 'Complete project overviews and design process' },
    { id: '3d-modeling', name: '3D Modeling & Visualization', description: '3D modeling and rendering workflows' },
    { id: 'workflow', name: 'Resources & Workflow', description: 'Productivity and workflow optimization' },
    { id: '2d-drafting', name: '2D Drafting & Docs', description: 'Technical drawings and documentation' },
  ];
  return c.json({ categories: data?.value || defaultCategories });
});

// ===== COLLABORATORS =====
app.get("/make-server-74296234/api/collaborators", async (c) => {
  const { data, error } = await supabase.from('collaborators').select('*');
  if (error) return c.json({ error: error.message }, 500);
  return c.json({ success: true, collaborators: data });
});

app.post("/make-server-74296234/api/collaborators", verifyAdminToken, async (c) => {
  const collaborator = await c.req.json();
  const { data, error } = await supabase.from('collaborators').insert(collaborator).select().single();
  if (error) return c.json({ error: error.message }, 500);
  return c.json({ success: true, collaboratorId: data.id });
});

app.put("/make-server-74296234/api/collaborators/:id", verifyAdminToken, async (c) => {
  const updates = await c.req.json();
  const { error } = await supabase.from('collaborators').update(updates).eq('id', c.req.param('id'));
  if (error) return c.json({ error: error.message }, 500);
  return c.json({ success: true });
});

app.delete("/make-server-74296234/api/collaborators/:id", verifyAdminToken, async (c) => {
  const { error } = await supabase.from('collaborators').delete().eq('id', c.req.param('id'));
  if (error) return c.json({ error: error.message }, 500);
  return c.json({ success: true });
});

// ===== SETTINGS & LINKS =====
app.get("/make-server-74296234/api/settings", async (c) => {
  const { data } = await supabase.from('site_configuration').select('value').eq('key', 'site_settings').single();
  return c.json({ settings: data?.value || {} });
});

app.post("/make-server-74296234/api/admin/settings", verifyAdminToken, async (c) => {
  const settings = await c.req.json();
  const { error } = await supabase.from('site_configuration').upsert({ key: 'site_settings', value: settings });
  if (error) return c.json({ error: error.message }, 500);
  return c.json({ success: true, settings });
});

app.get("/make-server-74296234/links", async (c) => {
  const { data } = await supabase.from('bio_links').select('*').order('order');
  return c.json(data || []);
});

app.post("/make-server-74296234/links", async (c) => {
  const link = await c.req.json();
  const { data, error } = await supabase.from('bio_links').insert(link).select().single();
  if (error) return c.json({ error: error.message }, 500);
  return c.json(data);
});

app.put("/make-server-74296234/links/:id", async (c) => {
  const updates = await c.req.json();
  const { data, error } = await supabase.from('bio_links').update(updates).eq('id', c.req.param('id')).select().single();
  if (error) return c.json({ error: error.message }, 500);
  return c.json(data);
});

app.delete("/make-server-74296234/links/:id", async (c) => {
  const { error } = await supabase.from('bio_links').delete().eq('id', c.req.param('id'));
  if (error) return c.json({ error: error.message }, 500);
  return c.json({ success: true });
});

// Bio Profile data
app.get("/make-server-74296234/links/bio", async (c) => {
  const { data } = await supabase.from('site_configuration').select('value').eq('key', 'bio_data').single();
  return c.json(data?.value || { name: 'Brandan PT Davis', tagline: 'Scenic Designer' });
});

app.post("/make-server-74296234/links/bio", async (c) => {
  const body = await c.req.json();
  await supabase.from('site_configuration').upsert({ key: 'bio_data', value: body });
  return c.json({ success: true });
});

// Social Links (KV compat)
app.get("/make-server-74296234/kv/social-links", async (c) => {
  const { data } = await supabase.from('site_configuration').select('value').eq('key', 'social_links').single();
  return c.json({ value: data?.value || [] });
});

app.post("/make-server-74296234/kv/social-links", async (c) => {
  const body = await c.req.json();
  await supabase.from('site_configuration').upsert({ key: 'social_links', value: body.value });
  return c.json({ success: true });
});

// Helper for AI
async function ensurePublicImageUrl(imageUrl: string, supabase: any): Promise<string> {
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) return imageUrl;
  if (imageUrl.includes('/storage/v1/object/')) {
    const match = imageUrl.match(/\/storage\/v1\/object\/(?:public|sign)\/([^/]+)\/(.+)/);
    if (match) {
      const [, bucket, path] = match;
      const { data } = await supabase.storage.from(bucket).createSignedUrl(path, 3600);
      return data?.signedUrl || imageUrl;
    }
  }
  return imageUrl;
}

// AI: Generate Tags
app.post("/make-server-74296234/api/admin/generate-tags", verifyAdminToken, async (c) => {
  try {
    const { imageUrl, context } = await c.req.json();
    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) return c.json({ error: 'OpenAI API key missing' }, 500);

    const publicUrl = await ensurePublicImageUrl(imageUrl, supabase);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are an expert in scenic design. Generate 8-12 concise tags. Return JSON array.' },
          { role: 'user', content: [{ type: 'text', text: `Tags for this image${context ? ' (' + context + ')' : ''}` }, { type: 'image_url', image_url: { url: publicUrl, detail: 'low' } }] }
        ],
        max_tokens: 300
      })
    });
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '[]';
    let tags = [];
    try { tags = JSON.parse(content.match(/\[.*\]/s)?.[0] || '[]'); } catch (e) { }
    return c.json({ success: true, tags, rawResponse: content });
  } catch (err: any) { return c.json({ error: err.message }, 500); }
});

// AI: Generate Alt Text
app.post("/make-server-74296234/api/admin/generate-alt-text", verifyAdminToken, async (c) => {
  try {
    const { imageUrl, context } = await c.req.json();
    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) return c.json({ error: 'OpenAI API key missing' }, 500);

    const publicUrl = await ensurePublicImageUrl(imageUrl, supabase);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'Generate concise alt text for accessibility (under 125 chars).' },
          { role: 'user', content: [{ type: 'text', text: `Alt text for this image${context ? ' (' + context + ')' : ''}` }, { type: 'image_url', image_url: { url: publicUrl, detail: 'low' } }] }
        ],
        max_tokens: 150
      })
    });
    const data = await response.json();
    return c.json({ success: true, altText: data.choices?.[0]?.message?.content?.trim() || '' });
  } catch (err: any) { return c.json({ error: err.message }, 500); }
});

// AI: General Generate
app.post("/make-server-74296234/api/admin/ai/generate", verifyAdminToken, async (c) => {
  try {
    const { prompt, type, context } = await c.req.json();
    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) return c.json({ error: 'OpenAI API key missing' }, 500);

    let sys = "You are a helpful writing assistant.";
    if (type === 'fix-grammar') sys = "Fix grammar and improve clarity.";
    else if (type === 'generate-title') sys = "Generate 5 engaging titles.";

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: sys },
          { role: 'user', content: prompt || context }
        ]
      })
    });
    const data = await response.json();
    return c.json({ success: true, result: data.choices?.[0]?.message?.content });
  } catch (err: any) { return c.json({ error: err.message }, 500); }
});


app.notFound((c) => c.json({ error: 'Endpoint not found' }, 404));

export default app;