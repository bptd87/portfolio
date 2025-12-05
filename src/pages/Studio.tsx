import React from 'react';
import { ArrowRight, Play, Code, Wrench, Sparkles } from 'lucide-react';
import { PageHeader } from '../components/shared/PageHeader';

interface StudioProps {
  onNavigate: (page: string) => void;
}

export function Studio({ onNavigate }: StudioProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <PageHeader
        variant="minimal"
        title="Studio"
        subtitle="Professional tools and creative experiments—where design meets technology"
      />

      {/* Two-Column Studio Showcase */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Scenic Studio - Professional Side */}
          <div 
            onClick={() => onNavigate('scenic-studio')}
            className="group relative overflow-hidden border border-border hover:border-foreground bg-card cursor-pointer transition-all duration-300"
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0" style={{
                backgroundImage: `linear-gradient(var(--border) 1px, transparent 1px),
                                  linear-gradient(90deg, var(--border) 1px, transparent 1px)`,
                backgroundSize: '20px 20px'
              }} />
            </div>

            <div className="relative p-8 md:p-12">
              {/* Icon */}
              <div className="mb-6 inline-flex items-center justify-center w-16 h-16 border border-border bg-secondary">
                <Play size={32} className="text-foreground" />
              </div>

              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-secondary border border-border mb-4">
                <Wrench size={14} className="text-accent-brand" />
                <span className="text-xs uppercase tracking-wider text-muted-foreground">
                  Professional Tools
                </span>
              </div>

              {/* Title */}
              <h2 className="mb-4 group-hover:text-accent-brand transition-colors">
                Scenic Studio
              </h2>

              {/* Description */}
              <p className="text-muted-foreground mb-8 leading-relaxed">
                VectorWorks tutorials, project walkthroughs, and professional scenic design workflows. 
                Learn 3D modeling, rendering, and technical documentation from real productions.
              </p>

              {/* Features List */}
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3 text-sm text-muted-foreground">
                  <div className="w-1 h-1 bg-accent-brand mt-2 flex-shrink-0" />
                  <span>Step-by-step VectorWorks tutorials</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-muted-foreground">
                  <div className="w-1 h-1 bg-accent-brand mt-2 flex-shrink-0" />
                  <span>Behind-the-scenes design walkthroughs</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-muted-foreground">
                  <div className="w-1 h-1 bg-accent-brand mt-2 flex-shrink-0" />
                  <span>3D modeling and rendering techniques</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-muted-foreground">
                  <div className="w-1 h-1 bg-accent-brand mt-2 flex-shrink-0" />
                  <span>Technical drafting best practices</span>
                </li>
              </ul>

              {/* CTA */}
              <button className="inline-flex items-center gap-2 text-foreground group-hover:text-accent-brand transition-colors">
                <span className="uppercase tracking-wider text-xs">Explore Tutorials</span>
                <ArrowRight size={16} className="icon-shift" />
              </button>
            </div>
          </div>

          {/* App Studio - Creative Side */}
          <div 
            onClick={() => onNavigate('app-studio')}
            className="group relative overflow-hidden border border-border hover:border-foreground bg-card cursor-pointer transition-all duration-300"
          >
            {/* Retro Grid Background */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0" style={{
                backgroundImage: `
                  linear-gradient(var(--accent-brand) 2px, transparent 2px),
                  linear-gradient(90deg, var(--accent-brand) 2px, transparent 2px)
                `,
                backgroundSize: '40px 40px',
                transform: 'perspective(500px) rotateX(60deg)',
                transformOrigin: 'bottom'
              }} />
            </div>

            <div className="relative p-8 md:p-12">
              {/* Icon */}
              <div className="mb-6 inline-flex items-center justify-center w-16 h-16 border border-border bg-secondary">
                <Code size={32} className="text-foreground" />
              </div>

              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-secondary border border-border mb-4">
                <Sparkles size={14} className="text-accent-brand" />
                <span className="text-xs uppercase tracking-wider text-muted-foreground">
                  Creative Experiments
                </span>
              </div>

              {/* Title */}
              <h2 className="mb-4 group-hover:text-accent-brand transition-colors">
                App Studio
              </h2>

              {/* Description */}
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Web-based tools and calculators for scenic designers. Scale converters, dimension references, 
                paint calculators, and design history databases—all built with a retro computing aesthetic.
              </p>

              {/* Features List */}
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3 text-sm text-muted-foreground">
                  <div className="w-1 h-1 bg-accent-brand mt-2 flex-shrink-0" />
                  <span>Scale conversion and 3D print calculators</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-muted-foreground">
                  <div className="w-1 h-1 bg-accent-brand mt-2 flex-shrink-0" />
                  <span>Dimension reference databases</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-muted-foreground">
                  <div className="w-1 h-1 bg-accent-brand mt-2 flex-shrink-0" />
                  <span>Paint and material calculators</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-muted-foreground">
                  <div className="w-1 h-1 bg-accent-brand mt-2 flex-shrink-0" />
                  <span>Design history and reference tools</span>
                </li>
              </ul>

              {/* CTA */}
              <button className="inline-flex items-center gap-2 text-foreground group-hover:text-accent-brand transition-colors">
                <span className="uppercase tracking-wider text-xs">Launch App Studio</span>
                <ArrowRight size={16} className="icon-shift" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Statement */}
        <div className="mt-16 text-center max-w-3xl mx-auto border-t border-border pt-12">
          <p className="text-muted-foreground leading-relaxed">
            <strong className="text-foreground">Two sides of the same practice:</strong> Scenic Studio provides 
            the professional workflows and technical knowledge, while App Studio builds the digital tools 
            that make design work faster and more enjoyable. Together, they represent a complete approach 
            to modern scenic design—where craft meets code.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Studio;
