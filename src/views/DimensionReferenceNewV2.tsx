import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
    Copy, Check, MagnifyingGlass, ArrowLeft, ArrowRight, Database, CaretLeft, CaretRight,
    Armchair, Table, Bed, Stack, Door, Ladder, 
    Monitor, Storefront, ProjectorScreen,
    PersonSimpleWalk, House,
    PresentationChart, Confetti
} from 'phosphor-react';
import { RelatedTools } from '../components/studio/RelatedTools';
import { SEO } from '../components/SEO';
import { useTheme } from '../hooks/useTheme';

interface DimensionItem {
  name: string;
  category: string;
  subCategory?: string;
  width?: string;
  depth?: string;
  height?: string;
  diameter?: string;
  notes?: string;
  jargon?: string;
}

// Data Categories used for iconography mapping
type CategoryKey = 
    | 'All Categories'
    | 'Furniture - Seating'
    | 'Furniture - Tables'
    | 'Furniture - Storage'
    | 'Furniture - Beds'
    | 'Theatre - Flats'
    | 'Theatre - Platforms'
    | 'Theatre - Doors'
    | 'Theatre - Stairs'
    | 'Event - Tables'
    | 'Event - Staging'
    | 'Event - Seating'
    | 'Event - Linens'
    | 'Experiential - Exhibition'
    | 'Experiential - AV & Tech'
    | 'Experiential - Activation'
    | 'Architecture - Circulation'
    | 'Architecture - Heights'
    | 'Architecture - Counters';

const CATEGORY_ICONS: Record<string, React.ElementType> = {
    'All Categories': Database,
    'Furniture - Seating': Armchair,
    'Furniture - Tables': Table,
    'Furniture - Storage': Stack,
    'Furniture - Beds': Bed,
    'Theatre - Flats': ProjectorScreen,
    'Theatre - Platforms': Stack,
    'Theatre - Doors': Door,
    'Theatre - Stairs': Ladder,
    'Event - Tables': Confetti,
    'Event - Staging': Storefront,
    'Event - Seating': Armchair,
    'Event - Linens': Table,
    'Experiential - Exhibition': Storefront,
    'Experiential - AV & Tech': Monitor,
    'Experiential - Activation': PersonSimpleWalk,
    'Architecture - Circulation': PersonSimpleWalk,
    'Architecture - Heights': House,
    'Architecture - Counters': Table,
};

const CATEGORIES: CategoryKey[] = [
  'All Categories',
  'Experiential - Exhibition',
  'Experiential - AV & Tech',
  'Experiential - Activation',
  'Furniture - Seating',
  'Furniture - Tables',
  'Furniture - Storage',
  'Furniture - Beds',
  'Theatre - Flats',
  'Theatre - Platforms',
  'Theatre - Doors',
  'Theatre - Stairs',
  'Event - Tables',
  'Event - Staging',
  'Event - Seating',
  'Event - Linens',
  'Architecture - Circulation',
  'Architecture - Heights',
  'Architecture - Counters',
];

