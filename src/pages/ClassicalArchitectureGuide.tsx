import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RelatedTools } from '../components/studio/RelatedTools';
import { X, Ruler } from 'phosphor-react';
import { PixelColumn, PixelRuler, PixelPalette, PixelMagnifier } from '../components/icons/PixelIcons';
import { AppStudioLoader } from '../components/AppStudioLoader';

type Category = 'orders' | 'moldings' | 'pediments' | 'capitals';

interface Dimension {
  part: string;
  ratio: string;
  description: string;
}

interface Order {
  id: string;
  name: string;
  category: 'orders';
  origin: string;
  period: string;
  description: string;
  characteristics: string[];
  proportions: Dimension[];
  baseHeight: string;
  shaftHeight: string;
  capitalHeight: string;
  entablatureHeight: string;
  totalHeight: string;
  diameter: string; // base unit
  examples: string[];
}

interface Molding {
  id: string;
  name: string;
  category: 'moldings';
  profile: string; // SVG path or description
  description: string;
  commonUse: string[];
  proportion: string;
  characteristics: string[];
  alsoKnownAs?: string;
}

interface Pediment {
  id: string;
  name: string;
  category: 'pediments';
  shape: string;
  description: string;
  period: string;
  characteristics: string[];
  proportion: string;
  examples: string[];
}

interface Capital {
  id: string;
  name: string;
  category: 'capitals';
  order: string;
  description: string;
  characteristics: string[];
  proportion: string;
  details: string[];
}

type ArchElement = Order | Molding | Pediment | Capital;

