import React, { useState, useEffect } from 'react';
import { ExternalLink, Instagram, Linkedin, Mail, FileText, Video, Github, Twitter, Facebook, Youtube, Newspaper, Image as ImageIcon, Link as LinkIcon, PenTool, ArrowUpRight, Globe } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { supabase } from '../utils/supabase/client';
import { SEO } from '../components/SEO';

// --- Interfaces ---

interface DashboardItem {
  id: string;
  type: 'custom' | 'article' | 'project' | 'news' | 'social';
  title: string;
  subtitle?: string;
  url: string;
  image?: string;
  date: string;
  icon: string;
  isPinned?: boolean;
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

  // Pagination
  const [displayLimit, setDisplayLimit] = useState(12);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = React.useRef<HTMLDivElement>(null);

  // --- Data Fetching ---

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch all sources concurrently
      const [
        profileData,
        bioLinksData,
        projectsData,
        articlesData,
        newsData,
        tutorialsData
      ] = await Promise.all([
        supabase.from('site_configuration').select('value').eq('key', 'bio_data').single(),
        supabase.from('bio_links').select('*').eq('active', true).order('order'),
        // Explicitly fetching ALL published projects regardless of category
        supabase.from('portfolio_projects').select('*').eq('published', true).order('year', { ascending: false }),
        supabase.from('articles').select('*').eq('published', true).order('published_at', { ascending: false }),
        supabase.from('news').select('*').order('date', { ascending: false }),
        supabase.from('tutorials').select('*').order('created_at', { ascending: false })
      ]) as any[];

      // 1. Setup Bio
      if (profileData.data && profileData.data.value) {
        setBioData({
          name: profileData.data.value.name || 'BRANDON PT DAVIS',
          tagline: profileData.data.value.tagline || 'Scenic Designer',
          profileImage: profileData.data.value.profileImage || ''
        });
      }

      const dashboardItems: DashboardItem[] = [];

      // 2. Pinned Bio Links (Top Buttons)
      if (bioLinksData.data) {
        bioLinksData.data.forEach((link: any) => {
          dashboardItems.push({
            id: `bio-${link.id}`,
            type: 'custom',
            title: link.title,
            subtitle: link.description,
            url: link.url,
            date: new Date().toISOString(), // Always sorting top via isPinned
            icon: link.icon || 'link',
            isPinned: true
          });
        });
      }

      // 3. Projects (The Work)
      if (projectsData.data) {
        projectsData.data.forEach((p: any) => {
          // Construct date
          let d = new Date(`${p.year}-${String(p.month || 1).padStart(2, '0')}-01`);
          if (isNaN(d.getTime())) d = new Date(); // Fallback

          // Determine Image
          let img = p.card_image || p.cover_image;
          if (!img && p.galleries?.hero?.[0]) img = p.galleries.hero[0];

          dashboardItems.push({
            id: `proj-${p.id}`,
            type: 'project',
            title: p.title,
            subtitle: p.venue || 'Portfolio',
            url: `/project/${p.slug}`,
            image: img,
            date: d.toISOString(),
            icon: 'image',
            isPinned: false
          });
        });
      }

      // 4. Articles
      if (articlesData.data) {
        articlesData.data.forEach((a: any) => {
          const d = a.published_at ? new Date(a.published_at) : new Date(a.created_at);
          dashboardItems.push({
            id: `art-${a.id}`,
            type: 'article',
            title: a.title,
            subtitle: 'Article',
            url: `/articles/${a.slug}`,
            image: a.cover_image,
            date: d.toISOString(),
            icon: 'pen-tool',
            isPinned: false
          });
        });
      }

      // 5. News
      if (newsData.data) {
        newsData.data.forEach((n: any) => {
          const d = n.date ? new Date(n.date) : new Date(n.created_at);
          dashboardItems.push({
            id: `news-${n.id}`,
            type: 'news',
            title: n.title,
            subtitle: 'News',
            url: n.url || `/news/${n.slug || n.id}`,
            image: n.cover_image || n.thumbnail,
            date: d.toISOString(),
            icon: 'newspaper',
            isPinned: false
          });
        });
      }

