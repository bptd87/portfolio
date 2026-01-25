import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Ruler, GridFour, Code, MagicWand } from 'phosphor-react';
import { PixelColumn, PixelRuler, PixelPalette, PixelMagnifier } from '../components/icons/PixelIcons';
import { SkeletonAppStudio } from '../components/skeletons/SkeletonAppStudio';
import { useTheme } from '../hooks/useTheme';

type Category = 'orders' | 'moldings' | 'pediments' | 'capitals' | 'monuments';

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
  image?: string;
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
  image?: string;
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
  image?: string;
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
  image?: string;
}

interface Monument {
  id: string;
  name: string;
  category: 'monuments';
  description: string;
  origin: string;
  period: string;
  characteristics: string[];
  dimensions: string;
  image?: string;
  location?: string;
}

type ArchElement = Order | Molding | Pediment | Capital | Monument;

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
    examples: ['Roman basilicas', 'Tuscan villas', 'Renaissance palaces', 'American colonial'],
    image: '/images/studio/tuscan-order-v2-enhanced.png'
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
    examples: ['Parthenon', 'Temple of Hephaestus', 'Lincoln Memorial', 'Greek Revival buildings'],
    image: '/images/studio/doric-order-enhanced.png'
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
    examples: ['Erechtheion', 'Temple of Athena Nike', 'Jefferson Memorial', 'British Museum'],
    image: '/images/studio/ionic-capital-enhanced.png'
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
    examples: ['Pantheon', 'Maison Carrée', 'US Capitol', 'Temple of Olympian Zeus'],
    image: '/images/studio/corinthian-order-enhanced.png'
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
    examples: ['Arch of Titus', 'Baths of Diocletian', 'Renaissance palaces', 'Baroque churches'],
    image: '/images/studio/composite-order-enhanced.png'
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
    alsoKnownAs: 'Egg-and-tongue, Egg-and-anchor',
    image: '/images/studio/egg-and-dart-enhanced.png'
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
    examples: ['Parthenon', 'Pantheon', 'Temple fronts', 'Porticos', 'Georgian architecture'],
    image: '/images/studio/triangular-pediment-v2-enhanced.png'
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
    examples: ['Palazzo Farnese', 'St. Peter\'s', 'Georgian doors', 'Window crowns'],
    image: '/images/studio/segmental-pediment-v2-enhanced.png'
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
    examples: ['Baroque churches', 'Theatrical facades', 'Monuments', 'Elaborate entrances'],
    image: '/images/studio/broken-triangular-pediment-v2-enhanced.png'
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
    examples: ['Baroque doorways', 'Furniture', 'Clocks', 'Decorative arts'],
    image: '/images/studio/broken-segmental-pediment-v2-enhanced.png'
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
    examples: ['American highboys', 'Colonial doorways', 'Chippendale furniture', 'Georgian architecture'],
    image: '/images/studio/swan-neck-pediment-v2-enhanced.png'
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
    examples: ['Aediculae', 'Window crowns', 'Niches', 'Mannerist details'],
    image: '/images/studio/open-pediment-enhanced.png'
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
    examples: ['Baroque altars', 'Church facades', 'Rococo interiors', 'Monuments'],
    image: '/images/studio/curved-broken-pediment-enhanced.png'
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
    examples: ['Baroque churches', 'Theatrical frames', 'Ornate furniture', 'Decorative arts'],
    image: '/images/studio/scrolled-pediment-enhanced.png'
  }
];

const MONUMENTS: Monument[] = [
  {
    id: 'obelisk',
    name: 'EGYPTIAN OBELISK',
    category: 'monuments',
    origin: 'Ancient Egypt',
    period: '2500 BCE - Present',
    description: 'A tall, four-sided, narrow tapering monument which ends in a pyramid-like shape or pyramidion at the top. Originally monolithic.',
    characteristics: ['Monolithic stone', 'Tapered shaft', 'Pyramidion top', 'Hieroglyphic inscriptions', 'Solar symbol'],
    dimensions: 'Height to base ratio typically 9:1 or 10:1',
    location: 'Temple entrances, Plazas',
    image: '/images/studio/egyptian-obelisk-enhanced.png'
  }
];

