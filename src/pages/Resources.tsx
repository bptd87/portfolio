import React, { useState, useEffect } from 'react';
import { 
  ExternalLink, Building2, Code, Palette, BookOpen, ArrowLeft, FolderOpen
} from 'lucide-react';
import { motion } from 'motion/react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface ResourcesProps {
  onNavigate: (page: string) => void;
}

interface DirectoryLink {
  id: string;
  title: string;
  url: string;
  description: string;
  category: string;
  enabled: boolean;
  order: number;
}

interface DirectoryCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  order: number;
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  building: Building2,
  code: Code,
  palette: Palette,
  book: BookOpen,
  folder: FolderOpen,
};

// Fallback data if database is empty
const FALLBACK_CATEGORIES: DirectoryCategory[] = [
  { id: 'organizations', name: 'Organizations', slug: 'organizations', description: 'Professional unions, societies, and industry groups', icon: 'building', order: 0 },
  { id: 'software', name: 'Software', slug: 'software', description: 'Essential design and drafting tools', icon: 'code', order: 1 },
  { id: 'supplies', name: 'Supplies & Materials', slug: 'supplies', description: 'Paint, fabric, hardware, and scenic materials', icon: 'palette', order: 2 },
  { id: 'research', name: 'Research & Inspiration', slug: 'research', description: 'Archives, publications, and design resources', icon: 'book', order: 3 },
];

const FALLBACK_LINKS: DirectoryLink[] = [
  // Organizations
  { id: '1', title: 'United Scenic Artists (USA 829)', url: 'https://www.usa829.org/', description: 'Union for scenic, costume, lighting, sound & projection designers', category: 'organizations', enabled: true, order: 0 },
  { id: '2', title: 'USITT', url: 'https://www.usitt.org/', description: 'United States Institute for Theatre Technology', category: 'organizations', enabled: true, order: 1 },
  { id: '3', title: 'OISTAT', url: 'https://www.oistat.org/', description: 'International organization of scenographers, theatre architects, and technicians', category: 'organizations', enabled: true, order: 2 },
  { id: '4', title: 'ADG (Art Directors Guild)', url: 'https://adg.org/', description: 'Union for production designers, art directors, and scenic artists in film/TV', category: 'organizations', enabled: true, order: 3 },
  // Software
  { id: '5', title: 'Vectorworks', url: 'https://www.vectorworks.net/', description: 'Industry standard CAD for scenic and lighting design', category: 'software', enabled: true, order: 0 },
  { id: '6', title: 'SketchUp', url: 'https://www.sketchup.com/', description: '3D modeling for quick visualization and presentations', category: 'software', enabled: true, order: 1 },
  { id: '7', title: 'Blender', url: 'https://www.blender.org/', description: 'Free open-source 3D creation suite', category: 'software', enabled: true, order: 2 },
  { id: '8', title: 'Enscape / Twinmotion', url: 'https://enscape3d.com/', description: 'Real-time rendering and visualization', category: 'software', enabled: true, order: 3 },
  { id: '9', title: 'Adobe Creative Cloud', url: 'https://www.adobe.com/creativecloud.html', description: 'Photoshop, Illustrator, InDesign for graphics and presentations', category: 'software', enabled: true, order: 4 },
  // Supplies
  { id: '10', title: 'Rosco', url: 'https://us.rosco.com/', description: 'Theatrical paints, gobos, fog machines, and scenic materials', category: 'supplies', enabled: true, order: 0 },
  { id: '11', title: 'Rose Brand', url: 'https://www.rosebrand.com/', description: 'Fabrics, drapery, flooring, and scenic supplies', category: 'supplies', enabled: true, order: 1 },
  { id: '12', title: 'BMI Supply', url: 'https://www.bmisupply.com/', description: 'Theatrical hardware, rigging, and expendables', category: 'supplies', enabled: true, order: 2 },
  { id: '13', title: 'Syracuse Scenery', url: 'https://syracusescenery.com/', description: 'Rigging, drapery, and stage equipment', category: 'supplies', enabled: true, order: 3 },
  { id: '14', title: 'Chicago Canvas', url: 'https://www.chicagocanvas.com/', description: 'Canvas, muslin, and scenic fabrics', category: 'supplies', enabled: true, order: 4 },
  // Research
  { id: '15', title: 'World Stage Design', url: 'https://www.worldstagedesign.org/', description: 'International scenography exhibition and competition', category: 'research', enabled: true, order: 0 },
  { id: '16', title: 'Theatre Design & Technology', url: 'https://www.usitt.org/td-t', description: 'USITT quarterly journal on design and technology', category: 'research', enabled: true, order: 1 },
  { id: '17', title: 'V&A Theatre Collections', url: 'https://www.vam.ac.uk/collections/theatre-performance', description: 'Victoria & Albert Museum performance archives', category: 'research', enabled: true, order: 2 },
  { id: '18', title: 'Prague Quadrennial', url: 'https://pq.cz/', description: 'World\'s largest scenography exhibition', category: 'research', enabled: true, order: 3 },
  { id: '19', title: 'Theatrecrafts.com', url: 'https://www.theatrecrafts.com/', description: 'Technical theatre encyclopedia and resources', category: 'research', enabled: true, order: 4 },
];

