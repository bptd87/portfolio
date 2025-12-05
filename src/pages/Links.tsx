import React, { useState, useEffect } from 'react';
import { ExternalLink, Instagram, Linkedin, Mail, FileText, Video, ArrowUpRight, Github, Twitter, Facebook, Youtube } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

interface SocialLink {
  id: string;
  title: string;
  url: string;
  icon: string;
  enabled: boolean;
  order: number;
  description?: string;
  type?: 'link' | 'social';
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
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [bioData, setBioData] = useState<BioData>({
    name: 'BRANDON PT DAVIS',
    tagline: 'Scenic Designer',
    profileImage: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch links
      const linksResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-74296234/links`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (linksResponse.ok) {
        const data = await linksResponse.json();
        setLinks(Array.isArray(data) ? data : []);
      }

      // Fetch bio data
      const bioResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-74296234/links/bio`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (bioResponse.ok) {
        const data = await bioResponse.json();
        if (data) {
          setBioData(data);
        }
      }
    } catch (error) {
      } finally {
      setLoading(false);
    }
  };

  const enabledLinks = links.filter(link => link.enabled).sort((a, b) => a.order - b.order);
  const socialLinks = enabledLinks.filter(link => link.type === 'social');
  const mainLinks = enabledLinks.filter(link => link.type !== 'social');

  const getIconComponent = (iconName: string) => {
    const icons: Record<string, any> = {
      instagram: Instagram,
      linkedin: Linkedin,
      mail: Mail,
      email: Mail,
      article: FileText,
      blog: FileText,
      video: Video,
      youtube: Youtube,
      github: Github,
      twitter: Twitter,
      facebook: Facebook,
      external: ExternalLink,
    };
    return icons[iconName.toLowerCase()] || ExternalLink;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-foreground border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-pixel text-xs tracking-[0.3em] text-foreground/60">LOADING</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Top spacing for navbar */}
      <div className="h-20" />

      <div className="max-w-2xl mx-auto px-4 py-8 md:py-12">
        {/* Profile Section */}
        <div className="text-center mb-10">
          {/* Profile Image */}
          {bioData.profileImage && (
            <div className="w-24 h-24 md:w-28 md:h-28 mx-auto mb-6 rounded-full overflow-hidden border-4 border-neutral-500/20">
              <ImageWithFallback
                src={bioData.profileImage}
                alt={bioData.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Name - Pixel Font */}
          <h1 className="font-pixel text-foreground text-sm md:text-base tracking-[0.4em] mb-2">
            {bioData.name}
          </h1>

          {/* Tagline - Display Font */}
          <p className="font-display italic text-foreground/70 text-xl md:text-2xl">
            {bioData.tagline}
          </p>
        </div>

        {/* Social Media Links Row */}
        {socialLinks.length > 0 && (
          <div className="flex justify-center gap-3 mb-8">
            {socialLinks.map((link) => {
              const IconComponent = getIconComponent(link.icon);
              return (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-14 h-14 rounded-full backdrop-blur-xl bg-neutral-500/10 border border-neutral-500/20 hover:border-neutral-500/40 hover:bg-neutral-500/15 transition-all duration-300 flex items-center justify-center group"
                  aria-label={link.title}
                >
                  <IconComponent className="w-6 h-6 text-foreground/60 group-hover:text-foreground transition-colors" />
                </a>
              );
            })}
          </div>
        )}

        {/* Main Links */}
        {mainLinks.length > 0 ? (
          <div className="space-y-4">
            {mainLinks.map((link) => {
              const IconComponent = getIconComponent(link.icon);
              
              return (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between w-full px-6 py-5 rounded-3xl backdrop-blur-xl bg-neutral-500/10 border border-neutral-500/20 hover:border-neutral-500/40 hover:bg-neutral-500/15 transition-all duration-300"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-neutral-500/10 border border-neutral-500/20 flex items-center justify-center flex-shrink-0">
                      <IconComponent className="w-6 h-6 text-foreground/60" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display italic text-foreground text-lg truncate">
                        {link.title}
                      </h3>
                      {link.description && (
                        <p className="font-pixel text-[10px] text-foreground/40 tracking-[0.3em] truncate mt-0.5">
                          {link.description.toUpperCase()}
                        </p>
                      )}
                    </div>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-foreground/40 group-hover:text-foreground group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all flex-shrink-0" />
                </a>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-24">
            <div className="w-20 h-20 mx-auto mb-6 rounded-3xl backdrop-blur-xl bg-neutral-500/10 border border-neutral-500/20 flex items-center justify-center">
              <ExternalLink className="w-10 h-10 text-foreground/20" />
            </div>
            <p className="font-pixel text-xs text-foreground/40 tracking-[0.3em]">
              NO LINKS YET
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-16 text-center">
          <p className="font-pixel text-[10px] text-foreground/30 tracking-[0.3em]">
            © {new Date().getFullYear()} {bioData.name}
          </p>
        </div>
      </div>
    </div>
  );
}

export default Links;