const CLASSICAL_ORDERS: Order[] = [
  {
    id: 'tuscan',
    name: 'TUSCAN ORDER',
    category: 'orders',
    origin: 'Roman (simplified Doric)',
    period: '100 BCE - Present',
    description: 'Simplest and most robust order. Plain shaft, simple capital, minimal ornamentation. Roman interpretation of Doric.',
    characteristics: ['Unfluted shaft', 'Simple echinus capital', 'Plain architrave', 'Very sturdy proportions', 'Minimal decoration'],
    proportions: [
      { part: 'Total Height', ratio: '7D', description: 'Seven times the column diameter' },
      { part: 'Column Height', ratio: '6D', description: 'Six diameters including capital' },
      { part: 'Shaft Height', ratio: '5D', description: 'Five diameters' },
      { part: 'Base Height', ratio: '0.5D', description: 'Half diameter' },
      { part: 'Capital Height', ratio: '0.5D', description: 'Half diameter' },
      { part: 'Entablature Height', ratio: '1D', description: 'One diameter total' },
      { part: 'Architrave', ratio: '0.5D', description: 'Half of entablature' },
      { part: 'Frieze', ratio: '0.3D', description: 'Plain, no decoration' },
      { part: 'Cornice', ratio: '0.2D', description: 'Simple projection' },
    ],
    baseHeight: '0.5D',
    shaftHeight: '5D',
    capitalHeight: '0.5D',
    entablatureHeight: '1D',
    totalHeight: '7D',
    diameter: '1D (base unit)',
    examples: ['Roman basilicas', 'Tuscan villas', 'Renaissance palaces', 'American colonial']
  },
  {
    id: 'doric',
    name: 'DORIC ORDER',
    category: 'orders',
    origin: 'Ancient Greece',
    period: '700 BCE - Present',
    description: 'Most ancient and masculine order. Fluted shaft with no base, simple capital, triglyphs and metopes in frieze.',
    characteristics: ['20 flutes', 'No base (Greek)', 'Echinus capital', 'Triglyph frieze', 'Sturdy proportions', 'Sharp arrises'],
    proportions: [
      { part: 'Total Height', ratio: '8D', description: 'Eight times diameter' },
      { part: 'Column Height', ratio: '6D', description: 'Including capital, no base' },
      { part: 'Shaft Height', ratio: '5.5D', description: 'With entasis' },
      { part: 'Capital Height', ratio: '0.5D', description: 'Echinus and abacus' },
      { part: 'Entablature Height', ratio: '2D', description: 'Two diameters' },
      { part: 'Architrave', ratio: '0.75D', description: 'Plain band' },
      { part: 'Frieze', ratio: '0.75D', description: 'Triglyphs + metopes' },
      { part: 'Cornice', ratio: '0.5D', description: 'With mutules' },
      { part: 'Triglyph Width', ratio: '0.5D', description: 'Module unit' },
      { part: 'Metope', ratio: '0.5D', description: 'Square panel' },
    ],
    baseHeight: '0D (no base)',
    shaftHeight: '5.5D',
    capitalHeight: '0.5D',
    entablatureHeight: '2D',
    totalHeight: '8D',
    diameter: '1D',
    examples: ['Parthenon', 'Temple of Hephaestus', 'Lincoln Memorial', 'Greek Revival buildings']
  },
  {
    id: 'ionic',
    name: 'IONIC ORDER',
    category: 'orders',
    origin: 'Ancient Greece (Ionia)',
    period: '600 BCE - Present',
    description: 'More slender and elegant than Doric. Distinguished by volute capital, continuous frieze, and refined proportions.',
    characteristics: ['24 flutes', 'Volute capital', 'Attic base', 'Continuous frieze', 'Slender proportions', 'Refined details'],
    proportions: [
      { part: 'Total Height', ratio: '9.5D', description: 'Nine and half diameters' },
      { part: 'Column Height', ratio: '9D', description: 'Including base and capital' },
      { part: 'Base Height', ratio: '0.5D', description: 'Attic base with torus' },
      { part: 'Shaft Height', ratio: '8D', description: 'Slender, with entasis' },
      { part: 'Capital Height', ratio: '0.5D', description: 'With volutes' },
      { part: 'Volute Width', ratio: '1D', description: 'Eye at center' },
      { part: 'Entablature Height', ratio: '2D', description: 'Lighter than Doric' },
      { part: 'Architrave', ratio: '0.75D', description: 'Three fasciae' },
      { part: 'Frieze', ratio: '0.75D', description: 'Continuous, often carved' },
      { part: 'Cornice', ratio: '0.5D', description: 'With dentils' },
    ],
    baseHeight: '0.5D',
    shaftHeight: '8D',
    capitalHeight: '0.5D',
    entablatureHeight: '2D',
    totalHeight: '9.5D',
    diameter: '1D',
    examples: ['Erechtheion', 'Temple of Athena Nike', 'Jefferson Memorial', 'British Museum']
  },
  {
    id: 'corinthian',
    name: 'CORINTHIAN ORDER',
    category: 'orders',
    origin: 'Ancient Greece/Roman',
    period: '400 BCE - Present',
    description: 'Most ornate order. Slender proportions with elaborate acanthus leaf capital. Favored by Romans.',
    characteristics: ['24 flutes', 'Acanthus capital', 'Two rows of leaves', 'Volutes at corners', 'Very slender', 'Rich ornamentation'],
    proportions: [
      { part: 'Total Height', ratio: '10D', description: 'Ten diameters' },
      { part: 'Column Height', ratio: '10D', description: 'Most slender order' },
      { part: 'Base Height', ratio: '0.5D', description: 'Attic base' },
      { part: 'Shaft Height', ratio: '8.5D', description: 'Very tall and slender' },
      { part: 'Capital Height', ratio: '1D', description: 'Tall with acanthus' },
      { part: 'Abacus Width', ratio: '1.5D', description: 'Wider than shaft' },
      { part: 'Entablature Height', ratio: '2D', description: 'Rich decoration' },
      { part: 'Architrave', ratio: '0.67D', description: 'Three fasciae' },
      { part: 'Frieze', ratio: '0.67D', description: 'Continuous, carved' },
      { part: 'Cornice', ratio: '0.67D', description: 'With modillions' },
    ],
    baseHeight: '0.5D',
    shaftHeight: '8.5D',
    capitalHeight: '1D',
    entablatureHeight: '2D',
    totalHeight: '10D',
    diameter: '1D',
    examples: ['Pantheon', 'Maison Carrée', 'US Capitol', 'Temple of Olympian Zeus']
  },
  {
    id: 'composite',
    name: 'COMPOSITE ORDER',
    category: 'orders',
    origin: 'Roman',
    period: '100 CE - Present',
    description: 'Roman invention combining Ionic volutes with Corinthian acanthus leaves. Most elaborate order.',
    characteristics: ['Ionic volutes', 'Corinthian leaves', 'Combined capital', 'Very ornate', 'Roman innovation', 'Rich entablature'],
    proportions: [
      { part: 'Total Height', ratio: '10D', description: 'Same as Corinthian' },
      { part: 'Column Height', ratio: '10D', description: 'Very slender' },
      { part: 'Base Height', ratio: '0.5D', description: 'Attic base' },
      { part: 'Shaft Height', ratio: '8.5D', description: 'Slender shaft' },
      { part: 'Capital Height', ratio: '1.25D', description: 'Tallest capital' },
      { part: 'Upper Volutes', ratio: '0.5D', description: 'Ionic style' },
      { part: 'Lower Acanthus', ratio: '0.75D', description: 'Corinthian style' },
      { part: 'Entablature Height', ratio: '2D', description: 'Very decorated' },
      { part: 'Architrave', ratio: '0.67D', description: 'Three fasciae' },
      { part: 'Frieze', ratio: '0.67D', description: 'Rich carving' },
      { part: 'Cornice', ratio: '0.67D', description: 'Heavy modillions' },
    ],
    baseHeight: '0.5D',
    shaftHeight: '8.5D',
    capitalHeight: '1.25D',
    entablatureHeight: '2D',
    totalHeight: '10D',
    diameter: '1D',
    examples: ['Arch of Titus', 'Baths of Diocletian', 'Renaissance palaces', 'Baroque churches']
  }
];

