import { useState, useEffect } from 'react';
import { MagnifyingGlass, Hash, Tag, Check } from 'phosphor-react';
import { motion } from 'motion/react';
import { RelatedTools } from '../components/studio/RelatedTools';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

// Common Commercial Paints Database
interface PaintColor {
  id: string;
  brand: string;
  name: string;
  hex: string;
  code: string;
}

const PAINT_DATABASE: PaintColor[] = [
  // BENJAMIN MOORE
  { id: 'bm-30', brand: 'Benjamin Moore', name: 'Caliente', hex: '#9F3C3C', code: 'AF-290' },
  { id: 'bm-31', brand: 'Benjamin Moore', name: 'Million Dollar Red', hex: '#C62D2D', code: '2003-10' },
  { id: 'bm-54', brand: 'Benjamin Moore', name: 'Raspberry Blush', hex: '#D66354', code: '2008-30' },
  { id: 'bm-87', brand: 'Benjamin Moore', name: 'Red Rock', hex: '#8C3834', code: '2005-10' },
  { id: 'bm-88', brand: 'Benjamin Moore', name: 'Heritage Red', hex: '#A52228', code: 'HC-181' },
  { id: 'bm-89', brand: 'Benjamin Moore', name: 'Coral Reef', hex: '#EF8377', code: '012' },
  { id: 'bm-100', brand: 'Benjamin Moore', name: 'Neon Red', hex: '#D9381E', code: '2087-10' },
  { id: 'bm-101', brand: 'Benjamin Moore', name: 'Vermilion', hex: '#C74031', code: '2002-10' },
  { id: 'bm-102', brand: 'Benjamin Moore', name: 'Pink Damask', hex: '#F4CACC', code: 'OC-72' },
  { id: 'bm-103', brand: 'Benjamin Moore', name: 'Peony', hex: '#D6466B', code: '2079-30' },
  { id: 'bm-104', brand: 'Benjamin Moore', name: 'Hot Lips', hex: '#D95076', code: '2077-30' },
  { id: 'bm-105', brand: 'Benjamin Moore', name: 'Magenta', hex: '#9E3057', code: '2077-10' },
  { id: 'bm-106', brand: 'Benjamin Moore', name: 'Razzle Dazzle', hex: '#C95369', code: '2169-40' },
  { id: 'bm-53', brand: 'Benjamin Moore', name: 'Hawthorne Yellow', hex: '#F1E095', code: 'HC-4' },
  { id: 'bm-93', brand: 'Benjamin Moore', name: 'Goldfinch', hex: '#FAD670', code: '187' },
  { id: 'bm-94', brand: 'Benjamin Moore', name: 'Stuart Gold', hex: '#D6AC5B', code: 'HC-10' },
  { id: 'bm-107', brand: 'Benjamin Moore', name: 'Electric Orange', hex: '#E7652D', code: '2015-10' },
  { id: 'bm-108', brand: 'Benjamin Moore', name: 'Tangerine Zing', hex: '#ED7935', code: '2016-20' },
  { id: 'bm-109', brand: 'Benjamin Moore', name: 'Startling Orange', hex: '#EC6A37', code: '2014-20' },
  { id: 'bm-110', brand: 'Benjamin Moore', name: 'Sunburst', hex: '#F7C64A', code: '2023-40' },
  { id: 'bm-111', brand: 'Benjamin Moore', name: 'Banana Yellow', hex: '#FBE378', code: '2022-40' },
  { id: 'bm-112', brand: 'Benjamin Moore', name: 'Yellow Flash', hex: '#F5D658', code: '2021-40' },
  { id: 'bm-28', brand: 'Benjamin Moore', name: 'Hunter Green', hex: '#3A4B41', code: '2041-10' },
  { id: 'bm-47', brand: 'Benjamin Moore', name: 'Guilford Green', hex: '#B9C0A4', code: 'HC-116' },
  { id: 'bm-81', brand: 'Benjamin Moore', name: 'Tarrytown Green', hex: '#37453D', code: 'HC-134' },
  { id: 'bm-113', brand: 'Benjamin Moore', name: 'Stem Green', hex: '#98AE45', code: '2029-40' },
  { id: 'bm-114', brand: 'Benjamin Moore', name: 'Lime Green', hex: '#7E9B40', code: '2026-10' },
  { id: 'bm-115', brand: 'Benjamin Moore', name: 'Kelly Green', hex: '#3C7C45', code: '2037-10' },
  { id: 'bm-116', brand: 'Benjamin Moore', name: 'Emerald Isle', hex: '#337256', code: '2039-20' },
  { id: 'bm-117', brand: 'Benjamin Moore', name: 'Teal', hex: '#1A646E', code: '2055-10' },
  { id: 'bm-118', brand: 'Benjamin Moore', name: 'Caribbean Blue Water', hex: '#5097A4', code: '2055-30' },
  { id: 'bm-119', brand: 'Benjamin Moore', name: 'Peacock Blue', hex: '#00627C', code: '2049-20' },
  { id: 'bm-23', brand: 'Benjamin Moore', name: 'Hale Navy', hex: '#4B535E', code: 'HC-154' },
  { id: 'bm-24', brand: 'Benjamin Moore', name: 'Old Navy', hex: '#2D3646', code: '2063-10' },
  { id: 'bm-52', brand: 'Benjamin Moore', name: 'Blue Nova', hex: '#5B6483', code: '825' },
  { id: 'bm-120', brand: 'Benjamin Moore', name: 'Blue Danube', hex: '#1F5F8B', code: '2062-30' },
  { id: 'bm-121', brand: 'Benjamin Moore', name: 'Patriot Blue', hex: '#283D58', code: '2064-20' },
  { id: 'bm-122', brand: 'Benjamin Moore', name: 'Blue Dragon', hex: '#2C4C75', code: '2062-10' },
  { id: 'bm-123', brand: 'Benjamin Moore', name: 'Clearest Ocean Blue', hex: '#3C8BB8', code: '2064-40' },
  { id: 'bm-124', brand: 'Benjamin Moore', name: 'Purple Lotus', hex: '#583A68', code: '2072-30' },
  { id: 'bm-125', brand: 'Benjamin Moore', name: 'Dark Purple', hex: '#433346', code: '2073-10' },
  { id: 'bm-126', brand: 'Benjamin Moore', name: 'Violetta', hex: '#8A769F', code: 'AF-585' },
  { id: 'bm-1', brand: 'Benjamin Moore', name: 'Chantilly Lace', hex: '#F5F5F0', code: 'OC-65' },
  { id: 'bm-2', brand: 'Benjamin Moore', name: 'White Dove', hex: '#EFEFE8', code: 'OC-17' },
  { id: 'bm-3', brand: 'Benjamin Moore', name: 'Simply White', hex: '#F6F6EC', code: 'OC-117' },
  { id: 'bm-12', brand: 'Benjamin Moore', name: 'Revere Pewter', hex: '#CBC6B8', code: 'HC-172' },
  { id: 'bm-17', brand: 'Benjamin Moore', name: 'Chelsea Gray', hex: '#888681', code: 'HC-168' },
  { id: 'bm-26', brand: 'Benjamin Moore', name: 'Black Beauty', hex: '#2E2E2E', code: '2128-10' },
  { id: 'bm-27', brand: 'Benjamin Moore', name: 'Wrought Iron', hex: '#4A4B4D', code: '2124-10' },

  // SHERWIN-WILLIAMS
  { id: 'sw-70', brand: 'Sherwin-Williams', name: 'Show Stopper', hex: '#AA3336', code: 'SW 7588' },
  { id: 'sw-71', brand: 'Sherwin-Williams', name: 'Positive Red', hex: '#AC2B30', code: 'SW 6871' },
  { id: 'sw-69', brand: 'Sherwin-Williams', name: 'Rookwood Red', hex: '#692E2D', code: 'SW 2802' },
  { id: 'sw-80', brand: 'Sherwin-Williams', name: 'Real Red', hex: '#BE2331', code: 'SW 6868' },
  { id: 'sw-81', brand: 'Sherwin-Williams', name: 'Stop', hex: '#BF2D32', code: 'SW 6869' },
  { id: 'sw-82', brand: 'Sherwin-Williams', name: 'Exuberant Pink', hex: '#C84C61', code: 'SW 6840' },
  { id: 'sw-83', brand: 'Sherwin-Williams', name: 'Forward Fuchsia', hex: '#A6325E', code: 'SW 6842' },
  { id: 'sw-84', brand: 'Sherwin-Williams', name: 'Eros Pink', hex: '#C85A80', code: 'SW 6860' },
  { id: 'sw-72', brand: 'Sherwin-Williams', name: 'Confident Yellow', hex: '#F0B743', code: 'SW 6911' },
  { id: 'sw-73', brand: 'Sherwin-Williams', name: 'Friendly Yellow', hex: '#F5D995', code: 'SW 6680' },
  { id: 'sw-74', brand: 'Sherwin-Williams', name: 'Torchlight', hex: '#EAA947', code: 'SW 6374' },
  { id: 'sw-85', brand: 'Sherwin-Williams', name: 'Gambol Gold', hex: '#E0A13C', code: 'SW 6690' },
  { id: 'sw-86', brand: 'Sherwin-Williams', name: 'Decisive Yellow', hex: '#F0C53E', code: 'SW 6902' },
  { id: 'sw-87', brand: 'Sherwin-Williams', name: 'Invigorate', hex: '#F08D42', code: 'SW 6880' },
  { id: 'sw-88', brand: 'Sherwin-Williams', name: 'Obstinate Orange', hex: '#EB5E35', code: 'SW 6884' },
  { id: 'sw-89', brand: 'Sherwin-Williams', name: 'Daredevil', hex: '#DE5930', code: 'SW 6882' },
  { id: 'sw-21', brand: 'Sherwin-Williams', name: 'Evergreen Fog', hex: '#969C92', code: 'SW 9130' },
  { id: 'sw-68', brand: 'Sherwin-Williams', name: 'Jasper', hex: '#303734', code: 'SW 6216' },
  { id: 'sw-90', brand: 'Sherwin-Williams', name: 'Electric Lime', hex: '#94BC46', code: 'SW 6921' },
  { id: 'sw-91', brand: 'Sherwin-Williams', name: 'Lucky Green', hex: '#3E8A48', code: 'SW 6926' },
  { id: 'sw-92', brand: 'Sherwin-Williams', name: 'Greens', hex: '#5B9548', code: 'SW 6748' },
  { id: 'sw-93', brand: 'Sherwin-Williams', name: 'Shamrock', hex: '#3A8254', code: 'SW 6454' },
  { id: 'sw-17', brand: 'Sherwin-Williams', name: 'Naval', hex: '#363E4B', code: 'SW 6244' },
  { id: 'sw-18', brand: 'Sherwin-Williams', name: 'Salty Dog', hex: '#2A435A', code: 'SW 9177' },
  { id: 'sw-96', brand: 'Sherwin-Williams', name: 'Frank Blue', hex: '#45668E', code: 'SW 6967' },
  { id: 'sw-97', brand: 'Sherwin-Williams', name: 'Hyper Blue', hex: '#366BA1', code: 'SW 6965' },
  { id: 'sw-100', brand: 'Sherwin-Williams', name: 'Indigo', hex: '#454C65', code: 'SW 6531' },
  { id: 'sw-101', brand: 'Sherwin-Williams', name: 'Kimono Violet', hex: '#53425F', code: 'SW 6839' },
  { id: 'sw-102', brand: 'Sherwin-Williams', name: 'Impulsive Purple', hex: '#6D527D', code: 'SW 6832' },
  { id: 'sw-1', brand: 'Sherwin-Williams', name: 'Alabaster', hex: '#F1F0E8', code: 'SW 7008' },
  { id: 'sw-2', brand: 'Sherwin-Williams', name: 'Pure White', hex: '#EEEFEA', code: 'SW 7005' },
  { id: 'sw-13', brand: 'Sherwin-Williams', name: 'Tricorn Black', hex: '#2F2F30', code: 'SW 6258' },
  { id: 'sw-14', brand: 'Sherwin-Williams', name: 'Iron Ore', hex: '#434341', code: 'SW 7069' },

  // BEHR
  { id: 'behr-50', brand: 'Behr', name: 'Red Pepper', hex: '#8A332D', code: 'PPU2-02' },
  { id: 'behr-51', brand: 'Behr', name: 'Japanese Koi', hex: '#CA4628', code: 'PPU2-02' },
  { id: 'behr-52', brand: 'Behr', name: 'Orange Flambe', hex: '#E36B2C', code: 'M220-7' },
  { id: 'behr-53', brand: 'Behr', name: 'Saffron Strands', hex: '#E69F30', code: 'PPU6-02' },
  { id: 'behr-54', brand: 'Behr', name: 'Torch Red', hex: '#D02F31', code: 'PPU2-11' },
  { id: 'behr-55', brand: 'Behr', name: 'Fire Cracker', hex: '#D84439', code: 'PPU2-16' },
  { id: 'behr-56', brand: 'Behr', name: 'Bikini Top', hex: '#8DC6CC', code: 'PPU13-03' },
  { id: 'behr-57', brand: 'Behr', name: 'Bluebird', hex: '#0084A8', code: 'PPU13-15' },
  { id: 'behr-58', brand: 'Behr', name: 'Tartaruga Green', hex: '#8BB361', code: 'PPU9-18' },
  { id: 'behr-59', brand: 'Behr', name: 'Laser Lemon', hex: '#F3E35C', code: 'PPU6-13' },
  { id: 'behr-60', brand: 'Behr', name: 'Unmellow Yellow', hex: '#F1D255', code: 'PPU6-15' },
  { id: 'behr-61', brand: 'Behr', name: 'Global Green', hex: '#426F42', code: 'PPU10-03' },
  { id: 'behr-62', brand: 'Behr', name: 'King\'s Court', hex: '#5B4E77', code: 'PPU16-03' },
  { id: 'behr-63', brand: 'Behr', name: 'Vibrant Violet', hex: '#755C99', code: 'PPU16-10' },
  { id: 'behr-64', brand: 'Behr', name: 'Pink Posies', hex: '#E091A4', code: 'PPU1-14' },
  { id: 'behr-65', brand: 'Behr', name: 'Beauty Queen', hex: '#D46A86', code: 'PPU1-19' },
  { id: 'behr-1', brand: 'Behr', name: 'Polar Bear', hex: '#F6F6F1', code: '75' },
  { id: 'behr-2', brand: 'Behr', name: 'Swiss Coffee', hex: '#F1EFE6', code: '12' },
  { id: 'behr-7', brand: 'Behr', name: 'Cracked Pepper', hex: '#4F5054', code: 'PPU18-01' },
  { id: 'behr-42', brand: 'Behr', name: 'Limousine Leather', hex: '#29292B', code: 'MQ5-05' },
  { id: 'behr-43', brand: 'Behr', name: 'Black', hex: '#2F3030', code: 'Black' },
];

