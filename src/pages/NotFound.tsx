import React from 'react';
import { SEO } from '../components/SEO';
import { PAGE_METADATA } from '../utils/seo/metadata';
import { ArrowLeft, Home } from 'lucide-react';
import contactIllustration from 'figma:asset/713a974ae3548a5674493504146826237eb95429.png';

interface NotFoundProps {
  onNavigate: (page: string, slug?: string) => void;
}

export function NotFound({ onNavigate }: NotFoundProps) {
  return (
    <>
      <SEO metadata={PAGE_METADATA['404']} />
      
      <div className="min-h-screen bg-background flex items-center justify-center px-6 py-24">
        <div className="max-w-4xl w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Image */}
            <div className="order-2 md:order-1 relative">
              <style>{`
                @keyframes float-404 {
                  0%, 100% {
                    transform: translateY(0px);
                  }
                  50% {
                    transform: translateY(-20px);
                  }
                }
                
                @keyframes pulse-glow-404 {
                  0%, 100% {
                    filter: drop-shadow(0 0 20px rgba(168, 85, 247, 0.4));
                  }
                  50% {
                    filter: drop-shadow(0 0 40px rgba(168, 85, 247, 0.6));
                  }
                }
                
                .cat-illustration-404 {
                  animation: float-404 6s ease-in-out infinite;
                  transition: transform 0.3s ease;
                }
                
                .cat-illustration-404:hover {
                  animation: float-404 6s ease-in-out infinite, pulse-glow-404 2s ease-in-out infinite;
                  transform: scale(1.02);
                }
              `}</style>
              <img 
                src={contactIllustration} 
                alt="Brandon at work with his cat"
                className="w-full max-w-md mx-auto rounded-2xl cat-illustration-404"
              />
            </div>

            {/* Content */}
            <div className="order-1 md:order-2 text-center md:text-left">
              <p className="font-pixel text-[11px] tracking-[0.3em] text-muted-foreground uppercase mb-4">
                Page Not Found
              </p>
              <h1 className="font-display text-6xl md:text-7xl italic text-foreground mb-4">
                404
              </h1>
              <p className="font-sans text-lg text-muted-foreground leading-relaxed mb-8 max-w-md">
                Looks like this page wandered off. Even my cat couldn't find it. Let's get you back on track.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <button 
                  onClick={() => onNavigate('home')}
                  className="font-sans inline-flex items-center justify-center gap-2 bg-foreground text-background font-medium py-3 px-6 rounded-xl hover:opacity-90 transition-opacity"
                >
                  <Home className="w-4 h-4" />
                  Return Home
                </button>
                <button 
                  onClick={() => onNavigate('portfolio')}
                  className="font-sans inline-flex items-center justify-center gap-2 bg-muted text-foreground font-medium py-3 px-6 rounded-xl hover:bg-muted/80 transition-colors"
                >
                  View Portfolio
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