export function ClassicalArchitectureGuide() {
  const context = useTheme();
  const theme = context?.theme || 'light';
  const isDark = theme === 'dark';

  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<Category>('orders');
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const detailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const allElements: ArchElement[] = [
    ...CLASSICAL_ORDERS,
    ...MOLDING_PROFILES,
    ...PEDIMENT_TYPES,
    ...MONUMENTS,
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

  // Programmatic Colors (App Studio)
  const colors = {
    bgMain: isDark ? '#000000' : '#ffffff',
    textMain: isDark ? '#ffffff' : '#000000',
    textMuted: isDark ? '#a1a1aa' : '#52525b',

    // Cards
    cardBg: isDark ? '#18181b' : '#f4f4f5',
    cardBorder: isDark ? '#27272a' : '#e4e4e7',
    cardGlow: isDark ? '0 0 40px -10px rgba(255,255,255,0.05)' : '0 10px 40px -10px rgba(0,0,0,0.05)',

    // Accents
    accent: isDark ? '#22d3ee' : '#0891b2',
    accentBg: isDark ? 'rgba(34, 211, 238, 0.1)' : 'rgba(8, 145, 178, 0.05)',

    // Filter Pills
    pillActiveBg: isDark ? '#ffffff' : '#000000',
    pillActiveText: isDark ? '#000000' : '#ffffff',
    pillInactiveBg: isDark ? '#18181b' : '#f4f4f5',
    pillInactiveText: isDark ? '#a1a1aa' : '#52525b',
  };

  if (isLoading) {
    return <SkeletonAppStudio />;
  }

  return (
    <div
      className="min-h-screen pt-32 pb-24 overflow-x-hidden transition-colors duration-300 font-sans"
      style={{ backgroundColor: colors.bgMain, color: colors.textMain }}
    >

      {/* Header Section */}
      <div className="px-6 lg:px-12 pb-12">
        <div className="max-w-[1800px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border"
              style={{
                backgroundColor: colors.cardBg,
                borderColor: colors.cardBorder
              }}
            >
              <Ruler className="w-3.5 h-3.5" style={{ color: colors.textMuted }} />
              <span className="font-pixel text-[10px] tracking-[0.2em]" style={{ color: colors.textMuted }}>REFERENCE LIBRARY</span>
            </div>

            <div>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl mb-4 leading-[0.95] italic">
                Classical Architecture
              </h1>
              <p className="text-lg md:text-xl max-w-2xl leading-relaxed" style={{ color: colors.textMuted }}>
                Comprehensive guide to classical orders, molding profiles, and pediment types.
                All measurements based on column diameter (D) as the base module.
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Controls Section */}
      <div className="px-6 lg:px-12 pb-8 sticky top-24 z-20 backdrop-blur-md" style={{ background: `linear-gradient(to bottom, ${colors.bgMain}EE, ${colors.bgMain}00)` }}>
        <div className="max-w-[1800px] mx-auto border-b pb-6" style={{ borderColor: colors.cardBorder }}>
          <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between">

            {/* Tabs */}
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'orders', label: 'ORDERS (5)', icon: PixelColumn },
                { id: 'moldings', label: 'MOLDINGS (12)', icon: PixelRuler },
                { id: 'pediments', label: 'PEDIMENTS (8)', icon: PixelPalette },
                { id: 'monuments', label: 'MONUMENTS (1)', icon: PixelColumn }
              ].map((tab) => {
                const isActive = selectedCategory === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setSelectedCategory(tab.id as Category);
                      setSelectedElement(null);
                    }}
                    className="px-5 py-2.5 rounded-full border transition-all flex items-center gap-2"
                    style={{
                      backgroundColor: isActive ? colors.pillActiveBg : colors.pillInactiveBg,
                      color: isActive ? colors.pillActiveText : colors.pillInactiveText,
                      borderColor: isActive ? colors.pillActiveBg : colors.cardBorder,
                    }}
                  >
                    <span className="font-pixel text-[10px] tracking-[0.2em]">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Search - Compact */}
            <div className="relative w-32 md:w-40 ml-auto shrink-0">
              <div className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: colors.textMuted }}>
                <PixelMagnifier size={12} />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter..."
                className="w-full px-8 py-2 rounded-full border text-xs focus:outline-none transition-all font-pixel tracking-wider"
                style={{
                  backgroundColor: colors.cardBg,
                  borderColor: colors.cardBorder,
                  color: colors.textMain
                }}
              />
            </div>
          </div>
        </div>
      </div>


      {/* Detail View (Overlay) */}
      <AnimatePresence>
        {selectedElementData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedElement(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-4xl max-h-[85vh] overflow-y-auto rounded-[2rem] border shadow-2xl relative"
              style={{
                backgroundColor: isDark ? '#18181b' : '#ffffff',
                borderColor: colors.cardBorder
              }}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedElement(null)}
                aria-label="Close details"
                className="absolute top-6 right-6 p-2 rounded-full border transition-all hover:rotate-90 z-10"
                style={{
                  color: colors.textMuted,
                  borderColor: colors.cardBorder,
                  backgroundColor: isDark ? '#000000' : '#f4f4f5'
                }}
              >
                <X size={20} />
              </button>

              <div className="p-8 md:p-12">
                {/* Header */}
                <div className="mb-8 border-b pb-6" style={{ borderColor: colors.cardBorder }}>
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="px-3 py-1 rounded-md text-[10px] font-pixel tracking-[0.2em] uppercase"
                      style={{ backgroundColor: colors.accentBg, color: colors.accent }}
                    >
                      {selectedElementData.category}
                    </div>
                    <div className="text-[10px] font-pixel tracking-[0.2em] opacity-50">
                      ID: {selectedElementData.id.toUpperCase()}
                    </div>
                  </div>
                  <h2 className="font-display text-4xl mb-4 italic leading-tight">
                    {selectedElementData.name}
                  </h2>
                  <p className="text-lg leading-relaxed opacity-80 max-w-2xl">
                    {selectedElementData.description}
                  </p>
                </div>

                {/* Content Grid */}
                <div className="grid md:grid-cols-2 gap-12">

                  {/* Left Column: Key Data */}
                  <div className="space-y-8">

                    {/* Main Image */}
                    <div className="aspect-video rounded-2xl overflow-hidden border bg-neutral-100 dark:bg-neutral-900" style={{ borderColor: colors.cardBorder }}>
                      {selectedElementData.image ? (
                        <img
                          src={selectedElementData.image}
                          alt={selectedElementData.name}
                          className="w-full h-full object-cover grayscale contrast-125 hover:grayscale-0 transition-all duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-neutral-100 dark:bg-neutral-900 text-neutral-300 dark:text-neutral-700">
                          {selectedElementData.category === 'orders' ? <PixelColumn size={64} /> :
                            selectedElementData.category === 'moldings' ? <PixelRuler size={64} /> :
                              selectedElementData.category === 'pediments' ? <PixelPalette size={64} /> : <PixelColumn size={64} />}
                        </div>
                      )}
                    </div>

                    {/* Characteristics */}
                    <div>
                      <h3 className="font-pixel text-[10px] tracking-[0.2em] mb-4 opacity-50 uppercase">Characteristics</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedElementData.characteristics.map((char) => (
                          <span
                            key={char}
                            className="px-3 py-1.5 rounded-lg border text-xs"
                            style={{
                              borderColor: colors.cardBorder,
                              backgroundColor: colors.cardBg,
                              color: colors.textMuted
                            }}
                          >
                            {char}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Category Specifics */}
                    {selectedElementData.category === 'orders' && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl border" style={{ borderColor: colors.cardBorder }}>
                          <div className="text-[10px] opacity-50 mb-1">ORIGIN</div>
                          <div className="font-medium">{(selectedElementData as Order).origin}</div>
                        </div>
                        <div className="p-4 rounded-2xl border" style={{ borderColor: colors.cardBorder }}>
                          <div className="text-[10px] opacity-50 mb-1">Total Height</div>
                          <div className="font-medium">{(selectedElementData as Order).totalHeight}</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Detailed Specs */}
                  <div className="p-6 rounded-3xl border" style={{ backgroundColor: colors.cardBg, borderColor: colors.cardBorder }}>
                    {selectedElementData.category === 'orders' && (
                      <div className="space-y-4">
                        <h3 className="font-pixel text-[10px] tracking-[0.2em] mb-4 opacity-50 uppercase flex items-center gap-2">
                          <Ruler size={14} /> Proportions (Module D)
                        </h3>
                        {(selectedElementData as Order).proportions.map((dim, i) => (
                          <div key={i} className="flex justify-between items-center py-2 border-b last:border-0" style={{ borderColor: colors.cardBorder }}>
                            <span className="text-sm opacity-70">{dim.part}</span>
                            <span className="font-mono text-sm font-bold" style={{ color: colors.accent }}>{dim.ratio}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {selectedElementData.category === 'moldings' && (
                      <div className="space-y-6">
                        <div>
                          <h3 className="font-pixel text-[10px] tracking-[0.2em] mb-2 opacity-50 uppercase">Profile</h3>
                          <p className="text-sm">{(selectedElementData as Molding).profile}</p>
                        </div>
                        <div>
                          <h3 className="font-pixel text-[10px] tracking-[0.2em] mb-2 opacity-50 uppercase">Common Use</h3>
                          <ul className="list-disc list-inside text-sm opacity-70 space-y-1">
                            {(selectedElementData as Molding).commonUse.map(use => <li key={use}>{use}</li>)}
                          </ul>
                        </div>
                      </div>
                    )}

                    {selectedElementData.category === 'pediments' && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h3 className="font-pixel text-[10px] tracking-[0.2em] mb-1 opacity-50 uppercase">Shape</h3>
                            <p className="text-sm">{(selectedElementData as Pediment).shape}</p>
                          </div>
                          <div>
                            <h3 className="font-pixel text-[10px] tracking-[0.2em] mb-1 opacity-50 uppercase">Period</h3>
                            <p className="text-sm">{(selectedElementData as Pediment).period}</p>
                          </div>
                        </div>

                        {/* Examples */}
                        <div>
                          <h3 className="font-pixel text-[10px] tracking-[0.2em] mb-2 opacity-50 uppercase">Examples</h3>
                          <div className="flex flex-wrap gap-2">
                            {(selectedElementData as Pediment).examples?.map(ex => (
                              <span key={ex} className="text-xs px-2 py-1 bg-black/5 dark:bg-white/10 rounded">
                                {ex}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedElementData.category === 'monuments' && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 rounded-2xl border" style={{ borderColor: colors.cardBorder }}>
                            <div className="text-[10px] opacity-50 mb-1">ORIGIN</div>
                            <div className="font-medium">{(selectedElementData as Monument).origin}</div>
                          </div>
                          <div className="p-4 rounded-2xl border" style={{ borderColor: colors.cardBorder }}>
                            <div className="text-[10px] opacity-50 mb-1">Dimensions</div>
                            <div className="font-medium">{(selectedElementData as Monument).dimensions}</div>
                          </div>
                        </div>
                        <div>
                          <h3 className="font-pixel text-[10px] tracking-[0.2em] mb-2 opacity-50 uppercase">Location</h3>
                          <p className="text-sm opacity-80">{(selectedElementData as Monument).location}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Grid */}
      <div className="px-6 lg:px-12">
        <div className="max-w-[1800px] mx-auto">
          {filteredElements.length === 0 ? (
            <div className="text-center py-24 opacity-50">
              <p className="font-pixel text-sm tracking-widest">NO ELEMENTS FOUND</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredElements.map((element, index) => {
                const isOrder = element.category === 'orders';

                return (
                  <motion.button
                    key={element.id}
                    onClick={() => setSelectedElement(element.id)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                    className="group text-left p-8 rounded-[2rem] border transition-all duration-300 h-full flex flex-col justify-between"
                    style={{
                      backgroundColor: colors.cardBg,
                      borderColor: colors.cardBorder,
                      boxShadow: colors.cardGlow
                    }}
                  >
                    <div>
                      {/* Card Image Placeholder */}
                      <div className="aspect-[4/3] rounded-xl mb-6 overflow-hidden bg-neutral-100 dark:bg-neutral-900 border flex items-center justify-center group-hover:scale-105 transition-transform duration-500" style={{ borderColor: colors.cardBorder }}>
                        {element.image ? (
                          <img
                            src={element.image}
                            alt={element.name}
                            className="w-full h-full object-cover grayscale contrast-125 group-hover:grayscale-0 transition-all duration-500"
                          />
                        ) : (
                          <div className="text-neutral-300 dark:text-neutral-700">
                            {element.category === 'orders' ? <PixelColumn size={32} /> :
                              element.category === 'moldings' ? <PixelRuler size={32} /> : <PixelPalette size={32} />}
                          </div>
                        )}
                      </div>

                      <div className="flex justify-between items-start mb-4">
                        <div
                          className="px-2 py-1 rounded text-[8px] font-pixel tracking-[0.2em] uppercase"
                          style={{ backgroundColor: colors.accentBg, color: colors.accent }}
                        >
                          {element.category}
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <ArrowRight size={20} style={{ color: colors.accent }} />
                        </div>
                      </div>

                      <h3 className="font-display text-2xl mb-3 group-hover:text-cyan-500 transition-colors">
                        {element.name}
                      </h3>

                      <p className="text-sm leading-relaxed opacity-70 mb-6 line-clamp-3">
                        {element.description}
                      </p>
                    </div>

                    <div className="pt-6 border-t flex flex-wrap gap-2" style={{ borderColor: colors.cardBorder }}>
                      {element.characteristics.slice(0, 3).map(char => (
                        <span
                          key={char}
                          className="text-[10px] px-2 py-1 rounded bg-black/5 dark:bg-white/5 opacity-60"
                        >
                          {char}
                        </span>
                      ))}
                      {element.characteristics.length > 3 && (
                        <span className="text-[10px] px-2 py-1 opacity-40">+{element.characteristics.length - 3}</span>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          )}
        </div>
      </div>

    </div >
  );
}

function ArrowRight({ size = 16, style }: { size?: number, style?: React.CSSProperties }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      fill="currentColor"
      viewBox="0 0 256 256"
      style={style}
    >
      <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z"></path>
    </svg>
  );
}

export default ClassicalArchitectureGuide;