// Utilities
function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : [0, 0, 0];
}

function rgbToLab(rgb: [number, number, number]): [number, number, number] {
  let [r, g, b] = rgb.map(v => v / 255);
  r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
  g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
  b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;
  let x = r * 0.4124564 + g * 0.3575761 + b * 0.1804375;
  let y = r * 0.2126729 + g * 0.7151522 + b * 0.0721750;
  let z = r * 0.0193339 + g * 0.1191920 + b * 0.9503041;
  x = x / 0.95047; y = y / 1.00000; z = z / 1.08883;
  x = x > 0.008856 ? Math.pow(x, 1 / 3) : (7.787 * x + 16 / 116);
  y = y > 0.008856 ? Math.pow(y, 1 / 3) : (7.787 * y + 16 / 116);
  z = z > 0.008856 ? Math.pow(z, 1 / 3) : (7.787 * z + 16 / 116);
  return [(116 * y) - 16, 500 * (x - y), 200 * (y - z)];
}

function deltaE(lab1: [number, number, number], lab2: [number, number, number]): number {
  const [L1, a1, b1] = lab1;
  const [L2, a2, b2] = lab2;
  return Math.sqrt(Math.pow(L2 - L1, 2) + Math.pow(a2 - a1, 2) + Math.pow(b2 - b1, 2));
}

