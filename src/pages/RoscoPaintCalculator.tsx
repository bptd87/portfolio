import React, { useState, useEffect } from 'react';
import { Copy, Palette } from 'lucide-react';
import { motion } from 'motion/react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

// Rosco Off-Broadway Paint Colors (32 colors from the official chart)
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

// Color space conversion utilities
function rgbToLab(rgb: [number, number, number]): [number, number, number] {
  // Normalize RGB to 0-1
  let [r, g, b] = rgb.map(v => v / 255);
  
  // Convert to linear RGB
  r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
  g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
  b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;
  
  // Convert to XYZ
  let x = r * 0.4124564 + g * 0.3575761 + b * 0.1804375;
  let y = r * 0.2126729 + g * 0.7151522 + b * 0.0721750;
  let z = r * 0.0193339 + g * 0.1191920 + b * 0.9503041;
  
  // Normalize for D65 white point
  x = x / 0.95047;
  y = y / 1.00000;
  z = z / 1.08883;
  
  // Convert to LAB
  x = x > 0.008856 ? Math.pow(x, 1/3) : (7.787 * x + 16/116);
  y = y > 0.008856 ? Math.pow(y, 1/3) : (7.787 * y + 16/116);
  z = z > 0.008856 ? Math.pow(z, 1/3) : (7.787 * z + 16/116);
  
  const L = (116 * y) - 16;
  const a = 500 * (x - y);
  const bValue = 200 * (y - z);
  
  return [L, a, bValue];
}

function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result 
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : [0, 0, 0];
}