const DIMENSIONS: DimensionItem[] = [
  // ==================== EXPERIENTIAL - EXHIBITION (NEW) ====================
  { name: 'Standard Booth (10\'x10\')', category: 'Experiential - Exhibition', width: '10\'-0"', depth: '10\'-0"', height: '8\'-0" (pipe & drape)', notes: 'Standard inline booth space' },
  { name: 'Standard Booth (10\'x20\')', category: 'Experiential - Exhibition', width: '20\'-0"', depth: '10\'-0"', height: '8\'-0"', notes: 'Double inline booth' },
  { name: 'Standard Booth (20\'x20\')', category: 'Experiential - Exhibition', width: '20\'-0"', depth: '20\'-0"', height: 'Varies', notes: 'Island booth, height often restricted to 16\'-20\'' },
  { name: 'BeMatrix Frame (1x2.5m)', category: 'Experiential - Exhibition', width: '992mm (39.06")', height: '2480mm (97.64")', depth: '62mm', notes: 'Industry standard modular frame system' },
  { name: 'BeMatrix Frame (1x1m)', category: 'Experiential - Exhibition', width: '992mm (39.06")', height: '992mm (39.06")', depth: '62mm' },
  { name: 'Aluvision Frame (1x2.5m)', category: 'Experiential - Exhibition', width: '992mm', height: '2480mm', depth: '55mm', notes: 'Competitor to BeMatrix' },
  { name: 'Banner Stand (Retractable)', category: 'Experiential - Exhibition', width: '33.5" (Standard)', height: '78" - 80"', depth: '10" (base)', notes: 'Typical pull-up banner visual area' },
  { name: 'Meter Board (Signage)', category: 'Experiential - Exhibition', width: '38" - 39"', height: '84" - 96"', notes: 'Freestanding lobby signage' },
  { name: 'Hanging Sign (Ring 10\')', category: 'Experiential - Exhibition', diameter: '10\'-0"', height: '36" - 48"', notes: 'Overhead rigging required' },
  { name: 'Registration Counter', category: 'Experiential - Exhibition', width: '40" - 60"', depth: '24" - 30"', height: '40" - 42"', notes: 'Standing height transaction surface' },

  // ==================== EXPERIENTIAL - AV & TECH (NEW) ====================
  { name: 'LED Tile (500x500)', category: 'Experiential - AV & Tech', width: '500mm (19.68")', height: '500mm (19.68")', depth: '75-100mm', notes: 'Standard cabinet size' },
  { name: 'LED Tile (500x1000)', category: 'Experiential - AV & Tech', width: '500mm (19.68")', height: '1000mm (39.37")', depth: '75-100mm', notes: 'Double height cabinet' },
  { name: 'Monitor 55" (Display)', category: 'Experiential - AV & Tech', width: '~48.5"', height: '~28"', depth: '2" - 3"', notes: 'Diagonal 54.6"' },
  { name: 'Monitor 65" (Display)', category: 'Experiential - AV & Tech', width: '~57"', height: '~33"', depth: '2" - 3"', notes: 'Diagonal 64.5"' },
  { name: 'Monitor 75" (Display)', category: 'Experiential - AV & Tech', width: '~66"', height: '~38"', depth: '2.5" - 3.5"', notes: 'Diagonal 74.5"' },
  { name: 'Monitor 85" (Display)', category: 'Experiential - AV & Tech', width: '~75"', height: '~43"', depth: '3" - 4"', notes: 'Diagonal 85.6"' },
  { name: 'Monitor 98" (Display)', category: 'Experiential - AV & Tech', width: '~86"', height: '~49"', depth: '3.5" - 4.5"', notes: 'Diagonal 98"' },
  { name: 'iPad (10.9" Air)', category: 'Experiential - AV & Tech', width: '7.02"', height: '9.74"', depth: '0.24"', notes: 'Kiosk standard' },
  { name: 'Server Rack (Standard)', category: 'Experiential - AV & Tech', width: '24"', depth: '36" - 42"', height: '79" (42U) - 84"', notes: 'Standard IT/AV rack footprint' },
  { name: 'Projector (Large Venue)', category: 'Experiential - AV & Tech', width: '24"', depth: '26" - 30"', height: '10" - 14"', notes: 'Approx. 20k lumen class' },

  // ==================== EXPERIENTIAL - ACTIVATION (NEW) ====================
  { name: 'Step & Repeat (8x8)', category: 'Experiential - Activation', width: '8\'-0"', height: '8\'-0"', depth: '18" (feet)', notes: 'Standard photo backdrop' },
  { name: 'Step & Repeat (10x8)', category: 'Experiential - Activation', width: '10\'-0"', height: '8\'-0"', depth: '18" (feet)', notes: 'Wider group photos' },
  { name: 'Photo Booth (Open Air)', category: 'Experiential - Activation', width: '6\'-0"', depth: '8\'-0" - 10\'-0"', height: '8\'-0"', notes: 'Optimal footprint for camera + backdrop + guests' },
  { name: 'Sampling Counter', category: 'Experiential - Activation', width: '30" - 36"', depth: '18" - 24"', height: '36" - 40"', notes: 'Portable demo station' },
  { name: 'Stanchion (Retractable)', category: 'Experiential - Activation', width: '14" (base)', height: '40"', notes: 'Belt length approx 7\' usable' },
  { name: 'Red Carpet Runner', category: 'Experiential - Activation', width: '3\'-0" - 4\'-0"', notes: 'Standard rental widths' },
  { name: 'Gobbo Projector (Source 4)', category: 'Experiential - Activation', width: '12"', depth: '22" - 24"', height: '12"', notes: 'Standard lighting fixture size' },
  { name: 'Charging Station (Kiosk)', category: 'Experiential - Activation', width: '24"', depth: '24"', height: '60" - 72"', notes: 'Freestanding unit' },

  // ==================== FURNITURE - SEATING ====================
  { name: 'Standard Sofa (3-Seat)', category: 'Furniture - Seating', width: '84" - 96"', depth: '36" - 40"', height: '30" - 36"', notes: 'Common residential' },
  { name: 'Loveseat (2-Seat)', category: 'Furniture - Seating', width: '58" - 64"', depth: '36" - 40"', height: '30" - 36"' },
  { name: 'Sectional Corner', category: 'Furniture - Seating', width: '36" - 40"', depth: '36" - 40"', height: '30" - 36"' },
  { name: 'Sectional Chaise', category: 'Furniture - Seating', width: '36" - 40"', depth: '60" - 75"', height: '30" - 36"' },
  { name: 'Armchair', category: 'Furniture - Seating', width: '30" - 36"', depth: '32" - 38"', height: '30" - 36"' },
  { name: 'Club Chair', category: 'Furniture - Seating', width: '32" - 36"', depth: '34" - 38"', height: '28" - 32"' },
  { name: 'Accent Chair', category: 'Furniture - Seating', width: '26" - 30"', depth: '28" - 32"', height: '32" - 36"' },
  { name: 'Wingback Chair', category: 'Furniture - Seating', width: '30" - 34"', depth: '32" - 36"', height: '42" - 48"' },
  { name: 'Rocking Chair', category: 'Furniture - Seating', width: '26" - 30"', depth: '36" - 40"', height: '40" - 44"' },
  { name: 'Recliner', category: 'Furniture - Seating', width: '32" - 40"', depth: '36" - 42"', height: '38" - 42"' },
  { name: 'Ottoman (Small)', category: 'Furniture - Seating', width: '18" - 24"', depth: '18" - 24"', height: '16" - 18"' },
  { name: 'Ottoman (Large)', category: 'Furniture - Seating', width: '36" - 48"', depth: '36" - 48"', height: '16" - 18"' },
  { name: 'Bench (Upholstered)', category: 'Furniture - Seating', width: '48" - 72"', depth: '18" - 24"', height: '18" - 20"' },
  { name: 'Bench (Dining)', category: 'Furniture - Seating', width: '48" - 72"', depth: '14" - 18"', height: '18"' },
  { name: 'Dining Chair (Standard)', category: 'Furniture - Seating', width: '18" - 20"', depth: '20" - 24"', height: '36" - 40"' },
  { name: 'Dining Chair (Armchair)', category: 'Furniture - Seating', width: '22" - 26"', depth: '22" - 26"', height: '36" - 40"' },
  { name: 'Dining Chair (Parsons)', category: 'Furniture - Seating', width: '18" - 20"', depth: '22" - 24"', height: '38" - 40"' },
  { name: 'Counter Stool', category: 'Furniture - Seating', width: '16" - 18"', depth: '16" - 18"', height: '24" - 26"' },
  { name: 'Bar Stool (Standard)', category: 'Furniture - Seating', width: '16" - 18"', depth: '16" - 18"', height: '30"' },

  // ==================== FURNITURE - TABLES ====================
  { name: 'Coffee Table (Rectangle)', category: 'Furniture - Tables', width: '48" - 60"', depth: '24" - 30"', height: '16" - 18"' },
  { name: 'Coffee Table (Square)', category: 'Furniture - Tables', width: '36" - 48"', depth: '36" - 48"', height: '16" - 18"' },
  { name: 'Coffee Table (Round)', category: 'Furniture - Tables', diameter: '36" - 48"', height: '16" - 18"' },
  { name: 'End Table / Side Table', category: 'Furniture - Tables', width: '18" - 24"', depth: '18" - 24"', height: '22" - 26"' },
  { name: 'Dining Table (4-Person)', category: 'Furniture - Tables', width: '48"', depth: '30" - 36"', height: '28" - 30"' },
  { name: 'Dining Table (6-Person)', category: 'Furniture - Tables', width: '60" - 72"', depth: '36" - 42"', height: '28" - 30"' },
  { name: 'Dining Table (8-Person)', category: 'Furniture - Tables', width: '84" - 96"', depth: '36" - 42"', height: '28" - 30"' },
  { name: 'Console Table', category: 'Furniture - Tables', width: '48" - 72"', depth: '12" - 18"', height: '30" - 36"' },
  { name: 'Desk (Standard)', category: 'Furniture - Tables', width: '48" - 60"', depth: '24" - 30"', height: '28" - 30"' },
  { name: 'Kitchen Island', category: 'Furniture - Tables', width: '36" - 48"', depth: '24" - 36"', height: '36"' },

  // ==================== FURNITURE - STORAGE ====================
  { name: 'Bookshelf (Low)', category: 'Furniture - Storage', width: '36" - 48"', depth: '10" - 14"', height: '30" - 36"' },
  { name: 'Bookshelf (Standard)', category: 'Furniture - Storage', width: '36" - 48"', depth: '10" - 14"', height: '72" - 84"' },
  { name: 'Dresser (Standard)', category: 'Furniture - Storage', width: '36" - 48"', depth: '18" - 22"', height: '42" - 48"' },
  { name: 'Wardrobe', category: 'Furniture - Storage', width: '36" - 48"', depth: '20" - 24"', height: '72" - 84"' },
  { name: 'File Cabinet (4-Drawer)', category: 'Furniture - Storage', width: '15"', depth: '24" - 28"', height: '52"' },

   // ==================== FURNITURE - BEDS ====================
  { name: 'Crib', category: 'Furniture - Beds', width: '28"', depth: '52"', height: '35" - 40"' },
  { name: 'Twin Bed', category: 'Furniture - Beds', width: '39"', depth: '75"', height: '25"' },
  { name: 'Twin XL Bed', category: 'Furniture - Beds', width: '39"', depth: '80"', height: '25"' },
  { name: 'Full / Double Bed', category: 'Furniture - Beds', width: '54"', depth: '75"', height: '25"' },
  { name: 'Queen Bed', category: 'Furniture - Beds', width: '60"', depth: '80"', height: '25"' },
  { name: 'King Bed', category: 'Furniture - Beds', width: '76"', depth: '80"', height: '25"' },
  { name: 'California King', category: 'Furniture - Beds', width: '72"', depth: '84"', height: '25"' },
  { name: 'Bunk Bed', category: 'Furniture - Beds', width: '39"', depth: '75"', height: '65" - 72"' },

  // ==================== THEATRE - FLATS ====================
  { name: 'Standard Flat (4\' x 8\')', category: 'Theatre - Flats', width: '4\'-0"', depth: '5.5"', height: '8\'-0"' },
  { name: 'Standard Flat (4\' x 10\')', category: 'Theatre - Flats', width: '4\'-0"', depth: '5.5"', height: '10\'-0"' },
  { name: 'Hollywood Flat (4\' x 8\')', category: 'Theatre - Flats', width: '4\'-0"', depth: '1"', height: '8\'-0"' },
  { name: 'Broadway Flat', category: 'Theatre - Flats', width: '5\'-9"', depth: '5.5"', height: 'Varies' },

  // ==================== THEATRE - PLATFORMS ====================
  { name: 'Stock Platform (4\' x 8\')', category: 'Theatre - Platforms', width: '4\'-0"', depth: '8\'-0"', height: 'Varies' },
  { name: 'Stock Platform (4\' x 4\')', category: 'Theatre - Platforms', width: '4\'-0"', depth: '4\'-0"', height: 'Varies' },
  { name: 'Riser (6")', category: 'Theatre - Platforms', width: '4\'-0"', depth: '8\'-0"', height: '6"' },
  { name: 'Riser (12")', category: 'Theatre - Platforms', width: '4\'-0"', depth: '8\'-0"', height: '12"' },

  // ==================== THEATRE - DOORS & STAIRS ====================
  { name: 'Standard Interior Door', category: 'Theatre - Doors', width: '3\'-0"', depth: '1-3/8"', height: '6\'-8"' },
  { name: 'Double Door', category: 'Theatre - Doors', width: '5\'-0" - 6\'-0"', depth: '1-3/8"', height: '6\'-8"' },
  { name: 'Standard Stair Tread', category: 'Theatre - Stairs', width: '3\'-0" +', depth: '10" - 12"', height: '6" - 8" (rise)' },

  // ==================== EVENT - TABLES & STAGING ====================
  { name: 'Round Table (60")', category: 'Event - Tables', diameter: '60"', height: '30"', notes: 'Seats 8' },
  { name: 'Round Table (72")', category: 'Event - Tables', diameter: '72"', height: '30"', notes: 'Seats 10' },
  { name: 'Cocktail Table (30")', category: 'Event - Tables', diameter: '30"', height: '30" or 42"' },
  { name: 'Rectangular Table (6\')', category: 'Event - Tables', width: '30"', depth: '72"', height: '30"' },
  { name: 'Stage Deck (4\' x 8\')', category: 'Event - Staging', width: '4\'', depth: '8\'', height: 'Varies' },
  { name: 'Pipe & Drape', category: 'Event - Staging', width: 'Varies', height: '8\' - 16\'' },

  // ==================== EVENT - SEATING & LINENS ====================
  { name: 'Chiavari Chair', category: 'Event - Seating', width: '16"', depth: '16"', height: '36"' },
  { name: 'Garden Chair', category: 'Event - Seating', width: '17.5"', depth: '17.5"', height: '30.5"' },
  { name: 'Tablecloth (60" Round)', category: 'Event - Linens', diameter: '120"', notes: 'Floor length' },
  { name: 'Tablecloth (6\' Rect)', category: 'Event - Linens', width: '90"', depth: '132"' },

  // ==================== ARCHITECTURE - ALL ====================
  { name: 'Corridor (Public)', category: 'Architecture - Circulation', width: '5\'-0"', notes: 'Min clear width' },
  { name: 'Door Clearance (ADA)', category: 'Architecture - Circulation', width: '32"', notes: 'Min clear opening' },
  { name: 'Ceiling Height (Res)', category: 'Architecture - Heights', height: '8\'-0" - 9\'-0"' },
  { name: 'Ceiling Height (Comm)', category: 'Architecture - Heights', height: '9\'-0" - 12\'-0"' },
  { name: 'Counter (Kitchen)', category: 'Architecture - Counters', depth: '24"', height: '36"' },
  { name: 'Counter (Bar)', category: 'Architecture - Counters', depth: '24"', height: '42"' },
];