const MOLDING_PROFILES: Molding[] = [
  {
    id: 'cyma-recta',
    name: 'CYMA RECTA',
    category: 'moldings',
    profile: 'Double curve: concave above, convex below (S-curve)',
    description: 'Classic S-shaped profile with concave upper section and convex lower section. One of the most common crown moldings.',
    commonUse: ['Cornices', 'Crown molding', 'Chair rails', 'Bed moldings'],
    proportion: 'Height typically 1:1 to projection',
    characteristics: ['S-curve profile', 'Concave top', 'Convex bottom', 'Strong shadow line', 'Classical elegance'],
    alsoKnownAs: 'Ogee'
  },
  {
    id: 'cyma-reversa',
    name: 'CYMA REVERSA',
    category: 'moldings',
    profile: 'Double curve: convex above, concave below (reversed S)',
    description: 'Reverse of cyma recta. Convex upper section, concave lower. Creates inverted S-curve.',
    commonUse: ['Bases', 'Capitals', 'Door surrounds', 'Picture rails'],
    proportion: 'Height equals projection typically',
    characteristics: ['Inverted S-curve', 'Convex top', 'Concave bottom', 'Softer shadow', 'Delicate appearance'],
    alsoKnownAs: 'Reversed Ogee'
  },
  {
    id: 'ovolo',
    name: 'OVOLO',
    category: 'moldings',
    profile: 'Convex quarter-round curve',
    description: 'Simple convex quarter-circle curve. Creates soft, rounded profile. Common in classical architecture.',
    commonUse: ['Column capitals', 'Architraves', 'Door/window frames', 'Base moldings'],
    proportion: 'Radius typically 1/4 to 1/2 of height',
    characteristics: ['Quarter-round', 'Convex curve', 'Soft profile', 'Gentle shadow', 'Versatile'],
    alsoKnownAs: 'Quarter Round, Echinus'
  },
  {
    id: 'cavetto',
    name: 'CAVETTO',
    category: 'moldings',
    profile: 'Concave quarter-round curve',
    description: 'Simple concave quarter-circle curve. Opposite of ovolo. Creates recessed profile.',
    commonUse: ['Cornices', 'Egyptian architecture', 'Under projections', 'Ceiling coves'],
    proportion: 'Radius equals projection',
    characteristics: ['Quarter-round', 'Concave curve', 'Recessed profile', 'Deep shadow', 'Egyptian origin'],
    alsoKnownAs: 'Cove, Hollow'
  },
  {
    id: 'torus',
    name: 'TORUS',
    category: 'moldings',
    profile: 'Large convex semicircular profile',
    description: 'Large, bold convex molding. Semicircular or more than quarter-round. Strong, prominent profile.',
    commonUse: ['Column bases', 'Door frames', 'Large-scale moldings', 'Attic bases'],
    proportion: 'Diameter 1/2 to 3/4 of projection',
    characteristics: ['Large semicircle', 'Bold profile', 'Strong presence', 'Classical bases', 'Structural appearance'],
    alsoKnownAs: 'Half-round'
  },
  {
    id: 'scotia',
    name: 'SCOTIA',
    category: 'moldings',
    profile: 'Deep concave curve between two tori',
    description: 'Deep concave molding, typically found between two convex moldings in column bases. Creates strong shadow.',
    commonUse: ['Column bases', 'Between tori', 'Classical bases', 'Pedestals'],
    proportion: 'Depth greater than projection',
    characteristics: ['Deep concave', 'Strong shadow', 'Between tori', 'Classical bases', 'Structural divider'],
    alsoKnownAs: 'Trochilus'
  },
  {
    id: 'astragal',
    name: 'ASTRAGAL',
    category: 'moldings',
    profile: 'Small convex bead, often with bead-and-reel ornament',
    description: 'Small, rounded bead molding. Often decorated with bead-and-reel or pearl pattern. Delicate divider.',
    commonUse: ['Between shaft and capital', 'Dividing moldings', 'Decorative bands', 'Enriched with ornament'],
    proportion: 'Small, 1/8 to 1/4 module',
    characteristics: ['Small bead', 'Often enriched', 'Bead-and-reel', 'Delicate divider', 'Decorative'],
    alsoKnownAs: 'Bead molding'
  },
  {
    id: 'fillet',
    name: 'FILLET',
    category: 'moldings',
    profile: 'Flat narrow band',
    description: 'Simple flat band or strip. Used to separate other moldings or create sharp edges. No curvature.',
    commonUse: ['Between moldings', 'Column flutes', 'Dividers', 'Sharp edges'],
    proportion: 'Narrow, 1/12 to 1/6 module',
    characteristics: ['Flat band', 'Sharp edges', 'Separates moldings', 'Clean lines', 'Minimal'],
    alsoKnownAs: 'Listel, Band'
  },
  {
    id: 'bead',
    name: 'BEAD',
    category: 'moldings',
    profile: 'Small semicircular convex molding',
    description: 'Small half-round convex molding. Creates a row of rounded beads. Often used in series.',
    commonUse: ['Edge trim', 'Panel divisions', 'Decorative strips', 'Series ornament'],
    proportion: 'Small diameter, 1/8 to 1/4 module',
    characteristics: ['Small half-round', 'Often in series', 'Pearl-like', 'Delicate', 'Edge detail'],
    alsoKnownAs: 'Pearl molding'
  },
  {
    id: 'quirk',
    name: 'QUIRK',
    category: 'moldings',
    profile: 'Sharp recessed channel or groove',
    description: 'Narrow, sharp V-shaped or rectangular groove. Creates sharp shadow line between moldings.',
    commonUse: ['Between moldings', 'Shadow lines', 'Panel edges', 'Detail work'],
    proportion: 'Narrow, sharp depth',
    characteristics: ['Sharp groove', 'V or rectangular', 'Strong shadow', 'Clean separation', 'Precision detail'],
    alsoKnownAs: 'Groove, Channel'
  },
  {
    id: 'corona',
    name: 'CORONA',
    category: 'moldings',
    profile: 'Large flat projection with vertical face',
    description: 'Main projecting element of cornice with vertical face and flat soffit. Creates primary drip edge.',
    commonUse: ['Cornices', 'Entablatures', 'Main projection', 'Drip edge'],
    proportion: 'Large projection, 1 to 1.5 module',
    characteristics: ['Flat projection', 'Vertical face', 'Drip edge', 'Primary element', 'Bold shadow'],
    alsoKnownAs: 'Drip, Projection'
  },
  {
    id: 'egg-and-dart',
    name: 'EGG-AND-DART',
    category: 'moldings',
    profile: 'Ovolo enriched with alternating egg and dart ornament',
    description: 'Decorative enrichment for ovolo moldings. Alternating egg shapes and dart/arrow points.',
    commonUse: ['Enriched ovolo', 'Capitals', 'Architraves', 'Decorative bands'],
    proportion: 'Applied to ovolo base',
    characteristics: ['Alternating pattern', 'Eggs and darts', 'Rich ornament', 'Classical detail', 'Hand-carved or cast'],
    alsoKnownAs: 'Egg-and-tongue, Egg-and-anchor'
  }
];

