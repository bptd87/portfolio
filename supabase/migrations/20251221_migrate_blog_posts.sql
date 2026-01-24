-- Migrate blog posts from kv_store_980dd7a4 to articles table

INSERT INTO public.articles (
    slug,
    title,
    excerpt,
    content,
    category,
    cover_image,
    date,
    read_time,
    tags,
    published,
    created_at,
    updated_at
)
SELECT 
    REPLACE(key, 'blog_post:', '') as slug,
    value->>'title' as title,
    value->>'excerpt' as excerpt,
    value->'blocks' as content,
    value->>'category' as category,
    value->>'coverImage' as cover_image,
    COALESCE((value->>'updatedAt')::timestamp, (value->>'createdAt')::timestamp, NOW()) as date,
    value->>'readTime' as read_time,
    COALESCE(
        ARRAY(SELECT jsonb_array_elements_text(value->'tags')),
        '{}'::text[]
    ) as tags,
    COALESCE((value->>'published')::boolean, true) as published,
    COALESCE((value->>'createdAt')::timestamp, NOW()) as created_at,
    COALESCE((value->>'updatedAt')::timestamp, NOW()) as updated_at
FROM public.kv_store_980dd7a4
WHERE key LIKE 'blog_post:%'
ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    excerpt = EXCLUDED.excerpt,
    content = EXCLUDED.content,
    category = EXCLUDED.category,
    cover_image = EXCLUDED.cover_image,
    date = EXCLUDED.date,
    read_time = EXCLUDED.read_time,
    tags = EXCLUDED.tags,
    published = EXCLUDED.published,
    updated_at = EXCLUDED.updated_at;
