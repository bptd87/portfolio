/// <reference lib="deno.ns" />

// Initialize Deno KV
// In Supabase Edge Functions, this connects to the built-in KV store
const kv = await Deno.openKv();

export async function get(key: string) {
    const result = await kv.get([key]);
    return result.value;
}

export async function set(key: string, value: any) {
    await kv.set([key], value);
}

export async function del(key: string) {
    await kv.delete([key]);
}

export async function getByPrefix(prefix: string) {
    const entries = [];
    // Use prefix listing
    // Since keys are stored as [string], we can use the prefix option
    // Note: This relies on keys being stored as [ "prefix:id" ]

    // Deno KV list returns an iterator
    const iter = kv.list({ prefix: [] });

    for await (const entry of iter) {
        const key = entry.key[0];
        if (typeof key === 'string' && key.startsWith(prefix)) {
            entries.push(entry.value);
        }
    }

    return entries;
}