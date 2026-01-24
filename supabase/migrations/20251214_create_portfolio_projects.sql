-- Create portfolio_projects table
CREATE TABLE IF NOT EXISTS public.portfolio_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL CHECK (category IN ('Scenic Design', 'Experiential Design', 'Rendering & Visualization', 'Design Documentation')),
    subcategory TEXT,
    venue TEXT,
    location TEXT,
    year INTEGER,
    description TEXT,
    project_overview TEXT, -- For detailed case studies
    card_image TEXT, -- The cover image
    banner_image TEXT, -- Optional hero banner
    credits JSONB DEFAULT '[]'::jsonb, -- Array of {role, name, website}
    galleries JSONB DEFAULT '{}'::jsonb, -- Object with hero:[], process:[], etc.
    tags TEXT[] DEFAULT '{}',
    youtube_videos TEXT[] DEFAULT '{}',
    featured BOOLEAN DEFAULT false,
    published BOOLEAN DEFAULT true,
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.portfolio_projects ENABLE ROW LEVEL SECURITY;

-- Create Policies
CREATE POLICY "Public can view published projects" 
ON public.portfolio_projects FOR SELECT 
USING (published = true OR auth.role() = 'service_role');

-- Admin Access (using existing admin_token logic or service role)
-- For Supabase interactions from the dashboard, we usually rely on the user being authenticated or using the service role in Edge Functions.
-- Since the frontend uses a custom 'admin_token', we might need to continue proxying writes through the Edge Function 
-- OR switch to proper Supabase Auth.
-- For now, we will allow Authenticated users (if you switch to Supabase Auth) or Service Role.

CREATE POLICY "Admins can insert projects" 
ON public.portfolio_projects FOR INSERT 
WITH CHECK (auth.role() = 'service_role' OR auth.role() = 'authenticated');

CREATE POLICY "Admins can update projects" 
ON public.portfolio_projects FOR UPDATE 
USING (auth.role() = 'service_role' OR auth.role() = 'authenticated');

CREATE POLICY "Admins can delete projects" 
ON public.portfolio_projects FOR DELETE 
USING (auth.role() = 'service_role' OR auth.role() = 'authenticated');

-- Create indexes for performance
CREATE INDEX idx_portfolio_category ON public.portfolio_projects(category);
CREATE INDEX idx_portfolio_slug ON public.portfolio_projects(slug);
CREATE INDEX idx_portfolio_featured ON public.portfolio_projects(featured) WHERE featured = true;
