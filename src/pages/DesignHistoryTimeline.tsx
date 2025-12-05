import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, MapPin, Search, Grid3x3, ChevronRight, Palette, Users, Landmark, X, ChevronDown } from 'lucide-react';

interface DesignPeriod {
  id: string;
  name: string;
  startYear: number;
  endYear: number | null;
  region: string;
  description: string;
  characteristics: string[];
  keyFigures?: string[];
  notableWorks?: string[];
  imageUrl: string;
  colors: string[];
}

const DESIGN_PERIODS: DesignPeriod[] = [
  // ANCIENT
  { 
    id: 'ancient-egypt', 
    name: 'Ancient Egyptian', 
    startYear: -3000, 
    endYear: -30, 
    region: 'Egypt', 
    description: 'Monumental architecture, hieroglyphics, symmetry, columns, massive stone construction', 
    characteristics: ['Monumentality', 'Symmetry', 'Religious symbolism', 'Stone construction'], 
    keyFigures: ['Imhotep'], 
    notableWorks: ['Great Pyramids of Giza', 'Temple of Karnak', 'Abu Simbel'],
    imageUrl: 'https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=800',
    colors: ['#D4AF37', '#8B4513', '#F4E4C1', '#2C1810', '#E8D4A8']
  },
  { 
    id: 'ancient-greece', 
    name: 'Ancient Greek', 
    startYear: -800, 
    endYear: -146, 
    region: 'Greece', 
    description: 'Classical orders (Doric, Ionic, Corinthian), proportion, harmony, democracy reflected in public spaces', 
    characteristics: ['Classical orders', 'Proportion', 'Harmony', 'Democratic spaces'], 
    keyFigures: ['Iktinos', 'Kallikrates', 'Phidias'], 
    notableWorks: ['Parthenon', 'Temple of Athena Nike', 'Erechtheion'],
    imageUrl: 'https://images.unsplash.com/photo-1555961403-e57931c76cfc?w=800',
    colors: ['#FFFFFF', '#F5F5DC', '#4A90E2', '#8B0000', '#DAA520']
  },
  { 
    id: 'ancient-rome', 
    name: 'Ancient Roman', 
    startYear: -500, 
    endYear: 476, 
    region: 'Roman Empire', 
    description: 'Engineering innovations (arches, vaults, concrete), aqueducts, amphitheaters, urban planning', 
    characteristics: ['Arches and vaults', 'Concrete', 'Engineering', 'Urban planning'], 
    keyFigures: ['Vitruvius'], 
    notableWorks: ['Colosseum', 'Pantheon', 'Roman aqueducts', 'Forum'],
    imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800',
    colors: ['#8B0000', '#DAA520', '#F5DEB3', '#8B4513', '#2F4F4F']
  },

  // MEDIEVAL
  { 
    id: 'byzantine', 
    name: 'Byzantine', 
    startYear: 330, 
    endYear: 1453, 
    region: 'Byzantine Empire', 
    description: 'Domes, mosaics, religious iconography, centralized plans, rich decoration', 
    characteristics: ['Domes', 'Mosaics', 'Religious iconography', 'Rich decoration'], 
    notableWorks: ['Hagia Sophia', 'San Vitale', 'St. Mark\'s Basilica'],
    imageUrl: 'https://images.unsplash.com/photo-1541963058-d9bc2ad69c6d?w=800',
    colors: ['#FFD700', '#4B0082', '#8B0000', '#00008B', '#228B22']
  },
  { 
    id: 'gothic', 
    name: 'Gothic', 
    startYear: 1150, 
    endYear: 1500, 
    region: 'Western Europe', 
    description: 'Pointed arches, ribbed vaults, flying buttresses, large stained glass windows, verticality', 
    characteristics: ['Pointed arches', 'Flying buttresses', 'Stained glass', 'Verticality'], 
    notableWorks: ['Notre-Dame de Paris', 'Chartres Cathedral', 'Cologne Cathedral'],
    imageUrl: 'https://images.unsplash.com/photo-1549549899-5c2e6eb7eb4e?w=800',
    colors: ['#4169E1', '#DC143C', '#FFD700', '#4B0082', '#2F4F4F']
  },

  // RENAISSANCE & BAROQUE
  { 
    id: 'renaissance', 
    name: 'Renaissance', 
    startYear: 1400, 
    endYear: 1600, 
    region: 'Italy, Europe', 
    description: 'Revival of classical principles, symmetry, proportion, perspective, humanism', 
    characteristics: ['Classical revival', 'Symmetry', 'Proportion', 'Humanism'], 
    keyFigures: ['Brunelleschi', 'Alberti', 'Michelangelo', 'Palladio'], 
    notableWorks: ['Florence Cathedral dome', 'St. Peter\'s Basilica', 'Villa Rotonda'],
    imageUrl: 'https://images.unsplash.com/photo-1534445538923-caae0c611d42?w=800',
    colors: ['#8B4513', '#D4AF37', '#F5DEB3', '#8B0000', '#2F4F4F']
  },
  { 
    id: 'baroque', 
    name: 'Baroque', 
    startYear: 1600, 
    endYear: 1750, 
    region: 'Europe', 
    description: 'Drama, grandeur, contrast, curved forms, ornate decoration, theatricality', 
    characteristics: ['Drama', 'Grandeur', 'Curved forms', 'Ornate decoration'], 
    keyFigures: ['Bernini', 'Borromini', 'Wren'], 
    notableWorks: ['St. Peter\'s Square', 'Palace of Versailles', 'St. Paul\'s Cathedral'],
    imageUrl: 'https://images.unsplash.com/photo-1601024445121-e5b82f020549?w=800',
    colors: ['#FFD700', '#8B0000', '#4B0082', '#F5DEB3', '#2F4F4F']
  },
  { 
    id: 'rococo', 
    name: 'Rococo', 
    startYear: 1700, 
    endYear: 1780, 
    region: 'France, Europe', 
    description: 'Lightness, elegance, playfulness, ornate decoration, pastel colors, asymmetry', 
    characteristics: ['Lightness', 'Elegance', 'Ornate', 'Asymmetry'], 
    notableWorks: ['Hôtel de Soubise', 'Sanssouci Palace', 'Amalienburg'],
    imageUrl: 'https://images.unsplash.com/photo-1586772002130-b0e1c00d62fc?w=800',
    colors: ['#FFB6C1', '#E6E6FA', '#FFFACD', '#F0E68C', '#DDA0DD']
  },

  // NEOCLASSICAL
  { 
    id: 'neoclassical', 
    name: 'Neoclassical', 
    startYear: 1750, 
    endYear: 1850, 
    region: 'Europe, Americas', 
    description: 'Return to classical Greek and Roman principles, simplicity, order, symmetry', 
    characteristics: ['Classical revival', 'Simplicity', 'Order', 'Symmetry'], 
    keyFigures: ['Robert Adam', 'Thomas Jefferson', 'Karl Friedrich Schinkel'], 
    notableWorks: ['Panthéon Paris', 'Brandenburg Gate', 'US Capitol'],
    imageUrl: 'https://images.unsplash.com/photo-1555992336-fb0d29498b13?w=800',
    colors: ['#F5F5F5', '#DAA520', '#8B4513', '#2F4F4F', '#696969']
  },
  { 
    id: 'gothic-revival', 
    name: 'Gothic Revival', 
    startYear: 1830, 
    endYear: 1900, 
    region: 'Britain, US', 
    description: 'Romantic revival of medieval Gothic, pointed arches, picturesque, nationalism', 
    characteristics: ['Medieval revival', 'Pointed arches', 'Picturesque', 'Romantic'], 
    keyFigures: ['Augustus Pugin', 'John Ruskin'], 
    notableWorks: ['Palace of Westminster', 'St. Patrick\'s Cathedral NYC'],
    imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800',
    colors: ['#8B4513', '#2F4F4F', '#FFD700', '#8B0000', '#4B0082']
  },

  // 19TH CENTURY
  { 
    id: 'beaux-arts', 
    name: 'Beaux-Arts', 
    startYear: 1830, 
    endYear: 1920, 
    region: 'France, US', 
    description: 'Academic classical design, grandeur, elaborate ornament, symmetry, hierarchy of spaces', 
    characteristics: ['Academic classicism', 'Grandeur', 'Elaborate ornament', 'Symmetry'], 
    notableWorks: ['Paris Opera', 'Grand Central Terminal', 'Boston Public Library'],
    imageUrl: 'https://images.unsplash.com/photo-1558617398-b0f0c4c5d812?w=800',
    colors: ['#F5F5DC', '#DAA520', '#8B4513', '#2F4F4F', '#FFD700']
  },
  { 
    id: 'arts-crafts', 
    name: 'Arts & Crafts', 
    startYear: 1860, 
    endYear: 1910, 
    region: 'Britain, US', 
    description: 'Reaction to industrialization, handcraft, natural materials, simplicity, medieval inspiration', 
    characteristics: ['Handcraft', 'Natural materials', 'Simplicity', 'Anti-industrial'], 
    keyFigures: ['William Morris', 'Charles Rennie Mackintosh'], 
    notableWorks: ['Red House', 'Glasgow School of Art'],
    imageUrl: 'https://images.unsplash.com/photo-1615875605825-5eb9bb5d52ac?w=800',
    colors: ['#8B4513', '#556B2F', '#D2691E', '#8B7355', '#A0522D']
  },
  { 
    id: 'art-nouveau', 
    name: 'Art Nouveau', 
    startYear: 1890, 
    endYear: 1910, 
    region: 'Europe', 
    description: 'Organic forms, flowing lines, nature motifs, craftsmanship, decorative arts integration', 
    characteristics: ['Organic forms', 'Flowing lines', 'Nature motifs', 'Decorative arts'], 
    keyFigures: ['Victor Horta', 'Antoni Gaudí', 'Hector Guimard'], 
    notableWorks: ['Hôtel Tassel', 'Sagrada Família', 'Paris Métro entrances'],
    imageUrl: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800',
    colors: ['#556B2F', '#DAA520', '#8B4513', '#9370DB', '#2F4F4F']
  },

  // EARLY MODERNISM
  { 
    id: 'chicago-school', 
    name: 'Chicago School', 
    startYear: 1880, 
    endYear: 1910, 
    region: 'Chicago, US', 
    description: 'Early skyscrapers, steel frame construction, large windows, commercial architecture', 
    characteristics: ['Skyscrapers', 'Steel frame', 'Large windows', 'Commercial'], 
    keyFigures: ['Louis Sullivan', 'Daniel Burnham', 'John Root'], 
    notableWorks: ['Wainwright Building', 'Monadnock Building', 'Carson Pirie Scott'],
    imageUrl: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800',
    colors: ['#8B4513', '#2F4F4F', '#696969', '#A9A9A9', '#BC8F8F']
  },
  { 
    id: 'art-deco', 
    name: 'Art Deco', 
    startYear: 1920, 
    endYear: 1940, 
    region: 'Global', 
    description: 'Geometric decoration, luxury, glamour, modern materials, streamlined forms', 
    characteristics: ['Geometric ornament', 'Luxury', 'Streamlined', 'Modern materials'], 
    keyFigures: ['William Van Alen', 'Raymond Hood'], 
    notableWorks: ['Chrysler Building', 'Rockefeller Center', 'Radio City Music Hall'],
    imageUrl: 'https://images.unsplash.com/photo-1605106250963-ffda6d2a4b32?w=800',
    colors: ['#FFD700', '#000000', '#C0C0C0', '#8B0000', '#4B0082']
  },

  // HIGH MODERNISM
  { 
    id: 'bauhaus', 
    name: 'Bauhaus', 
    startYear: 1919, 
    endYear: 1933, 
    region: 'Germany', 
    description: 'Form follows function, integration of art and technology, simplicity, functionalism', 
    characteristics: ['Functionalism', 'Geometric', 'Integration of arts', 'Modern materials'], 
    keyFigures: ['Walter Gropius', 'Ludwig Mies van der Rohe', 'Marcel Breuer'], 
    notableWorks: ['Bauhaus Dessau', 'Fagus Factory', 'Barcelona Pavilion'],
    imageUrl: 'https://images.unsplash.com/photo-1545158535-c3f7168c28b6?w=800',
    colors: ['#FF0000', '#FFFF00', '#0000FF', '#000000', '#FFFFFF']
  },
  { 
    id: 'de-stijl', 
    name: 'De Stijl', 
    startYear: 1917, 
    endYear: 1931, 
    region: 'Netherlands', 
    description: 'Abstraction, primary colors, horizontal and vertical lines, simplification', 
    characteristics: ['Abstraction', 'Primary colors', 'Orthogonal', 'Simplification'], 
    keyFigures: ['Gerrit Rietveld', 'Theo van Doesburg', 'Piet Mondrian'], 
    notableWorks: ['Rietveld Schröder House', 'Café Aubette'],
    imageUrl: 'https://images.unsplash.com/photo-1541746972996-4e0b0f43e02a?w=800',
    colors: ['#FF0000', '#FFFF00', '#0000FF', '#000000', '#FFFFFF']
  },
  { 
    id: 'international-style', 
    name: 'International Style', 
    startYear: 1920, 
    endYear: 1970, 
    region: 'Global', 
    description: 'Universal design language, flat roofs, ribbon windows, no ornamentation, open floor plans', 
    characteristics: ['Universal', 'Flat roofs', 'Ribbon windows', 'No ornament'], 
    keyFigures: ['Le Corbusier', 'Mies van der Rohe', 'Walter Gropius'], 
    notableWorks: ['Villa Savoye', 'Seagram Building', 'Farnsworth House'],
    imageUrl: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=800',
    colors: ['#FFFFFF', '#000000', '#808080', '#A9A9A9', '#2F4F4F']
  },

  // MID-CENTURY & LATE MODERN
  { 
    id: 'mid-century-modern', 
    name: 'Mid-Century Modern', 
    startYear: 1945, 
    endYear: 1970, 
    region: 'US, Global', 
    description: 'Clean lines, organic forms, integration with nature, open plans, new materials', 
    characteristics: ['Clean lines', 'Organic forms', 'Indoor-outdoor', 'New materials'], 
    keyFigures: ['Eero Saarinen', 'Richard Neutra', 'Charles & Ray Eames'], 
    notableWorks: ['Farnsworth House', 'Case Study Houses', 'TWA Terminal'],
    imageUrl: 'https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=800',
    colors: ['#D2691E', '#8B4513', '#556B2F', '#F4A460', '#2F4F4F']
  },
  { 
    id: 'brutalism', 
    name: 'Brutalism', 
    startYear: 1950, 
    endYear: 1980, 
    region: 'Global', 
    description: 'Raw concrete (béton brut), massive forms, fortress-like, honesty of materials, social housing', 
    characteristics: ['Raw concrete', 'Massive forms', 'Fortress-like', 'Honesty'], 
    keyFigures: ['Le Corbusier', 'Paul Rudolph', 'Denys Lasdun'], 
    notableWorks: ['Unité d\'Habitation', 'Yale Art & Architecture', 'National Theatre London'],
    imageUrl: 'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?w=800',
    colors: ['#696969', '#808080', '#A9A9A9', '#556B2F', '#2F4F4F']
  },
  { 
    id: 'metabolism', 
    name: 'Metabolism', 
    startYear: 1960, 
    endYear: 1975, 
    region: 'Japan', 
    description: 'Organic growth, flexibility, prefabrication, capsule architecture, megastructures', 
    characteristics: ['Organic growth', 'Flexible', 'Prefab', 'Megastructures'], 
    keyFigures: ['Kenzo Tange', 'Kisho Kurokawa', 'Fumihiko Maki'], 
    notableWorks: ['Nakagin Capsule Tower', 'Osaka Expo \'70', 'Yamanashi Press Center'],
    imageUrl: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800',
    colors: ['#FF6347', '#696969', '#F5F5F5', '#000000', '#FFD700']
  },
  { 
    id: 'high-tech', 
    name: 'High-Tech', 
    startYear: 1970, 
    endYear: 1990, 
    region: 'Global', 
    description: 'Exposed structure, industrial materials, technology celebration, flexibility, services visible', 
    characteristics: ['Exposed structure', 'Industrial aesthetic', 'Technology', 'Flexibility'], 
    keyFigures: ['Norman Foster', 'Richard Rogers', 'Renzo Piano'], 
    notableWorks: ['Pompidou Centre', 'Lloyd\'s Building', 'HSBC Building Hong Kong'],
    imageUrl: 'https://images.unsplash.com/photo-1511818966892-d7d671e672a2?w=800',
    colors: ['#4169E1', '#C0C0C0', '#FF0000', '#FFFF00', '#000000']
  },

  // POSTMODERN & CONTEMPORARY
  { 
    id: 'postmodernism', 
    name: 'Postmodernism', 
    startYear: 1970, 
    endYear: 1995, 
    region: 'Global', 
    description: 'Reaction to modernism, historical references, ornamentation, irony, pluralism, color', 
    characteristics: ['Historical references', 'Ornamentation', 'Irony', 'Pluralism'], 
    keyFigures: ['Robert Venturi', 'Michael Graves', 'Philip Johnson'], 
    notableWorks: ['Vanna Venturi House', 'Portland Building', 'AT&T Building'],
    imageUrl: 'https://images.unsplash.com/photo-1486718448742-163732cd1544?w=800',
    colors: ['#FF69B4', '#00CED1', '#FFD700', '#9370DB', '#FF6347']
  },
  { 
    id: 'deconstructivism', 
    name: 'Deconstructivism', 
    startYear: 1980, 
    endYear: 2000, 
    region: 'Global', 
    description: 'Fragmented forms, non-rectilinear shapes, distortion, controlled chaos, challenging norms', 
    characteristics: ['Fragmented', 'Non-rectilinear', 'Distorted', 'Chaotic'], 
    keyFigures: ['Frank Gehry', 'Zaha Hadid', 'Daniel Libeskind'], 
    notableWorks: ['Guggenheim Bilbao', 'Vitra Fire Station', 'Jewish Museum Berlin'],
    imageUrl: 'https://images.unsplash.com/photo-1583484963886-cdd56c49f53f?w=800',
    colors: ['#C0C0C0', '#696969', '#FF6347', '#4169E1', '#000000']
  },
  { 
    id: 'minimalism', 
    name: 'Minimalism', 
    startYear: 1980, 
    endYear: 2010, 
    region: 'Global', 
    description: 'Simplicity, essential elements only, clean lines, neutral colors, spatial clarity', 
    characteristics: ['Simplicity', 'Essential', 'Clean lines', 'Spatial clarity'], 
    keyFigures: ['Tadao Ando', 'John Pawson', 'Alberto Campo Baeza'], 
    notableWorks: ['Church of the Light', 'Nový Dvůr Monastery', 'House of the Infinite'],
    imageUrl: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
    colors: ['#FFFFFF', '#F5F5F5', '#E0E0E0', '#BEBEBE', '#808080']
  },
  { 
    id: 'parametricism', 
    name: 'Parametricism', 
    startYear: 2000, 
    endYear: null, 
    region: 'Global', 
    description: 'Digital design, algorithms, complex curved forms, variation, computational design', 
    characteristics: ['Digital', 'Algorithmic', 'Complex curves', 'Computational'], 
    keyFigures: ['Zaha Hadid', 'Patrik Schumacher', 'Greg Lynn'], 
    notableWorks: ['Heydar Aliyev Center', 'Galaxy SOHO', 'Broad Museum'],
    imageUrl: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=800',
    colors: ['#FFFFFF', '#4169E1', '#C0C0C0', '#FF6347', '#000000']
  },
  { 
    id: 'sustainable', 
    name: 'Sustainable Architecture', 
    startYear: 1990, 
    endYear: null, 
    region: 'Global', 
    description: 'Environmental responsibility, energy efficiency, green building, renewable materials, LEED', 
    characteristics: ['Environmental', 'Energy efficient', 'Green building', 'Renewable'], 
    keyFigures: ['Norman Foster', 'Renzo Piano', 'Ken Yeang'], 
    notableWorks: ['California Academy of Sciences', 'The Edge Amsterdam', 'ACROS Fukuoka'],
    imageUrl: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=800',
    colors: ['#228B22', '#8FBC8F', '#F5F5DC', '#6B8E23', '#2F4F4F']
  },
  { 
    id: 'contemporary', 
    name: 'Contemporary', 
    startYear: 2010, 
    endYear: null, 
    region: 'Global', 
    description: 'Diverse approaches, sustainability, technology integration, parametric design, biophilic design', 
    characteristics: ['Diversity', 'Sustainability', 'Technology', 'Biophilic'], 
    keyFigures: ['Bjarke Ingels', 'Shigeru Ban', 'Thomas Heatherwick'], 
    notableWorks: ['The Shed NYC', 'VIA 57 West', 'Vessel Hudson Yards'],
    imageUrl: 'https://images.unsplash.com/photo-1511452885600-a3d2c9148a31?w=800',
    colors: ['#4169E1', '#32CD32', '#FFD700', '#FF6347', '#000000']
  },
];

