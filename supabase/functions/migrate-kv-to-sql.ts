/**
 * KV to SQL Migration Script
 * 
 * This script migrates data from Deno KV to Supabase SQL tables.
 * Run this from the Supabase Edge Function environment or locally with Deno.
 * 
 * Usage:
 * deno run --allow-net --allow-env migrate-kv-to-sql.ts
 */

import { createClient } from "npm:@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseKey);

async function migrateKVToSQL() {
  console.log("🚀 Starting KV to SQL migration...\n");

  const kv = await Deno.openKv();

  try {
    // Migrate News
    console.log("📰 Migrating News...");
    const newsEntries = kv.list({ prefix: ["news"] });
    let newsCount = 0;
    for await (const entry of newsEntries) {
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
        console.error(`  ❌ Failed to migrate news: ${newsItem.slug}`, error.message);
      } else {
        newsCount++;
        console.log(`  ✅ Migrated: ${newsItem.title}`);
      }
    }
    console.log(`✨ Migrated ${newsCount} news items\n`);

    // Migrate Tutorials
    console.log("📚 Migrating Tutorials...");
    const tutorialEntries = kv.list({ prefix: ["tutorials"] });
    let tutorialCount = 0;
    for await (const entry of tutorialEntries) {
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
        console.error(`  ❌ Failed to migrate tutorial: ${tutorial.slug}`, error.message);
      } else {
        tutorialCount++;
        console.log(`  ✅ Migrated: ${tutorial.title}`);
      }
    }
    console.log(`✨ Migrated ${tutorialCount} tutorials\n`);

    // Migrate Collaborators
    console.log("👥 Migrating Collaborators...");
    const collaboratorEntries = kv.list({ prefix: ["collaborators"] });
    let collaboratorCount = 0;
    for await (const entry of collaboratorEntries) {
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
        console.error(`  ❌ Failed to migrate collaborator: ${collaborator.name}`, error.message);
      } else {
        collaboratorCount++;
        console.log(`  ✅ Migrated: ${collaborator.name}`);
      }
    }
    console.log(`✨ Migrated ${collaboratorCount} collaborators\n`);

    // Migrate Bio Links
    console.log("🔗 Migrating Bio Links...");
    const bioLinksEntry = await kv.get(["bio_links"]);
    if (bioLinksEntry.value) {
      const links = bioLinksEntry.value as any[];
      let linkCount = 0;
      for (const link of links) {
        const { error } = await supabase.from('bio_links').upsert({
          id: link.id,
          title: link.title,
          url: link.url,
          icon: link.icon,
          order: link.order ?? linkCount,
          active: link.active ?? true,
        });
        if (error) {
          console.error(`  ❌ Failed to migrate link: ${link.title}`, error.message);
        } else {
          linkCount++;
          console.log(`  ✅ Migrated: ${link.title}`);
        }
      }
      console.log(`✨ Migrated ${linkCount} bio links\n`);
    }

    // Migrate Site Configuration
    console.log("⚙️  Migrating Site Configuration...");
    const configKeys = ["site_settings", "social_links", "bio_data", "tutorial_categories"];
    let configCount = 0;
    for (const key of configKeys) {
      const entry = await kv.get([key]);
      if (entry.value) {
        const { error } = await supabase.from('site_configuration').upsert({
          key: key,
          value: entry.value,
        });
        if (error) {
          console.error(`  ❌ Failed to migrate config: ${key}`, error.message);
        } else {
          configCount++;
          console.log(`  ✅ Migrated: ${key}`);
        }
      }
    }
    console.log(`✨ Migrated ${configCount} configuration items\n`);

    console.log("🎉 Migration complete!");
    console.log("\nSummary:");
    console.log(`  News: ${newsCount}`);
    console.log(`  Tutorials: ${tutorialCount}`);
    console.log(`  Collaborators: ${collaboratorCount}`);
    console.log(`  Configuration: ${configCount}`);

  } catch (error) {
    console.error("❌ Migration failed:", error);
  } finally {
    kv.close();
  }
}

// Run migration
migrateKVToSQL();
