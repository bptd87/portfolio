import React, { useState, useEffect } from 'react';
import { Cube, CheckCircle, XCircle, Printer, Copy, Check } from 'phosphor-react';
import { motion } from 'motion/react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

interface ScaleOption {
  label: string;
  ratio: number; // How many real inches = 1 model inch
}

const ARCHITECTURAL_SCALES: ScaleOption[] = [
  { label: '1" = 1\'-0"', ratio: 12 },
  { label: '3/4" = 1\'-0"', ratio: 16 },
  { label: '1/2" = 1\'-0"', ratio: 24 },
  { label: '3/8" = 1\'-0"', ratio: 32 },
  { label: '1/4" = 1\'-0"', ratio: 48 },
  { label: '3/16" = 1\'-0"', ratio: 64 },
  { label: '1/8" = 1\'-0"', ratio: 96 },
  { label: '3/32" = 1\'-0"', ratio: 128 },
  { label: '1/16" = 1\'-0"', ratio: 192 },
];

interface Printer {
  name: string;
  buildVolume: { x: number; y: number; z: number }; // in mm
  category: string;
  manufacturer: string;
}

const PRINTERS: Printer[] = [
  // Budget FDM
  { name: 'Ender 3 V2', buildVolume: { x: 220, y: 220, z: 250 }, category: 'Budget FDM', manufacturer: 'Creality' },
  { name: 'Ender 3 S1', buildVolume: { x: 220, y: 220, z: 270 }, category: 'Budget FDM', manufacturer: 'Creality' },
  { name: 'Anycubic Kobra', buildVolume: { x: 220, y: 220, z: 250 }, category: 'Budget FDM', manufacturer: 'Anycubic' },
  
  // Mid-Range FDM
  { name: 'Prusa i3 MK3S+', buildVolume: { x: 250, y: 210, z: 210 }, category: 'Mid-Range FDM', manufacturer: 'Prusa' },
  { name: 'Bambu Lab P1P', buildVolume: { x: 256, y: 256, z: 256 }, category: 'Mid-Range FDM', manufacturer: 'Bambu Lab' },
  { name: 'Bambu Lab X1 Carbon', buildVolume: { x: 256, y: 256, z: 256 }, category: 'Premium FDM', manufacturer: 'Bambu Lab' },
  
  // Large Format FDM
  { name: 'Creality CR-10', buildVolume: { x: 300, y: 300, z: 400 }, category: 'Large Format FDM', manufacturer: 'Creality' },
  { name: 'Creality CR-10 S5', buildVolume: { x: 500, y: 500, z: 500 }, category: 'Large Format FDM', manufacturer: 'Creality' },
  { name: 'Prusa XL', buildVolume: { x: 360, y: 360, z: 360 }, category: 'Large Format FDM', manufacturer: 'Prusa' },
  
  // Budget Resin
  { name: 'Elegoo Mars 3', buildVolume: { x: 143, y: 89, z: 175 }, category: 'Budget Resin', manufacturer: 'Elegoo' },
  { name: 'Anycubic Photon Mono', buildVolume: { x: 130, y: 82, z: 165 }, category: 'Budget Resin', manufacturer: 'Anycubic' },
  
  // Mid-Range Resin
  { name: 'Anycubic Photon Mono X', buildVolume: { x: 192, y: 120, z: 245 }, category: 'Mid-Range Resin', manufacturer: 'Anycubic' },
  { name: 'Elegoo Saturn 2', buildVolume: { x: 219, y: 123, z: 250 }, category: 'Mid-Range Resin', manufacturer: 'Elegoo' },
  
  // Professional Resin
  { name: 'Formlabs Form 3', buildVolume: { x: 145, y: 145, z: 185 }, category: 'Professional Resin', manufacturer: 'Formlabs' },
  { name: 'Formlabs Form 3L', buildVolume: { x: 200, y: 335, z: 300 }, category: 'Professional Resin', manufacturer: 'Formlabs' },
];

