-- Migration script to populate articles table from static data
-- Run this in Supabase SQL Editor

-- 0. Cleanup duplicates in categories table (Keep oldest)
DELETE FROM categories
WHERE id IN (
    SELECT id
    FROM (
        SELECT id,
        ROW_NUMBER() OVER (PARTITION BY slug ORDER BY created_at ASC) as row_num
        FROM categories
    ) t
    WHERE t.row_num > 1
);

-- 1. Ensure Unique Constraints exist (required for ON CONFLICT)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'categories_slug_key') THEN
        ALTER TABLE categories ADD CONSTRAINT categories_slug_key UNIQUE (slug);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'articles_slug_key') THEN
        ALTER TABLE articles ADD CONSTRAINT articles_slug_key UNIQUE (slug);
    END IF;
END $$;

-- 2. Create categories if they don't exist
INSERT INTO categories (name, slug, type) VALUES
('Design Philosophy & Scenic Insights', 'design-philosophy-scenic-insights', 'articles'),
('Scenic Design Process & Highlights', 'scenic-design-process-highlights', 'articles'),
('Technology & Tutorials', 'technology-tutorials', 'articles'),
('Experiential Design', 'experiential-design', 'articles')
ON CONFLICT (slug) DO NOTHING;

-- 2. Insert articles
INSERT INTO articles (
  slug,
  title,
  category,
  published_at,
  excerpt,
  cover_image,
  tags,
  published
) VALUES
(
  'artistic-vision-finding-creative-voice',
  'Artistic Vision in Scenic Design: Finding My Creative Voice',
  'Design Philosophy & Scenic Insights',
  '2025-01-31',
  'A reflection on artistic identity, creative independence, and building a scenic design career driven by authenticity rather than algorithmic validation.',
  '/assets/images/blog/artistic-vision.png', -- Placeholder path, user may need to update
  ARRAY['Design Philosophy', 'Artistic Vision', 'Creative Process', 'Portfolio Development', 'Theatre Career'],
  true
),
(
  'becoming-a-scenic-designer',
  'Becoming a Scenic Designer: A Comprehensive Guide',
  'Design Philosophy & Scenic Insights',
  '2025-09-16',
  'Everything you need to know about pursuing a career in scenic design, from education to professional practice.',
  '/assets/images/blog/becoming-designer.png',
  ARRAY['Scenic Design', 'Career Guide', 'Theatre Education', 'BFA Programs', 'MFA Programs', 'Portfolio'],
  true
),
(
  'scenic-rendering-principles',
  'What Makes a Good Scenic Design Rendering?',
  'Technology & Tutorials',
  '2025-09-16',
  'Drawing lessons from the Old Masters: atmospheric lighting, focal points, visual hierarchy, and architectural framing in scenic design visualization.',
  'https://images.unsplash.com/photo-1604952703578-8ae924053711?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcmNoaXRlY3R1cmFsJTIwcmVuZGVyaW5nJTIwc2tldGNofGVufDF8fHx8MTc2MTg5Njk5OHww&ixlib=rb-4.1.0&q=80&w=1080',
  ARRAY['Rendering', 'Vectorworks', 'Digital Design', 'Twinmotion', 'Concept Art', 'Lighting'],
  true
),
(
  'romero-set-design',
  'Framing the Martyr: Scenic Design as Memory Work in Romero',
  'Scenic Design Process & Highlights',
  '2025-08-31',
  'A deep dive into the scenic design process for Romero, exploring how physical space can frame memory and martyrdom.',
  'https://images.unsplash.com/photo-1747999827332-163aa33cd597?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXNpZ24lMjBwcm9jZXNzJTIwd29ya3NwYWNlfGVufDF8fHx8MTc2MTg5Njk5OHww&ixlib=rb-4.1.0&q=80&w=1080',
  ARRAY['Design Process', 'Case Study', 'University Production', 'Set Design', 'Symbolism'],
  true
),
(
  'scenic-design-lesson-youre-wasting-my-time',
  '"You''re Wasting My Time" — A Scenic Design Lesson in Growth and Revision',
  'Design Philosophy & Scenic Insights',
  '2025-09-16',
  'A formative moment at URTAs taught me the importance of intentionality, revision, and knowing your worth as a designer.',
  'https://images.unsplash.com/photo-1758669919394-b3eb103f5e48?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0aGVhdHJlJTIwc3RhZ2UlMjBkZXNpZ258ZW58MXx8fHwxNzYxODk2OTk3fDA&ixlib=rb-4.1.0&q=80&w=1080',
  ARRAY['Design Philosophy', 'Graduate School', 'Portfolio Review', 'Mentorship', 'URTA'],
  true
),
(
  'the-lights-were-already-on-maude-adams-legacy-at-stephens-college',
  'The Lights Were Already On: Maude Adams'' Legacy at Stephens College',
  'Design Philosophy & Scenic Insights',
  '2025-04-27',
  'Exploring the remarkable legacy of actress and lighting innovator Maude Adams at Stephens College.',
  'https://images.unsplash.com/photo-1580060372014-711bda378d20?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0aGVhdHJlJTIwbGlnaHRpbmclMjBkZXNpZ258ZW58MXx8fHwxNzYxODk2OTk5fDA&ixlib=rb-4.1.0&q=80&w=1080',
  ARRAY['Theatre History', 'Lighting', 'Architecture', 'Women in Theatre', 'Historic Theatres'],
  true
),
(
  'sora-in-the-studio-testing-ais-potential-for-theatrical-design',
  'Sora in the Studio: Testing AI''s Potential for Theatrical Design',
  'Technology & Tutorials',
  '2025-09-16',
  'Exploring OpenAI''s Sora video generation tool as a potential resource for scenic design visualization and concept development.',
  'https://images.unsplash.com/photo-1697577418970-95d99b5a55cf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnRpZmljaWFsJTIwaW50ZWxsaWdlbmNlJTIwdGVjaG5vbG9neXxlbnwxfHx8fDE3NjE4MzY4OTF8MA&ixlib=rb-4.1.0&q=80&w=1080',
  ARRAY['AI Tools', 'Technology', 'Sora', 'Visualization', 'Digital Design', 'Innovation'],
  true
),
(
  'jvtt8t7ek9xhgcd28j0zt2qha0v5cd',
  'Designing the Keller Home: A Look Back at All My Sons',
  'Scenic Design Process & Highlights',
  '2025-08-31',
  'Reflecting on the scenic design for Arthur Miller''s All My Sons at Stephens College in 2010.',
  'https://images.unsplash.com/photo-1760768550727-00f5e02feb72?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0aGVhdHJlJTIwYmFja3N0YWdlJTIwdGVjaG5pY2FsfGVufDF8fHx8MTc2MTg5Njk5OHww&ixlib=rb-4.1.0&q=80&w=1080',
  ARRAY['Design Process', 'Case Study', 'Arthur Miller', 'Realism', 'University Production'],
  true
),
(
  'computer-hardware-guide',
  'Understanding Computer Hardware: Why Scenic Designers (and All Theatre Designers) Need to Care',
  'Technology & Tutorials',
  '2025-08-31',
  'A comprehensive guide to computer hardware for theatre designers, from CPUs and GPUs to RAM and storage.',
  'https://images.unsplash.com/photo-1642736656789-65a6a0abbf04?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21wdXRlciUyMGhhcmR3YXJlJTIwdGVjaG5vbG9neXxlbnwxfHx8fDE3NjE2Mzc5ODF8MA&ixlib=rb-4.1.0&q=80&w=1080',
  ARRAY['Technology', 'Hardware', 'Computer Guide', 'Tech Education', 'Vectorworks'],
  true
),
(
  'scenic-design-vision',
  'Scenic Design Vision: Brandon PT Davis Creates Artistic Spaces Beyond the Traditional Portfolio',
  'Design Philosophy & Scenic Insights',
  '2025-08-31',
  'An overview of my design philosophy and approach to creating immersive theatrical environments.',
  'https://images.unsplash.com/photo-1758669919394-b3eb103f5e48?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0aGVhdHJlJTIwc3RhZ2UlMjBkZXNpZ258ZW58MXx8fHwxNzYxODk2OTk3fDA&ixlib=rb-4.1.0&q=80&w=1080',
  ARRAY['Design Philosophy', 'Scenic Design', 'Creative Process', 'Portfolio'],
  true
),
(
  'themed-entertainment-evolution',
  'Themed Entertainment Design: Studio Ghibli-Inspired Immersive Dining Experience by Theatre Students',
  'Experiential Design',
  '2025-09-15',
  'Stephens College theatre students create an immersive dining experience inspired by Studio Ghibli films.',
  'https://images.unsplash.com/photo-1692057418762-eeab24cd8505?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0aGVtZSUyMHBhcmslMjBjYXN0bGUlMjBtYWdpY3xlbnwxfHx8fDE3NjE3OTQ3NDJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
  ARRAY['Experiential Design', 'Themed Entertainment', 'Immersive Design', 'Student Project', 'Theme Parks'],
  true
),
(
  'presenting-like-apple',
  'The Art of Presenting Theatre Design: A Guide for Designers',
  'Technology & Tutorials',
  '2025-04-23',
  'Best practices for presenting your scenic design work to directors, collaborators, and production teams.',
  'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcmVzZW50YXRpb24lMjBkZXNpZ258ZW58MXx8fHwxNzYxNjM5Mjg1fDA&ixlib=rb-4.1.0&q=80&w=1080',
  ARRAY['Presentation Skills', 'Design Process', 'Communication', 'Keynote', 'Professional Skills'],
  true
),
(
  'navigating-the-scenic-design-process-a-comprehensive-guide',
  'Navigating the Scenic Design Process: A Comprehensive Guide',
  'Scenic Design Process & Highlights',
  '2025-08-31',
  'A step-by-step guide through the complete scenic design process, from script analysis to opening night.',
  'https://images.unsplash.com/photo-1747999827332-163aa33cd597?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXNpZ24lMjBwcm9jZXNzJTIwd29ya3NwYWNlfGVufDF8fHx8MTc2MTg5Njk5OHww&ixlib=rb-4.1.0&q=80&w=1080',
  ARRAY['Design Process', 'Workflow', 'Production Design', 'Creative Process', 'Guide'],
  true
),
(
  'computer-literacy',
  'Empowering Theatre Production Students with Computer Literacy',
  'Technology & Tutorials',
  '2025-09-15',
  'Why computer literacy matters for theatre production students and how to develop these essential skills.',
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkZW50JTIwY29tcHV0ZXJ8ZW58MXx8fHwxNzYxNjM4MDUyfDA&ixlib=rb-4.1.0&q=80&w=1080',
  ARRAY['Theatre Education', 'Tech Education', 'Digital Skills', 'Teaching', 'Computer Literacy'],
  true
),
(
  'video-game-environments',
  'Video Game Environments: Lessons for Scenic Design',
  'Design Philosophy & Scenic Insights',
  '2025-07-12',
  'Exploring how video game environment design principles can inform and enhance theatrical scenic design.',
  'https://images.unsplash.com/photo-1760802185763-fe4999466b78?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYW50YXN5JTIwZ2FtZSUyMGNvbmNlcHQlMjBhcnR8ZW58MXx8fHwxNzYxNzk0MTY0fDA&ixlib=rb-4.1.0&q=80&w=1080',
  ARRAY['Game Design', 'Environment Design', 'Digital Design', 'Design Philosophy', 'Innovation'],
  true
),
(
  'opera-foundations',
  'Opera''s Foundations: The Evolution of Scenic Design in Opera',
  'Design Philosophy & Scenic Insights',
  '2025-06-18',
  'A journey through the history of scenic design in opera, from the Baroque era to contemporary practice.',
  'https://images.unsplash.com/photo-1761359841098-8e84b7cf3661?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvcGVyYSUyMGhvdXNlJTIwcGVyZm9ybWFuY2UlMjBzdGFnZXxlbnwxfHx8fDE3NjE3OTUzMjh8MA&ixlib=rb-4.1.0&q=80&w=1080',
  ARRAY['Opera', 'Theatre History', 'Design History', 'Baroque', 'Historical Design'],
  true
),
(
  'golden-age-broadway',
  'The Golden Age of Broadway: Scenic Design Excellence',
  'Design Philosophy & Scenic Insights',
  '2025-05-22',
  'Celebrating the legendary scenic designers who defined Broadway''s Golden Age and their lasting influence.',
  'https://images.unsplash.com/photo-1608587446131-b70c4664a62a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwYnJvYWR3YXklMjB0aGVhdHJlJTIwZGlzdHJpY3QlMjAxOTUwc3xlbnwxfHx8fDE3NjE3OTYwMjh8MA&ixlib=rb-4.1.0&q=80&w=1080',
  ARRAY['Broadway', 'Theatre History', 'Design History', 'Golden Age', 'Historic Designers'],
  true
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  published_at = EXCLUDED.published_at,
  excerpt = EXCLUDED.excerpt,
  tags = EXCLUDED.tags,
  published = EXCLUDED.published;
