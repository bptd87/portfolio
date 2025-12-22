-- Migrate vault assets from kv_store_980dd7a4 to vault_assets table

INSERT INTO public.vault_assets (
    id,
    title,
    description,
    category,
    tags,
    image_url,
    published,
    created_at,
    updated_at
)
SELECT 
    (value->>'id')::uuid as id,
    value->>'name' as title,
    value->>'notes' as description,
    value->>'category' as category,
    COALESCE(
        ARRAY(SELECT jsonb_array_elements_text(value->'tags')),
        '{}'::text[]
    ) as tags,
    value->>'thumbnailUrl' as image_url,
    COALESCE((value->>'enabled')::boolean, true) as published,
    COALESCE((value->>'createdAt')::timestamp, NOW()) as created_at,
    COALESCE((value->>'updatedAt')::timestamp, NOW()) as updated_at
FROM public.kv_store_980dd7a4
WHERE key LIKE 'vault_asset:%'
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    tags = EXCLUDED.tags,
    image_url = EXCLUDED.image_url,
    published = EXCLUDED.published,
    updated_at = EXCLUDED.updated_at;
