import React from 'react';
import { TutorialTemplate } from './TutorialTemplate';
import { getTutorialBySlug } from '../../data/tutorials';
import { NotFound } from '../NotFound';
import { CheckCircle, Lightbulb, AlertCircle, BookOpen } from 'lucide-react';
import { renderBlocksToHTML } from '../../components/admin/BlockRenderer';

interface DynamicTutorialProps {
  slug: string;
  onNavigate: (page: string) => void;
}

export function DynamicTutorial({ slug, onNavigate }: DynamicTutorialProps) {
  const tutorial = getTutorialBySlug(slug);

  if (!tutorial) {
    return <NotFound onNavigate={onNavigate} />;
  }

  // Build the content ReactNode from tutorial data
  const buildContent = () => {
    return (
      <>
        {/* Learning Objectives Section */}
        {tutorial.learningObjectives && tutorial.learningObjectives.length > 0 && (
          <div className="mb-16 pb-12 border-b border-border">
            <div className="flex items-center gap-3 mb-6">
              <CheckCircle className="w-6 h-6 text-accent-brand" />
              <h2 className="text-2xl">What You'll Learn</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {tutorial.learningObjectives.map((objective, index) => (
                <div key={index} className="flex items-start gap-3 p-4 bg-accent-brand/5 border-l-2 border-accent-brand">
                  <CheckCircle className="w-5 h-5 text-accent-brand flex-shrink-0 mt-0.5" />
                  <p className="text-muted-foreground leading-relaxed">{objective}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tutorial Content (Blocks or HTML) */}
        {tutorial.tutorialContent && (
          <div className="article-content space-y-8 mb-12">
            {Array.isArray(tutorial.tutorialContent) ? (
              // Render blocks
              <div dangerouslySetInnerHTML={{ __html: renderBlocksToHTML(tutorial.tutorialContent) }} />
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
              <div key={index} className="flex gap-4 p-6 bg-accent-brand/5 border border-accent-brand/20 mb-6">
                <Lightbulb className="w-6 h-6 text-accent-brand flex-shrink-0 mt-1" />
                <div>
                  <h4 className="mb-2 flex items-center gap-2">
                    <span className="text-sm uppercase tracking-wider text-accent-brand">Pro Tip</span>
                  </h4>
                  <p className="text-muted-foreground leading-relaxed">{tip}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Reference Section */}
        {((tutorial.keyShortcuts && tutorial.keyShortcuts.length > 0) || 
          (tutorial.commonPitfalls && tutorial.commonPitfalls.length > 0)) && (
          <div className="mt-16 pt-12 border-t border-border">
            <h3 className="mb-6">Quick Reference</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Key Shortcuts */}
              {tutorial.keyShortcuts && tutorial.keyShortcuts.length > 0 && (
                <div className="border border-border p-6">
                  <h4 className="mb-4 text-sm uppercase tracking-wider text-muted-foreground">Essential Shortcuts</h4>
                  <div className="space-y-3">
                    {tutorial.keyShortcuts.map((shortcut, index) => (
                      <div key={index} className="flex justify-between items-center gap-4">
                        <span className="text-muted-foreground">{shortcut.name}</span>
                        <code className="px-2 py-1 bg-secondary text-sm border border-border whitespace-nowrap">
                          {shortcut.shortcut}
                        </code>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Common Pitfalls */}
              {tutorial.commonPitfalls && tutorial.commonPitfalls.length > 0 && (
                <div className="border border-border p-6">
                  <h4 className="mb-4 text-sm uppercase tracking-wider text-muted-foreground">Common Pitfalls</h4>
                  <ul className="space-y-3 text-muted-foreground">
                    {tutorial.commonPitfalls.map((pitfall, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-accent-brand mt-1">•</span>
                        <span>{pitfall}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Default content if none provided */}
        {!tutorial.tutorialContent && 
         (!tutorial.learningObjectives || tutorial.learningObjectives.length === 0) && (
          <div className="mb-8">
            <h2>About This Tutorial</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {tutorial.description}
            </p>
          </div>
        )}
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
    relatedTutorials: tutorial.relatedTutorials || [],
  };

  return <TutorialTemplate tutorial={tutorialWithContent} onNavigate={onNavigate} />;
}

export default DynamicTutorial;