interface MatchResult extends PaintColor {
  distance: number;
  accuracy: number;
}



export function CommercialPaintFinder() {
  const [inputColor, setInputColor] = useState('#D9381E');
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string>('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (/^#[0-9A-F]{6}$/i.test(inputColor)) {
      findMatches(inputColor);
    }
  }, [inputColor, selectedBrand]);

  const handlePaste = async (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text');
    const match = text.match(/#?[0-9A-F]{6}/i);
    if (match) {
      let hex = match[0];
      if (!hex.startsWith('#')) hex = '#' + hex;
      setInputColor(hex);
    }
  };

  const handleHexInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (!val.startsWith('#')) val = '#' + val;
    if (/^#[0-9A-F]{0,6}$/i.test(val)) {
      setInputColor(val);
    }
  };

  const findMatches = (hex: string) => {
    const targetRgb = hexToRgb(hex);
    const targetLab = rgbToLab(targetRgb);

    const filteredDb = selectedBrand === 'All'
      ? PAINT_DATABASE
      : PAINT_DATABASE.filter(p => p.brand === selectedBrand);

    const results = filteredDb.map(paint => {
      const paintRgb = hexToRgb(paint.hex);
      const paintLab = rgbToLab(paintRgb);
      const dist = deltaE(targetLab, paintLab);
      const accuracy = Math.max(0, 100 - (dist * 1.5));
      return { ...paint, distance: dist, accuracy };
    });

    results.sort((a, b) => a.distance - b.distance);
    setMatches(results.slice(0, 15));
  };

  const copyToClipboard = (text: string, id: string) => {
    // Try modern Clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text)
        .then(() => {
          setCopiedId(id);
          setTimeout(() => setCopiedId(null), 2000);
        })
        .catch(() => {
          // Fallback to older method
          fallbackCopyToClipboard(text, id);
        });
    } else {
      // Use fallback for browsers without Clipboard API
      fallbackCopyToClipboard(text, id);
    }
  };

  const fallbackCopyToClipboard = (text: string, id: string) => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
    }
    document.body.removeChild(textarea);
  };

  const brands = ['All', ...Array.from(new Set(PAINT_DATABASE.map(p => p.brand)))];

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 md:px-6 lg:px-12">

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto mb-12">
        <div className="bg-neutral-500/10 backdrop-blur-md border border-neutral-500/20 rounded-3xl overflow-hidden">
          <div className="grid md:grid-cols-2 gap-0">
            <div className="p-8 md:p-12 flex flex-col justify-center">
              <div className="inline-block mb-4">
                <div className="bg-foreground text-background px-3 py-1.5 rounded-full font-pixel text-[10px] tracking-[0.3em]">
                  CALCULATION TOOL
                </div>
              </div>
              <h1 className="font-serif italic text-5xl md:text-6xl mb-4">
                Commercial Paint Finder
              </h1>
              <p className="text-foreground/70 text-lg leading-relaxed">
                Match any hex color to commercial paint brands instantly. Perfect for scenic design, set decoration, and theatrical production.
              </p>
            </div>
            <div className="relative aspect-square md:aspect-auto bg-neutral-500/5 flex items-center justify-center">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=1000"
                alt="Paint Swatches"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60" />
            </div>
          </div>
        </div>
      </div>

      {/* Calculator */}
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-[300px_1fr] gap-6">

          {/* Left Panel: Input */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-neutral-500/10 backdrop-blur-md border border-neutral-500/20 rounded-3xl p-6"
            >
              <h2 className="font-pixel text-[10px] tracking-[0.3em] text-foreground/60 uppercase mb-6">
                Input Color
              </h2>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-neutral-500/30">
                    <input
                      aria-label="Color Picker"
                      type="color"
                      value={inputColor}
                      onChange={(e) => setInputColor(e.target.value)}
                      className="absolute inset-0 w-full h-full cursor-pointer border-none"
                      style={{ padding: 0 }}
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={inputColor}
                      onChange={handleHexInput}
                      onPaste={handlePaste}
                      maxLength={7}
                      placeholder="#RRGGBB"
                      className="w-full px-4 py-3 bg-background border border-neutral-500/20 rounded-2xl text-foreground focus:border-foreground outline-none uppercase"
                    />
                    <p className="text-xs text-foreground/50 mt-2">Paste any hex code</p>
                  </div>
                </div>

                <div className="border-t border-neutral-500/20 pt-6">
                  <label className="block mb-3 font-pixel text-[10px] tracking-[0.3em] text-foreground/60 uppercase">
                    Filter by Brand
                  </label>
                  <div className="space-y-2">
                    {brands.map(b => (
                      <button
                        key={b}
                        onClick={() => setSelectedBrand(b)}
                        className={`w-full px-4 py-2 text-left text-sm rounded-2xl transition-all ${selectedBrand === b
                          ? 'bg-foreground text-background'
                          : 'bg-neutral-500/10 border border-neutral-500/20 hover:border-foreground'
                          }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Preview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-neutral-500/10 backdrop-blur-md border border-neutral-500/20 rounded-3xl p-6"
            >
              <p className="font-pixel text-[10px] tracking-[0.3em] text-foreground/60 uppercase mb-4">Current Selection</p>
              <div
                className="w-full h-32 rounded-2xl border border-neutral-500/20 mb-4"
                style={{ backgroundColor: inputColor }}
              />
              <p className="text-xl font-mono text-center">{inputColor.toUpperCase()}</p>
            </motion.div>
          </div>

          {/* Right Panel: Results */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-pixel text-[10px] tracking-[0.3em] text-foreground/60 uppercase">Match Results</h2>
                <p className="text-sm text-foreground/60 mt-1">{matches.length} matches found</p>
              </div>
              <MagnifyingGlass size={24} className="text-foreground/40" />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {matches.map((match, idx) => (
                <motion.div
                  key={match.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="bg-neutral-500/10 backdrop-blur-md border border-neutral-500/20 rounded-3xl overflow-hidden hover:border-foreground/50 transition-all group"
                >
                  <div className="relative">
                    <div
                      className="h-32 w-full"
                      style={{ backgroundColor: match.hex }}
                    />
                    <div className="absolute top-3 left-3 bg-background/90 backdrop-blur px-2 py-1 rounded-full text-xs font-pixel">
                      #{idx + 1}
                    </div>
                    <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs ${match.accuracy > 90 ? 'bg-green-500 text-black' :
                      match.accuracy > 80 ? 'bg-foreground text-background' :
                        'bg-background/90 backdrop-blur text-foreground'
                      }`}>
                      {match.accuracy.toFixed(0)}% Match
                    </div>
                  </div>

                  <div className="p-4">
                    <p className="font-pixel text-[10px] tracking-[0.3em] text-foreground/60 uppercase mb-1">{match.brand}</p>
                    <h3 className="text-lg mb-4">{match.name}</h3>

                    <div className="space-y-2 pt-3 border-t border-neutral-500/20">
                      <div className="flex justify-between items-center">
                        <span className="font-mono text-xs text-foreground/60">{match.code}</span>
                        <button
                          onClick={() => copyToClipboard(match.code, `code-${match.id}`)}
                          className="text-xs flex items-center gap-1 hover:text-foreground transition-colors"
                        >
                          {copiedId === `code-${match.id}` ? <Check size={12} /> : <Tag size={12} />}
                          {copiedId === `code-${match.id}` ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-mono text-xs text-foreground/40">{match.hex}</span>
                        <button
                          onClick={() => copyToClipboard(match.hex, `hex-${match.id}`)}
                          className="text-xs flex items-center gap-1 hover:text-foreground transition-colors"
                        >
                          {copiedId === `hex-${match.id}` ? <Check size={12} /> : <Hash size={12} />}
                          {copiedId === `hex-${match.id}` ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {matches.length === 0 && (
              <div className="bg-neutral-500/10 backdrop-blur-md border-2 border-dashed border-neutral-500/20 rounded-3xl p-12 text-center text-foreground/40">
                Enter a valid hex color to see matches
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Related Tools */}
      <RelatedTools currentToolId="commercial-paint-finder" />
    </div>
  );
}