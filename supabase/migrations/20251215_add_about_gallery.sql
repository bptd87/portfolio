-- Add about_gallery table for managing Bio page photo gallery
CREATE TABLE IF NOT EXISTS about_gallery (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    image_url TEXT NOT NULL,
    caption TEXT,
    alt_text TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- Add RLS policies
ALTER TABLE about_gallery ENABLE ROW LEVEL SECURITY;
-- Public read access
CREATE POLICY "Allow public read access to about_gallery" ON about_gallery FOR
SELECT USING (true);
-- Admin write access (authenticated users can insert/update/delete)
CREATE POLICY "Allow authenticated users to manage about_gallery" ON about_gallery FOR ALL USING (auth.role() = 'authenticated');
-- Create index for ordering
CREATE INDEX IF NOT EXISTS about_gallery_display_order_idx ON about_gallery(display_order);
-- Insert default placeholder photos (can be replaced via admin)
INSERT INTO about_gallery (image_url, caption, alt_text, display_order)
VALUES (
        'https://images.unsplash.com/photo-1758671914231-4193ed752eb3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0aGVhdHJlJTIwcmVoZWFyc2FsJTIwYmFja3N0YWdlfGVufDF8fHx8MTc2MTk0NDg5Mnww&ixlib=rb-4.1.0&q=80&w=1080',
        'Backstage during tech rehearsal',
        'Backstage during rehearsal',
        1
    ),
    (
        'https://images.unsplash.com/photo-1510074377623-8cf13fb86c08?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXNpZ24lMjBzdHVkaW8lMjB3b3Jrc3BhY2V8ZW58MXx8fHwxNzYxODg0OTAyfDA&ixlib=rb-4.1.0&q=80&w=1080',
        'Studio workspace in Irvine',
        'Design studio workspace',
        2
    ),
    (
        'https://images.unsplash.com/photo-1577537653888-383504d823ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0aGVhdHJlJTIwb3BlbmluZyUyMG5pZ2h0fGVufDF8fHx8MTc2MTk0NDg5M3ww&ixlib=rb-4.1.0&q=80&w=1080',
        'Opening night celebration',
        'Opening night at the theatre',
        3
    ),
    (
        'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1bml2ZXJzaXR5JTIwY2xhc3Nyb29tJTIwdGVhY2hpbmd8ZW58MXx8fHwxNzYxODMzMDI1fDA&ixlib=rb-4.1.0&q=80&w=1080',
        'Teaching scenic design at UC Irvine',
        'Teaching at university',
        4
    ),
    (
        'https://images.unsplash.com/photo-1601931992301-5c9a46c92808?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0aGVhdHJlJTIwY29sbGFib3JhdGlvbiUyMG1lZXRpbmd8ZW58MXx8fHwxNzYxOTQ0ODk0fDA&ixlib=rb-4.1.0&q=80&w=1080',
        'Collaborating with the creative team',
        'Collaboration meeting with creative team',
        5
    ),
    (
        'https://images.unsplash.com/photo-1751822656923-211bb90e3d97?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzY2VuaWMlMjBkZXNpZ24lMjBtb2RlbHxlbnwxfHx8fDE3NjE5NDQ4OTR8MA&ixlib=rb-4.1.0&q=80&w=1080',
        'Working on a scenic model',
        'Scenic design model',
        6
    ) ON CONFLICT DO NOTHING;