const PEDIMENT_TYPES: Pediment[] = [
  {
    id: 'triangular',
    name: 'TRIANGULAR PEDIMENT',
    category: 'pediments',
    shape: 'Isosceles triangle',
    description: 'Classic Greek/Roman pediment. Two raking cornices meet at apex, base is horizontal cornice. Standard temple form.',
    period: 'Ancient Greece - Present',
    characteristics: ['Triangular shape', 'Raking cornices', 'Tympanum field', 'Classical proportions', 'Sculpture field'],
    proportion: 'Height = 1/9 to 1/7 of width. Angle typically 15-20°',
    examples: ['Parthenon', 'Pantheon', 'Temple fronts', 'Porticos', 'Georgian architecture']
  },
  {
    id: 'segmental',
    name: 'SEGMENTAL PEDIMENT',
    category: 'pediments',
    shape: 'Curved segment of circle',
    description: 'Curved pediment forming arc segment. Gentler than triangular. Common in Renaissance and Baroque.',
    period: 'Renaissance - Present',
    characteristics: ['Curved arc', 'Softer profile', 'Roman influence', 'Door/window crowns', 'Classical alternative'],
    proportion: 'Rise = 1/5 to 1/7 of span. Radius varies',
    examples: ['Palazzo Farnese', 'St. Peter\'s', 'Georgian doors', 'Window crowns']
  },
  {
    id: 'broken-triangular',
    name: 'BROKEN PEDIMENT (Triangular)',
    category: 'pediments',
    shape: 'Triangular with open apex',
    description: 'Triangular pediment with central break at apex. Space for sculpture, urn, or cartouche. Baroque innovation.',
    period: 'Baroque - Present',
    characteristics: ['Open center', 'Broken apex', 'Sculpture space', 'Baroque drama', 'Decorative opportunity'],
    proportion: 'Standard triangle with 1/4 to 1/3 central opening',
    examples: ['Baroque churches', 'Theatrical facades', 'Monuments', 'Elaborate entrances']
  },
  {
    id: 'broken-segmental',
    name: 'BROKEN PEDIMENT (Segmental)',
    category: 'pediments',
    shape: 'Segmental arc with open center',
    description: 'Segmental pediment with central break. Curves stop before meeting. Space for ornament.',
    period: 'Baroque - Present',
    characteristics: ['Open arc', 'Curved ends', 'Ornament space', 'Baroque style', 'Dynamic composition'],
    proportion: 'Arc segment with 1/4 to 1/3 central gap',
    examples: ['Baroque doorways', 'Furniture', 'Clocks', 'Decorative arts']
  },
  {
    id: 'swan-neck',
    name: 'SWAN-NECK PEDIMENT',
    category: 'pediments',
    shape: 'Two S-curves meeting at center',
    description: 'Two opposing S-curves (cyma curves) rising to central ornament. Elegant, flowing form. American specialty.',
    period: '18th Century - Present',
    characteristics: ['S-curves', 'Flowing lines', 'Central finial', 'American Colonial', 'Furniture style'],
    proportion: 'Curves rise 1/6 to 1/5 of width. Central ornament 1/4 width',
    examples: ['American highboys', 'Colonial doorways', 'Chippendale furniture', 'Georgian architecture']
  },
  {
    id: 'open',
    name: 'OPEN PEDIMENT',
    category: 'pediments',
    shape: 'Incomplete base with raking sides',
    description: 'Pediment with open bottom. Raking cornices without horizontal base. Supports from columns visible.',
    period: 'Renaissance - Present',
    characteristics: ['Open base', 'Raking sides only', 'Column support visible', 'Light appearance', 'Airy composition'],
    proportion: 'Standard triangle angle without base cornice',
    examples: ['Aediculae', 'Window crowns', 'Niches', 'Mannerist details']
  },
  {
    id: 'curved-broken',
    name: 'CURVED BROKEN PEDIMENT',
    category: 'pediments',
    shape: 'Two curved segments with gap',
    description: 'Two quarter-circle curves leaving central opening. More circular than segmental. Ornate Baroque form.',
    period: 'Baroque - Rococo',
    characteristics: ['Circular segments', 'Wide opening', 'Baroque ornament', 'Sculptural', 'Theatrical'],
    proportion: 'Quarter circles with 1/3 to 1/2 central opening',
    examples: ['Baroque altars', 'Church facades', 'Rococo interiors', 'Monuments']
  },
  {
    id: 'scrolled',
    name: 'SCROLLED PEDIMENT',
    category: 'pediments',
    shape: 'Scrolls or volutes instead of straight rakes',
    description: 'Pediment composed of scrolls or volutes rather than straight lines. Very ornate Baroque invention.',
    period: 'Baroque - Present',
    characteristics: ['Scroll forms', 'Volutes', 'No straight lines', 'Highly ornate', 'Sculptural quality'],
    proportion: 'Scrolls typically 1/3 width each, central gap',
    examples: ['Baroque churches', 'Theatrical frames', 'Ornate furniture', 'Decorative arts']
  }
];

