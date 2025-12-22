import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase/client';
import { motion } from 'motion/react';
import { ArrowUpRight, Globe, Linkedin, Instagram } from 'lucide-react';

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
  projectCount?: number;
}

export function Collaborators({ onNavigate }: CollaboratorsProps) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    const fetchCollaborators = async () => {
      try {
        const { data, error } = await supabase
          .from('collaborators')
          .select('*')
          .order('name');

        if (error) throw error;

        if (data) {
          // Map DB to frontend interface
          const mappedCollaborators: Collaborator[] = data.map(c => ({
            id: c.id,
            name: c.name,
            type: (c.type as any) || 'person',
            role: c.role || 'Collaborator',
            bio: c.bio,
            website: c.website,
            linkedin: c.linkedin,
            instagram: c.instagram,
            featured: false, // Default as not in DB yet
            projectCount: 0 // Default as not computed yet
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

  // Group people by role
  const peopleByRole = collaborators
    .filter(c => c.type === 'person')
    .reduce((acc, person) => {
      const role = person.role || 'Collaborator';
      if (!acc[role]) acc[role] = [];
      acc[role].push(person);
      return acc;
    }, {} as Record<string, Collaborator[]>);

  // Sort roles roughly by production hierarchy customization could go here
  const roleOrder = [
    'Director',
    'Scenic Designer',
    'Costume Designer',
    'Lighting Designer',
    'Sound Designer',
    'Projection Designer',
    'Choreographer',
    'Music Director',
    'Wig Designer',
    'Makeup Designer'
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
    .filter(c => c.type === 'company')
    .sort((a, b) => a.name.localeCompare(b.name));

  const brands = collaborators
    .filter(c => c.type === 'brand')
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

  const renderSection = (title: string, items: Collaborator[], isGrid = true) => (
    <div className="mb-24 break-inside-avoid">
      <h3 className="font-pixel text-[10px] tracking-[0.3em] opacity-40 uppercase mb-8 border-b border-foreground/10 pb-2">{title}</h3>

      <div className={isGrid ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-16 gap-y-12" : "space-y-6"}>
        {items.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className={`group relative ${hoveredId && hoveredId !== item.id ? 'opacity-30' : 'opacity-100'} transition-opacity duration-300`}
            onMouseEnter={() => setHoveredId(item.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <div className="flex flex-col gap-2">
              <h4 className="font-sans text-lg font-light tracking-wide text-foreground cursor-default transition-all duration-300 group-hover:tracking-wider group-hover:pl-2 origin-left">
                {item.name}
              </h4>

              <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -translate-y-2 group-hover:translate-y-0 h-6">
                {item.website && (
                  <a
                    href={item.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/icon hover:scale-110 transition-transform"
                    aria-label={`Visit ${item.name} Website`}
                  >
                    <Globe className="w-4 h-4 transition-all" style={{ stroke: '#06b6d4' }} />
                  </a>
                )}
                {item.linkedin && (
                  <a
                    href={item.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/icon hover:scale-110 transition-transform"
                    aria-label={`Visit ${item.name} LinkedIn`}
                  >
                    <Linkedin className="w-4 h-4 transition-all" style={{ stroke: '#3b82f6' }} />
                  </a>
                )}
                {item.instagram && (
                  <a
                    href={item.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/icon hover:scale-110 transition-transform"
                    aria-label={`Visit ${item.name} Instagram`}
                  >
                    <Instagram className="w-4 h-4 transition-all" style={{ stroke: '#ec4899' }} />
                  </a>
                )}
              </div>
              {!isGrid && item.projectCount && (
                <span className="font-pixel text-[9px] text-foreground/40 tracking-wider">
                  {item.projectCount} {item.projectCount === 1 ? 'PRODUCTION' : 'PRODUCTIONS'}
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pt-32 pb-24 px-6 md:px-12 lg:px-24 bg-background">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="max-w-[1800px] mx-auto mb-24"
      >
        <h1 className="font-display text-6xl md:text-8xl lg:text-9xl mb-8 leading-[0.9] tracking-tight">
          Collaborators
        </h1>
        <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-8 border-t border-foreground p-4">
          <p className="font-pixel text-xs tracking-[0.2em] uppercase max-w-md leading-relaxed opacity-60">
            A directory of the extraordinary directors, designers, technicians, and venues that define this body of work.
          </p>
          <p className="font-display italic text-xl md:text-2xl text-foreground/40">
            Est. 2010 — Present
          </p>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-[1800px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">

        {/* Left Column: People by Role */}
        <div className="lg:col-span-8 space-y-12">
          <div className="flex items-baseline justify-between border-b border-foreground/10 pb-4 mb-4">
            <h2 className="font-display italic text-4xl">People</h2>
          </div>

          {sortedRoles.map(role => (
            renderSection(role, peopleByRole[role].sort((a: Collaborator, b: Collaborator) => a.name.localeCompare(b.name)))
          ))}
        </div>

        {/* Right Column: Organizations */}
        <div className="lg:col-span-4 space-y-16">
          {theatres.length > 0 && renderSection('Theatres', theatres, false)}
          {companies.length > 0 && renderSection('Companies', companies, false)}
          {brands.length > 0 && renderSection('Brands', brands, false)}
        </div>

      </div>
      {/* Footer Note */}
      <div className="mt-32 pt-12 border-t border-foreground/10 flex flex-col items-center text-center gap-6">
        <p className="font-pixel text-[10px] tracking-[0.2em] opacity-40 uppercase">
          Theatre is a collaborative art form
        </p>
        <button
          onClick={() => onNavigate('contact')}
          className="text-2xl md:text-4xl font-display italic hover:opacity-60 transition-opacity underline decoration-1 decoration-foreground/20 underline-offset-8"
        >
          Work Together
        </button>
      </div>
    </div>
  );
}