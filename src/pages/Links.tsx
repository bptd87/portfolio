import React, { useState, useEffect } from 'react';
import { ExternalLink, Instagram, Linkedin, Mail, FileText, Video, Github, Twitter, Facebook, Youtube, Newspaper, Image as ImageIcon, Link as LinkIcon, PenTool } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { apiCall } from '../utils/api';
import { publicAnonKey, projectId } from '../utils/supabase/info';
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
      // 1. Fetch Custom Links & Bio (Existing)
      const [linksRes, bioRes] = await Promise.all([
        fetch(`https://${projectId}.supabase.co/functions/v1/make-server-74296234/links`, {
          headers: { Authorization: `Bearer ${publicAnonKey}` }
        }).then(res => res.ok ? res.json() : []),
        fetch(`https://${projectId}.supabase.co/functions/v1/make-server-74296234/links/bio`, {
          headers: { Authorization: `Bearer ${publicAnonKey}` }
        }).then(res => res.ok ? res.json() : null)
      ]);

      if (bioRes) setBioData(bioRes);

      // 2. Fetch Content (Articles, Projects, News)
      const [postsRes, projectsRes, newsRes] = await Promise.all([
        apiCall('/api/posts'),
        apiCall('/api/projects'),
        apiCall('/api/news')
      ]);

      // Process Data
      const dashboardItems: DashboardItem[] = [];

      // --- Custom Links (Pinned/Ordered) ---
      const customLinks: SocialLink[] = Array.isArray(linksRes) ? linksRes : [];

      // Separate pure social icons (small circle) vs custom content links (cards)
      // The user wants "New, Portfolio, and Articles" auto populated. 
      // "Additional links" implies standard links.
      // We will render 'social' type links in a separate row, and 'link' type cards in the grid.
      const socialRowLinks = customLinks.filter(l => l.enabled && l.type === 'social');
      const customGridLinks = customLinks.filter(l => l.enabled && l.type !== 'social');

      // Add Custom Grid Links
      customGridLinks.forEach(link => {
        dashboardItems.push({
          id: `custom-${link.id}`,
          type: 'custom',
          title: link.title,
          subtitle: link.description,
          url: link.url,
          date: new Date().toISOString(), // Always fresh/top if pinned, or use order
          icon: link.icon || 'link',
          isPinned: true, // Mark as pinned to sort first
          // Custom links don't have images in current schema usually, 
          // but we can try to use og-default or specific logic if added later.
          // For now, they will rely on a cool gradient fallback.
        });
      });

      // --- Articles ---
      if (postsRes.ok) {
        const postsData = await postsRes.json();
        const posts = postsData.posts || [];
        posts.forEach((post: any) => {
          dashboardItems.push({
            id: `article-${post.id}`,
            type: 'article',
            title: post.title,
            subtitle: new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            url: `/articles/${post.slug}`,
            image: post.coverImage,
            date: post.date,
            icon: 'pen-tool'
          });
        });
      }

      // --- Projects ---
      if (projectsRes.ok) {
        const projectsData = await projectsRes.json();
        const projects = projectsData.projects || [];
        projects.forEach((project: any) => {
          // Construct date from year/month for sorting
          const dateStr = `${project.year}-${String(project.month || 1).padStart(2, '0')}-01`;

          // Robust Image Selection
          // Use cardImage (from Bento Grid), then fallback to thumbnail/hero/cover
          // This matches the Portfolio page logic
          let selectedImage = project.cardImage || project.thumbnail || project.heroImage || project.coverImage;

          if (!selectedImage && project.galleries?.hero?.[0]) {
            selectedImage = project.galleries.hero[0].url || project.galleries.hero[0];
          }

          dashboardItems.push({
            id: `project-${project.id}`,
            type: 'project',
            title: project.title,
            subtitle: `${project.venue || 'Portfolio'} • ${project.year}`,
            url: `/portfolio/${project.slug}`,
            image: selectedImage,
            date: dateStr,
            icon: 'image'
          });
        });
      }

      // --- News ---
      if (newsRes.ok) {
        const newsData = await newsRes.json();
        const news = newsData.news || [];
        news.forEach((item: any) => {
          dashboardItems.push({
            id: `news-${item.id}`,
            type: 'news',
            title: item.title,
            subtitle: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            url: item.url || '#', // News might be text-only or have external link
            image: item.coverImage || item.thumbnail,
            date: item.date,
            icon: 'newspaper'
          });
        });
      }

      // 3. Sort Items
      // Strategy: Pinned custom links first (by order), then everything else by date desc
      const sortedItems = dashboardItems.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;

        if (a.isPinned && b.isPinned) {
          // Preserve order for pinned items (implicitly handled by order of insertion if source was ordered)
          // We can assume source 'customGridLinks' was sorted by 'order'
          return 0;
        }

        // Date Descending
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });

      setItems(sortedItems);
      // We pass socialRowLinks separately if needed, but for now we might fetch them again or store them?
      // Actually, define social state or just filter from raw response?
      // Let's store social links in a separate state.
      setSocialRow(socialRowLinks);

    } catch (error) {
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
              onClick={(e) => { e.preventDefault(); if (onNavigate) onNavigate('/'); }}
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
