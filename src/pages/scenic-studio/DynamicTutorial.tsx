import React, { useState, useEffect } from 'react';
import { TutorialTemplate } from './TutorialTemplate';
import { getTutorialBySlug } from '../../data/tutorials';
import { NotFound } from '../NotFound';
import { CheckCircle, Lightbulb, AlertCircle, BookOpen } from 'lucide-react';
import { renderBlocksToHTML } from '../../components/admin/BlockRenderer';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface DynamicTutorialProps {
  slug: string;
  onNavigate: (page: string) => void;
}

export function DynamicTutorial({ slug, onNavigate }: DynamicTutorialProps) {
  const [tutorial, setTutorial] = useState(getTutorialBySlug(slug));
  /* Add Key Concepts to state init if missing from getTutorialBySlug? 
     Ideally getTutorialBySlug should handle it, but for dynamic fetch it works. */
  const [relatedTutorials, setRelatedTutorials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTutorial = async () => {
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/tutorials/${slug}`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.tutorial) {
            setTutorial(data.tutorial);
          }
        }
      } catch (err) {
        console.error('Failed to fetch tutorial:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTutorial();
  }, [slug]);

  // Fetch related tutorials automatically
  useEffect(() => {
    if (!tutorial?.category) return;

    const fetchRelated = async () => {
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/tutorials?minimal=true`,
          {
            headers: { 'Authorization': `Bearer ${publicAnonKey}` },
          }
        );
        if (response.ok) {
          const data = await response.json();
          if (data.tutorials) {
            // Filter by same category, exclude current, limit to 3
            const related = data.tutorials
              .filter((t: any) => t.category === tutorial.category && t.slug !== slug)
              .slice(0, 3)
              .map((t: any) => ({
                title: t.title,
                slug: t.slug,
                thumbnail: t.thumbnail,
                duration: t.duration
              }));
            setRelatedTutorials(related);
          }
        }
      } catch (err) {
        console.error('Failed to fetch related tutorials:', err);
      }
    };
    fetchRelated();
  }, [tutorial, slug]);

  // Show loading state while fetching
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-1 w-24 bg-white/20 overflow-hidden rounded-full">
            <div className="h-full w-full bg-white animate-progress-indeterminateOrigin"></div>
          </div>
          <p className="font-pixel text-[10px] tracking-[0.3em] text-white/40 animate-pulse">LOADING TUTORIAL</p>
        </div>
      </div>
    );
  }

  if (!tutorial) {
    return <NotFound onNavigate={onNavigate} />;
  }

  // Build the content ReactNode from tutorial data
  const buildContent = () => {
    return (
      <>
        {/* Learning Objectives Section Rendering Removed (Handled by Template) */}

        {/* Tutorial Content (Blocks or HTML) */}
        {tutorial.tutorialContent && (
          <div className="article-content space-y-8 mb-12">
            {Array.isArray(tutorial.tutorialContent) ? (
              // Render blocks with rich text styling support
              <div
                className="[&_strong]:font-bold [&_strong]:text-accent-brand [&_a]:text-accent-brand [&_a]:underline [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_blockquote]:border-l-4 [&_blockquote]:border-accent-brand [&_blockquote]:pl-4 [&_blockquote]:italic [&_h1]:text-2xl [&_h2]:text-xl [&_h3]:text-lg [&_h1]:font-bold [&_h2]:font-bold [&_h3]:font-bold [&_h1]:mt-8 [&_h2]:mt-6 [&_h3]:mt-4"
                dangerouslySetInnerHTML={{ __html: renderBlocksToHTML(tutorial.tutorialContent) }}
              />
            ) : (
              // Render HTML string (backward compatibility)
              <div dangerouslySetInnerHTML={{ __html: tutorial.tutorialContent }} />
            )}
          </div>
        )}

        {/* Pro Tips */}
        {tutorial.proTips && tutorial.proTips.length > 0 && (
          <div className="my-12">
            {tutorial.proTips.map((tip, index) => (
              <div
                key={index}
                className="flex gap-4 p-6 border mb-6 rounded-lg bg-accent-brand/5 border-accent-brand/20"
                style={{ backgroundColor: 'rgba(212, 175, 55, 0.1)', borderColor: 'rgba(212, 175, 55, 0.2)' }}
              >
                <Lightbulb className="w-6 h-6 flex-shrink-0 mt-1 text-accent-brand" style={{ color: '#d4af37' }} />
                <div>
                  <h4 className="mb-2 flex items-center gap-2">
                    <span className="text-sm uppercase tracking-wider font-bold text-accent-brand" style={{ color: '#d4af37' }}>Pro Tip</span>
                  </h4>
                  <p className="text-muted-foreground leading-relaxed">{tip}</p>
                </div>
              </div>
            ))}
          </div>
        )}



        {/* Key Concepts (New Section) */}
        {
          tutorial.keyConcepts && tutorial.keyConcepts.length > 0 && (
            <div className="my-12 p-8 border border-accent-brand/20 bg-accent-brand/5 rounded-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-10">
                <BookOpen className="w-32 h-32 text-accent-brand" />
              </div>
              <h3 className="mb-6 flex items-center gap-3 text-accent-brand">
                <BookOpen className="w-6 h-6" />
                Key Concepts
              </h3>
              <ul className="space-y-4 relative z-10">
                {tutorial.keyConcepts.map((concept: string, index: number) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent-brand flex-shrink-0" />
                    <span className="text-lg leading-relaxed">{concept}</span>
                  </li>
                ))}
              </ul>
            </div>
          )
        }

        {/* Quick Reference Section */}
        {
          ((tutorial.keyShortcuts && tutorial.keyShortcuts.length > 0) ||
            (tutorial.commonPitfalls && tutorial.commonPitfalls.length > 0)) && (
            <div className="mt-16 pt-12 border-t border-border">
              <h3 className="mb-8">Quick Reference</h3>
              <div className="space-y-12">
                {/* Key Shortcuts */}
                {tutorial.keyShortcuts && tutorial.keyShortcuts.length > 0 && (
                  <div className="border border-border p-8 bg-card/30">
                    <h4 className="mb-6 text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <BookOpen className="w-4 h-4" /> Essential Shortcuts
                    </h4>
                    <div className="space-y-4">
                      {tutorial.keyShortcuts.map((shortcut, index) => (
                        <div key={index} className="flex flex-col md:flex-row md:items-center gap-4 justify-between border-b border-border/50 pb-3 last:border-0 last:pb-0">
                          <code className="px-3 py-1.5 bg-secondary text-sm border border-border rounded w-fit font-mono text-accent-brand">
                            {shortcut.shortcut}
                          </code>
                          <span className="text-muted-foreground md:text-right text-sm">{shortcut.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Common Pitfalls */}
                {tutorial.commonPitfalls && tutorial.commonPitfalls.length > 0 && (
                  <div className="border border-border p-8 bg-card/30">
                    <h4 className="mb-6 text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" /> Common Pitfalls
                    </h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      {tutorial.commonPitfalls.map((pitfall, index) => (
                        <div key={index} className="flex items-start gap-3 p-4 bg-destructive/5 border border-destructive/10 rounded">
                          <div className="mt-1 w-1.5 h-1.5 rounded-full bg-destructive flex-shrink-0" />
                          <span className="text-muted-foreground text-sm leading-relaxed">{pitfall}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        }

        {/* Default content if none provided */}
        {
          !tutorial.tutorialContent &&
          (!tutorial.learningObjectives || tutorial.learningObjectives.length === 0) && (
            <div className="mb-8">
              <h2>About This Tutorial</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {tutorial.description}
              </p>
            </div>
          )
        }
      </>
    );
  };

  const tutorialWithContent = {
    title: tutorial.title,
    description: tutorial.description,
    category: tutorial.category,
    duration: tutorial.duration,
    publishDate: tutorial.publishDate,
    videoUrl: tutorial.videoUrl,
    content: buildContent(),
    resources: tutorial.resources || [],
    relatedTutorials: relatedTutorials.length > 0 ? relatedTutorials : (tutorial.relatedTutorials || []),
    learningObjectives: tutorial.learningObjectives || [],
  };

  return <TutorialTemplate tutorial={tutorialWithContent} onNavigate={onNavigate} />;
}

export default DynamicTutorial;