function rgbToHex(rgb: [number, number, number]): string {
  return '#' + rgb.map(v => {
    const hex = Math.round(v).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

function deltaE(lab1: [number, number, number], lab2: [number, number, number]): number {
  // CIE76 color difference formula
  const [L1, a1, b1] = lab1;
  const [L2, a2, b2] = lab2;
  return Math.sqrt(Math.pow(L2 - L1, 2) + Math.pow(a2 - a1, 2) + Math.pow(b2 - b1, 2));
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

function mixColors(paints: PaintRecipe[]): [number, number, number] {
  const totalParts = paints.reduce((sum, p) => sum + p.parts, 0);
  if (totalParts === 0) return [0, 0, 0];
  
  const mixed: [number, number, number] = [0, 0, 0];
  paints.forEach(({ paint, parts }) => {
    const weight = parts / totalParts;
    mixed[0] += paint.rgb[0] * weight;
    mixed[1] += paint.rgb[1] * weight;
    mixed[2] += paint.rgb[2] * weight;
  });
  
  return mixed;
}

function calculateRecipe(targetHex: string): RecipeResult {
  const targetRgb = hexToRgb(targetHex);
  const targetLab = rgbToLab(targetRgb);
  
  let bestRecipe: PaintRecipe[] = [];
  let bestDeltaE = Infinity;
  let bestMixedRgb: [number, number, number] = [0, 0, 0];
  
  // Get all paints sorted by closeness to target
  const sortedPaints = [...ROSCO_PAINTS]
    .map(paint => ({
      paint,
      delta: deltaE(targetLab, rgbToLab(paint.rgb))
    }))
    .sort((a, b) => a.delta - b.delta);
  
  // Step 1: Check if we already have an exact or very close match
  if (sortedPaints[0].delta < 2) {
    return {
      recipe: [{ paint: sortedPaints[0].paint, parts: 1 }],
      achievedColor: sortedPaints[0].paint.hex,
      achievedRgb: sortedPaints[0].paint.rgb,
      accuracy: Math.max(0, Math.min(100, 100 - (sortedPaints[0].delta * 10))),
      deltaE: sortedPaints[0].delta
    };
  }
  
  const white = ROSCO_PAINTS.find(p => p.id === '5330') || ROSCO_PAINTS[0];
  const black = ROSCO_PAINTS.find(p => p.id === '5352') || ROSCO_PAINTS[8];
  
  // Step 2: Try 2-paint combinations with finer granularity
  const topPaints = sortedPaints.slice(0, 8); // Top 8 closest paints
  
  for (let i = 0; i < topPaints.length; i++) {
    for (let j = i; j < topPaints.length; j++) {
      // Try ratios from 0.05 to 0.95 in steps of 0.05 (much finer than before)
      for (let ratio1 = 0.05; ratio1 <= 0.95; ratio1 += 0.05) {
        const ratio2 = 1 - ratio1;
        
        if (i === j && ratio1 !== 1) continue; // Skip duplicate same-paint mixes
        
        const recipe: PaintRecipe[] = [];
        if (ratio1 >= 0.05) recipe.push({ paint: topPaints[i].paint, parts: ratio1 * 20 });
        if (ratio2 >= 0.05 && i !== j) recipe.push({ paint: topPaints[j].paint, parts: ratio2 * 20 });
        
        if (recipe.length === 0) continue;
        
        const mixedRgb = mixColors(recipe);
        const mixedLab = rgbToLab(mixedRgb);
        const delta = deltaE(targetLab, mixedLab);
        
        if (delta < bestDeltaE) {
          bestDeltaE = delta;
          bestRecipe = recipe;
          bestMixedRgb = mixedRgb;
        }
      }
    }
  }
  
  // Step 3: Try 3-paint combinations with the best candidates
  const topCandidates = sortedPaints.slice(0, 6);
  
  for (let i = 0; i < topCandidates.length; i++) {
    for (let j = i + 1; j < topCandidates.length; j++) {
      for (let k = j + 1; k < topCandidates.length; k++) {
        // Try various 3-way ratios
        const ratios = [
          [0.5, 0.3, 0.2],
          [0.5, 0.25, 0.25],
          [0.4, 0.4, 0.2],
          [0.4, 0.3, 0.3],
          [0.6, 0.2, 0.2],
          [0.7, 0.2, 0.1],
          [0.6, 0.3, 0.1],
        ];
        
        for (const [r1, r2, r3] of ratios) {
          const recipe: PaintRecipe[] = [
            { paint: topCandidates[i].paint, parts: r1 * 20 },
            { paint: topCandidates[j].paint, parts: r2 * 20 },
            { paint: topCandidates[k].paint, parts: r3 * 20 }
          ];
          
          const mixedRgb = mixColors(recipe);
          const mixedLab = rgbToLab(mixedRgb);
          const delta = deltaE(targetLab, mixedLab);
          
          if (delta < bestDeltaE) {
            bestDeltaE = delta;
            bestRecipe = recipe;
            bestMixedRgb = mixedRgb;
          }
        }
      }
    }
  }
  
  // Step 4: Try adding white or black to the best result for tinting/shading refinement
  if (bestRecipe.length > 0) {
    const originalRecipe = [...bestRecipe];
    
    // Try adding white (tinting)
    for (let whiteRatio = 0.05; whiteRatio <= 0.4; whiteRatio += 0.05) {
      const baseRatio = 1 - whiteRatio;
      const recipe: PaintRecipe[] = [
        ...originalRecipe.map(r => ({ paint: r.paint, parts: r.parts * baseRatio })),
        { paint: white, parts: whiteRatio * 20 }
      ];
      
      const mixedRgb = mixColors(recipe);
      const mixedLab = rgbToLab(mixedRgb);
      const delta = deltaE(targetLab, mixedLab);
      
      if (delta < bestDeltaE) {
        bestDeltaE = delta;
        bestRecipe = recipe;
        bestMixedRgb = mixedRgb;
      }
    }
    
    // Try adding black (shading)
    for (let blackRatio = 0.05; blackRatio <= 0.3; blackRatio += 0.05) {
      const baseRatio = 1 - blackRatio;
      const recipe: PaintRecipe[] = [
        ...originalRecipe.map(r => ({ paint: r.paint, parts: r.parts * baseRatio })),
        { paint: black, parts: blackRatio * 20 }
      ];
      
      const mixedRgb = mixColors(recipe);
      const mixedLab = rgbToLab(mixedRgb);
      const delta = deltaE(targetLab, mixedLab);
      
      if (delta < bestDeltaE) {
        bestDeltaE = delta;
        bestRecipe = recipe;
        bestMixedRgb = mixedRgb;
      }
    }
  }
  
  // Step 5: Refinement - fine-tune the best recipe found
  if (bestRecipe.length >= 2) {
    const refinedRecipe = [...bestRecipe];
    
    // Try small adjustments to ratios
    for (let adjustment = -0.1; adjustment <= 0.1; adjustment += 0.05) {
      for (let i = 0; i < refinedRecipe.length; i++) {
        const testRecipe = refinedRecipe.map((r, idx) => ({
          paint: r.paint,
          parts: idx === i ? Math.max(0.1, r.parts * (1 + adjustment)) : r.parts
        })).filter(r => r.parts > 0.1);
        
        if (testRecipe.length === 0) continue;
        
        const mixedRgb = mixColors(testRecipe);
        const mixedLab = rgbToLab(mixedRgb);
        const delta = deltaE(targetLab, mixedLab);
        
        if (delta < bestDeltaE) {
          bestDeltaE = delta;
          bestRecipe = testRecipe;
          bestMixedRgb = mixedRgb;
        }
      }
    }
  }
  
  // Normalize recipe to simple ratios
  const totalParts = bestRecipe.reduce((sum, p) => sum + p.parts, 0);
  
  // Handle edge case where no recipe was found
  if (totalParts === 0 || bestRecipe.length === 0) {
    return {
      recipe: [{ paint: ROSCO_PAINTS[0], parts: 1 }],
      achievedColor: ROSCO_PAINTS[0].hex,
      achievedRgb: ROSCO_PAINTS[0].rgb,
      accuracy: 0,
      deltaE: 100
    };
  }
  
  const normalizedRecipe = bestRecipe.map(({ paint, parts }) => ({
    paint,
    parts: Math.round((parts / totalParts) * 10 * 2) / 2 // Round to 0.5
  })).filter(r => r.parts >= 0.5);
  
  // Ensure we always have at least one paint in the recipe
  if (normalizedRecipe.length === 0) {
    normalizedRecipe.push({ paint: bestRecipe[0].paint, parts: 1 });
  }
  
  // Sort by parts (largest first)
  normalizedRecipe.sort((a, b) => b.parts - a.parts);
  
  // Calculate accuracy (0-100%)
  // DeltaE < 1 is imperceptible, < 2 is very close, < 5 is acceptable
  const accuracy = Math.max(0, Math.min(100, 100 - (bestDeltaE * 10)));
  
  return {
    recipe: normalizedRecipe,
    achievedColor: rgbToHex(bestMixedRgb),
    achievedRgb: bestMixedRgb,
    accuracy,
    deltaE: bestDeltaE
  };
}

interface RoscoPaintCalculatorProps {
  onNavigate: (page: string) => void;
}

export function RoscoPaintCalculator({ onNavigate }: RoscoPaintCalculatorProps) {
  const [targetColor, setTargetColor] = useState('#8B4789');
  const [result, setResult] = useState<RecipeResult | null>(null);
  const [scaleAmount, setScaleAmount] = useState(1);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (targetColor && /^#[0-9A-F]{6}$/i.test(targetColor)) {
      const recipe = calculateRecipe(targetColor);
      setResult(recipe);
    }
  }, [targetColor]);

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTargetColor(e.target.value);
  };

  const handleHexInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    if (!value.startsWith('#')) value = '#' + value;
    if (/^#[0-9A-F]{0,6}$/i.test(value)) {
      setTargetColor(value);
    }
  };

  const copyRecipe = () => {
    if (!result) return;
    
    const totalParts = result.recipe.reduce((sum, r) => sum + r.parts, 0);
    const recipeText = [
      `TARGET COLOR: ${targetColor}`,
      `ACHIEVED COLOR: ${result.achievedColor}`,
      `MATCH ACCURACY: ${result.accuracy.toFixed(1)}%`,
      '',
      'RECIPE:',
      ...result.recipe.map(({ paint, parts }) => 
        `• ${parts.toFixed(1)} parts ${paint.name} (${paint.id})`
      ),
      '',
      `TOTAL: ${totalParts.toFixed(1)} parts`
    ].join('\n');
    
    navigator.clipboard.writeText(recipeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getAccuracyLabel = (accuracy: number): string => {
    if (accuracy >= 95) return 'Excellent';
    if (accuracy >= 85) return 'Very Good';
    if (accuracy >= 75) return 'Good';
    if (accuracy >= 60) return 'Acceptable';
    return 'Approximate';
  };

  const totalParts = result ? result.recipe.reduce((sum, r) => sum + r.parts, 0) : 0;

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 md:px-6 lg:px-12">
      
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto mb-12">
        <div className="bg-neutral-500/10 backdrop-blur-md border border-neutral-500/20 rounded-3xl overflow-hidden">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Left: Text */}
            <div className="p-8 md:p-12 flex flex-col justify-center">
              <div className="inline-block mb-4">
                <div className="bg-foreground text-background px-3 py-1.5 rounded-full font-pixel text-[10px] tracking-[0.3em]">
                  PAINT MIXING
                </div>
              </div>
              <h1 className="font-serif italic text-5xl md:text-6xl mb-4">
                Rosco Paint Mixer
              </h1>
              <p className="text-foreground/70 text-lg leading-relaxed">
                Calculate precise mixing recipes using Rosco's 32-color scenic paint palette. Perfect for color matching and paint budgeting.
              </p>
            </div>

            {/* Right: Image Placeholder */}
            <div className="relative aspect-square md:aspect-auto bg-neutral-500/5 flex items-center justify-center">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=1000"
                alt="Paint Mixing"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-6">
          
          {/* LEFT PANEL: Color Input */}
          <div className="space-y-6">
            
            {/* Color Picker Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-neutral-500/10 backdrop-blur-md border border-neutral-500/20 rounded-3xl p-6 md:p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <Palette size={24} className="text-foreground" />
                <h2 className="font-pixel text-xs tracking-[0.3em] text-foreground/60 uppercase">
                  Target Color
                </h2>
              </div>
              
              {/* Visual Picker */}
              <div className="mb-6">
                <label className="block mb-3 font-pixel text-[10px] tracking-[0.3em] text-foreground/60 uppercase">
                  Visual Picker
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="color"
                    value={targetColor}
                    onChange={handleColorChange}
                    className="w-32 h-32 cursor-pointer bg-transparent border-2 border-neutral-500/20 rounded-2xl"
                  />
                  <div className="flex-1">
                    <div className="bg-neutral-500/10 border border-neutral-500/20 rounded-2xl p-4">
                      <div className="font-serif italic text-2xl mb-2">{targetColor.toUpperCase()}</div>
                      <div className="text-xs text-foreground/60">
                        RGB: [{hexToRgb(targetColor).join(', ')}]
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hex Input */}
              <div className="mb-6">
                <label className="block mb-3 font-pixel text-[10px] tracking-[0.3em] text-foreground/60 uppercase">
                  Hex Code
                </label>
                <input
                  type="text"
                  value={targetColor}
                  onChange={handleHexInput}
                  placeholder="#RRGGBB"
                  className="w-full bg-background border border-neutral-500/20 rounded-2xl px-4 py-3 focus:border-foreground focus:outline-none transition-colors tracking-wider"
                  maxLength={7}
                />
              </div>

              {/* Quick Presets */}
              <div>
                <label className="block mb-3 font-pixel text-[10px] tracking-[0.3em] text-foreground/60 uppercase">
                  Quick Presets
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { name: 'Brick', hex: '#8B4513' },
                    { name: 'Forest', hex: '#228B22' },
                    { name: 'Sky', hex: '#87CEEB' },
                    { name: 'Wine', hex: '#722F37' },
                    { name: 'Sand', hex: '#C2B280' },
                    { name: 'Plum', hex: '#8B4789' },
                    { name: 'Slate', hex: '#708090' },
                    { name: 'Cream', hex: '#FFFDD0' },
                  ].map(preset => (
                    <button
                      key={preset.name}
                      onClick={() => setTargetColor(preset.hex)}
                      className="border border-neutral-500/20 rounded-xl hover:border-foreground transition-colors relative group overflow-hidden"
                      title={preset.name}
                    >
                      <div 
                        className="w-full h-12 relative"
                        style={{ backgroundColor: preset.hex }}
                      >
                        <div className="absolute inset-0 bg-background/90 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="font-pixel text-[8px] tracking-wider">{preset.name.toUpperCase()}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Rosco Paint Chart Reference */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-neutral-500/10 backdrop-blur-md border border-neutral-500/20 rounded-3xl p-6 md:p-8"
            >
              <h3 className="font-pixel text-xs tracking-[0.3em] text-foreground/60 uppercase mb-4">
                Rosco Palette (32 Colors)
              </h3>
              
              <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                {ROSCO_PAINTS.map(paint => (
                  <button
                    key={paint.id}
                    className="group relative border border-neutral-500/20 rounded-xl hover:border-foreground transition-colors overflow-hidden"
                    title={`${paint.name} (${paint.id})`}
                    onClick={() => setTargetColor(paint.hex)}
                  >
                    <div 
                      className="w-full h-12"
                      style={{ backgroundColor: paint.hex }}
                    />
                    <div className="absolute inset-0 bg-background/95 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-center p-1">
                      <div className="text-[9px] font-pixel tracking-tight leading-tight">{paint.name}</div>
                      <div className="text-[8px] text-foreground/60">{paint.id}</div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>

          {/* RIGHT PANEL: Recipe Output */}
          <div className="space-y-6">
            {result && (
              <>
                {/* Color Comparison */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.15 }}
                  className="bg-neutral-500/10 backdrop-blur-md border border-neutral-500/20 rounded-3xl p-6 md:p-8"
                >
                  <h3 className="font-pixel text-xs tracking-[0.3em] text-foreground/60 uppercase mb-4">
                    Color Match
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <div className="text-xs text-foreground/60 mb-2 font-pixel tracking-wider">TARGET</div>
                      <div 
                        className="w-full h-32 border border-neutral-500/20 rounded-2xl"
                        style={{ backgroundColor: targetColor }}
                      />
                      <div className="mt-2 text-xs font-mono text-foreground/70">
                        {targetColor.toUpperCase()}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-foreground/60 mb-2 font-pixel tracking-wider">ACHIEVED</div>
                      <div 
                        className="w-full h-32 border border-neutral-500/20 rounded-2xl"
                        style={{ backgroundColor: result.achievedColor }}
                      />
                      <div className="mt-2 text-xs font-mono text-foreground/70">
                        {result.achievedColor.toUpperCase()}
                      </div>
                    </div>
                  </div>
                  
                  {/* Accuracy Meter */}
                  <div className="bg-neutral-500/10 border border-neutral-500/20 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-pixel text-[10px] tracking-wider text-foreground/60 uppercase">Match Accuracy</span>
                      <span className="font-serif italic text-2xl">
                        {result.accuracy.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-3 bg-neutral-500/10 rounded-full overflow-hidden border border-neutral-500/20">
                      <div 
                        className="h-full bg-foreground transition-all rounded-full"
                        style={{ width: `${result.accuracy}%` }}
                      />
                    </div>
                    <div className="text-xs text-foreground/60 mt-2 flex items-center justify-between">
                      <span>{getAccuracyLabel(result.accuracy)}</span>
                      <span>ΔE: {result.deltaE.toFixed(2)}</span>
                    </div>
                  </div>
                </motion.div>

                {/* Recipe */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="bg-neutral-500/10 backdrop-blur-md border border-neutral-500/20 rounded-3xl p-6 md:p-8"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-pixel text-xs tracking-[0.3em] text-foreground/60 uppercase">
                      Paint Recipe
                    </h3>
                    <button
                      onClick={copyRecipe}
                      className="flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-full hover:opacity-90 transition-opacity text-xs font-pixel tracking-wider"
                    >
                      <Copy size={14} />
                      {copied ? 'COPIED!' : 'COPY'}
                    </button>
                  </div>

                  <div className="space-y-3 mb-6">
                    {result.recipe.map(({ paint, parts }, index) => (
                      <div key={index} className="bg-neutral-500/10 border border-neutral-500/20 rounded-2xl p-4 flex items-center gap-4">
                        <div 
                          className="w-12 h-12 border border-neutral-500/20 rounded-xl flex-shrink-0"
                          style={{ backgroundColor: paint.hex }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-serif italic text-lg truncate">{parts.toFixed(1)} parts</div>
                          <div className="text-xs text-foreground/60">{paint.name} ({paint.id})</div>
                        </div>
                        <div className="text-xl text-foreground/80 font-mono">
                          {((parts / totalParts) * 100).toFixed(0)}%
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-neutral-500/20 pt-4">
                    <div className="bg-neutral-500/10 border border-neutral-500/20 rounded-2xl p-4 flex items-center justify-between">
                      <span className="font-pixel text-[10px] tracking-wider text-foreground/60 uppercase">Total Parts</span>
                      <span className="font-serif italic text-3xl">{totalParts.toFixed(1)}</span>
                    </div>
                  </div>
                </motion.div>

                {/* Recipe Scaler */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.25 }}
                  className="bg-neutral-500/10 backdrop-blur-md border border-neutral-500/20 rounded-3xl p-6 md:p-8"
                >
                  <h3 className="font-pixel text-xs tracking-[0.3em] text-foreground/60 uppercase mb-4">
                    Scale Recipe
                  </h3>
                  
                  <div className="mb-4">
                    <label className="block mb-3 font-pixel text-[10px] tracking-[0.3em] text-foreground/60 uppercase">
                      Multiplier
                    </label>
                    <input
                      type="number"
                      value={scaleAmount}
                      onChange={(e) => setScaleAmount(parseFloat(e.target.value) || 1)}
                      min="0.1"
                      step="0.5"
                      className="w-full bg-background border border-neutral-500/20 rounded-2xl px-4 py-3 focus:border-foreground focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="bg-neutral-500/10 border border-neutral-500/20 rounded-2xl p-4">
                    <div className="space-y-2">
                      {result.recipe.map(({ paint, parts }, index) => (
                        <div key={index} className="flex justify-between items-center py-2 border-b border-neutral-500/10 last:border-0">
                          <span className="text-xs text-foreground/60 truncate pr-2">{paint.name}</span>
                          <span className="font-mono text-foreground">{(parts * scaleAmount).toFixed(2)}</span>
                        </div>
                      ))}
                      <div className="flex justify-between items-center pt-3 mt-3 border-t-2 border-neutral-500/20">
                        <span className="font-pixel text-[10px] tracking-wider text-foreground/60 uppercase">Total</span>
                        <span className="font-serif italic text-xl">{(totalParts * scaleAmount).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-2 gap-6 mt-6">
          {/* Mixing Instructions */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-neutral-500/10 backdrop-blur-md border border-neutral-500/20 rounded-3xl p-6 md:p-8"
          >
            <h3 className="font-pixel text-xs tracking-[0.3em] text-foreground/60 uppercase mb-4">
              Mixing Instructions
            </h3>
            <div className="text-sm text-foreground/70 space-y-2">
              <div className="flex items-start gap-3">
                <div className="w-1 h-1 bg-foreground mt-2 flex-shrink-0 rounded-full" />
                <span>Recipes use subtractive color mixing models for accuracy</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1 h-1 bg-foreground mt-2 flex-shrink-0 rounded-full" />
                <span>Mix paints thoroughly before evaluating color</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1 h-1 bg-foreground mt-2 flex-shrink-0 rounded-full" />
                <span>Test on sample surfaces before full production</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1 h-1 bg-foreground mt-2 flex-shrink-0 rounded-full" />
                <span>Paint may dry slightly darker - test dry samples</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1 h-1 bg-foreground mt-2 flex-shrink-0 rounded-full" />
                <span>"Parts" can be any unit (cups, ounces, liters)</span>
              </div>
            </div>
          </motion.div>

          {/* Example Image */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="bg-neutral-500/10 backdrop-blur-md border border-neutral-500/20 rounded-3xl overflow-hidden"
          >
            <div className="relative aspect-video bg-neutral-500/5 flex items-center justify-center">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1452860606245-08befc0ff44b?q=80&w=1000"
                alt="Scenic Painting"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6">
              <h3 className="font-pixel text-xs tracking-[0.3em] text-foreground/60 uppercase mb-2">
                Scenic Painting
              </h3>
              <p className="text-sm text-foreground/70">
                Professional-grade scenic paint mixing for theatrical productions and installations.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}