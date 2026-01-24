import { serve } from "std/http/server";
import { Client } from "postgres";

serve(async (_req: Request) => {
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
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