export function Resources({ onNavigate }: ResourcesProps) {
  const [categories, setCategories] = useState<DirectoryCategory[]>(FALLBACK_CATEGORIES);
  const [links, setLinks] = useState<DirectoryLink[]>(FALLBACK_LINKS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/directory`,
          {
            headers: { Authorization: `Bearer ${publicAnonKey}` },
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            // Only use API data if it has content
            if (data.links && data.links.length > 0) {
              setLinks(data.links.filter((l: DirectoryLink) => l.enabled));
            }
            if (data.categories && data.categories.length > 0) {
              setCategories(data.categories);
            }
          }
        }
      } catch (error) {
        // Keep fallback data on error
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Group links by category
  const groupedResources = categories
    .sort((a, b) => a.order - b.order)
    .map(category => ({
      ...category,
      icon: CATEGORY_ICONS[category.icon] || FolderOpen,
      links: links
        .filter(l => l.category === category.slug)
        .sort((a, b) => a.order - b.order),
    }))
    .filter(cat => cat.links.length > 0);
  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white transition-colors duration-300 pt-24 pb-24">
      
      {/* Header */}
      <section className="px-6 lg:px-12 pb-12">
        <div className="max-w-[1400px] mx-auto">
          <button
            onClick={() => onNavigate('studio')}
            className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Studio
          </button>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="font-pixel text-[10px] text-black/40 dark:text-white/40 tracking-[0.3em] mb-4">
              CURATED LINKS
            </div>
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl mb-4 leading-[0.95] italic">
              Scenic Directory
            </h1>
            <p className="text-lg md:text-xl text-black/60 dark:text-white/60 max-w-2xl">
              Essential links for scenic designers—organizations, software, suppliers, and research archives.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Resources Grid */}
      <section className="px-6 lg:px-12">
        <div className="max-w-[1400px] mx-auto">
          <div className="space-y-12">
            {groupedResources.map((category, catIndex) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: catIndex * 0.1 }}
              >
                {/* Category Header */}
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 dark:bg-amber-400/10 flex items-center justify-center flex-shrink-0">
                    <category.icon className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-display italic mb-1">
                      {category.name}
                    </h2>
                    <p className="text-sm text-black/50 dark:text-white/50">
                      {category.description}
                    </p>
                  </div>
                </div>
                
                {/* Links Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pl-0 md:pl-16">
                  {category.links.map((link, linkIndex) => (
                    <motion.a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: catIndex * 0.1 + linkIndex * 0.05 }}
                      className="group flex items-start gap-3 p-5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl hover:border-amber-500/30 dark:hover:border-amber-400/30 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all"
                    >
                      <ExternalLink className="w-4 h-4 text-neutral-400 dark:text-neutral-500 mt-1 group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors truncate">
                          {link.title}
                        </div>
                        <div className="text-sm text-black/50 dark:text-white/50 line-clamp-2">
                          {link.description}
                        </div>
                      </div>
                    </motion.a>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom Note */}
      <section className="px-6 lg:px-12 mt-16">
        <div className="max-w-[1400px] mx-auto">
          <div className="p-6 bg-neutral-100 dark:bg-neutral-900 rounded-2xl text-center">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Know a great resource that should be on this list? <button onClick={() => onNavigate('contact')} className="text-amber-600 dark:text-amber-400 hover:underline">Let me know</button>.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}

export default Resources;