const toMetric = (val: string | undefined) => {
  if (!val) return '';
  // Handle 6'-8" format
  let res = val.replace(/(\d+)'(?:\s*-\s*(\d+(?:\.\d+)?)(?:"|'')?)/g, (_, f, i) => {
    const cm = (parseInt(f) * 30.48) + (parseFloat(i) * 2.54);
    return `${Math.round(cm)} cm`;
  });
  // Handle 6' format (no inches)
  res = res.replace(/(\d+)'(?!-)/g, (_, f) => {
    return `${Math.round(parseInt(f) * 30.48)} cm`;
  });
  // Handle 30" or 992mm format
  res = res.replace(/(\d+(?:\.\d+)?)"/g, (_, i) => {
    return `${Math.round(parseFloat(i) * 2.54)} cm`;
  });
  // Pass through mm if already metric
  if (res.includes('mm')) return res;
  return res;
}

interface Props {
  onNavigate: (page: string) => void;
}

export function DimensionReferenceNewV2({ onNavigate }: Props) {
  // Dual-Mode Support V4 (Programmatic)
  const context = useTheme();
  const theme = context?.theme || 'light'; 

  const isDark = theme === 'dark';

  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>('All Categories');
  const [searchQuery, setSearchQuery] = useState('');
  const [unitSystem, setUnitSystem] = useState<'imperial' | 'metric'>('imperial');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const filteredDimensions = DIMENSIONS.filter(item => {
    const matchesCategory = selectedCategory === 'All Categories' || item.category === selectedCategory;
    const matchesSearch = searchQuery === '' ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.jargon && item.jargon.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const scrollCategories = (direction: 'left' | 'right') => {
      if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollBy({
              left: direction === 'left' ? -200 : 200,
              behavior: 'smooth'
          });
      }
  };

  // Define programatic colors to bypass Tailwind selector issues
  const colors = {
    bgMain: isDark ? '#09090b' : '#fafafa', // zinc-50 vs zinc-950
    bgCard: isDark ? 'rgba(24, 24, 27, 0.6)' : 'rgba(255, 255, 255, 0.8)',
    textMain: isDark ? '#ffffff' : '#171717', // white vs neutral-900
    textMuted: isDark ? '#a1a1aa' : '#737373', // zinc-400 vs neutral-500
    border: isDark ? 'rgba(255, 255, 255, 0.1)' : '#e5e5e5',
    inputBg: isDark ? '#18181b' : '#ffffff',
  };

  return (
    <>
    <SEO 
        title="Dimension Reference DB"
        description="Standard dimensions for theatrical flats, furniture, event staging, AV, and experiential design assets."
        keywords={['dimensions', 'standard furniture sizes', 'theatrical flats', 'event staging', 'av specs', 'trade show booth sizes']}
        />

    <div 
        className="min-h-screen pb-24 font-sans selection:bg-cyan-500/30 transition-colors duration-300"
        style={{ backgroundColor: colors.bgMain, color: colors.textMain }}
    >
      <div className="pt-32 md:pt-40 container mx-auto px-4 max-w-7xl">

        {/* Navigation & Title Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
            <div>
                 <button 
                    onClick={() => onNavigate('app-studio')}
                    className="group flex items-center gap-2 text-sm hover:text-cyan-500 transition-colors mb-3"
                    style={{ color: colors.textMuted }}
                >
                    <ArrowRight className="rotate-180 group-hover:-translate-x-1 transition-transform" />
                    <span>Back to Studio</span>
                </button>
                <div className="flex items-center gap-3">
                    <h1 className="font-display text-4xl md:text-5xl uppercase tracking-tight">
                        Dimension <span 
                            className="bg-clip-text text-transparent"
                            style={{ 
                                backgroundImage: 'linear-gradient(to right, #06b6d4, #3b82f6)', 
                                WebkitBackgroundClip: 'text',
                                color: 'transparent'
                            }}
                        >
                            Reference
                        </span>
                    </h1>

                </div>
            </div>
             
             {/* Unit Toggles */}
             <div 
                className="flex items-center gap-1 rounded-xl p-1 shadow-sm"
                style={{ backgroundColor: isDark ? 'rgba(24, 24, 27, 0.5)' : '#ffffff', borderColor: colors.border, borderWidth: 1 }}
             >
                <button
                    onClick={() => setUnitSystem('imperial')}
                    className="px-6 py-2 rounded-lg text-xs font-bold transition-all"
                    style={unitSystem === 'imperial' ? {
                        backgroundColor: '#06b6d4',
                        color: '#000000',
                        boxShadow: '0 10px 15px -3px rgba(6, 182, 212, 0.2)'
                    } : {
                        color: colors.textMuted
                    }}
                >
                    IMPERIAL
                </button>
                <button
                    onClick={() => setUnitSystem('metric')}
                    className="px-6 py-2 rounded-lg text-xs font-bold transition-all"
                    style={unitSystem === 'metric' ? {
                        backgroundColor: '#06b6d4',
                        color: '#000000',
                        boxShadow: '0 10px 15px -3px rgba(6, 182, 212, 0.2)'
                    } : {
                        color: colors.textMuted
                    }}
                >
                    METRIC
                </button>
            </div>
        </div>

        {/* Search & Category Filter */}
        <div className="space-y-6 mb-12">
            {/* Search Bar */}
            <div className="relative group max-w-lg">
                <MagnifyingGlass 
                    className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors" 
                    size={20} 
                    style={{ color: colors.textMuted }}
                />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for '10x10 booth', 'sofa', or 'LED tile'..."
                    className="w-full rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:ring-1 transition-all font-mono text-sm shadow-sm"
                    style={{ 
                        backgroundColor: colors.inputBg, 
                        borderColor: colors.border, 
                        borderWidth: 1,
                        color: colors.textMain,
                        '--tw-ring-color': 'rgba(6, 182, 212, 0.2)' 
                    } as React.CSSProperties}
                />
            </div>

            {/* Category Pills */}
            <div 
                className="flex items-center gap-4 p-2 rounded-2xl border"
                style={{ 
                    backgroundColor: isDark ? 'rgba(24, 24, 27, 0.4)' : '#f5f5f5', 
                    borderColor: colors.border 
                }}
            >
                <button 
                    onClick={() => scrollCategories('left')}
                    className="p-3 rounded-xl transition-colors flex-shrink-0"
                    style={{ 
                        backgroundColor: isDark ? '#27272a' : '#ffffff', 
                        color: colors.textMuted 
                    }}
                    aria-label="Scroll categories left"
                >
                    <CaretLeft size={20} />
                </button>

                <div 
                    ref={scrollContainerRef}
                    className="flex-1 flex gap-3 overflow-x-auto no-scrollbar mask-linear-fade py-1 scroll-smooth"
                >
                    {CATEGORIES.map((cat) => {
                        const Icon = CATEGORY_ICONS[cat] || Database;
                        const isSelected = selectedCategory === cat;
                        return (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all whitespace-nowrap flex-shrink-0`}
                                style={isSelected ? {
                                    backgroundColor: 'rgba(6, 182, 212, 0.1)',
                                    borderColor: 'rgba(6, 182, 212, 0.5)',
                                    color: '#06b6d4',
                                    fontWeight: 'bold'
                                } : {
                                    backgroundColor: isDark ? '#27272a' : '#ffffff',
                                    borderColor: colors.border,
                                    color: colors.textMuted
                                }}
                            >
                                <Icon size={16} weight={isSelected ? "fill" : "regular"} />
                                <span className="text-xs font-bold uppercase tracking-wide">{cat}</span>
                            </button>
                        );
                    })}
                </div>

                <button 
                    onClick={() => scrollCategories('right')}
                    className="p-3 rounded-xl transition-colors flex-shrink-0"
                    style={{ 
                        backgroundColor: isDark ? '#27272a' : '#ffffff', 
                        color: colors.textMuted 
                    }}
                     aria-label="Scroll categories right"
                >
                    <CaretRight size={20} />
                </button>
            </div>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredDimensions.map((item, index) => (
              <motion.div
                layout
                key={`${item.name}-${item.category}-${index}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="backdrop-blur-sm rounded-2xl p-6 hover:shadow-lg transition-all group relative overflow-hidden"
                style={{ 
                    backgroundColor: colors.bgCard, 
                    borderWidth: 1,
                    borderColor: colors.border
                }}
              >
                 <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                     <button
                        onClick={() => handleCopy(
                            `${item.name}: ${item.width ? `W:${item.width} ` : ''}${item.depth ? `D:${item.depth} ` : ''}${item.height ? `H:${item.height}` : ''}`,
                            item.name
                        )}
                        className="p-2 rounded-lg hover:bg-cyan-500 hover:text-white transition-colors"
                        style={{ 
                            backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#f5f5f5', 
                            color: colors.textMuted 
                        }}
                        title="Copy Data"
                     >
                         {copiedId === item.name ? <Check size={16} weight="bold" /> : <Copy size={16} />}
                     </button>
                 </div>

                <div className="mb-6 pr-8">
                    <div className="text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center gap-2" style={{ color: isDark ? 'rgba(6,182,212,0.7)' : '#0891b2' }}>
                        {item.category.split(' - ')[1] || item.category}
                    </div>
                    <h3 className="text-xl font-display transition-colors" style={{ color: colors.textMain }}>
                        {item.name}
                    </h3>
                </div>

                <div 
                    className="grid grid-cols-2 gap-y-4 gap-x-2 mb-4 font-mono text-sm pt-4"
                    style={{ borderTopWidth: 1, borderColor: colors.border }}
                >
                    {item.width && (
                        <div>
                            <span className="text-[10px] block mb-0.5" style={{ color: colors.textMuted }}>WIDTH</span>
                            <span className="font-medium" style={{ color: isDark ? '#d4d4d8' : '#3f3f46' }}>{unitSystem === 'metric' ? toMetric(item.width) : item.width}</span>
                        </div>
                    )}
                    {item.depth && (
                        <div>
                            <span className="text-[10px] block mb-0.5" style={{ color: colors.textMuted }}>DEPTH</span>
                            <span className="font-medium" style={{ color: isDark ? '#d4d4d8' : '#3f3f46' }}>{unitSystem === 'metric' ? toMetric(item.depth) : item.depth}</span>
                        </div>
                    )}
                    {item.height && (
                        <div>
                            <span className="text-[10px] block mb-0.5" style={{ color: colors.textMuted }}>HEIGHT</span>
                            <span className="font-medium" style={{ color: isDark ? '#d4d4d8' : '#3f3f46' }}>{unitSystem === 'metric' ? toMetric(item.height) : item.height}</span>
                        </div>
                    )}
                    {item.diameter && (
                        <div>
                            <span className="text-[10px] block mb-0.5" style={{ color: colors.textMuted }}>DIA</span>
                            <span className="font-medium" style={{ color: isDark ? '#d4d4d8' : '#3f3f46' }}>{unitSystem === 'metric' ? toMetric(item.diameter) : item.diameter}</span>
                        </div>
                    )}
                </div>

                {(item.notes || item.jargon) && (
                    <div 
                        className="rounded-xl p-3 text-xs space-y-2 border"
                        style={{ 
                            backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : '#f9fafb',
                            borderColor: colors.border
                        }}
                    >
                        {item.notes && (
                            <p style={{ color: isDark ? '#a1a1aa' : '#52525b' }}>
                                <span className="font-bold mr-1" style={{ color: isDark ? 'rgba(6,182,212,0.5)' : '#0891b2' }}>NOTE:</span>
                                {item.notes}
                            </p>
                        )}
                        {item.jargon && (
                            <p className="italic" style={{ color: isDark ? '#a1a1aa' : '#52525b' }}>
                                <span className="font-bold mr-1 mx-1" style={{ color: isDark ? 'rgba(192,132,252,0.5)' : '#a855f7' }}>AKA:</span>
                                {item.jargon}
                            </p>
                        )}
                    </div>
                )}

              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredDimensions.length === 0 && (
            <div className="text-center py-20" style={{ color: colors.textMuted }}>
                <Database size={48} className="mx-auto mb-4 opacity-20" />
                <p>No dimensions found matching "{searchQuery}"</p>
            </div>
        )}

         {/* Footer Related Tools */}
        <div className="pt-20 mt-20" style={{ borderTopWidth: 1, borderColor: colors.border }}>
            <RelatedTools currentToolId="dimension-reference" />
        </div>

      </div>
    </div>
    </>
  );
}

export default DimensionReferenceNewV2;
