import React, { useState, useEffect } from 'react';
import { Copy, Palette, PaintBrush, ArrowRight, ArrowLeft, ArchiveBox, Sliders } from 'phosphor-react';
import { RelatedTools } from '../components/studio/RelatedTools';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '../hooks/useTheme';
import { SEO } from '../components/SEO';

// Rosco Off-Broadway Paint Colors (32 colors)
interface RoscoPaint {
  id: string;
  name: string;
  hex: string;
  rgb: [number, number, number];
}

const ROSCO_PAINTS: RoscoPaint[] = [
  { id: '5330', name: 'White', hex: '#FFFFFF', rgb: [255, 255, 255] },
  { id: '5340', name: 'Chrome Yellow', hex: '#FFD700', rgb: [255, 215, 0] },
  { id: '5341', name: 'Yellow Ochre', hex: '#CC8833', rgb: [204, 136, 51] },
  { id: '5342', name: 'Raw Sienna', hex: '#C17A3A', rgb: [193, 122, 58] },
  { id: '5343', name: 'Burnt Sienna', hex: '#8B4513', rgb: [139, 69, 19] },
  { id: '5344', name: 'Burnt Umber', hex: '#5C3317', rgb: [92, 51, 23] },
  { id: '5345', name: 'Raw Umber', hex: '#6B4423', rgb: [107, 68, 35] },
  { id: '5350', name: 'Paynes Grey', hex: '#536878', rgb: [83, 104, 120] },
  { id: '5352', name: 'Black', hex: '#1A1A1A', rgb: [26, 26, 26] },
  { id: '5355', name: 'Cerulean Blue', hex: '#2A52BE', rgb: [42, 82, 190] },
  { id: '5357', name: 'Prussian Blue', hex: '#003153', rgb: [0, 49, 83] },
  { id: '5358', name: 'Pthalo Blue', hex: '#000F89', rgb: [0, 15, 137] },
  { id: '5359', name: 'Ultramarine Blue', hex: '#4166F5', rgb: [65, 102, 245] },
  { id: '5360', name: 'Violet', hex: '#8B00FF', rgb: [139, 0, 255] },
  { id: '5363', name: 'Purple', hex: '#660099', rgb: [102, 0, 153] },
  { id: '5365', name: 'Crimson', hex: '#DC143C', rgb: [220, 20, 60] },
  { id: '5367', name: 'Fire Red', hex: '#E92207', rgb: [233, 34, 7] },
  { id: '5369', name: 'Magenta', hex: '#FF00FF', rgb: [255, 0, 255] },
  { id: '5370', name: 'Burgundy', hex: '#800020', rgb: [128, 0, 32] },
  { id: '5371', name: 'Red Oxide', hex: '#A0522D', rgb: [160, 82, 45] },
  { id: '5373', name: 'Orange', hex: '#FF6600', rgb: [255, 102, 0] },
  { id: '5375', name: 'Chrome Orange', hex: '#FF7F00', rgb: [255, 127, 0] },
  { id: '5380', name: 'Lemon Yellow', hex: '#FFF44F', rgb: [255, 244, 79] },
  { id: '5381', name: 'Chrome Green', hex: '#00A86B', rgb: [0, 168, 107] },
  { id: '5385', name: 'Pthalo Green', hex: '#123524', rgb: [18, 53, 36] },
  { id: '5387', name: 'Ultramarine Green', hex: '#00693E', rgb: [0, 105, 62] },
  { id: '5388', name: 'Viridian Green', hex: '#40826D', rgb: [64, 130, 109] },
  { id: '5389', name: 'Emerald Green', hex: '#50C878', rgb: [80, 200, 120] },
  { id: '5390', name: 'Turquoise', hex: '#40E0D0', rgb: [64, 224, 208] },
  { id: '5391', name: 'Aqua', hex: '#00FFFF', rgb: [0, 255, 255] },
  { id: '5392', name: 'Navy Blue', hex: '#000080', rgb: [0, 0, 128] },
  { id: '5395', name: 'Van Dyke Brown', hex: '#3D2B1F', rgb: [61, 43, 31] },
];

// ----------------------------------------------------------------------
// COLOR LOGIC (Improved Subtractive/CMYK Model)
// ----------------------------------------------------------------------

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

function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : [0, 0, 0];
}

