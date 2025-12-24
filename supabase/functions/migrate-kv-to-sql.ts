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
      const { error } = await supabase.from("news").upsert({
        id: newsItem.id,
        slug: newsItem.slug,
        title: newsItem.title,
        excerpt: newsItem.excerpt,
        content: newsItem.content,
        date: newsItem.date,
        published: newsItem.published ?? true,
        category: newsItem.category,
        cover_image: newsItem.coverImage || newsItem.cover_image,
        location: newsItem.location,
        link: newsItem.link,
        tags: newsItem.tags || [],
        blocks: newsItem.blocks || [],
        images: newsItem.images || [],
        created_at: newsItem.created_at || new Date().toISOString(),
      });
      if (error) {
        console.error(
          `  ❌ Failed to migrate news: ${newsItem.slug}`,
          error.message,
        );
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
      const { error } = await supabase.from("tutorials").upsert({
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
        console.error(
          `  ❌ Failed to migrate tutorial: ${tutorial.slug}`,
          error.message,
        );
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
      const { error } = await supabase.from("collaborators").upsert({
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
        console.error(
          `  ❌ Failed to migrate collaborator: ${collaborator.name}`,
          error.message,
        );
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
        const { error } = await supabase.from("bio_links").upsert({
          id: link.id,
          title: link.title,
          url: link.url,
          icon: link.icon,
          order: link.order ?? linkCount,
          active: link.active ?? true,
        });
        if (error) {
          console.error(
            `  ❌ Failed to migrate link: ${link.title}`,
            error.message,
          );
        } else {
          linkCount++;
          console.log(`  ✅ Migrated: ${link.title}`);
        }
      }
      console.log(`✨ Migrated ${linkCount} bio links\n`);
    }

    // Migrate Site Configuration
    console.log("⚙️  Migrating Site Configuration...");
    const configKeys = [
      "site_settings",
      "social_links",
      "bio_data",
      "tutorial_categories",
    ];
    let configCount = 0;
    for (const key of configKeys) {
      const entry = await kv.get([key]);
      if (entry.value) {
        const { error } = await supabase.from("site_configuration").upsert({
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

    // Migrate Directory (Categories & Links)
    console.log("📂 Migrating Directory...");

    // 1. Categories
    const categoryEntries = kv.list({ prefix: ["directory_categories"] });
    let dirCatCount = 0;
    for await (const entry of categoryEntries) {
      const cat = entry.value as any;
      const { error } = await supabase.from("directory_categories").upsert({
        // id: cat.id, // Let SQL generate UUID if not present, or preserve if exists
        slug: cat.slug || cat.id, // Fallback if slug missing
        name: cat.name,
        description: cat.description,
        icon: cat.icon || "folder",
        display_order: cat.order || 0,
        // created_at: cat.created_at // specific handling if needed
      }, { onConflict: "slug" }); // Use slug as the unique constraint for upsert

      if (error) {
        console.error(
          `  ❌ Failed to migrate directory category: ${cat.name}`,
          error.message,
        );
      } else dirCatCount++;
    }
    console.log(`  ✅ Migrated ${dirCatCount} directory categories`);

    // 2. Links
    const linkEntries = kv.list({ prefix: ["directory_links"] });
    let dirLinkCount = 0;
    for await (const entry of linkEntries) {
      const link = entry.value as any;
      const { error } = await supabase.from("directory_links").upsert({
        // id: link.id,
        title: link.title,
        url: link.url,
        description: link.description,
        category_slug: link.category, // Map old 'category' field to 'category_slug'
        enabled: link.enabled ?? true,
        display_order: link.order || 0,
        // created_at: link.created_at
      });

      if (error) {
        console.error(
          `  ❌ Failed to migrate directory link: ${link.title}`,
          error.message,
        );
      } else dirLinkCount++;
    }
    console.log(`  ✅ Migrated ${dirLinkCount} directory links\n`);

    console.log(`✨ Migrated ${dirLinkCount} directory links\n`);

    // Migrate Projects
    console.log("🏗️ Migrating Projects...");
    const projectEntries = kv.list({ prefix: ["projects"] });
    let projectCount = 0;
    for await (const entry of projectEntries) {
      const p = entry.value as any;
      const { error } = await supabase.from("portfolio_projects").upsert({
        id: p.id,
        slug: p.slug,
        title: p.title,
        category: p.category || p.type,
        year: p.year,
        venue: p.venue,
        client_name: p.client || p.clientName,
        cover_image: p.coverImage || p.cover_image,
        card_image: p.cardImage || p.card_image,
        description: p.description,
        project_overview: p.projectOverview || p.project_overview,
        design_notes: p.designNotes || p.design_notes,
        software_used: p.softwareUsed || p.software_used,
        video_urls: p.videoUrls || p.video_urls,
        published: p.published ?? true,
        created_at: p.created_at || new Date().toISOString(),
        // Map other fields as best effort
      });

      if (error) {
        console.error(
          `  ❌ Failed to migrate project: ${p.title}`,
          error.message,
        );
      } else {
        projectCount++;
        console.log(`  ✅ Migrated: ${p.title}`);
      }
    }
    console.log(`✨ Migrated ${projectCount} projects\n`);

    // Migrate Articles (Posts)
    console.log("✍️ Migrating Articles...");
    const postEntries = kv.list({ prefix: ["posts"] });
    let postCount = 0;
    for await (const entry of postEntries) {
      const p = entry.value as any;
      const { error } = await supabase.from("articles").upsert({
        id: p.id,
        slug: p.slug,
        title: p.title,
        excerpt: p.excerpt,
        content: p.content, // Assuming content block structure matches
        category: p.category,
        cover_image: p.coverImage || p.cover_image,
        publish_date: p.date || p.publish_date,
        tags: p.tags || [],
        published: p.published ?? true,
        created_at: p.created_at || new Date().toISOString(),
      });

      if (error) {
        console.error(
          `  ❌ Failed to migrate article: ${p.title}`,
          error.message,
        );
      } else {
        postCount++;
        console.log(`  ✅ Migrated: ${p.title}`);
      }
    }
    console.log(`✨ Migrated ${postCount} articles\n`);

    // Migrate Vault Categories
    console.log("🗄️ Migrating Vault Categories...");
    const vaultCatEntries = kv.list({ prefix: ["vault_categories"] });
    let vaultCatCount = 0;
    for await (const entry of vaultCatEntries) {
      const c = entry.value as any;
      const { error } = await supabase.from("vault_categories").upsert({
        id: c.id,
        name: c.name,
        slug: c.slug || c.id,
        description: c.description,
        created_at: c.created_at || new Date().toISOString(),
      });

      if (error) {
        console.error(
          `  ❌ Failed to migrate vault category: ${c.name}`,
          error.message,
        );
      } else vaultCatCount++;
    }
    console.log(`✨ Migrated ${vaultCatCount} vault categories\n`);

    // Migrate Vault Assets
    console.log("💎 Migrating Vault Assets...");
    const vaultAssetEntries = kv.list({ prefix: ["vault_assets"] });
    let vaultAssetCount = 0;
    for await (const entry of vaultAssetEntries) {
      const a = entry.value as any;
      const { error } = await supabase.from("vault_assets").upsert({
        id: a.id,
        name: a.name,
        description: a.description,
        category_id: a.categoryId || a.category_id, // Might need mapping if IDs changed, but assuming consistent UUIDs if possible
        asset_type: a.assetType || a.asset_type || "model",
        thumbnail_url: a.thumbnailUrl || a.thumbnail_url,
        file_url: a.fileUrl || a.file_url,
        file_size: a.fileSize || a.file_size,
        downloads: a.downloads || 0,
        enabled: a.enabled ?? true,
        created_at: a.created_at || new Date().toISOString(),
      });

      if (error) {
        console.error(
          `  ❌ Failed to migrate vault asset: ${a.name}`,
          error.message,
        );
      } else vaultAssetCount++;
    }
    console.log(`✨ Migrated ${vaultAssetCount} vault assets\n`);

    console.log("🎉 Migration complete!");
    console.log("\nSummary:");
    console.log(`  News: ${newsCount}`);
    console.log(`  Tutorials: ${tutorialCount}`);
    console.log(`  Collaborators: ${collaboratorCount}`);
    console.log(`  Configuration: ${configCount}`);
    console.log(`  Projects: ${projectCount}`);
    console.log(`  Articles: ${postCount}`);
    console.log(`  Vault assets: ${vaultAssetCount}`);
    console.log(`  Vault categories: ${vaultCatCount}`);
  } catch (error) {
    console.error("❌ Migration failed:", error);
  } finally {
    kv.close();
  }
}

// Run migration
migrateKVToSQL();
