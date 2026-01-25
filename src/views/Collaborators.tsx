import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase/client';
import { motion } from 'motion/react';
import { Globe, Linkedin, Instagram, ArrowUpRight } from 'lucide-react';
// FORCE RELOAD: 2026-01-13T02:09:32

interface CollaboratorsProps {
  onNavigate: (page: string) => void;
}

interface Collaborator {
  id: string;
  name: string;
  type: 'person' | 'company' | 'theatre' | 'brand';
  role: string;
  bio?: string;
  website?: string;
  linkedin?: string;
  instagram?: string;
  featured: boolean;
}

export function Collaborators({ onNavigate }: CollaboratorsProps) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCollaborators = async () => {
      try {
        const { data, error } = await supabase
          .from('collaborators')
          .select('*')
          .order('name');

        if (error) throw error;

        if (data) {
          const mappedCollaborators: Collaborator[] = data.map(c => ({
            id: c.id,
            name: c.name,
            type: (c.type as any) || 'person',
            role: c.role || 'Collaborator',
            bio: c.bio,
            website: c.website,
            linkedin: c.linkedin,
            instagram: c.instagram,
            featured: false,
          }));
          setCollaborators(mappedCollaborators);
        }
      } catch (err) {
        console.error('Error fetching collaborators:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCollaborators();
  }, []);

  // Structural Logic
  const peopleByRole = collaborators
    .filter(c => c.type === 'person')
    .reduce((acc, person) => {
      const role = person.role || 'Collaborator';
      if (!acc[role]) acc[role] = [];
      acc[role].push(person);
      return acc;
    }, {} as Record<string, Collaborator[]>);

  const roleOrder = [
    'Director', 'Scenic Designer', 'Costume Designer', 'Lighting Designer',
    'Sound Designer', 'Projection Designer', 'Choreographer', 'Music Director',
    'Wig Designer', 'Makeup Designer'
  ];

  const sortedRoles = Object.keys(peopleByRole).sort((a, b) => {
    const idxA = roleOrder.indexOf(a);
    const idxB = roleOrder.indexOf(b);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a.localeCompare(b);
  });

  const theatres = collaborators
    .filter(c => c.type === 'theatre')
    .sort((a, b) => a.name.localeCompare(b.name));

  const companies = collaborators
    .filter(c => ['company', 'brand', 'institution'].includes(c.type))
    .sort((a, b) => a.name.localeCompare(b.name));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24 pb-12 px-4 bg-background">
        <div className="text-center">
          <div className="w-16 h-px bg-foreground/20 mx-auto mb-4 animate-pulse" />
          <p className="text-[10px] tracking-[0.3em] opacity-40 font-pixel uppercase">Loading Cast</p>
        </div>
      </div>
    );
  }

  const SocialLink = ({ href, icon: Icon, label }: { href?: string, icon: any, label: string }) => {
    if (!href) return null;
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 -m-2 text-foreground/40 hover:text-white transition-colors duration-300"
        aria-label={label}
      >
        <Icon className="w-4 h-4" />
      </a>
    );
  };

  return (
    <div className="min-h-screen pb-32 px-6 md:px-12 lg:px-24 bg-background" style={{ paddingTop: '10rem' }}>
      {/* Hero Header - Updated padding for navbar clearance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-[1800px] mx-auto"
        style={{ marginBottom: '8rem' }}
      >
        <h1 className="font-display text-7xl md:text-9xl mb-12 leading-[0.9] tracking-tighter text-neutral-900 dark:text-white">
          Collaborators
        </h1>
        <div className="border-t border-neutral-200 dark:border-white/10 pt-8">
          <p className="font-pixel text-xs tracking-[0.2em] uppercase max-w-2xl leading-relaxed text-foreground/60">
            The extraordinary directors, designers, technicians, and venues that define this body of work.
          </p>
        </div>
      </motion.div>

      <div className="max-w-[1800px] mx-auto">

        {/* People Section - Masonry Style */}
        <div style={{ marginBottom: '6rem' }}>
          {sortedRoles.map(role => (
            <div key={role} className="mb-20">
              <div className="flex items-center gap-6 mb-12">
                <h2 className="font-pixel text-sm tracking-[0.2em] uppercase text-foreground/40 shrink-0">{role}</h2>
                <div className="h-px bg-neutral-200 dark:bg-white/10 flex-grow" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {peopleByRole[role].sort((a, b) => a.name.localeCompare(b.name)).map((person) => (
                  <motion.div
                    key={person.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.5 }}
                    className="group relative p-6 rounded-xl border border-neutral-200 dark:border-white/5 bg-neutral-50 dark:bg-white/[0.02] backdrop-blur-sm hover:bg-neutral-100 dark:hover:bg-white/[0.06] hover:border-neutral-300 dark:hover:border-white/20 hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1">
                        <h3 className="font-display text-2xl text-neutral-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-200 transition-colors">
                          {person.name}
                        </h3>
                        {person.website && (
                          <a href={person.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[10px] font-pixel tracking-wider text-blue-400/60 hover:text-blue-400 transition-colors uppercase">
                            Portfolio <ArrowUpRight className="w-2 h-2" />
                          </a>
                        )}
                      </div>

                      {/* Socials - Visible on Hover (Desktop) or Always (Mobile) */}
                      <div className="flex flex-col gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
                        <SocialLink href={person.linkedin} icon={Linkedin} label="LinkedIn" />
                        <SocialLink href={person.instagram} icon={Instagram} label="Instagram" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Theatres Section */}
        {theatres.length > 0 && (
          <div style={{ marginBottom: '8rem' }}>
            <h2 className="font-display text-5xl md:text-6xl mb-3 text-neutral-900/90 dark:text-white/90">Theatres</h2>
            <p className="font-pixel text-sm tracking-[0.2em] uppercase text-neutral-500 dark:text-white/40 mb-12">Academic and professional venues</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {theatres.map((theatre) => (
                <motion.a
                  href={theatre.website}
                  target={theatre.website ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  key={theatre.id}
                  whileHover={{ scale: 1.02 }}
                  className={`block p-6 rounded-lg border border-neutral-200 dark:border-white/5 bg-neutral-50 dark:bg-white/[0.02] hover:bg-neutral-100 dark:hover:bg-white/10 hover:border-neutral-300 dark:hover:border-white/20 transition-all duration-300 ${!theatre.website ? 'cursor-default' : 'cursor-pointer'}`}
                >
                  <h3 className="font-sans font-medium text-lg text-neutral-800 dark:text-white/80 mb-1">{theatre.name}</h3>
                  <p className="font-pixel text-[10px] uppercase tracking-wider text-neutral-500 dark:text-white/40">Theatre</p>
                </motion.a>
              ))}
            </div>
          </div>
        )}

        {/* Companies Section */}
        {companies.length > 0 && (
          <div style={{ marginBottom: '8rem' }}>
            <h2 className="font-display text-5xl md:text-6xl mb-3 text-neutral-900/90 dark:text-white/90">Companies</h2>
            <p className="font-pixel text-sm tracking-[0.2em] uppercase text-neutral-500 dark:text-white/40 mb-12">Design firms and creative studios</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {companies.map((company) => (
                <motion.a
                  href={company.website}
                  target={company.website ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  key={company.id}
                  whileHover={{ scale: 1.02 }}
                  className={`block p-6 rounded-lg border border-neutral-200 dark:border-white/5 bg-neutral-50 dark:bg-white/[0.02] hover:bg-neutral-100 dark:hover:bg-white/10 hover:border-neutral-300 dark:hover:border-white/20 transition-all duration-300 ${!company.website ? 'cursor-default' : 'cursor-pointer'}`}
                >
                  <h3 className="font-sans font-medium text-lg text-neutral-800 dark:text-white/80 mb-1">{company.name}</h3>
                  <p className="font-pixel text-[10px] uppercase tracking-wider text-neutral-500 dark:text-white/40">{company.type}</p>
                </motion.a>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Footer CTA */}
      <div className="pt-20 border-t border-neutral-200 dark:border-white/10 flex flex-col items-center text-center gap-8" style={{ marginTop: '8rem' }}>
        <p className="font-pixel text-xs tracking-[0.3em] opacity-40 uppercase">
          Theatre is a collaborative art form
        </p>
        <button
          onClick={() => onNavigate('contact')}
          className="group relative px-8 py-4 bg-neutral-900 dark:bg-white text-white dark:text-black font-display text-xl italic rounded-full overflow-hidden hover:scale-105 transition-transform duration-300"
        >
          <span className="relative z-10">Work Together</span>
        </button>
      </div>
    </div>
  );
}