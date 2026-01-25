import { useState, useEffect, useRef } from 'react';
import { Cube, Copy, Check, Info, Ruler, ArrowRight, Table, CaretLeft, CaretRight } from 'phosphor-react';
import { RelatedTools } from '../components/studio/RelatedTools';
import { SEO } from '../components/SEO';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '../hooks/useTheme';

interface ScaleOption {
  label: string;
  ratio: number;
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

interface Props {
  onNavigate: (page: string) => void;
}

export function ArchitectureScaleConverter({ onNavigate }: Props) {
  // Theme Integration
  const context = useTheme();
  const theme = context?.theme || 'light';
  const isDark = theme === 'dark';

  const [activeTab, setActiveTab] = useState<'real-to-scale' | 'scale-to-real'>('real-to-scale');
  
  // Real -> Scale Inputs
  const [realFeet, setRealFeet] = useState<string>('10');
  const [realInches, setRealInches] = useState<string>('0');
  
  // Scale -> Real Inputs
  const [modelMM, setModelMM] = useState<string>('50');

  const [selectedScale, setSelectedScale] = useState<number>(48); // Default 1/4"
  const [resultMM, setResultMM] = useState<number | null>(null);
  const [resultReal, setResultReal] = useState<{ feet: number; inches: number } | null>(null);
  const [copied, setCopied] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Programmatic Colors (Fail-Safe) - V7 Unified Header (Safest)
  const colors = {
    // Page
    bgMain: isDark ? '#09090b' : '#f8fafc',
    
    // Text
    textMain: isDark ? '#ffffff' : '#0f172a',
    textMuted: isDark ? '#a1a1aa' : '#64748b',
    
    // Card
    cardBg: isDark ? 'rgba(255, 255, 255, 0.05)' : '#ffffff',
    cardBorder: isDark ? 'rgba(255, 255, 255, 0.1)' : '#e2e8f0',
    cardShadow: isDark ? 'none' : '0 10px 30px -5px rgba(0, 0, 0, 0.05)',
    
    // Inputs
    inputBg: isDark ? 'rgba(0, 0, 0, 0.4)' : '#f1f5f9',
    inputBorder: isDark ? 'rgba(255, 255, 255, 0.1)' : '#cbd5e1',
    inputText: isDark ? '#ffffff' : '#0f172a',
    
    // Buttons
    buttonActive: isDark ? 'rgba(6, 182, 212, 0.1)' : '#ecfeff',
    buttonActiveText: isDark ? '#06b6d4' : '#0891b2',
    buttonInactiveText: isDark ? '#a1a1aa' : '#64748b',

    // Ruler
    rulerBg: isDark ? 'rgba(0, 0, 0, 0.4)' : '#f1f5f9',

    // Promo Card
    promoBg: isDark ? 'linear-gradient(135deg, rgba(49, 46, 129, 0.9), rgba(88, 28, 135, 0.9))' : 'linear-gradient(135deg, #eff6ff, #f3e8ff)',
    promoBorder: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
    promoTextMain: isDark ? '#ffffff' : '#1e3a8a',
    promoTextSub: isDark ? 'rgba(255,255,255,0.7)' : '#475569',
    promoButtonBg: isDark ? 'rgba(255,255,255,0.1)' : '#ffffff',
    promoButtonText: isDark ? '#ffffff' : '#1e3a8a',

    // Header V7: Standardized Dark Header for consistency (Fixes "Milky White" gradient issue)
    headerBorder: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0,0,0,0.05)',
    headerOverlay: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 40%, transparent 100%)', // Always dark tint
    headerText: '#ffffff', // Always white text
    headerIcon: 'rgba(255,255,255,0.6)' // Always white icon
  };

  // Calculation Logic
  useEffect(() => {
    if (activeTab === 'real-to-scale') {
      const feet = parseFloat(realFeet) || 0;
      const inches = parseFloat(realInches) || 0;
      if (feet === 0 && inches === 0) {
        setResultMM(null);
        return;
      }
      const totalInches = (feet * 12) + inches;
      const modelInches = totalInches / selectedScale;
      setResultMM(modelInches * 25.4);
    } else {
      const mm = parseFloat(modelMM) || 0;
      if (mm === 0) {
        setResultReal(null);
        return;
      }
      const modelInches = mm / 25.4;
      const realTotalInches = modelInches * selectedScale;
      setResultReal({
        feet: Math.floor(realTotalInches / 12),
        inches: realTotalInches % 12
      });
    }
  }, [realFeet, realInches, modelMM, selectedScale, activeTab]);

  const copyToClipboard = async (text: string) => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <>
      <SEO 
        title="Scale Calculator"
        description="Convert real-world dimensions to theatrical scale model measurements (1:48, 1:24, etc) for 3D printing and handicraft."
        keywords={['scale converter', 'model making', 'theatrical design', '3d printing scale', '1/4 inch scale']}
      />

      <div 
         className="min-h-screen pb-20 font-sans transition-colors duration-300"
         style={{ backgroundColor: colors.bgMain, color: colors.textMain }}
      >
        <div className="pt-32 md:pt-40 pb-12 container mx-auto px-4 max-w-7xl">
            
            {/* Navigation Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
                <div>
                     <button 
                        onClick={() => onNavigate('app-studio')}
                        className="group flex items-center gap-2 text-sm transition-colors mb-3"
                        style={{ color: colors.textMuted }}
                    >
                        <ArrowRight className="rotate-180 group-hover:-translate-x-1 transition-transform" />
                        <span>Back to Studio</span>
                    </button>
                    <h1 className="font-display text-4xl md:text-5xl uppercase tracking-tight">
                        Scale <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Calculator</span>
                    </h1>
                </div>
                </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 mb-24">
                
                {/* Main Tool Column (8 Cols) */}
                <div className="lg:col-span-8 space-y-6">
                    
                    {/* Header Image - UNIFIED DARK STYLE */}
                    <div 
                        className="relative aspect-[2.35/1] rounded-3xl overflow-hidden shadow-2xl border group" 
                        style={{ borderColor: colors.headerBorder }}
                    >
                        <img 
                            src="/images/studio/scale-converter-abstract.webp" 
                            alt="Scale Calculator Visual" 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                        />
                        {/* Always use Dark Gradient for Image Text Legibility */}
                        <div 
                            className="absolute inset-0" 
                            style={{ background: colors.headerOverlay }}
                        />
                        
                         {/* Overlay Content */}
                        <div className="absolute bottom-0 left-0 right-0 p-8 flex items-end justify-between">
                            <div>
                                <p className="text-sm max-w-md drop-shadow-md font-medium" style={{ color: colors.headerText }}>
                                    Precision conversion engine for theatrical drafting and scale model fabrication.
                                </p>
                            </div>
                            <Cube weight="duotone" className="w-16 h-16" style={{ color: colors.headerIcon }} />
                        </div>
                    </div>

                    {/* Main Interface Card */}
                    <div 
                         className="backdrop-blur-sm border rounded-3xl overflow-hidden transition-all duration-300"
                         style={{ 
                             backgroundColor: colors.cardBg, 
                             borderColor: colors.cardBorder,
                             boxShadow: colors.cardShadow 
                         }}
                    >
                        
                        {/* Tab Switcher */}
                        <div className="flex border-b" style={{ borderColor: colors.cardBorder }}>
                            <button
                                onClick={() => setActiveTab('real-to-scale')}
                                className="flex-1 py-6 text-xs md:text-sm font-bold uppercase tracking-widest transition-all relative"
                                style={{
                                    color: activeTab === 'real-to-scale' ? colors.buttonActiveText : colors.buttonInactiveText,
                                    backgroundColor: activeTab === 'real-to-scale' ? colors.buttonActive : 'transparent'
                                }}
                            >
                                Real World → Scale Model
                            </button>
                            <button
                                onClick={() => setActiveTab('scale-to-real')}
                                className="flex-1 py-6 text-xs md:text-sm font-bold uppercase tracking-widest transition-all relative"
                                style={{
                                    color: activeTab === 'scale-to-real' ? colors.buttonActiveText : colors.buttonInactiveText,
                                    backgroundColor: activeTab === 'scale-to-real' ? colors.buttonActive : 'transparent'
                                }}
                            >
                                Scale Model → Real World
                            </button>
                        </div>

                        <div className="p-8 md:p-10">
                            <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] gap-8 items-center">
                                {/* INPUT */}
                                <div className="space-y-4">
                                    <label className="block text-[10px] font-bold uppercase tracking-widest" style={{ color: colors.textMuted }}>
                                        Input ({activeTab === 'real-to-scale' ? 'Imperial' : 'Metric'})
                                    </label>
                                    
                                    {activeTab === 'real-to-scale' ? (
                                        <div className="flex gap-4">
                                            <div className="group relative">
                                                <input
                                                    type="number"
                                                    value={realFeet}
                                                    onChange={(e) => setRealFeet(e.target.value)}
                                                    className="w-full border rounded-xl px-4 py-4 text-3xl font-mono text-center focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder:text-opacity-20 shadow-sm"
                                                    style={{ 
                                                        backgroundColor: colors.inputBg, 
                                                        borderColor: colors.inputBorder,
                                                        color: colors.inputText
                                                    }}
                                                    placeholder="0"
                                                />
                                                <span className="absolute -bottom-6 left-0 right-0 text-center text-[10px] font-bold uppercase tracking-wider transition-colors" style={{ color: colors.textMuted }}>Feet</span>
                                            </div>
                                            <div className="group relative">
                                                <input
                                                    type="number"
                                                    value={realInches}
                                                    onChange={(e) => setRealInches(e.target.value)}
                                                    className="w-full border rounded-xl px-4 py-4 text-3xl font-mono text-center focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder:text-opacity-20 shadow-sm"
                                                    style={{ 
                                                        backgroundColor: colors.inputBg, 
                                                        borderColor: colors.inputBorder,
                                                        color: colors.inputText
                                                    }}
                                                    placeholder="0"
                                                />
                                                <span className="absolute -bottom-6 left-0 right-0 text-center text-[10px] font-bold uppercase tracking-wider transition-colors" style={{ color: colors.textMuted }}>Inches</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="group relative">
                                            <input
                                                type="number"
                                                value={modelMM}
                                                onChange={(e) => setModelMM(e.target.value)}
                                                className="w-full border rounded-xl px-4 py-4 text-3xl font-mono text-center focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder:text-opacity-20 shadow-sm"
                                                style={{ 
                                                    backgroundColor: colors.inputBg, 
                                                    borderColor: colors.inputBorder,
                                                    color: colors.inputText
                                                }}
                                                placeholder="0"
                                            />
                                            <span className="absolute -bottom-6 left-0 right-0 text-center text-[10px] font-bold uppercase tracking-wider transition-colors" style={{ color: colors.textMuted }}>Millimeters</span>
                                        </div>
                                    )}
                                </div>

                                {/* Divider */}
                                <div className="hidden md:flex flex-col items-center justify-center gap-2 pt-6">
                                    <div className="w-px h-12 bg-gradient-to-b from-transparent to-transparent" style={{ backgroundImage: `linear-gradient(to bottom, transparent, ${colors.cardBorder}, transparent)` }} />
                                    <div className="p-2 rounded-full border shadow-sm" style={{ backgroundColor: colors.inputBg, borderColor: colors.cardBorder }}>
                                        <ArrowRight size={20} className="text-cyan-500" />
                                    </div>
                                    <div className="w-px h-12 bg-gradient-to-b from-transparent to-transparent" style={{ backgroundImage: `linear-gradient(to bottom, transparent, ${colors.cardBorder}, transparent)` }} />
                                </div>

                                {/* OUTPUT */}
                                <div className="space-y-4">
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-right" style={{ color: colors.textMuted }}>
                                        Result ({activeTab === 'real-to-scale' ? 'Metric' : 'Imperial'})
                                    </label>
                                    
                                    <div 
                                        className="rounded-2xl p-6 relative group h-[88px] flex items-center justify-center overflow-hidden border shadow-inner"
                                        style={{ 
                                            backgroundColor: isDark ? 'rgba(6, 182, 212, 0.1)' : '#ecfeff',
                                            borderColor: isDark ? 'rgba(6, 182, 212, 0.2)' : '#cffafe'
                                        }}
                                    >
                                        <button 
                                            onClick={() => {
                                                if (activeTab === 'real-to-scale' && resultMM) copyToClipboard(resultMM.toFixed(2));
                                                if (activeTab === 'scale-to-real' && resultReal) copyToClipboard(`${resultReal.feet}'-${resultReal.inches.toFixed(2)}"`);
                                            }}
                                            className="absolute top-2 right-2 p-1.5 rounded-lg hover:bg-black/5 text-cyan-600 transition-colors z-20"
                                            title="Copy Result"
                                        >
                                            {copied ? <Check size={14} weight="bold" /> : <Copy size={14} weight="bold" />}
                                        </button>

                                        <div className="relative z-10 text-center">
                                            {activeTab === 'real-to-scale' ? (
                                                resultMM !== null ? (
                                                    <span className="text-4xl font-mono font-bold" style={{ color: isDark ? '#ecfeff' : '#0e7490' }}>
                                                        {resultMM.toFixed(2)}<span className="text-base ml-1 opacity-60">mm</span>
                                                    </span>
                                                ) : <span className="text-4xl font-mono opacity-20" style={{ color: colors.textMain }}>---</span>
                                            ) : (
                                                resultReal ? (
                                                    <span className="text-3xl font-mono font-bold" style={{ color: isDark ? '#ecfeff' : '#0e7490' }}>
                                                        {resultReal.feet}'<span className="opacity-60 mx-1">-</span>{resultReal.inches.toFixed(2)}"
                                                    </span>
                                                ) : <span className="text-4xl font-mono opacity-20" style={{ color: colors.textMain }}>---</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

{/* Scale Ruler UI */}
                            <div className="mt-16">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-2" style={{ color: colors.textMuted }}>
                                        <Ruler size={18} className="text-cyan-500" />
                                        <span className="text-xs font-bold uppercase tracking-widest">Scale Ratio</span>
                                    </div>
                                    <span className="text-sm font-mono px-2 py-1 rounded border" style={{ backgroundColor: colors.inputBg, color: colors.textMain, borderColor: colors.cardBorder }}>
                                        1:{selectedScale}
                                    </span>
                                </div>
                                
                                <div 
                                    className="relative border rounded-2xl flex items-center overflow-hidden"
                                    style={{ backgroundColor: colors.rulerBg, borderColor: colors.cardBorder }}
                                >
                                    {/* Left Scroll Button */}
                                    <button 
                                        onClick={() => {
                                            if (scrollContainerRef.current) {
                                                scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
                                            }
                                        }}
                                        className="absolute left-0 top-0 bottom-0 z-20 px-2 flex items-center justify-center transition-colors hover:bg-black/5"
                                        style={{ color: colors.textMuted }}
                                        aria-label="Scroll left"
                                    >
                                        <CaretLeft size={24} />
                                    </button>

                                    {/* Draggable/Scrollable Scales */}
                                    <div 
                                        ref={scrollContainerRef}
                                        className="flex gap-3 overflow-x-auto w-full no-scrollbar px-12 snap-mandatory snap-x items-center py-6 mask-linear-fade scroll-smooth"
                                    >
                                        {ARCHITECTURAL_SCALES.map((scale) => (
                                            <button
                                                key={scale.ratio}
                                                onClick={() => setSelectedScale(scale.ratio)}
                                                className="flex-shrink-0 snap-center px-6 py-3 rounded-xl border transition-all duration-300 relative group"
                                                style={{
                                                    backgroundColor: selectedScale === scale.ratio 
                                                        ? (isDark ? 'rgba(6, 182, 212, 0.2)' : '#ecfeff') 
                                                        : (isDark ? 'rgba(255,255,255,0.05)' : '#ffffff'),
                                                    borderColor: selectedScale === scale.ratio ? '#06b6d4' : colors.cardBorder,
                                                    color: selectedScale === scale.ratio 
                                                        ? (isDark ? '#22d3ee' : '#0891b2') 
                                                        : colors.textMuted,
                                                    boxShadow: selectedScale === scale.ratio ? '0 0 15px rgba(6, 182, 212, 0.2)' : '0 2px 4px rgba(0,0,0,0.05)'
                                                }}
                                            >
                                                <span className="text-sm font-bold block">{scale.label}</span>
                                                <span className="text-[10px] opacity-70 font-mono mt-1 block">1:{48 / (48/scale.ratio)}</span>
                                            </button>
                                        ))}
                                    </div>

                                    {/* Right Scroll Button */}
                                    <button 
                                        onClick={() => {
                                            if (scrollContainerRef.current) {
                                                scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
                                            }
                                        }}
                                        className="absolute right-0 top-0 bottom-0 z-20 px-2 flex items-center justify-center transition-colors hover:bg-black/5"
                                        style={{ color: colors.textMuted }}
                                        aria-label="Scroll right"
                                    >
                                        <CaretRight size={24} />
                                    </button>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                {/* Sidebar (4 Cols) */}
                <div className="lg:col-span-4 space-y-6">
                     {/* Info Card - Glassmorphism */}
                    <div 
                        className="border rounded-3xl p-8 backdrop-blur-md shadow-sm"
                        style={{ 
                            backgroundColor: colors.cardBg, 
                            borderColor: colors.cardBorder 
                        }}
                    >
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white mb-6 shadow-lg shadow-cyan-900/20">
                            <Info size={24} weight="bold" />
                        </div>
                        <h3 className="font-display text-xl mb-4" style={{ color: colors.textMain }}>Understanding Scale</h3>
                        <div className="space-y-4">
                            <div className="flex gap-4 items-start group">
                                <div className="w-1 h-12 rounded-full mt-1 transition-colors" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0' }} />
                                <div>
                                    <h4 className="text-sm font-bold mb-1" style={{ color: colors.textMain }}>1/4" Scale (1:48)</h4>
                                    <p className="text-xs leading-relaxed" style={{ color: colors.textMuted }}>
                                        The industry standard for theatrical "White Models". Best balance of detail and size.
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-4 items-start group">
                                <div className="w-1 h-12 rounded-full mt-1 transition-colors" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0' }} />
                                <div>
                                    <h4 className="text-sm font-bold mb-1" style={{ color: colors.textMain }}>1/2" Scale (1:24)</h4>
                                    <p className="text-xs leading-relaxed" style={{ color: colors.textMuted }}>
                                        Used for detailed prop drafting and texturing references.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Reference Promo - fully themed */}
                    <div 
                        className="border rounded-3xl p-5 relative overflow-hidden group transition-all shadow-lg"
                        style={{ 
                            background: colors.promoBg,
                            borderColor: colors.promoBorder
                        }}
                    >
                        <div className="relative z-10">
                            <div className="mb-4">
                                <Table size={24} className="mb-3" style={{ color: '#06b6d4' }} />
                                <h3 className="font-display text-lg mb-1" style={{ color: colors.promoTextMain }}>Standard Dimensions</h3>
                                <p className="text-xs" style={{ color: colors.promoTextSub }}>Furniture, door, and prop measurements.</p>
                            </div>
                            
                            <button 
                                onClick={() => onNavigate('dimension-reference')}
                                className="w-full py-3 border font-bold text-[10px] uppercase tracking-widest rounded-xl transition-all"
                                style={{
                                    backgroundColor: colors.promoButtonBg,
                                    borderColor: colors.promoBorder,
                                    color: colors.promoButtonText
                                }}
                            >
                                Open Database
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>

             {/* Footer Related Tools */}
            <div className="pt-20" style={{ borderTopWidth: 1, borderColor: colors.cardBorder }}>
                <RelatedTools currentToolId="architecture-scale-converter" />
            </div>

        </div>

    </>
  );
}

export default ArchitectureScaleConverter;