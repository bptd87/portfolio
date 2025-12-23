-- Merge duplicates: Update 'clean slug' rows with content from 'timestamp slug' rows matching by Title
UPDATE articles
SET content = source.content,
    cover_image = source.cover_image
FROM articles AS source
WHERE articles.title = source.title
  AND articles.slug != source.slug
  AND articles.slug NOT LIKE 'post-%'
  AND source.slug LIKE 'post-%'
  AND articles.content IS NULL;

-- Delete the old timestamp rows after merging
DELETE FROM articles
WHERE slug LIKE 'post-%'
  AND EXISTS (
    SELECT 1 FROM articles AS target
    WHERE target.title = articles.title
    AND target.slug != articles.slug
    AND target.slug NOT LIKE 'post-%'
  );
