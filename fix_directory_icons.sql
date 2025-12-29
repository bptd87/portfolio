
-- Force update icons to match the frontend expectations
UPDATE directory_categories SET icon = 'building' WHERE slug = 'organizations';
UPDATE directory_categories SET icon = 'code' WHERE slug = 'software';
UPDATE directory_categories SET icon = 'palette' WHERE slug = 'supplies';
UPDATE directory_categories SET icon = 'book' WHERE slug = 'research';

-- Ensure any nulls become 'folder'
UPDATE directory_categories SET icon = 'folder' WHERE icon IS NULL OR icon = '';
