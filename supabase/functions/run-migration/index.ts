import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Client } from "https://deno.land/x/postgres@v0.17.0/mod.ts";

serve(async (req) => {
  try {
    // 1. Get DB connection string
    // Supabase Edge Functions provide SUPABASE_DB_URL, but sometimes we need to construct it
    // or use the pool URL.
    const dbUrl = Deno.env.get("SUPABASE_DB_URL") ||
      Deno.env.get("DATABASE_URL");

    if (!dbUrl) {
      return new Response(JSON.stringify({ error: "No DB URL found" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 2. Connect
    const client = new Client(dbUrl);
    await client.connect();

    // 3. Run Migration
    const sql = `
      ALTER TABLE articles 
      ADD COLUMN IF NOT EXISTS cover_image_focal_point jsonb;
    `;

    await client.queryArray(sql);
    await client.end();

    return new Response(
      JSON.stringify({ success: true, message: "Migration ran successfully" }),
      {
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
