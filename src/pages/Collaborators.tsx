import React, { useState, useEffect, useRef } from 'react';
import { Users, Building2, Briefcase, ChevronLeft, ChevronRight, Globe, Linkedin, Instagram } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

interface CollaboratorsProps {
  onNavigate: (page: string) => void;
}

interface Collaborator {
  id: string;
  name: string;
  type: 'person' | 'company' | 'theatre';
  role: string;
  bio?: string;
  website?: string;
  linkedin?: string;
  instagram?: string;
  avatar?: string;
  featured: boolean;
  projectCount?: number;
  projects?: string[];
}

export function Collaborators({ onNavigate }: CollaboratorsProps) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCollaborators = async () => {
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/collaborators`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          const collaboratorsData = data.collaborators || data || [];
          setCollaborators(collaboratorsData);
        } else {
          }
      } catch (err) {
        } finally {
        setLoading(false);
      }
    };

    fetchCollaborators();
  }, []);

  // Organize by type
  const people = collaborators
    .filter(c => c.type === 'person')
    .sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return (b.projectCount || 0) - (a.projectCount || 0);
    });

  const theatres = collaborators
    .filter(c => c.type === 'theatre')
    .sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return (b.projectCount || 0) - (a.projectCount || 0);
    });

  const companies = collaborators
    .filter(c => c.type === 'company')
    .sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return (b.projectCount || 0) - (a.projectCount || 0);
    });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24 pb-12 px-4">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-foreground border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm tracking-wider opacity-60 font-pixel">LOADING COLLABORATORS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12">
      {/* Header */}
      <div className="px-4 md:px-6 lg:px-12 mb-16">
        <div className="max-w-[1400px] mx-auto">
          <div className="font-pixel text-xs tracking-[0.3em] text-foreground/60 mb-4">
            CREATIVE PARTNERS
          </div>
          <h1 className="font-serif italic text-5xl md:text-7xl mb-4">Collaborators</h1>
          <p className="text-foreground/70 text-lg max-w-2xl">
            Theatre is a collaborative art form. Over 15 years of practice, I've had the privilege 
            of working alongside extraordinary directors, designers, technicians, companies, and venues 
            who have shaped my approach to scenic design.
          </p>
        </div>
      </div>

      {/* People Section */}
      {people.length > 0 && (
        <CollaboratorSlider
          title="People"
          subtitle="DIRECTORS • DESIGNERS • COLLABORATORS"
          icon={Users}
          collaborators={people}
        />
      )}

      {/* Theatres Section */}
      {theatres.length > 0 && (
        <CollaboratorSlider
          title="Theatres"
          subtitle="VENUES • COMPANIES • INSTITUTIONS"
          icon={Building2}
          collaborators={theatres}
        />
      )}

      {/* Companies Section */}
      {companies.length > 0 && (
        <CollaboratorSlider
          title="Companies"
          subtitle="EXPERIENTIAL • PRODUCTION • PARTNERS"
          icon={Briefcase}
          collaborators={companies}
        />
      )}

      {/* Empty State */}
      {people.length === 0 && theatres.length === 0 && companies.length === 0 && (
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-12">
          <div className="text-center py-24">
            <div className="bg-neutral-500/10 backdrop-blur-md border border-neutral-500/20 rounded-3xl p-12 inline-block">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-40" />
              <p className="font-pixel text-sm tracking-wider opacity-60">NO COLLABORATORS YET</p>
              <p className="text-sm text-foreground/60 mt-2">Add collaborators from the admin panel</p>
            </div>
          </div>
        </div>
      )}

      {/* Call to Action */}
      <div className="max-w-[1400px] mx-auto mt-24 px-4 md:px-6 lg:px-12">
        <div className="bg-neutral-500/10 backdrop-blur-md border border-neutral-500/20 rounded-3xl p-12 text-center">
          <h2 className="font-pixel text-xs tracking-[0.3em] text-foreground/60 mb-4">
            LET'S COLLABORATE
          </h2>
          <p className="font-serif italic text-3xl md:text-4xl mb-6">
            Interested in working together?
          </p>
          <p className="text-foreground/70 mb-8 max-w-xl mx-auto">
            I'm always open to new partnerships and creative conversations. 
            Let's create something extraordinary.
          </p>
          <button
            onClick={() => onNavigate('contact')}
            className="bg-foreground text-background px-8 py-4 rounded-full font-pixel text-[10px] tracking-[0.2em] hover:opacity-90 transition-opacity"
          >
            GET IN TOUCH
          </button>
        </div>
      </div>
    </div>
  );
}

// Slider Component
interface SliderProps {
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  collaborators: Collaborator[];
}

function CollaboratorSlider({ title, subtitle, icon: Icon, collaborators }: SliderProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [selectedRole, setSelectedRole] = useState<string>('all');

  // Get unique roles for filtering (only for People section)
  const roles = title === 'People' 
    ? ['all', ...Array.from(new Set(collaborators.map(c => c.role).filter(Boolean)))]
    : [];

  // Filter collaborators by role
  const filteredCollaborators = selectedRole === 'all' 
    ? collaborators 
    : collaborators.filter(c => c.role === selectedRole);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    const ref = scrollRef.current;
    if (ref) {
      ref.addEventListener('scroll', checkScroll);
      return () => ref.removeEventListener('scroll', checkScroll);
    }
  }, [collaborators]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 600; // Increased for wider cards
      const newScrollLeft = direction === 'left' 
        ? scrollRef.current.scrollLeft - scrollAmount
        : scrollRef.current.scrollLeft + scrollAmount;
      
      scrollRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="mb-24">
      {/* Section Header */}
      <div className="px-4 md:px-6 lg:px-12 mb-6">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Icon className="w-6 h-6 text-foreground/60" />
                <h2 className="font-serif italic text-3xl md:text-4xl">{title}</h2>
              </div>
              <p className="font-pixel text-[10px] tracking-[0.3em] text-foreground/60">
                {subtitle}
              </p>
            </div>

            {/* Navigation Arrows - Desktop Only */}
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => scroll('left')}
                disabled={!canScrollLeft}
                className={`p-3 rounded-full border border-neutral-500/20 backdrop-blur-md transition-all ${
                  canScrollLeft 
                    ? 'bg-neutral-500/10 hover:bg-neutral-500/20 text-foreground' 
                    : 'bg-neutral-500/5 text-foreground/20 cursor-not-allowed'
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => scroll('right')}
                disabled={!canScrollRight}
                className={`p-3 rounded-full border border-neutral-500/20 backdrop-blur-md transition-all ${
                  canScrollRight 
                    ? 'bg-neutral-500/10 hover:bg-neutral-500/20 text-foreground' 
                    : 'bg-neutral-500/5 text-foreground/20 cursor-not-allowed'
                }`}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Role Filter - Only for People */}
          {roles.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {roles.map((role) => (
                <button
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  className={`px-4 py-2 rounded-full font-pixel text-[9px] tracking-wider transition-all ${
                    selectedRole === role
                      ? 'bg-foreground text-background'
                      : 'bg-neutral-500/10 border border-neutral-500/20 text-foreground/60 hover:bg-neutral-500/20'
                  }`}
                >
                  {role === 'all' ? 'ALL' : role.toUpperCase()}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Slider */}
      <div className="relative">
        <div
          ref={scrollRef}
          className="overflow-x-auto overflow-y-hidden scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <div className="flex gap-6 pb-4 px-4 md:px-6 lg:px-12" style={{ width: 'max-content' }}>
            <div style={{ width: 'calc((100vw - 1400px) / 2 - 48px)', minWidth: '0' }} className="hidden xl:block flex-shrink-0" />
            {filteredCollaborators.map((collaborator, index) => (
              <CollaboratorCard
                key={collaborator.id}
                collaborator={collaborator}
                index={index}
              />
            ))}
          </div>
        </div>

        {/* Gradient Fade Edges */}
        <div className="pointer-events-none absolute top-0 left-0 h-full w-32 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute top-0 right-0 h-full w-32 bg-gradient-to-l from-background to-transparent" />
      </div>
    </div>
  );
}

// Collaborator Card
interface CardProps {
  collaborator: Collaborator;
  index: number;
}

function CollaboratorCard({ collaborator, index }: CardProps) {
  // Use wider cards for companies and theatres like Apple TV
  const isWideCard = collaborator.type === 'company' || collaborator.type === 'theatre';
  
  return (
    <div
      className="bg-neutral-500/10 backdrop-blur-md border border-neutral-500/20 rounded-3xl overflow-hidden hover:border-neutral-500/40 transition-all duration-300 group flex-shrink-0"
      style={{ 
        width: isWideCard ? '480px' : '320px',
        animation: `fade-in 0.6s ease-out ${index * 0.05}s both`
      }}
    >
      {/* Avatar/Logo Section */}
      <div className={`relative bg-neutral-500/5 overflow-hidden ${isWideCard ? 'aspect-[16/10]' : 'aspect-square'}`}>
        {collaborator.avatar ? (
          <ImageWithFallback
            src={collaborator.avatar}
            alt={collaborator.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {collaborator.type === 'person' && <Users className="w-16 h-16 opacity-20" />}
            {collaborator.type === 'theatre' && <Building2 className="w-16 h-16 opacity-20" />}
            {collaborator.type === 'company' && <Briefcase className="w-16 h-16 opacity-20" />}
          </div>
        )}
        
        {/* Featured Badge */}
        {collaborator.featured && (
          <div className="absolute top-4 right-4 bg-foreground text-background px-3 py-1 rounded-full">
            <span className="font-pixel text-[9px] tracking-wider">FEATURED</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Name */}
        <h3 className="font-serif italic text-2xl mb-2 group-hover:text-foreground/80 transition-colors">
          {collaborator.name}
        </h3>

        {/* Role */}
        {collaborator.role && (
          <p className="text-sm text-foreground/70 mb-3 font-pixel tracking-wider">
            {collaborator.role.toUpperCase()}
          </p>
        )}

        {/* Bio */}
        {collaborator.bio && (
          <p className="text-sm text-foreground/60 line-clamp-3 mb-4">
            {collaborator.bio}
          </p>
        )}

        {/* Project Count */}
        {collaborator.projectCount !== undefined && collaborator.projectCount > 0 && (
          <div className="mb-4 font-pixel text-[10px] tracking-wider text-foreground/40">
            {collaborator.projectCount} {collaborator.projectCount === 1 ? 'PROJECT' : 'PROJECTS'}
          </div>
        )}

        {/* Social Links */}
        {(collaborator.website || collaborator.linkedin || collaborator.instagram) && (
          <div className="flex items-center gap-3 pt-4 border-t border-neutral-500/20">
            {collaborator.website && (
              <a
                href={collaborator.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground/60 hover:text-foreground transition-colors"
                title="Website"
              >
                <Globe className="w-4 h-4" />
              </a>
            )}
            {collaborator.linkedin && (
              <a
                href={collaborator.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground/60 hover:text-foreground transition-colors"
                title="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            )}
            {collaborator.instagram && (
              <a
                href={collaborator.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground/60 hover:text-foreground transition-colors"
                title="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Hide scrollbar but keep functionality
const style = document.createElement('style');
style.textContent = `
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
`;
document.head.appendChild(style);