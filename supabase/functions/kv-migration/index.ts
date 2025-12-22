import { Hono } from "npm:hono@3";
import { createClient } from "npm:@supabase/supabase-js@2";

const app = new Hono();

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseKey);

// Admin authentication middleware
const verifyAdminToken = async (c: any, next: any) => {
  const token = c.req.header('X-Admin-Token');
  if (!token) {
    return c.json({ error: 'Unauthorized - Admin token required' }, 401);
  }
  try {
    const decoded = atob(token.trim());
    if (!decoded.startsWith('admin:')) {
      return c.json({ error: 'Invalid admin token' }, 401);
    }
  } catch {
    return c.json({ error: 'Invalid admin token' }, 401);
  }
  await next();
};

// Health check (no auth required)
app.get("/health", (c) => c.json({ status: "ok" }));

// Migration endpoint (auth required)
app.post("/", verifyAdminToken, async (c) => {
  const kv = await Deno.openKv();
  const results = {
    news: { migrated: 0, errors: [] as string[] },
    tutorials: { migrated: 0, errors: [] as string[] },
    collaborators: { migrated: 0, errors: [] as string[] },
    bioLinks: { migrated: 0, errors: [] as string[] },
    config: { migrated: 0, errors: [] as string[] },
  };

  try {
    // Migrate News
    const newsEntries = kv.list({ prefix: ["news"] });
    for await (const entry of newsEntries) {
      try {
        const newsItem = entry.value as any;
        const { error } = await supabase.from('news').upsert({
          id: newsItem.id,
          slug: newsItem.slug,
          title: newsItem.title,
          excerpt: newsItem.excerpt,
          content: newsItem.content,
          date: newsItem.date,
          published: newsItem.published ?? true,
          created_at: newsItem.created_at || new Date().toISOString(),
        });
        if (error) {
          results.news.errors.push(`${newsItem.slug}: ${error.message}`);
        } else {
          results.news.migrated++;
        }
      } catch (err: any) {
        results.news.errors.push(`Error: ${err.message}`);
      }
    }

    // Migrate Tutorials
    const tutorialEntries = kv.list({ prefix: ["tutorials"] });
    for await (const entry of tutorialEntries) {
      try {
        const tutorial = entry.value as any;
        const { error } = await supabase.from('tutorials').upsert({
          id: tutorial.id,
          slug: tutorial.slug,
          title: tutorial.title,
          excerpt: tutorial.excerpt,
          content: tutorial.content,
          category: tutorial.category,
          cover_image: tutorial.cover_image,
          publish_date: tutorial.publish_date,
          duration: tutorial.duration,
          difficulty: tutorial.difficulty,
          tags: tutorial.tags || [],
          created_at: tutorial.created_at || new Date().toISOString(),
        });
        if (error) {
          results.tutorials.errors.push(`${tutorial.slug}: ${error.message}`);
        } else {
          results.tutorials.migrated++;
        }
      } catch (err: any) {
        results.tutorials.errors.push(`Error: ${err.message}`);
      }
    }

    // Migrate Collaborators
    const collaboratorEntries = kv.list({ prefix: ["collaborators"] });
    for await (const entry of collaboratorEntries) {
      try {
        const collaborator = entry.value as any;
        const { error } = await supabase.from('collaborators').upsert({
          id: collaborator.id,
          name: collaborator.name,
          role: collaborator.role,
          bio: collaborator.bio,
          image: collaborator.image,
          website: collaborator.website,
          social_links: collaborator.social_links || {},
          featured: collaborator.featured ?? false,
          created_at: collaborator.created_at || new Date().toISOString(),
        });
        if (error) {
          results.collaborators.errors.push(`${collaborator.name}: ${error.message}`);
        } else {
          results.collaborators.migrated++;
        }
      } catch (err: any) {
        results.collaborators.errors.push(`Error: ${err.message}`);
      }
    }

    // Migrate Bio Links
    const bioLinksEntry = await kv.get(["bio_links"]);
    if (bioLinksEntry.value) {
      const links = bioLinksEntry.value as any[];
      for (const link of links) {
        try {
          const { error } = await supabase.from('bio_links').upsert({
            id: link.id,
            title: link.title,
            url: link.url,
            icon: link.icon,
            order: link.order ?? 0,
            active: link.active ?? true,
          });
          if (error) {
            results.bioLinks.errors.push(`${link.title}: ${error.message}`);
          } else {
            results.bioLinks.migrated++;
          }
        } catch (err: any) {
          results.bioLinks.errors.push(`Error: ${err.message}`);
        }
      }
    }

    // Migrate Site Configuration
    const configKeys = ["site_settings", "social_links", "bio_data", "tutorial_categories"];
    for (const key of configKeys) {
      try {
        const entry = await kv.get([key]);
        if (entry.value) {
          const { error } = await supabase.from('site_configuration').upsert({
            key: key,
            value: entry.value,
          });
          if (error) {
            results.config.errors.push(`${key}: ${error.message}`);
          } else {
            results.config.migrated++;
          }
        }
      } catch (err: any) {
        results.config.errors.push(`${key}: ${err.message}`);
      }
    }

    return c.json({
      success: true,
      message: "Migration completed",
      results,
      summary: {
        totalMigrated: results.news.migrated + results.tutorials.migrated + 
                      results.collaborators.migrated + results.bioLinks.migrated + 
                      results.config.migrated,
        totalErrors: results.news.errors.length + results.tutorials.errors.length + 
                    results.collaborators.errors.length + results.bioLinks.errors.length + 
                    results.config.errors.length,
      }
    });

  } catch (error: any) {
    return c.json({ 
      success: false, 
      error: error.message,
      results 
    }, 500);
  } finally {
    kv.close();
  }
});

export default app;
