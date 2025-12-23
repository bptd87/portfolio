import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { projectId, publicAnonKey } from "./info";
import { Database } from "../../types/database.types";

// Create a singleton Supabase client for frontend use
let supabaseClient: ReturnType<typeof createSupabaseClient<Database>> | null =
  null;

export function createClient() {
  if (!supabaseClient) {
    const supabaseUrl = `https://${projectId}.supabase.co`;
    supabaseClient = createSupabaseClient<Database>(supabaseUrl, publicAnonKey);
  }
  return supabaseClient;
}

export const supabase = createClient();

// Helper function to get data from KV store
export async function getFromKV(key: string) {
  const supabase = createClient();

  console.log(`[KV] Fetching single key: ${key}`);

  try {
    const { data, error } = await supabase
      .from("kv_store_980dd7a4")
      .select("value")
      .eq("key", key)
      .maybeSingle<any>();

    if (error) {
      console.error("[KV] Query error:", error);
      console.error("[KV] Error details:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      return null;
    }

    console.log(`[KV] Found data for key: ${key}`, !!data);
    return data?.value;
  } catch (err) {
    console.error("[KV] Failed to fetch from database:", err);
    return null;
  }
}

// Helper function to get data by prefix from KV store
export async function getByPrefixFromKV(prefix: string) {
  const supabase = createClient();

  console.log(`[KV] Fetching data with prefix: ${prefix}`);

  try {
    const { data, error } = await supabase
      .from("kv_store_980dd7a4")
      .select("key, value")
      .like("key", `${prefix}%`)
      .returns<any[]>();

    if (error) {
      console.error("[KV] Query error:", error);
      console.error("[KV] Error details:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      throw error;
    }

    console.log(
      `[KV] Found ${data?.length || 0} records for prefix: ${prefix}`,
    );
    return data?.map((d) => d.value) ?? [];
  } catch (err) {
    console.error("[KV] Failed to fetch from database:", err);
    // Return empty array instead of throwing to prevent app crashes
    return [];
  }
}
