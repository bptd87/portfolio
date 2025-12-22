import React, { useState, useEffect } from 'react';
import { ExternalLink, Instagram, Linkedin, Mail, FileText, Video, Github, Twitter, Facebook, Youtube, Newspaper, Image as ImageIcon, Link as LinkIcon, PenTool } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
// apiCall removed
// publicAnonKey, projectId removed
import { supabase } from '../utils/supabase/client';
import { SEO } from '../components/SEO';

// Interface for the unified dashboard item
interface DashboardItem {
  id: string;
  type: 'custom' | 'article' | 'project' | 'news' | 'social';
  title: string;
  subtitle?: string; // Date or extra info
  url: string;
  image?: string;
  date: string; // ISO string for sorting
  icon: string; // Icon name
  isPinned?: boolean; // For custom links
}

// Raw data interfaces
interface SocialLink {
  id: string;
  title: string;
  url: string;
  icon: string;
  enabled: boolean;
  order: number;
  description?: string;
  type?: 'link' | 'social';
  created_at?: string;
}

interface BioData {
  name: string;
  tagline: string;
  profileImage: string;
}

interface LinksProps {
  onNavigate?: (page: string) => void;
}

export function Links({ onNavigate }: LinksProps = {}) {
  const [items, setItems] = useState<DashboardItem[]>([]);
  const [bioData, setBioData] = useState<BioData>({
    name: 'BRANDON PT DAVIS',
    tagline: 'Scenic Designer',
    profileImage: '',
  });
  const [loading, setLoading] = useState(true);

  // Infinite Scroll State
  const [displayLimit, setDisplayLimit] = useState(15);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Infinite Scroll Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setDisplayLimit((prev) => prev + 12);
        }
      },
      { threshold: 0.5 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, items.length]);

  // Update hasMore when items or limit changes
  useEffect(() => {
    setHasMore(displayLimit < items.length);
  }, [displayLimit, items.length]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch data concurrently
      const [linksData, profileData, postsData, projectsData, newsData] = await Promise.all([
        // Social/Custom Links
        supabase.from('social_links').select('*').eq('enabled', true).order('order'),
        // Profile
        supabase.from('profile').select('*').single(),
        // Articles
        supabase.from('articles').select('*').eq('published', true).order('publish_date', { ascending: false }).limit(6),
        // Projects
        supabase.from('portfolio_projects').select('*').eq('published', true).order('year', { ascending: false }).limit(6),
        // News
        supabase.from('news').select('*').order('date', { ascending: false }).limit(6)
      ]) as any[];

      // 2. Handle Profile
      if (profileData.data) {
        setBioData({
          name: profileData.data.name || 'BRANDON PT DAVIS',
          tagline: profileData.data.tagline || 'Scenic Designer',
          profileImage: profileData.data.profile_image || ''
        });
      }

      // 3. Process Content
      const dashboardItems: DashboardItem[] = [];

      // --- Custom Links (Pinned/Ordered) ---
      const customLinks: any[] = linksData.data || [];
      const socialRowLinks = customLinks.filter(l => l.type === 'social');
      const customGridLinks = customLinks.filter(l => l.type !== 'social');

      // Add Custom Grid Links
      customGridLinks.forEach(link => {
        dashboardItems.push({
          id: `custom-${link.id}`,
          type: 'custom',
          title: link.title,
          subtitle: link.description,
          url: link.url,
          date: new Date().toISOString(),
          icon: link.icon || 'link',
          isPinned: true
        });
      });

      // --- Articles ---
      if (postsData.data) {
        postsData.data.forEach((post: any) => {
          dashboardItems.push({
            id: `article-${post.id}`,
            type: 'article',
            title: post.title,
            subtitle: new Date(post.publish_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            url: `/articles/${post.slug}`,
            image: post.cover_image,
            date: post.publish_date,
            icon: 'pen-tool'
          });
        });
      }

      // --- Projects ---
      if (projectsData.data) {
        projectsData.data.forEach((project: any) => {
          // Construct date from year/month for sorting
          const dateStr = `${project.year}-${String(project.month || 1).padStart(2, '0')}-01`;

          let selectedImage = project.card_image || project.cover_image;
          if (!selectedImage && project.galleries?.hero?.[0]) {
            selectedImage = project.galleries.hero[0];
          }

          dashboardItems.push({
            id: `project-${project.id}`,
            type: 'project',
            title: project.title,
            subtitle: `${project.venue || 'Portfolio'} • ${project.year}`,
            url: `/project/${project.slug}`,
            image: selectedImage,
            date: dateStr,
            icon: 'image'
          });
        });
      }

      // --- News ---
      if (newsData.data) {
        newsData.data.forEach((item: any) => {
          dashboardItems.push({
            id: `news-${item.id}`,
            type: 'news',
            title: item.title,
            subtitle: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            url: item.url && item.url.startsWith('http') ? item.url : `/news/${item.slug || item.id}`,
            image: item.cover_image || item.thumbnail,
            date: item.date,
            icon: 'newspaper'
          });
        });
      }

      // 4. Sort
      const sortedItems = dashboardItems.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        if (a.isPinned && b.isPinned) return 0;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });

      setItems(sortedItems);
      // Fallback for social links if DB fetch was empty (should check if we want to support this fallback still? 
      // Maybe not needed if we assume migration run, but safer to keep default state initialized in useState and only update if data found)
      if (socialRowLinks.length > 0) {
        // Map DB structure to SocialLink interface if needed, or update state
        // DB: { id, title, url, icon, enabled, order }
        // State: SocialLink[]
        setSocialRow(socialRowLinks.map((l: any) => ({
          id: l.id,
          title: l.title,
          url: l.url,
          icon: l.icon || 'link',
          enabled: l.enabled,
          order: l.order,
          description: l.description,
          type: l.type
        })));
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const [socialRow, setSocialRow] = useState<SocialLink[]>([
    { id: 'ig', title: 'Instagram', url: 'https://instagram.com/brandonptdavis', icon: 'instagram', enabled: true, order: 1 },
    { id: 'li', title: 'LinkedIn', url: 'https://linkedin.com/in/brandonptdavis', icon: 'linkedin', enabled: true, order: 2 },
  ]);

  // ---- Icons Helper ----
  const getIcon = (name: string) => {
    const map: Record<string, any> = {
      instagram: Instagram,
      linkedin: Linkedin,
      twitter: Twitter,
      facebook: Facebook,
      youtube: Youtube,
      github: Github,
      mail: Mail,
      email: Mail,
      link: LinkIcon,
      website: ExternalLink,
      article: FileText,
      'pen-tool': PenTool,
      project: ImageIcon,
      image: ImageIcon,
      news: Newspaper,
      video: Video
    };
    return map[name.toLowerCase()] || ExternalLink;
  };

  // ---- Navigation Helper ----
  const handleItemClick = (e: React.MouseEvent, item: DashboardItem) => {
    e.preventDefault();
    if (item.type === 'custom' || item.url.startsWith('http')) {
      window.open(item.url, '_blank', 'noopener,noreferrer');
    } else {
      // Internal navigation
      if (onNavigate) {
        window.scrollTo(0, 0);
        // Remove leading slash for onNavigate if needed
        const path = item.url.startsWith('/') ? item.url.substring(1) : item.url;
        onNavigate(path);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
          <p className="font-pixel text-[10px] tracking-[0.3em] opacity-50">LOADING FEED</p>
        </div>
      </div>
    );
  }

  // Slice items for display
  const visibleItems = items.slice(0, displayLimit);

  return (
    <div className="min-h-screen bg-background pb-32">
      <SEO
        title="Links"
        description="Connect with Brandon PT Davis: Latest news, portfolio projects, and resources."
      />
      {/* Top spacing */}
      <div className="h-12" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 md:py-12">

        {/* --- BIO SECTION --- */}
        <div className="flex flex-col items-center text-center mb-12">
          {/* Profile Image */}
          {bioData.profileImage && (
            <div className="w-24 h-24 md:w-32 md:h-32 mb-6 rounded-full p-1 border border-foreground/10">
              <div className="w-full h-full rounded-full overflow-hidden">
                <ImageWithFallback
                  src={bioData.profileImage}
                  alt={bioData.name}
                  className="w-full h-full object-cover"
                  priority={true}
                />
              </div>
            </div>
          )}

          <h1 className="font-pixel text-xs md:text-sm tracking-[0.4em] mb-3 uppercase opacity-80">
            {bioData.name}
          </h1>
          <p className="font-display italic text-2xl md:text-3xl text-foreground/80 max-w-lg leading-tight mb-8">
            {bioData.tagline}
          </p>

          {/* Social Row + CTA */}
          <div className="flex flex-col items-center gap-6">
            {/* Socials */}
            <div className="flex items-center gap-4">
              {socialRow.map(link => {
                const Icon = getIcon(link.icon);
                return (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-full bg-foreground/5 hover:bg-foreground/10 transition-all text-foreground/60 hover:text-foreground hover:scale-110"
                    aria-label={link.title}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>

            {/* Website CTA */}
            <a
              href="/"
              onClick={(e) => { e.preventDefault(); if (onNavigate) onNavigate('home'); }}
              className="px-6 py-2.5 rounded-full border border-foreground/20 hover:bg-foreground/5 hover:border-foreground/40 transition-all font-pixel text-[10px] tracking-[0.2em] uppercase text-foreground/80"
            >
              VISIT WEBSITE
            </a>
          </div>
        </div>

        {/* --- DASHBOARD GRID --- */}
        <div className="grid grid-cols-3 gap-3 md:gap-4 mx-auto max-w-4xl">
          {visibleItems.map((item, index) => {
            const Icon = getIcon(item.icon);
            const isImage = item.image && item.image !== '';

            // Prioritize first 3 images for LCP
            const isPriority = index < 3;

            return (
              <a
                key={item.id}
                href={item.url}
                onClick={(e) => handleItemClick(e, item)}
                style={{ aspectRatio: '0.8' }}
                className="group relative w-full rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-900 border border-black/5 dark:border-white/5 transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl cursor-pointer"
              >
                {/* Background Image */}
                {isImage ? (
                  <ImageWithFallback
                    src={item.image!}
                    alt={item.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    priority={isPriority}
                  />
                ) : (
                  // Fallback Gradient
                  <div className="absolute inset-0 bg-gradient-to-br from-neutral-200 to-neutral-300 dark:from-neutral-800 dark:to-neutral-900" />
                )}

                {/* Dark Overlay - Only for Text Items */}
                {item.type !== 'project' && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                )}

                {/* Type Icon */}
                <div className="absolute top-2 right-2 p-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white/90 shadow-sm z-10">
                  <Icon className="w-3.5 h-3.5" />
                </div>

                {/* Content - Hidden for Projects, Title Only for others */}
                {item.type !== 'project' && (
                  <div className="absolute inset-x-0 bottom-0 p-3 md:p-4 flex flex-col justify-end h-full">
                    <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                      {/* Title Only */}
                      <h3 className="font-display italic text-white text-sm md:text-lg leading-tight line-clamp-3 shadow-black drop-shadow-md">
                        {item.title}
                      </h3>
                    </div>
                  </div>
                )}
              </a>
            );
          })}
        </div>

        {/* Loading / Sentinel */}
        {hasMore && (
          <div ref={loaderRef} className="py-12 flex justify-center">
            <div className="w-6 h-6 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
          </div>
        )}

        {/* Footer */}
        {!hasMore && (
          <div className="mt-20 text-center pb-8">
            <p className="font-pixel text-[10px] opacity-30 tracking-[0.3em]">
              END OF FEED • © {new Date().getFullYear()}
            </p>
          </div>
        )}

      </div>
    </div>
  );
}

export default Links;