export function ClassicalArchitectureGuide() {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<Category>('orders');
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const detailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1800);
    return () => clearTimeout(timer);
  }, []);

  const allElements: ArchElement[] = [
    ...CLASSICAL_ORDERS,
    ...MOLDING_PROFILES,
    ...PEDIMENT_TYPES,
  ];

  const filteredElements = allElements.filter(element => {
    const matchesCategory = element.category === selectedCategory;
    const matchesSearch = searchQuery === '' ||
      element.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      element.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      element.characteristics.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const selectedElementData = selectedElement
    ? allElements.find(e => e.id === selectedElement)
    : null;

  if (isLoading) {
    return <AppStudioLoader appName="CLASSICAL_ARCHITECTURE_REFERENCE" onComplete={() => setIsLoading(false)} />;
  }

  return (
    <div className="min-h-screen bg-black text-accent-brand font-retro relative overflow-hidden">
      {/* Blueprint grid background */}
      <div
        className="fixed inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(var(--accent-dark-rgb), 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(var(--accent-dark-rgb), 0.3) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      />

      {/* Blueprint paper texture */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(0,0,0,0.2)_100%)] pointer-events-none" />

      <div className="relative z-10 p-6 pt-24 pb-24">
        <div className="max-w-[1600px] mx-auto">

          {/* Technical Header */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8 border-2 border-accent-brand bg-[#0a1628]/95 p-6 shadow-[0_0_30px_rgba(var(--accent-dark-rgb),0.4)]"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="text-accent-brand/60 text-xs mb-2 uppercase tracking-wider">
                  {'>'} BRANDON PT DAVIS // SCENIC DESIGN STUDIO
                </div>
                <div className="text-accent-brand/60 text-xs mb-2 uppercase tracking-wider">
                  {'>'} ART &times; TECHNOLOGY &times; STAGECRAFT
                </div>
                <h1 className="text-3xl md:text-4xl mb-3 text-accent-brand tracking-wide uppercase">
                  Classical Architecture
                </h1>
                <div className="text-accent-brand/70 text-sm">
                  {'>'} Comprehensive guide to orders, moldings, pediments & proportional dimensions
                </div>
                <div className="text-accent-brand/70 text-sm">
                  {'>'} All measurements based on column diameter (D) as base module
                </div>
              </div>
              <PixelColumn size={64} className="text-accent-brand opacity-40" />
            </div>

            {/* Category Tabs */}
            <div className="mt-6 border-t border-accent-brand/30 pt-4">
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => {
                    setSelectedCategory('orders');
                    setSelectedElement(null);
                  }}
                  className={`px-4 py-2 border transition-all text-sm uppercase tracking-wider ${selectedCategory === 'orders'
                    ? 'bg-accent-brand text-black border-accent-brand'
                    : 'bg-transparent text-accent-brand border-accent-brand/50 hover:border-accent-brand'
                    }`}
                >
                  <PixelColumn size={16} className="inline mr-2" />
                  Orders (5)
                </button>
                <button
                  onClick={() => {
                    setSelectedCategory('moldings');
                    setSelectedElement(null);
                  }}
                  className={`px-4 py-2 border transition-all text-sm uppercase tracking-wider ${selectedCategory === 'moldings'
                    ? 'bg-accent-brand text-black border-accent-brand'
                    : 'bg-transparent text-accent-brand border-accent-brand/50 hover:border-accent-brand'
                    }`}
                >
                  <PixelRuler size={16} className="inline mr-2" />
                  Moldings (12)
                </button>
                <button
                  onClick={() => {
                    setSelectedCategory('pediments');
                    setSelectedElement(null);
                  }}
                  className={`px-4 py-2 border transition-all text-sm uppercase tracking-wider ${selectedCategory === 'pediments'
                    ? 'bg-accent-brand text-black border-accent-brand'
                    : 'bg-transparent text-accent-brand border-accent-brand/50 hover:border-accent-brand'
                    }`}
                >
                  <PixelPalette size={16} className="inline mr-2" />
                  Pediments (8)
                </button>
              </div>

              {/* Search */}
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <PixelMagnifier size={16} className="text-accent-brand/60" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`SEARCH ${selectedCategory.toUpperCase()}...`}
                  className="w-full bg-[#0a1628] border border-accent-brand/50 text-accent-brand px-10 py-2 text-sm focus:border-accent-brand focus:outline-none placeholder-accent-brand/30"
                />
              </div>

              {searchQuery && (
                <div className="mt-2 text-xs text-accent-brand/70">
                  FOUND {filteredElements.length} MATCHING ELEMENTS
                </div>
              )}
            </div>
          </motion.div>

          {/* Elements Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredElements.map((element, index) => (
                <motion.button
                  key={element.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => setSelectedElement(element.id)}
                  className={`text-left border-2 p-4 transition-all group ${selectedElement === element.id
                    ? 'border-accent-brand bg-accent-brand/10 shadow-[0_0_20px_rgba(var(--accent-dark-rgb),0.4)]'
                    : 'border-accent-brand/30 bg-[#0a1628]/80 hover:border-accent-brand hover:bg-accent-brand/5'
                    }`}
                >
                  <div className="text-accent-brand font-bold text-sm mb-2 uppercase tracking-wider">
                    {element.name}
                  </div>
                  <div className="text-accent-brand/70 text-xs mb-3 leading-relaxed">
                    {element.description}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {element.characteristics.slice(0, 3).map(char => (
                      <span
                        key={char}
                        className="text-[10px] px-2 py-1 border border-accent-brand/30 text-accent-brand/60 uppercase"
                      >
                        {char}
                      </span>
                    ))}
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Detail Panel */}
          <AnimatePresence>
            {selectedElementData && (
              <motion.div
                ref={detailRef}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="border-2 border-accent-brand bg-[#0a1628]/95 shadow-[0_0_40px_rgba(var(--accent-dark-rgb),0.5)] relative"
              >
                {/* Close button */}
                <button
                  onClick={() => setSelectedElement(null)}
                  title="Close Detail View"
                  aria-label="Close"
                  className="absolute top-4 right-4 z-10 p-2 border border-accent-brand bg-[#0a1628] text-accent-brand hover:bg-accent-brand hover:text-black transition-all"
                >
                  <X size={20} />
                </button>

                <div className="p-8">
                  {/* Header */}
                  <div className="mb-6 border-b-2 border-accent-brand/30 pb-4">
                    <div className="text-xs text-accent-brand/60 mb-2 uppercase tracking-widest">
                      DRAWING NO: {selectedElementData.id.toUpperCase()} // REV: A
                    </div>
                    <h2 className="text-3xl text-accent-brand mb-3 uppercase tracking-wider">
                      {selectedElementData.name}
                    </h2>
                    <p className="text-accent-brand/80 leading-relaxed mb-4">
                      {selectedElementData.description}
                    </p>

                    {/* Category-specific info */}
                    {selectedElementData.category === 'orders' && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="text-accent-brand/60 text-xs mb-1">ORIGIN:</div>
                          <div className="text-accent-brand">{(selectedElementData as Order).origin}</div>
                        </div>
                        <div>
                          <div className="text-accent-brand/60 text-xs mb-1">PERIOD:</div>
                          <div className="text-accent-brand">{(selectedElementData as Order).period}</div>
                        </div>
                        <div>
                          <div className="text-accent-brand/60 text-xs mb-1">TOTAL HEIGHT:</div>
                          <div className="text-accent-brand">{(selectedElementData as Order).totalHeight}</div>
                        </div>
                        <div>
                          <div className="text-accent-brand/60 text-xs mb-1">BASE MODULE:</div>
                          <div className="text-accent-brand">{(selectedElementData as Order).diameter}</div>
                        </div>
                      </div>
                    )}

                    {selectedElementData.category === 'moldings' && (
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-accent-brand/60 text-xs mb-1">PROFILE:</div>
                          <div className="text-accent-brand">{(selectedElementData as Molding).profile}</div>
                        </div>
                        <div>
                          <div className="text-accent-brand/60 text-xs mb-1">PROPORTION:</div>
                          <div className="text-accent-brand">{(selectedElementData as Molding).proportion}</div>
                        </div>
                      </div>
                    )}

                    {selectedElementData.category === 'pediments' && (
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-accent-brand/60 text-xs mb-1">SHAPE:</div>
                          <div className="text-accent-brand">{(selectedElementData as Pediment).shape}</div>
                        </div>
                        <div>
                          <div className="text-accent-brand/60 text-xs mb-1">PERIOD:</div>
                          <div className="text-accent-brand">{(selectedElementData as Pediment).period}</div>
                        </div>
                        <div>
                          <div className="text-accent-brand/60 text-xs mb-1">PROPORTION:</div>
                          <div className="text-accent-brand">{(selectedElementData as Pediment).proportion}</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Content Grid */}
                  <div className="grid lg:grid-cols-2 gap-8">

                    {/* Left Column - Characteristics & Proportions */}
                    <div className="space-y-6">

                      {/* Characteristics */}
                      <div>
                        <div className="text-accent-brand text-sm mb-3 border-b border-accent-brand/30 pb-2 uppercase tracking-wider">
                          Characteristics
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {selectedElementData.characteristics.map((char, i) => (
                            <motion.div
                              key={char}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.05 }}
                              className="text-xs text-accent-brand/80 border border-accent-brand/30 bg-accent-brand/5 px-3 py-2"
                            >
                              • {char}
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      {/* Proportions (Orders only) */}
                      {selectedElementData.category === 'orders' && (
                        <div>
                          <div className="text-accent-brand text-sm mb-3 border-b border-accent-brand/30 pb-2 uppercase tracking-wider">
                            Proportional Dimensions
                          </div>
                          <div className="space-y-3">
                            {(selectedElementData as Order).proportions.map((dim, i) => (
                              <motion.div
                                key={dim.part}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.03 }}
                                className="border-l-2 border-accent-brand/50 pl-3 py-2"
                              >
                                <div className="flex items-baseline justify-between mb-1">
                                  <span className="text-accent-brand text-xs font-bold uppercase">{dim.part}</span>
                                  <span className="text-accent-brand text-sm font-mono">{dim.ratio}</span>
                                </div>
                                <div className="text-accent-brand/60 text-[10px]">
                                  {dim.description}
                                </div>
                              </motion.div>
                            ))}
                          </div>

                          <div className="mt-4 p-3 border border-accent-brand/30 bg-accent-brand/5">
                            <div className="text-[10px] text-accent-brand/70 mb-2">
                              NOTE: All dimensions expressed as multiples of column diameter (D).
                              For a 12" diameter column, multiply all ratios by 12.
                            </div>
                            <div className="text-[10px] text-accent-brand/60">
                              Example: If D = 12", then total height {(selectedElementData as Order).totalHeight} = {
                                parseFloat((selectedElementData as Order).totalHeight) * 12
                              }"
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Common Use (Moldings only) */}
                      {selectedElementData.category === 'moldings' && (
                        <div>
                          <div className="text-accent-brand text-sm mb-3 border-b border-accent-brand/30 pb-2 uppercase tracking-wider">
                            Common Applications
                          </div>
                          <div className="space-y-2">
                            {(selectedElementData as Molding).commonUse.map((use) => (
                              <div
                                key={use}
                                className="text-xs text-accent-brand/80 border-l-2 border-accent-brand/50 pl-3 py-1"
                              >
                                • {use}
                              </div>
                            ))}
                          </div>
                          {(selectedElementData as Molding).alsoKnownAs && (
                            <div className="mt-4 p-3 border border-accent-brand/30 bg-accent-brand/5">
                              <div className="text-[10px] text-accent-brand/70">
                                ALSO KNOWN AS: {(selectedElementData as Molding).alsoKnownAs}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Examples */}
                      {('examples' in selectedElementData) && (
                        <div>
                          <div className="text-accent-brand text-sm mb-3 border-b border-accent-brand/30 pb-2 uppercase tracking-wider">
                            Notable Examples
                          </div>
                          <div className="space-y-2">
                            {selectedElementData.examples.map((example) => (
                              <div
                                key={example}
                                className="text-xs text-accent-brand/80 border-l-2 border-accent-brand/50 pl-3 py-1"
                              >
                                • {example}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right Column - Visual Diagram Placeholder */}
                    <div className="space-y-6">
                      <div>
                        <div className="text-accent-brand text-sm mb-3 border-b border-accent-brand/30 pb-2 uppercase tracking-wider">
                          Technical Drawing
                        </div>
                        <div className="border-2 border-accent-brand/50 bg-accent-brand/5 aspect-[3/4] flex items-center justify-center relative">
                          {/* Blueprint grid */}
                          <div
                            className="absolute inset-0 opacity-20"
                            style={{
                              backgroundImage: 'linear-gradient(rgba(var(--accent-dark-rgb), 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(var(--accent-dark-rgb), 0.5) 1px, transparent 1px)',
                              backgroundSize: '20px 20px',
                            }}
                          />

                          {/* Placeholder content */}
                          <div className="text-center z-10 p-8">
                            <Ruler size={64} weight="thin" className="text-accent-brand/30 mx-auto mb-4" />
                            <div className="text-accent-brand/50 text-sm mb-2 uppercase tracking-wider">
                              Technical Elevation
                            </div>
                            <div className="text-accent-brand/30 text-xs">
                              Detailed CAD drawing with dimensions
                            </div>
                            <div className="text-accent-brand/30 text-xs mt-4">
                              [Diagram visualization coming soon]
                            </div>
                          </div>

                          {/* Scale indicator */}
                          <div className="absolute bottom-4 right-4 text-[10px] text-accent-brand/60 font-mono">
                            SCALE: 1:10
                          </div>
                        </div>

                        {/* Drawing notes */}
                        <div className="mt-4 space-y-2">
                          <div className="text-[10px] text-accent-brand/60 border-l-2 border-accent-brand/30 pl-2">
                            ALL DIMENSIONS IN MODULES (D = DIAMETER)
                          </div>
                          <div className="text-[10px] text-accent-brand/60 border-l-2 border-accent-brand/30 pl-2">
                            VERIFY ALL DIMENSIONS BEFORE CONSTRUCTION
                          </div>
                          <div className="text-[10px] text-accent-brand/60 border-l-2 border-accent-brand/30 pl-2">
                            FOR CONSTRUCTION DETAILS SEE SHEET A2.0
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Technical footer */}
                <div className="border-t-2 border-accent-brand/30 p-4 bg-accent-brand/5">
                  <div className="grid grid-cols-3 gap-4 text-[10px] text-accent-brand/60">
                    <div>
                      <div className="font-bold mb-1">DRAWN BY:</div>
                      <div>Classical Architecture Reference System</div>
                    </div>
                    <div>
                      <div className="font-bold mb-1">DATE:</div>
                      <div>{new Date().toLocaleDateString()}</div>
                    </div>
                    <div>
                      <div className="font-bold mb-1">SHEET:</div>
                      <div>REF-{selectedElementData.id.toUpperCase()}</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8 border-2 border-accent-brand bg-[#0a1628]/95 p-6 text-xs text-accent-brand/60"
          >
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <div className="text-accent-brand mb-2 uppercase tracking-wider">Reference System</div>
                <div>• 5 Classical Orders catalogued</div>
                <div>• 12 Standard molding profiles</div>
                <div>• 8 Pediment variations</div>
                <div>• Proportional dimensions included</div>
              </div>
              <div>
                <div className="text-accent-brand mb-2 uppercase tracking-wider">Usage Notes</div>
                <div>• All dimensions use module (D)</div>
                <div>• D = column diameter at base</div>
                <div>• Scale proportions for your needs</div>
                <div>• Based on classical treatises</div>
              </div>
              <div>
                <div className="text-accent-brand mb-2 uppercase tracking-wider">Sources</div>
                <div>• Vitruvius - De Architectura</div>
                <div>• Palladio - Four Books</div>
                <div>• Vignola - Five Orders</div>
                <div>• Modern architectural standards</div>
              </div>
            </div>
          </motion.div>

        </div>

        {/* Related Tools */}
        <RelatedTools currentToolId="classical-architecture-guide" />
      </div>
    </div>
  );
}