export function ArchitectureScaleConverter() {
  const [realFeet, setRealFeet] = useState<string>('10');
  const [realInches, setRealInches] = useState<string>('0');
  const [selectedScale, setSelectedScale] = useState<number>(48); // Default 1/4\" = 1'-0\"
  const [selectedPrinter, setSelectedPrinter] = useState<Printer | null>(PRINTERS[0]);
  const [resultMM, setResultMM] = useState<{ x: number; y: number; z: number } | null>(null);
  const [willFit, setWillFit] = useState<boolean | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    calculateScale();
  }, [realFeet, realInches, selectedScale, selectedPrinter]);

  const calculateScale = () => {
    const feet = parseFloat(realFeet) || 0;
    const inches = parseFloat(realInches) || 0;
    
    if (feet <= 0 && inches <= 0) {
      setResultMM(null);
      setWillFit(null);
      return;
    }

    // Convert to total inches
    const totalInches = (feet * 12) + inches;

    // Calculate model size in inches
    const modelInches = totalInches / selectedScale;

    // Convert to mm (1 inch = 25.4mm)
    const modelMM = modelInches * 25.4;

    // For now, assuming a single dimension. User would measure each axis (X, Y, Z) separately
    setResultMM({ x: modelMM, y: modelMM, z: modelMM });

    // Check if it fits
    if (selectedPrinter) {
      const fits = 
        modelMM <= selectedPrinter.buildVolume.x &&
        modelMM <= selectedPrinter.buildVolume.y &&
        modelMM <= selectedPrinter.buildVolume.z;
      setWillFit(fits);
    }
  };

  const copyToClipboard = async () => {
    if (!resultMM) return;
    
    const textToCopy = resultMM.x.toFixed(2);
    
    // Try modern Clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        // Fallback to older method
        fallbackCopyToClipboard(textToCopy);
      }
    } else {
      // Use fallback for browsers without Clipboard API
      fallbackCopyToClipboard(textToCopy);
    }
  };

  const fallbackCopyToClipboard = (text: string) => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      }
    document.body.removeChild(textarea);
  };

  const selectedScaleLabel = ARCHITECTURAL_SCALES.find(s => s.ratio === selectedScale)?.label || '';

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 md:px-6 lg:px-12">
      
      {/* Hero Section with Image */}
      <div className="max-w-6xl mx-auto mb-12">
        <div className="bg-neutral-500/10 backdrop-blur-md border border-neutral-500/20 rounded-3xl overflow-hidden">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Left: Text */}
            <div className="p-8 md:p-12 flex flex-col justify-center">
              <div className="inline-block mb-4">
                <div className="bg-foreground text-background px-3 py-1.5 rounded-full font-pixel text-[10px] tracking-[0.3em]">
                  CALCULATION TOOL
                </div>
              </div>
              <h1 className="font-serif italic text-5xl md:text-6xl mb-4">
                3D Print Scale Calculator
              </h1>
              <p className="text-foreground/70 text-lg leading-relaxed">
                Convert theatrical dimensions to 3D printable scale with precision. Check printer compatibility instantly.
              </p>
            </div>

            {/* Right: Image Placeholder */}
            <div className="relative aspect-square md:aspect-auto bg-neutral-500/5 flex items-center justify-center">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1664575262619-b28fef7a40a4?q=80&w=1000"
                alt="3D Printer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60" />
            </div>
          </div>
        </div>
      </div>

      {/* Calculator Grid */}
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          
          {/* LEFT PANEL: Input */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-neutral-500/10 backdrop-blur-md border border-neutral-500/20 rounded-3xl p-6 md:p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <Cube size={32} weight="regular" className="text-foreground" />
              <h2 className="font-pixel text-xs tracking-[0.3em] text-foreground/60 uppercase">
                Input Dimensions
              </h2>
            </div>
            
            {/* Real World Dimensions */}
            <div className="mb-8">
              <label className="block mb-3 font-pixel text-[10px] tracking-[0.3em] text-foreground/60 uppercase">
                Real World Size
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-foreground/60 mb-2 font-pixel tracking-wider">FEET</div>
                  <input
                    type="number"
                    value={realFeet}
                    onChange={(e) => setRealFeet(e.target.value)}
                    className="w-full px-4 py-3 bg-background border border-neutral-500/20 rounded-2xl text-foreground focus:border-foreground outline-none transition-all"
                    placeholder="10"
                  />
                </div>
                <div>
                  <div className="text-xs text-foreground/60 mb-2 font-pixel tracking-wider">INCHES</div>
                  <input
                    type="number"
                    value={realInches}
                    onChange={(e) => setRealInches(e.target.value)}
                    className="w-full px-4 py-3 bg-background border border-neutral-500/20 rounded-2xl text-foreground focus:border-foreground outline-none transition-all"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            {/* Scale Selection */}
            <div className="mb-8">
              <label className="block mb-3 font-pixel text-[10px] tracking-[0.3em] text-foreground/60 uppercase">
                Architectural Scale
              </label>
              <div className="grid grid-cols-3 gap-2">
                {ARCHITECTURAL_SCALES.map((scale) => (
                  <motion.button
                    key={scale.ratio}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedScale(scale.ratio)}
                    className={`px-3 py-2 rounded-full transition-all text-sm ${
                      selectedScale === scale.ratio
                        ? 'bg-foreground text-background'
                        : 'bg-neutral-500/10 border border-neutral-500/20 text-foreground hover:border-foreground'
                    }`}
                  >
                    {scale.label}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Printer Selection */}
            <div>
              <label className="block mb-3 font-pixel text-[10px] tracking-[0.3em] text-foreground/60 uppercase flex items-center gap-2">
                <Printer size={16} weight="regular" />
                Select 3D Printer
              </label>
              <select
                value={selectedPrinter?.name || ''}
                onChange={(e) => {
                  const printer = PRINTERS.find(p => p.name === e.target.value);
                  setSelectedPrinter(printer || null);
                }}
                className="w-full px-4 py-3 bg-background border border-neutral-500/20 rounded-2xl text-foreground focus:border-foreground outline-none transition-all"
              >
                {PRINTERS.map((printer) => (
                  <option key={printer.name} value={printer.name}>
                    {printer.manufacturer} {printer.name} — {printer.category}
                  </option>
                ))}
              </select>
              {selectedPrinter && (
                <motion.div 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 text-xs text-foreground/60 bg-neutral-500/10 rounded-2xl p-3 border border-neutral-500/20"
                >
                  <div className="mb-1 font-pixel tracking-wider">Build Volume: {selectedPrinter.buildVolume.x} × {selectedPrinter.buildVolume.y} × {selectedPrinter.buildVolume.z} mm</div>
                  <div className="text-foreground/60">{selectedPrinter.category}</div>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* RIGHT PANEL: Output */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-neutral-500/10 backdrop-blur-md border border-neutral-500/20 rounded-3xl p-6 md:p-8"
          >
            <div className="mb-6">
              <h2 className="font-pixel text-xs tracking-[0.3em] text-foreground/60 uppercase">
                Calculated Output
              </h2>
            </div>
            
            {resultMM ? (
              <div className="space-y-6">
                {/* Result Display */}
                <motion.div 
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="bg-neutral-500/10 backdrop-blur-md border border-neutral-500/20 rounded-3xl p-6"
                >
                  <div className="text-xs text-foreground/60 mb-2 font-pixel tracking-wider uppercase">Model Size</div>
                  <div className="flex items-center justify-between gap-4">
                    <motion.div 
                      key={resultMM.x}
                      initial={{ scale: 1.1, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className="font-serif italic text-5xl"
                    >
                      {resultMM.x.toFixed(2)} mm
                    </motion.div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={copyToClipboard}
                      className="flex-shrink-0 p-3 bg-foreground text-background rounded-2xl hover:opacity-90 transition-opacity"
                      title="Copy number to clipboard"
                    >
                      {copied ? (
                        <Check size={24} weight="bold" />
                      ) : (
                        <Copy size={24} weight="regular" />
                      )}
                    </motion.button>
                  </div>
                  <div className="text-sm text-foreground/70 mt-2">
                    at {selectedScaleLabel} scale
                  </div>
                  {copied && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-xs text-green-500 mt-2 font-pixel tracking-wider"
                    >
                      ✓ COPIED TO CLIPBOARD
                    </motion.div>
                  )}
                </motion.div>

                {/* Fit Check */}
                <motion.div 
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.05 }}
                  className={`border rounded-3xl p-6 transition-all ${
                    willFit 
                      ? 'bg-green-500/10 border-green-500/30' 
                      : 'bg-red-500/10 border-red-500/30'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    {willFit ? (
                      <>
                        <CheckCircle size={32} weight="regular" className="text-green-500" />
                        <div className="font-pixel text-xs tracking-wider text-green-500 uppercase">Print Viable</div>
                      </>
                    ) : (
                      <>
                        <XCircle size={32} weight="regular" className="text-red-500" />
                        <div className="font-pixel text-xs tracking-wider text-red-500 uppercase">Exceeds Build Volume</div>
                      </>
                    )}
                  </div>
                  
                  {selectedPrinter && (
                    <div className="text-xs space-y-1 text-foreground/70">
                      <div className="font-pixel tracking-wider text-foreground">{selectedPrinter.manufacturer} {selectedPrinter.name}</div>
                      <div>Build Volume: {selectedPrinter.buildVolume.x} × {selectedPrinter.buildVolume.y} × {selectedPrinter.buildVolume.z} mm</div>
                      <div>Model Size: {resultMM.x.toFixed(1)} mm per dimension</div>
                      {!willFit && (
                        <div className="text-red-500 mt-2 pt-2 border-t border-red-500/30">
                          → Recommendation: Select larger printer or reduce scale
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>

                {/* Technical Details */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-neutral-500/10 backdrop-blur-md border border-neutral-500/20 rounded-3xl p-4 text-xs space-y-1 text-foreground/60"
                >
                  <div className="font-pixel tracking-wider text-foreground mb-2 uppercase">Calculation Breakdown</div>
                  <div>• Real: {realFeet}'-{realInches}" = {(parseFloat(realFeet) * 12 + parseFloat(realInches)).toFixed(2)}" total</div>
                  <div>• Scale Ratio: 1:{selectedScale}</div>
                  <div>• Model: {((parseFloat(realFeet) * 12 + parseFloat(realInches)) / selectedScale).toFixed(4)}"</div>
                  <div>• Converted: {resultMM.x.toFixed(2)} mm</div>
                  <div className="text-foreground/60 pt-2 border-t border-neutral-500/20 mt-2">
                    Note: Measure each axis (X, Y, Z) separately for full models
                  </div>
                </motion.div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-foreground/40">
                <div className="text-center">
                  <Cube size={48} weight="regular" className="mx-auto mb-4 opacity-40" />
                  <div className="font-pixel text-xs tracking-wider">AWAITING INPUT DATA...</div>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Usage Tips */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-neutral-500/10 backdrop-blur-md border border-neutral-500/20 rounded-3xl p-6 md:p-8"
          >
            <h3 className="font-pixel text-xs tracking-[0.3em] text-foreground/60 uppercase mb-4">
              Usage Tips
            </h3>
            <div className="space-y-3 text-sm text-foreground/70">
              <div className="flex items-start gap-3">
                <div className="w-1 h-1 bg-foreground mt-2 flex-shrink-0 rounded-full" />
                <span>This calculator assumes a single dimension. Measure each axis (X, Y, Z) separately for complex models.</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1 h-1 bg-foreground mt-2 flex-shrink-0 rounded-full" />
                <span>FDM printers: Best for structural models with PLA or PETG filament.</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1 h-1 bg-foreground mt-2 flex-shrink-0 rounded-full" />
                <span>Resin printers: Higher detail for decorative elements, smaller build volumes.</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1 h-1 bg-foreground mt-2 flex-shrink-0 rounded-full" />
                <span>Standard theatrical white model scale: 1/4" = 1'-0" (1:48 ratio)</span>
              </div>
            </div>
          </motion.div>

          {/* Example Image */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="bg-neutral-500/10 backdrop-blur-md border border-neutral-500/20 rounded-3xl overflow-hidden"
          >
            <div className="relative aspect-video bg-neutral-500/5 flex items-center justify-center">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=1000"
                alt="Architectural Model Example"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6">
              <h3 className="font-pixel text-xs tracking-[0.3em] text-foreground/60 uppercase mb-2">
                Professional Models
              </h3>
              <p className="text-sm text-foreground/70">
                Create precision architectural models at theatrical scale using 3D printing technology.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}