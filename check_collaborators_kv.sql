-- Check what collaborator data exists in KV store
SELECT key, value->'name' as name, value->'type' as type 
FROM kv_store_980dd7a4 
WHERE key LIKE 'collaborator:%' 
ORDER BY key 
LIMIT 10;
