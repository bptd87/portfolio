import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft } from 'lucide-react';
import { SEO } from '../components/SEO';
import { LikeButton } from '../components/shared/LikeButton';
import { ShareButton } from '../components/shared/ShareButton';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { RenderingTemplate } from './portfolio/RenderingTemplate';

interface RenderingProjectDetailProps {
  slug: string;
  onNavigate: (page: string, slug?: string) => void;
}

export function RenderingProjectDetail({ slug, onNavigate }: RenderingProjectDetailProps) {
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [nextProject, setNextProject] = useState<any>(null);
  const [prevProject, setPrevProject] = useState<any>(null);

  useEffect(() => {
    fetchProject();
  }, [slug]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/projects/${slug}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) throw new Error('Failed to fetch project');
      const data = await response.json();
      
      if (!data.success || !data.project) throw new Error('Invalid project data');
      setProject(data.project);

      // Increment view count
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/projects/${data.project.id}/view`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      // Fetch adjacent projects
      const allProjectsResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/projects`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (allProjectsResponse.ok) {
        const allProjectsData = await allProjectsResponse.json();
        const allProjects = allProjectsData.success ? allProjectsData.projects : [];
        const sameCategory = allProjects.filter((p: any) => 
          p.category === 'Rendering' || 
          p.category === 'Visualization' || 
          p.category === 'Rendering & Visualization'
        );
        const currentIndex = sameCategory.findIndex((p: any) => p.slug === slug);
        
        if (currentIndex > -1) {
          const nextIndex = (currentIndex + 1) % sameCategory.length;
          const prevIndex = (currentIndex - 1 + sameCategory.length) % sameCategory.length;
          setNextProject(sameCategory[nextIndex]);
          setPrevProject(sameCategory[prevIndex]);
        }
      }
    } catch (error) {
      console.error('Error fetching project:', error);
    } finally {
      setLoading(false);
    }
  };

  // Transform project data to match RenderingTemplate format
  const renderingData = useMemo(() => {
    if (!project) return null;
    
    // Check if we have gallery images
    const hasGalleryImages = (project.galleries?.hero && project.galleries.hero.length > 0) || 
                            (project.galleries?.additional && project.galleries.additional.length > 0);
    
    return {
      title: project.title,
      client: project.clientName,
      softwareUsed: project.tags || [],
      description: project.description,
      projectOverview: [project.description, ...(project.designNotes || [])].join('\n\n'),
      galleries: [
        // Use card image as fallback if no galleries
        ...(!hasGalleryImages && project.cardImage ? [{
          heading: '',
          description: '',
          images: [{ url: project.cardImage, caption: '' }],
          layout: '1-col' as const
        }] : []),
        ...(project.galleries?.hero && project.galleries.hero.length > 0 ? [{
          heading: 'Final Renders',
          description: '',
          images: project.galleries.hero.map((url: string) => ({ url, caption: '' })),
          layout: '1-col' as const
        }] : []),
        ...(project.galleries?.additional || []).map((gallery: any) => ({
          heading: gallery.title || 'Gallery',
          description: gallery.description || '',
          images: gallery.images?.map((img: any) => ({
            url: typeof img === 'string' ? img : img.url,
            caption: typeof img === 'string' ? '' : (img.caption || '')
          })) || [],
          layout: (gallery.layout || '2-col') as '1-col' | '2-col' | '3-col' | 'masonry'
        }))
      ],
      videoUrls: project.videoUrls || [],
      credits: project.credits,
    };
  }, [project]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!project || !renderingData) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6">
        <p className="font-pixel text-sm tracking-wider opacity-60">PROJECT NOT FOUND</p>
        <button
          onClick={() => onNavigate('portfolio')}
          className="px-8 py-3 rounded-full border border-border hover:bg-secondary transition-all font-pixel tracking-wider"
        >
          BACK TO PORTFOLIO
        </button>
      </div>
    );
  }

  return (
    <>
      <SEO 
        metadata={{
          title: project.seoTitle || `${project.title} - Rendering | Brandon PT Davis`,
          description: project.seoDescription || project.description,
          keywords: project.seoKeywords || [project.title, 'rendering', 'visualization', '3D', 'Brandon PT Davis'],
          ogType: 'article',
          ogImage: project.ogImage || project.cardImage,
          canonicalPath: `/portfolio/${project.slug}`
        }}
      />

      <div className="min-h-screen bg-background text-foreground">
        {/* Main Content */}
        <main className="px-6 md:px-12 max-w-[1600px] mx-auto py-12">
          {/* Header with back button and actions */}
          <div className="relative z-10 flex items-start justify-between mb-8 pb-8 border-b border-border">
            <button
              onClick={() => onNavigate('portfolio?filter=rendering')}
              className="relative z-10 flex items-center gap-2 px-4 py-2 rounded-full hover:bg-secondary transition-all group"
              type="button"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="font-pixel text-xs tracking-[0.2em]">BACK</span>
            </button>
            
            <div className="relative z-10 flex items-center gap-4">
              <LikeButton projectId={project.id} initialLikes={project.likes || 0} />
              <ShareButton title={project.title} description={project.description} />
            </div>
          </div>

          {/* Project Title */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-display italic leading-tight mb-4">
              {project.title}
            </h1>
            <div className="flex items-center gap-4 text-sm opacity-40 font-pixel tracking-wider uppercase">
              <span>{project.year || '2024'}</span>
              <span>•</span>
              <span>{project.category || 'VISUALIZATION'}</span>
            </div>
          </div>

          {/* Rendering Template */}
          <RenderingTemplate project={renderingData} />

          {/* Process Section (if exists and not in galleries) */}
          {project.process && project.process.length > 0 && (
            <div className="py-12 border-t border-border">
              <h2 className="text-2xl md:text-3xl font-light mb-8 tracking-tight">
                Process & Evolution
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {project.process.map((step: any, index: number) => (
                  <div key={index} className="space-y-3">
                    {step.image && (
                      <div className="aspect-video bg-secondary rounded-lg overflow-hidden">
                        <img 
                          src={step.image} 
                          alt={step.title || `Process ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div>
                      <h3 className="font-medium mb-1">{step.title || `Step ${index + 1}`}</h3>
                      <p className="text-sm opacity-60">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation Footer */}
          <div className="grid md:grid-cols-2 gap-px border-t border-border mt-20">
            {prevProject ? (
              <button
                onClick={() => onNavigate('project', prevProject.slug)}
                className="group p-8 hover:bg-secondary transition-all text-left border-r border-border"
              >
                <span className="font-pixel text-xs opacity-40 tracking-[0.2em] uppercase block mb-2">PREVIOUS</span>
                <span className="text-2xl font-display italic group-hover:translate-x-2 transition-transform inline-block">
                  {prevProject.title}
                </span>
              </button>
            ) : <div className="p-8 bg-secondary/50 border-r border-border" />}

            {nextProject ? (
              <button
                onClick={() => onNavigate('project', nextProject.slug)}
                className="group p-8 hover:bg-secondary transition-all text-right"
              >
                <span className="font-pixel text-xs opacity-40 tracking-[0.2em] uppercase block mb-2">NEXT</span>
                <span className="text-2xl font-display italic group-hover:-translate-x-2 transition-transform inline-block">
                  {nextProject.title}
                </span>
              </button>
            ) : <div className="p-8 bg-secondary/50" />}
          </div>
        </main>
      </div>
    </>
  );
}