interface DesignHistoryTimelineProps {
  onNavigate?: (page: string) => void;
}

export function DesignHistoryTimeline({ onNavigate }: DesignHistoryTimelineProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPeriods = DESIGN_PERIODS.filter(period => 
    searchQuery === '' ||
    period.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    period.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
    period.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    period.characteristics.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const formatYear = (year: number | null) => {
    if (year === null) return 'Present';
    if (year < 0) return `${Math.abs(year)} BCE`;
    return year.toString();
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white transition-colors duration-300 pt-32 pb-24">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-200/60 dark:bg-neutral-900/60 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-full mb-8">
            <Calendar className="w-3.5 h-3.5 text-black/60 dark:text-white/60" />
            <span className="font-pixel text-[10px] tracking-[0.2em] text-black/60 dark:text-white/60">EXPLORE TIMELINE</span>
          </div>
          
          <h1 className="font-display text-black dark:text-white text-5xl md:text-6xl lg:text-7xl mb-6 leading-[0.95] italic">
            Design History Timeline
          </h1>
          <p className="text-xl md:text-2xl text-black/70 dark:text-white/70 leading-relaxed max-w-3xl">
            Click any period to explore. Scroll through history from Ancient Egypt to today.
          </p>
        </motion.div>

        {/* Search */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="mb-8"
        >
          <div className="bg-neutral-200/60 dark:bg-neutral-900/60 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-3xl p-6">
            <label className="font-pixel text-[10px] tracking-[0.3em] text-black/40 dark:text-white/40 mb-3 block">
              SEARCH
            </label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black/40 dark:text-white/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search periods, regions, or characteristics..."
                className="w-full bg-white dark:bg-black border border-black/10 dark:border-white/10 text-black dark:text-white pl-12 pr-4 py-3 rounded-2xl focus:outline-none focus:border-black dark:focus:border-white transition-colors placeholder:text-black/30 dark:placeholder:text-white/30"
              />
            </div>
          </div>
        </motion.div>

        {/* Results Count */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <span className="font-pixel text-[10px] tracking-[0.2em] text-black/40 dark:text-white/40">
            {filteredPeriods.length} PERIODS • CLICK TO EXPAND
          </span>
        </motion.div>

        {/* Timeline */}
        <div className="relative max-w-5xl mx-auto">
          {/* Timeline Line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-black/10 dark:bg-white/10 hidden md:block" />

          {/* Timeline Items */}
          <div className="space-y-6">
            {filteredPeriods.map((period, index) => {
              const isExpanded = expandedId === period.id;
              
              return (
                <motion.div
                  key={period.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className="relative"
                >
                  {/* Timeline Dot */}
                  <div 
                    className={`absolute left-6 top-8 w-5 h-5 rounded-full border-2 transition-all z-10 hidden md:block ${
                      isExpanded 
                        ? 'border-black dark:border-white bg-black dark:bg-white scale-125' 
                        : 'border-black/20 dark:border-white/20 bg-white dark:bg-black'
                    }`}
                  />

                  {/* Compact Card */}
                  <button
                    onClick={() => toggleExpand(period.id)}
                    className={`w-full text-left md:ml-16 bg-neutral-200/60 dark:bg-neutral-900/60 backdrop-blur-xl border rounded-3xl overflow-hidden transition-all ${
                      isExpanded
                        ? 'border-black dark:border-white shadow-lg'
                        : 'border-black/10 dark:border-white/10 hover:border-black/30 dark:hover:border-white/30'
                    }`}
                  >
                    <div className="grid md:grid-cols-[200px_1fr] gap-6 p-6">
                      {/* Thumbnail */}
                      <div className="aspect-video md:aspect-square overflow-hidden rounded-2xl">
                        <img
                          src={period.imageUrl}
                          alt={period.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Summary Info */}
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-pixel text-[10px] tracking-[0.2em] text-black/40 dark:text-white/40 mb-2">
                            {formatYear(period.startYear)} - {formatYear(period.endYear)}
                          </div>
                          <h3 className="text-2xl md:text-3xl font-display italic mb-2">{period.name}</h3>
                          <div className="text-sm text-black/60 dark:text-white/60 mb-4 flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5" />
                            {period.region}
                          </div>
                          
                          {/* Mini Color Palette */}
                          <div className="flex gap-1.5">
                            {period.colors.map((color, i) => (
                              <div
                                key={i}
                                className="w-8 h-8 rounded-lg border border-black/10 dark:border-white/10"
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Expand Icon */}
                        <motion.div
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <ChevronDown className="w-6 h-6 text-black/40 dark:text-white/40" />
                        </motion.div>
                      </div>
                    </div>
                  </button>

                  {/* Expanded Content */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: 'easeInOut' }}
                        className="overflow-hidden md:ml-16"
                      >
                        <div className="bg-neutral-200/60 dark:bg-neutral-900/60 backdrop-blur-xl border-x border-b border-black/10 dark:border-white/10 rounded-b-3xl p-8 md:p-12 space-y-8">
                          
                          {/* Hero Image */}
                          <div className="aspect-[21/9] overflow-hidden rounded-2xl border border-black/10 dark:border-white/10">
                            <img
                              src={period.imageUrl}
                              alt={period.name}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          {/* Color Palette */}
                          <div>
                            <div className="font-pixel text-[10px] tracking-[0.3em] text-black/40 dark:text-white/40 mb-4 flex items-center gap-2">
                              <Palette className="w-3.5 h-3.5" />
                              COLOR PALETTE
                            </div>
                            <div className="grid grid-cols-5 gap-3">
                              {period.colors.map((color, index) => (
                                <div key={index} className="space-y-2">
                                  <div
                                    className="h-20 rounded-2xl border border-black/10 dark:border-white/10"
                                    style={{ backgroundColor: color }}
                                  />
                                  <div className="text-[10px] font-mono text-center text-black/60 dark:text-white/60">
                                    {color}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Description */}
                          <div>
                            <div className="font-pixel text-[10px] tracking-[0.3em] text-black/40 dark:text-white/40 mb-3">OVERVIEW</div>
                            <p className="text-lg leading-relaxed">{period.description}</p>
                          </div>

                          {/* Two Column Layout for Details */}
                          <div className="grid md:grid-cols-2 gap-8">
                            {/* Left Column */}
                            <div className="space-y-8">
                              {/* Characteristics */}
                              <div>
                                <div className="font-pixel text-[10px] tracking-[0.3em] text-black/40 dark:text-white/40 mb-4">KEY CHARACTERISTICS</div>
                                <div className="flex flex-wrap gap-2">
                                  {period.characteristics.map(char => (
                                    <span 
                                      key={char}
                                      className="px-4 py-2 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-full text-sm"
                                    >
                                      {char}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              {/* Key Figures */}
                              {period.keyFigures && period.keyFigures.length > 0 && (
                                <div>
                                  <div className="font-pixel text-[10px] tracking-[0.3em] text-black/40 dark:text-white/40 mb-4 flex items-center gap-2">
                                    <Users className="w-3.5 h-3.5" />
                                    KEY FIGURES
                                  </div>
                                  <div className="space-y-2">
                                    {period.keyFigures.map(figure => (
                                      <div key={figure} className="text-black/70 dark:text-white/70">• {figure}</div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Right Column */}
                            <div>
                              {/* Notable Works */}
                              {period.notableWorks && period.notableWorks.length > 0 && (
                                <div>
                                  <div className="font-pixel text-[10px] tracking-[0.3em] text-black/40 dark:text-white/40 mb-4 flex items-center gap-2">
                                    <Landmark className="w-3.5 h-3.5" />
                                    NOTABLE WORKS
                                  </div>
                                  <div className="space-y-2">
                                    {period.notableWorks.map(work => (
                                      <div key={work} className="text-black/70 dark:text-white/70">• {work}</div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Close Button */}
                          <button
                            onClick={() => setExpandedId(null)}
                            className="w-full py-4 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-black/10 dark:border-white/10 rounded-2xl transition-all flex items-center justify-center gap-2"
                          >
                            <X className="w-4 h-4" />
                            <span className="font-pixel text-[10px] tracking-[0.2em]">CLOSE</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}

            {filteredPeriods.length === 0 && (
              <div className="text-center py-12 text-black/60 dark:text-white/60">
                No periods found matching your search
              </div>
            )}
          </div>
        </div>

        {/* More Apps Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-24 mb-12"
        >
          <div className="text-center mb-12">
            <Grid3x3 className="w-12 h-12 text-black/60 dark:text-white/60 mx-auto mb-6" />
            <h2 className="font-display text-3xl md:text-4xl mb-4 italic">
              More Tools
            </h2>
            <p className="text-lg text-black/60 dark:text-white/60 max-w-2xl mx-auto">
              Explore our full collection of scenic design and architectural reference tools
            </p>
          </div>

          {/* App Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Dimension Reference */}
            <a
              href="/dimension-reference"
              className="bg-neutral-200/60 dark:bg-neutral-900/60 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-3xl overflow-hidden hover:border-black/30 dark:hover:border-white/30 transition-all group"
            >
              <div className="aspect-video overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1670222061552-c273834aee0c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmdXJuaXR1cmUlMjBkaW1lbnNpb24lMjByZWZlcmVuY2V8ZW58MXx8fHwxNzYzOTcwNzc4fDA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Dimension Reference"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6">
                <div className="font-pixel text-[10px] tracking-[0.2em] text-black/40 dark:text-white/40 mb-3">REFERENCE</div>
                <h3 className="font-display text-2xl mb-2 italic">Dimension Reference</h3>
                <p className="text-black/60 dark:text-white/60 mb-4">Comprehensive database of standard dimensions for furniture and architectural elements.</p>
                <div className="flex items-center gap-2 text-black/60 dark:text-white/60">
                  <span className="text-sm">Explore</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </a>

            {/* Classical Architecture */}
            <a
              href="/classical-architecture-guide"
              className="bg-neutral-200/60 dark:bg-neutral-900/60 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-3xl overflow-hidden hover:border-black/30 dark:hover:border-white/30 transition-all group"
            >
              <div className="aspect-video overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1632731187075-11c50d94bd5a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbGFzc2ljYWwlMjBhcmNoaXRlY3R1cmUlMjBjb2x1bW5zfGVufDF8fHx8MTc2Mzk3MDc3OHww&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Classical Architecture"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6">
                <div className="font-pixel text-[10px] tracking-[0.2em] text-black/40 dark:text-white/40 mb-3">REFERENCE</div>
                <h3 className="font-display text-2xl mb-2 italic">Classical Architecture</h3>
                <p className="text-black/60 dark:text-white/60 mb-4">Comprehensive guide to classical orders, molding profiles, and pediment types.</p>
                <div className="flex items-center gap-2 text-black/60 dark:text-white/60">
                  <span className="text-sm">Explore</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </a>

            {/* 3D Print Scale Calculator */}
            <a
              href="/architecture-scale-converter"
              className="bg-neutral-200/60 dark:bg-neutral-900/60 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-3xl overflow-hidden hover:border-black/30 dark:hover:border-white/30 transition-all group"
            >
              <div className="aspect-video overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1544704784-59bcc978c9c4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHwzZCUyMHByaW50ZXIlMjB0ZWNobm9sb2d5fGVufDF8fHx8MTc2Mzk3MDQ5N3ww&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="3D Print Scale Calculator"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6">
                <div className="font-pixel text-[10px] tracking-[0.3em] text-black/40 dark:text-white/40 mb-3">CALCULATION</div>
                <h3 className="font-display text-2xl mb-2 italic">3D Print Scale Calculator</h3>
                <p className="text-black/60 dark:text-white/60 mb-4">Convert theatrical dimensions to 3D printable scale with precision.</p>
                <div className="flex items-center gap-2 text-black/60 dark:text-white/60">
                  <span className="text-sm">Explore</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </a>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