function rgbToHex(rgb: [number, number, number]): string {
  return '#' + rgb.map(v => {
    const hex = Math.round(Math.max(0, Math.min(255, v))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

function deltaE(lab1: [number, number, number], lab2: [number, number, number]): number {
  return Math.sqrt(Math.pow(lab2[0] - lab1[0], 2) + Math.pow(lab2[1] - lab1[1], 2) + Math.pow(lab2[2] - lab1[2], 2));
}

// CMYK Helpers for Subtractive Mixing
function rgbToCmyk(rgb: [number, number, number]): [number, number, number, number] {
    const r = rgb[0] / 255;
    const g = rgb[1] / 255;
    const b = rgb[2] / 255;

    const k = 1 - Math.max(r, g, b);
    const c = (1 - r - k) / (1 - k) || 0;
    const m = (1 - g - k) / (1 - k) || 0;
    const y = (1 - b - k) / (1 - k) || 0;

    return [c, m, y, k];
}

function cmykToRgb(cmyk: [number, number, number, number]): [number, number, number] {
    const c = cmyk[0];
    const m = cmyk[1];
    const y = cmyk[2];
    const k = cmyk[3];

    const r = 255 * (1 - c) * (1 - k);
    const g = 255 * (1 - m) * (1 - k);
    const b = 255 * (1 - y) * (1 - k);

    return [r, g, b];
}

function mixColors(paints: PaintRecipe[]): [number, number, number] {
  const totalParts = paints.reduce((sum, p) => sum + p.parts, 0);
  if (totalParts === 0) return [0, 0, 0];

  // Mix in CMYK space (Subtractive)
  let c = 0, m = 0, y = 0, k = 0;

  paints.forEach(({ paint, parts }) => {
    const weight = parts / totalParts;
    const [pc, pm, py, pk] = rgbToCmyk(paint.rgb);
    c += pc * weight;
    m += pm * weight;
    y += py * weight;
    k += pk * weight;
  });

  return cmykToRgb([c, m, y, k]);
}

interface PaintRecipe {
  paint: RoscoPaint;
  parts: number;
}

interface RecipeResult {
  recipe: PaintRecipe[];
  achievedColor: string;
  achievedRgb: [number, number, number];
  accuracy: number;
  deltaE: number;
}


// FULL CALCULATION ENGINE (5-Step Logic with Higher Precision)
function calculateRecipe(targetHex: string, paintSet: RoscoPaint[] = ROSCO_PAINTS): RecipeResult {
  const targetRgb = hexToRgb(targetHex);
  const targetLab = rgbToLab(targetRgb);

  // Pre-calculate deltas to sort candidates
  const sortedPaints = [...paintSet]
    .map(paint => ({ paint, delta: deltaE(targetLab, rgbToLab(paint.rgb)) }))
    .sort((a, b) => a.delta - b.delta);

  if (sortedPaints.length === 0) return { recipe: [], achievedColor: '#000000', achievedRgb: [0,0,0], accuracy: 0, deltaE: 100 };

  // 1: Exact Match check
  if (sortedPaints[0].delta < 2) {
    return {
      recipe: [{ paint: sortedPaints[0].paint, parts: 1 }],
      achievedColor: sortedPaints[0].paint.hex,
      achievedRgb: sortedPaints[0].paint.rgb,
      accuracy: Math.max(0, Math.min(100, 100 - (sortedPaints[0].delta * 10))),
      deltaE: sortedPaints[0].delta
    };
  }

  let bestRecipe: PaintRecipe[] = [];
  let bestDeltaE = Infinity;
  let bestMixedRgb: [number, number, number] = [0, 0, 0];

  const updateBest = (recipe: PaintRecipe[]) => {
      if (recipe.length === 0) return;
      const mixed = mixColors(recipe); // Uses CMYK mixing now
      const delta = deltaE(targetLab, rgbToLab(mixed));
      if (delta < bestDeltaE) {
          bestDeltaE = delta;
          bestRecipe = recipe;
          bestMixedRgb = mixed;
      }
  };

  // 2: Two-Paint Mix (High Precision)
  const topPaints = sortedPaints.slice(0, 10); // Check top 10
  for(let i=0; i<topPaints.length; i++) {
      for(let j=i; j<topPaints.length; j++) {
           // Step by 2.5% (1/40)
           for(let r=1; r<=39; r++) { 
               const r1 = r/40;
               updateBest([
                   { paint: topPaints[i].paint, parts: r1 * 40 },
                   { paint: topPaints[j].paint, parts: (1-r1) * 40 }
               ]);
           }
      }
  }

  // 3: Three-Paint Mix
  const top3 = sortedPaints.slice(0, 6);
  for(let i=0; i<top3.length; i++) {
      for(let j=i+1; j<top3.length; j++) {
          for(let k=j+1; k<top3.length; k++) {
              // Standard ratios 
              const ratios = [[0.5,0.3,0.2], [0.5,0.25,0.25], [0.4,0.4,0.2], [0.4,0.3,0.3], [0.6,0.2,0.2]];
              for(const [r1, r2, r3] of ratios) {
                  updateBest([
                      { paint: top3[i].paint, parts: r1*20 },
                      { paint: top3[j].paint, parts: r2*20 },
                      { paint: top3[k].paint, parts: r3*20 }
                  ]);
              }
          }
      }
  }

  // 4: Tint/Shade Refinement
  if (bestRecipe.length > 0) {
      const white = paintSet.find(p => p.id === '5330');
      const black = paintSet.find(p => p.id === '5352');
      
      if (white) {
          for(let w=1; w<=8; w++) { // 2.5% steps up to 20%
             const ratio = w * 0.025;
             updateBest([...bestRecipe.map(r => ({...r, parts: r.parts * (1-ratio)})), { paint: white, parts: ratio * 40 }]);
          }
      }
      if (black) {
          for(let b=1; b<=6; b++) { // 2.5% steps up to 15%
             const ratio = b * 0.025;
             updateBest([...bestRecipe.map(r => ({...r, parts: r.parts * (1-ratio)})), { paint: black, parts: ratio * 40 }]);
          }
      }
  }

  // Consolidate duplicates (fix for "multiple whites")
  const consolidated: Record<string, PaintRecipe> = {};
  bestRecipe.forEach(r => {
    if (consolidated[r.paint.id]) {
      consolidated[r.paint.id].parts += r.parts;
    } else {
      consolidated[r.paint.id] = { ...r };
    }
  });
  const consolidatedRecipe = Object.values(consolidated);

  // Normalize
  const total = consolidatedRecipe.reduce((a,b) => a+b.parts, 0);
  // Round to nearest 0.5 part relative to a base of 20 parts total for readability
  const normalized = consolidatedRecipe.map(r => ({ paint: r.paint, parts: Math.round((r.parts/total)*20)/2 })).filter(r => r.parts > 0);
  normalized.sort((a,b) => b.parts - a.parts);

  return {
      recipe: normalized,
      achievedColor: rgbToHex(bestMixedRgb),
      achievedRgb: bestMixedRgb,
      accuracy: Math.max(0, Math.min(100, 100 - (bestDeltaE * 8))),
      deltaE: bestDeltaE
  };
}


// ----------------------------------------------------------------------
// MAIN COMPONENT
// ----------------------------------------------------------------------

interface Props {
  onNavigate: (page: string) => void;
}

export function RoscoPaintCalculator({ onNavigate }: Props) {
  const context = useTheme();
  const theme = context?.theme || 'light';
  const isDark = theme === 'dark';

  const [targetColor, setTargetColor] = useState('#8B4789'); // Default Plum
  const [result, setResult] = useState<RecipeResult | null>(null);
  const [scaleAmount, setScaleAmount] = useState(1);
  const [copied, setCopied] = useState(false);

  // Inventory State
  const [inventory, setInventory] = useState<string[]>([]);
  const [showInventory, setShowInventory] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);

  // Load inventory
  useEffect(() => {
    const saved = localStorage.getItem('rosco_inventory_v1');
    if (saved) setInventory(JSON.parse(saved));
  }, []);

  // Save inventory
  useEffect(() => {
    localStorage.setItem('rosco_inventory_v1', JSON.stringify(inventory));
  }, [inventory]);

  const toggleInventoryItem = (id: string) => {
    setInventory(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  // Theme Logic
  const colors = {
    bgMain: isDark ? '#09090b' : '#f8fafc',
    textMain: isDark ? '#ffffff' : '#0f172a',
    textMuted: isDark ? '#a1a1aa' : '#64748b',
    cardBg: isDark ? 'rgba(255, 255, 255, 0.05)' : '#ffffff',
    cardBorder: isDark ? 'rgba(255, 255, 255, 0.1)' : '#e2e8f0',
    cardShadow: isDark ? 'none' : '0 10px 30px -5px rgba(0, 0, 0, 0.05)',
    inputBg: isDark ? 'rgba(0, 0, 0, 0.4)' : '#f1f5f9',
    accent: isDark ? '#ec4899' : '#db2777', 
    accentBg: isDark ? 'rgba(236, 72, 153, 0.1)' : 'rgba(219, 39, 119, 0.1)',
    headerBorder: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0,0,0,0.05)',
    headerOverlay: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 40%, transparent 100%)',
    headerText: '#ffffff',
    headerIcon: 'rgba(255,255,255,0.6)'
  };

  // Calculation Effect
  useEffect(() => {
    if (targetColor && /^#[0-9A-F]{6}$/i.test(targetColor)) {
      const availablePaints = inStockOnly
        ? ROSCO_PAINTS.filter(p => inventory.includes(p.id))
        : ROSCO_PAINTS;

      if (availablePaints.length > 0) {
        setResult(calculateRecipe(targetColor, availablePaints));
      } else {
        setResult(null);
      }
    }
  }, [targetColor, inStockOnly, inventory]);

  const copyRecipe = () => {
    if (!result) return;
    const text = `Rosco Recipe for ${targetColor}: ${result.recipe.map(r => `${r.parts.toFixed(1)} parts ${r.paint.name}`).join(', ')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <SEO title="Rosco Paint Mix Master" description="Professional scenic paint calculator." />

      <div 
         className="min-h-screen pb-20 font-sans transition-colors duration-300"
         style={{ backgroundColor: colors.bgMain, color: colors.textMain }}
      >
        <div className="pt-32 md:pt-40 pb-12 container mx-auto px-4 max-w-7xl">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
                <div>
                     <button 
                        onClick={() => onNavigate('app-studio')}
                        className="group flex items-center gap-2 text-sm transition-colors mb-3"
                        style={{ color: colors.textMuted }}
                    >
                        <ArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                        <span>Back to Studio</span>
                    </button>
                    <h1 className="font-display text-4xl md:text-5xl uppercase tracking-tight">
                        Rosco <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">Mix Master</span>
                    </h1>
                </div>
                
                {/* Inventory Toggle */}
                <button
                    onClick={() => setInStockOnly(!inStockOnly)}
                     className={`flex items-center gap-3 px-6 py-3 rounded-full border transition-all ${inStockOnly ? 'bg-pink-500 text-white border-pink-500' : 'bg-transparent'}`}
                    style={{ borderColor: inStockOnly ? 'transparent' : colors.cardBorder }}
                >
                    <ArchiveBox size={18} weight={inStockOnly ? 'fill' : 'regular'} />
                    <div className="text-xs font-bold tracking-wider uppercase">
                        {inStockOnly ? 'Using Inventory' : 'Full Catalog'}
                    </div>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 mb-24">
                
                {/* Main Content (8 Cols) */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Abstract Header */}
                    <div 
                        className="relative aspect-[2.35/1] rounded-3xl overflow-hidden shadow-2xl border" 
                        style={{ borderColor: colors.headerBorder }}
                    >
                        <img 
                            src="/images/studio/rosco-abstract.webp" 
                            alt="Rosco Paint Abstract" 
                            className="w-full h-full object-cover opacity-80"
                        />
                        <div className="absolute inset-0" style={{ background: colors.headerOverlay }} />
                        <div className="absolute bottom-0 left-0 right-0 p-8 flex items-end justify-between">
                            <p className="text-sm max-w-md font-medium" style={{ color: colors.headerText }}>
                                Advanced 5-step mixing engine for precise scenic color matching.
                            </p>
                            <PaintBrush weight="duotone" className="w-16 h-16" style={{ color: colors.headerIcon }} />
                        </div>
                    </div>

                    {/* Result Card */}
                    {result && (
                        <div 
                            className="border rounded-3xl p-6 md:p-8"
                            style={{ 
                                backgroundColor: colors.cardBg, 
                                borderColor: colors.cardBorder,
                                boxShadow: colors.cardShadow 
                            }}
                        >
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="font-display text-xl" style={{ color: colors.accent }}>Mixing Recipe</h3>
                                <div className="flex gap-2">
                                    <button onClick={copyRecipe} className="p-2 rounded-full hover:bg-black/5 transition-colors">
                                        {copied ? <ArrowRight size={20} /> : <Copy size={20} />}
                                    </button>
                                </div>
                            </div>
                            
                            <div className="grid md:grid-cols-2 gap-8">
                                <div>
                                    <div className="flex gap-4 h-32 mb-4">
                                        <div className="flex-1 rounded-2xl border flex items-center justify-center relative" style={{ backgroundColor: targetColor, borderColor: colors.cardBorder }}>
                                            <span className="text-[10px] bg-black/50 text-white px-2 py-1 rounded-full backdrop-blur-sm">TARGET</span>
                                        </div>
                                        <div className="flex-1 rounded-2xl border flex items-center justify-center relative" style={{ backgroundColor: result.achievedColor, borderColor: colors.cardBorder }}>
                                            <span className="text-[10px] bg-black/50 text-white px-2 py-1 rounded-full backdrop-blur-sm">RESULT</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center bg-black/5 rounded-lg p-3">
                                        <span className="text-xs font-bold uppercase opacity-60">Accuracy</span>
                                        <span className="font-mono font-bold text-lg">{result.accuracy.toFixed(1)}%</span>
                                    </div>
                                </div>
                                
                                <div className="space-y-2">
                                     {result.recipe.map((r, i) => (
                                        <div key={i} className="flex items-center gap-3 p-3 rounded-xl border" style={{ borderColor: colors.cardBorder, backgroundColor: colors.inputBg }}>
                                            <div className="w-8 h-8 rounded-lg shadow-sm border" style={{ backgroundColor: r.paint.hex, borderColor: colors.cardBorder }} />
                                            <div className="flex-1">
                                                <div className="font-bold text-sm">{r.paint.name}</div>
                                                <div className="text-[10px] opacity-60 font-mono">RGB: {r.paint.rgb.join(',')}</div>
                                            </div>
                                            <div className="text-lg font-display italic opacity-80">{r.parts.toFixed(1)}pt</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                    

                </div>

                {/* Sidebar (4 Cols) */}
                <div className="lg:col-span-4 space-y-6">
                    
                    {/* Controls */}
                    <div 
                        className="border rounded-3xl p-6 sticky top-24"
                        style={{ backgroundColor: colors.cardBg, borderColor: colors.cardBorder, boxShadow: colors.cardShadow }}
                    >
                         <h3 className="font-display text-lg mb-6">Target Color</h3>
                         <input 
                            type="color" 
                            value={targetColor}
                            onChange={(e) => setTargetColor(e.target.value)}
                            className="w-full h-16 rounded-xl cursor-pointer mb-3"
                            title="Choose target color"
                         />
                         <input 
                            type="text"
                            value={targetColor}
                            onChange={(e) => setTargetColor(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border text-center font-mono uppercase mb-6"
                            style={{ backgroundColor: colors.inputBg, borderColor: colors.cardBorder, color: colors.textMain }}
                            title="Target color hex"
                            placeholder="#000000"
                         />

                         {/* Mini Palette Grid (Moved from Main) */}
                         <div className="mb-6">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="text-xs font-bold uppercase opacity-60 tracking-wider">Rosco Library</h4>
                                <span className="text-[10px] opacity-40">{ROSCO_PAINTS.length}</span>
                            </div>
                            <div className="grid grid-cols-5 gap-1.5">
                                {ROSCO_PAINTS.map(paint => (
                                    <button
                                        key={paint.id}
                                        onClick={() => setTargetColor(paint.hex)}
                                        className="relative aspect-square rounded-md border hover:scale-110 transition-transform hover:z-10 shadow-sm"
                                        style={{ backgroundColor: paint.hex, borderColor: colors.cardBorder }}
                                        title={`${paint.name} (${paint.id})`}
                                    />
                                ))}
                            </div>
                         </div>
                         
                         {/* Inventory Manager */}
                         <button 
                             onClick={() => setShowInventory(!showInventory)}
                             className="w-full py-3 border rounded-xl flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider transition-colors hover:bg-black/5"
                             style={{ borderColor: colors.cardBorder }}
                         >
                             <Sliders size={16} />
                             Manage Inventory
                         </button>

                         <AnimatePresence>
                             {showInventory && (
                                 <motion.div 
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="mt-4 pt-4 border-t overflow-hidden"
                                    style={{ borderColor: colors.cardBorder }}
                                 >
                                      <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-2">
                                          {ROSCO_PAINTS.map(paint => (
                                              <button
                                                  key={paint.id}
                                                  onClick={() => toggleInventoryItem(paint.id)}
                                                  className={`flex items-center gap-2 p-2 rounded-lg border text-left text-xs transition-colors ${inventory.includes(paint.id) ? 'bg-green-500/10 border-green-500/50' : 'opacity-50 border-transparent hover:bg-black/5'}`}
                                              >
                                                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: paint.hex }} />
                                                  <span className="truncate">{paint.name}</span>
                                              </button>
                                          ))}
                                      </div>
                                 </motion.div>
                             )}
                         </AnimatePresence>
                    </div>
                </div>

            </div>

             {/* Footer */}
            <div className="pt-20" style={{ borderTopWidth: 1, borderColor: colors.cardBorder }}>
                <RelatedTools currentToolId="rosco-paint-calculator" />
            </div>

        </div>
      </div>
    </>
  );
}

export default RoscoPaintCalculator;