
-- Seed default directory categories
INSERT INTO directory_categories (name, slug, description, icon, display_order)
VALUES 
  ('Organizations', 'organizations', 'Professional unions, societies, and industry groups', 'building', 0),
  ('Software', 'software', 'Essential design and drafting tools', 'code', 1),
  ('Supplies & Materials', 'supplies', 'Paint, fabric, hardware, and scenic materials', 'palette', 2),
  ('Research & Inspiration', 'research', 'Archives, publications, and design resources', 'book', 3)
ON CONFLICT (slug) DO NOTHING;