      // 6. Tutorials
      if (tutorialsData.data) {
        tutorialsData.data.forEach((t: any) => {
          const d = t.publish_date ? new Date(t.publish_date) : new Date(t.created_at);
          dashboardItems.push({
            id: `tut-${t.id}`,
            type: 'article',
            title: t.title,
            subtitle: 'Tutorial',
            url: `/tutorials/${t.slug}`,
            image: t.thumbnail_url || t.cover_image,
            date: d.toISOString(),
            icon: 'video',
            isPinned: false
          });
        });
      }

      // 7. Sort
      const sorted = dashboardItems.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });

      setItems(sorted);

    } catch (err) {
      console.error("Links fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- Infinite Scroll ---
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        setDisplayLimit(prev => prev + 12);
      }
    }, { threshold: 0.1 });
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [hasMore]);

  useEffect(() => {
    setHasMore(displayLimit < items.length);
  }, [displayLimit, items.length]);


  // --- Render Helpers ---

  const getIcon = (name: string) => {
    const map: Record<string, any> = {
      instagram: Instagram, linkedin: Linkedin, twitter: Twitter,
      facebook: Facebook, youtube: Youtube, github: Github,
      mail: Mail, email: Mail, link: LinkIcon, website: Globe,
      article: FileText, 'pen-tool': PenTool, project: ImageIcon,
      image: ImageIcon, news: Newspaper, video: Video
    };
    return map[name.toLowerCase()] || ExternalLink;
  };

  const handleNav = (e: React.MouseEvent, url: string, isExternal: boolean) => {
    if (isExternal || url.startsWith('http')) {
      if (url.startsWith('http')) return;
    }

    e.preventDefault();
    if (onNavigate) {
      window.scrollTo(0, 0);
      const path = url.startsWith('/') ? url.substring(1) : url;
      onNavigate(path);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-6 h-6 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin" />
          <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">Loading Feed</p>
        </div>
      </div>
    );
  }

  const pinnedItems = items.filter(i => i.isPinned);
  const feedItems = items.filter(i => !i.isPinned).slice(0, displayLimit);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 pb-32">
      <SEO
        metadata={{
          title: "Links",
          description: `Latest work and updates from ${bioData.name}`,
          canonicalPath: '/links'
        }}
      />

      {/* Ambient Background & Noise */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-neutral-950" />
        <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-neutral-900 to-transparent opacity-80" />
        <div className="absolute -top-[20%] left-[20%] w-[60vw] h-[60vw] bg-purple-500/10 rounded-full blur-[128px] mix-blend-screen" />
        <div className="absolute top-[10%] -right-[10%] w-[50vw] h-[50vw] bg-amber-500/5 rounded-full blur-[128px] mix-blend-screen" />
        {/* Noise Texture */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 pt-16 md:pt-24">

        {/* --- 1. Profile --- */}
        <div className="flex flex-col items-center text-center mb-16">
          {bioData.profileImage && (
            <div className="relative mb-8 group">
              <div className="absolute inset-0 bg-gradient-to-tr from-amber-500 to-purple-500 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-700" />
              <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-full p-1 border border-white/10 bg-black/50 backdrop-blur-sm">
                <div className="w-full h-full rounded-full overflow-hidden">
                  <ImageWithFallback
                    src={bioData.profileImage}
                    alt={bioData.name}
                    className="object-cover w-full h-full"
                    priority
                  />
                </div>
              </div>
            </div>
          )}

          <h1 className="font-display font-medium text-4xl md:text-5xl tracking-tight text-white mb-3">
            {bioData.name}
          </h1>
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-gradient-to-r from-transparent to-white/30" />
            <p className="font-mono text-xs text-neutral-400 uppercase tracking-widest">
              {bioData.tagline}
            </p>
            <span className="h-px w-8 bg-gradient-to-l from-transparent to-white/30" />
          </div>

          {/* Socials - Floating Pill */}
          <div className="mt-8 flex items-center gap-1 p-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-lg">
            <a href="https://instagram.com/brandonptdavis" target="_blank" rel="noopener" aria-label="Visit Instagram Profile" className="p-2.5 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-all"><Instagram className="w-5 h-5" /></a>
            <a href="https://linkedin.com/in/brandonptdavis" target="_blank" rel="noopener" aria-label="Visit LinkedIn Profile" className="p-2.5 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-all"><Linkedin className="w-5 h-5" /></a>
            <div className="w-px h-4 bg-white/10 mx-1" />
            <a href="mailto:info@brandonptdavis.com" className="px-4 py-1.5 rounded-full bg-white text-black font-medium text-xs hover:bg-neutral-200 transition-colors flex items-center gap-2">
              <span>Contact</span>
              <Mail className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* --- 2. Pinned Links (Grid) --- */}
        {pinnedItems.length > 0 && (
          <div className="grid grid-cols-2 gap-3 mb-16">
            {pinnedItems.map(item => {
              const Icon = getIcon(item.icon);
              return (
                <a
                  key={item.id}
                  href={item.url}
                  target={item.url.startsWith('http') ? "_blank" : "_self"}
                  onClick={(e) => !item.url.startsWith('http') && handleNav(e, item.url, false)}
                  className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative p-4 flex flex-col items-center text-center gap-3">
                    <Icon className="w-6 h-6 text-neutral-300 group-hover:text-amber-200 transition-colors" />
                    <span className="font-medium text-sm text-neutral-200 group-hover:text-white">
                      {item.title}
                    </span>
                  </div>
                </a>
              );
            })}
          </div>
        )}

        {/* --- 3. Latest Feed (3 Columns) --- */}
        <div className="border-t border-white/10 pt-10">
          <div className="flex items-center justify-between mb-8 opacity-60">
            <h2 className="font-mono text-[10px] uppercase tracking-widest text-white">Latest Activity</h2>
            <div className="h-px flex-1 bg-white/20 ml-4" />
          </div>

          <div className="grid grid-cols-3 gap-3 md:gap-4">
            {feedItems.map((item) => {
              // Ensure we get the correct icon component
              const ItemIcon = getIcon(item.icon);

              return (
                <a
                  key={item.id}
                  href={item.url}
                  onClick={(e) => !item.url.startsWith('http') && handleNav(e, item.url, false)}
                  className="relative group overflow-hidden rounded-lg bg-neutral-900 border border-white/10 aspect-[4/5] hover:border-white/30 transition-colors"
                >
                  {/* Image */}
                  {item.image ? (
                    <ImageWithFallback
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full bg-neutral-800 flex items-center justify-center">
                      <ItemIcon className="w-8 h-8 opacity-20" />
                    </div>
                  )}

                  {/* Use a persistent gradient for legibility */}
                  <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

                  {/* Content - Always Visible */}
                  <div className="absolute inset-x-0 bottom-0 p-4 pb-5 text-center">
                    <div>
                      <p className="font-display italic text-white text-xs md:text-sm leading-tight mb-1 drop-shadow-md">
                        {item.title}
                      </p>
                      <p className="font-mono text-[9px] text-white/60 uppercase tracking-wider">
                        {item.type}
                      </p>
                    </div>
                  </div>

                  {/* Persistent Icon (Top Right) */}
                  <div className="absolute top-2 right-2 p-1.5 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 text-white/90 z-10 pointer-events-none">
                    <ItemIcon className="w-3 h-3" />
                  </div>
                </a>
              );
            })}
          </div>

          {hasMore && (
            <div ref={loaderRef} className="py-12 flex justify-center">
              <div className="w-5 h-5 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>

        <div className="h-20" /> {/* Bottom spacer */}
      </div>
    </div>
  );
}

export default Links;
