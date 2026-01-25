import React from 'react';
import { Play, Clock, ExternalLink } from 'lucide-react';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';

interface Resource {
  name: string;
  description: string;
  url: string;
}

interface RelatedWalkthrough {
  slug: string;
  title: string;
  thumbnail: string;
  duration: string;
}

interface WalkthroughData {
  slug: string;
  title: string;
  description: string;
  category: string;
  thumbnail: string;
  videoUrl: string;
  duration: string;
  publishDate: string;
  content: React.ReactNode;
  credits?: React.ReactNode;
  resources?: Resource[];
  relatedWalkthroughs?: RelatedWalkthrough[];
}

interface WalkthroughTemplateProps {
  walkthrough: WalkthroughData;
  onNavigate: (page: string) => void;
}

export function WalkthroughTemplate({ walkthrough, onNavigate }: WalkthroughTemplateProps) {
  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
      {/* Hero Section */}
      <div className="border-b border-black/10 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-12 md:py-16">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm opacity-40 mb-8 tracking-wider">
            <button
              onClick={() => onNavigate('scenic-studio')}
              className="hover:opacity-100 transition-opacity"
            >
              SCENIC DESIGN STUDIO
            </button>
            <span>/</span>
            <span className="opacity-60">{walkthrough.category.toUpperCase()}</span>
          </div>

          {/* Title */}
          <h1 className="mb-8 max-w-5xl">{walkthrough.title}</h1>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 text-sm opacity-40 mb-12">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{walkthrough.duration}</span>
            </div>
            <span>•</span>
            <span>{new Date(walkthrough.publishDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
          </div>

          {/* Video Player */}
          <div className="relative w-full bg-black border border-black dark:border-white" style={{ paddingBottom: '56.25%' }}>
            <iframe
              src={walkthrough.videoUrl}
              title={walkthrough.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-16 md:py-24">
        <div className="grid lg:grid-cols-12 gap-16">
          {/* Main Content */}
          <div className="lg:col-span-8">
            <div className="prose-custom max-w-none">
              {walkthrough.content}
            </div>

            {/* Credits */}
            {walkthrough.credits && (
              <div className="mt-24 pt-12 border-t border-black/10 dark:border-white/10">
                {walkthrough.credits}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-12">
            {/* Resources */}
            {walkthrough.resources && walkthrough.resources.length > 0 && (
              <div>
                <h3 className="mb-6 text-sm tracking-wider opacity-40">RESOURCES</h3>
                <div className="space-y-4">
                  {walkthrough.resources.map((resource, index) => (
                    <a
                      key={index}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-4 border border-black/10 dark:border-white/10 hover:border-accent-brand dark:hover:border-accent-brand transition-colors group"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm mb-1 group-hover:text-accent-brand transition-colors">
                            {resource.name}
                          </div>
                          <p className="text-xs opacity-40 leading-relaxed">
                            {resource.description}
                          </p>
                        </div>
                        <ExternalLink className="w-4 h-4 opacity-20 group-hover:opacity-100 group-hover:text-accent-brand transition-all flex-shrink-0 mt-0.5" />
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Related Walkthroughs */}
            {walkthrough.relatedWalkthroughs && walkthrough.relatedWalkthroughs.length > 0 && (
              <div>
                <h3 className="mb-6 text-sm tracking-wider opacity-40">RELATED WALKTHROUGHS</h3>
                <div className="space-y-6">
                  {walkthrough.relatedWalkthroughs.map((related) => (
                    <button
                      key={related.slug}
                      onClick={() => onNavigate(`scenic-studio/${related.slug}`)}
                      className="group text-left w-full"
                    >
                      <div className="relative aspect-video bg-black mb-3 overflow-hidden border border-black/10 dark:border-white/10">
                        <ImageWithFallback
                          src={related.thumbnail}
                          alt={related.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                          <div className="w-12 h-12 border border-white bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/20 transition-all">
                            <Play className="w-5 h-5 text-white ml-0.5" fill="currentColor" />
                          </div>
                        </div>
                        <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/90 text-white px-2 py-1 text-xs">
                          <Clock className="w-3 h-3" />
                          <span>{related.duration}</span>
                        </div>
                      </div>
                      <h4 className="text-sm leading-snug group-hover:text-accent-brand transition-colors">
                        {related.title}
                      </h4>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
