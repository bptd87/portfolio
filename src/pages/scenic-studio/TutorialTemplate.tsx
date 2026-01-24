import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Calendar, Clock, ExternalLink, PlayCircle, FileText, Download, Grid, CheckCircle, Lightbulb, AlertCircle, BookOpen, Target } from 'lucide-react';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';

interface Resource {
  name: string;
  description: string;
  url: string;
}

interface RelatedTutorial {
  title: string;
  slug: string;
  thumbnail: string;
  duration: string;
}

interface Tutorial {
  title: string;
  description: string;
  category: string;
  duration: string;
  publishDate: string;
  videoUrl: string;
  content: React.ReactNode;
  resources: Resource[];
  relatedTutorials: RelatedTutorial[];
}

interface TutorialTemplateProps {
  onNavigate: (page: string) => void;
  tutorial: Tutorial;
}

export function TutorialTemplate({ onNavigate, tutorial }: TutorialTemplateProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white transition-colors duration-300 pt-32 pb-24">
      
      {/* Hero Section */}
      <section className="px-6 lg:px-12 pb-16">
        <div className="max-w-[1800px] mx-auto">
          <motion.button
            onClick={() => onNavigate('scenic-studio')}
            className="flex items-center gap-2 text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors mb-8"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-pixel text-[10px] tracking-[0.3em]">BACK TO SCENIC STUDIO</span>
          </motion.button>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            {/* Meta Info - Glass Cards */}
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-neutral-200/60 dark:bg-neutral-900/60 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-full">
                <span className="font-pixel text-[10px] tracking-[0.2em] text-black/60 dark:text-white/60">{tutorial.category.toUpperCase()}</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-neutral-200/60 dark:bg-neutral-900/60 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-full">
                <Clock className="w-3.5 h-3.5 text-black/40 dark:text-white/40" />
                <span className="text-xs text-black/60 dark:text-white/60">{tutorial.duration}</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-neutral-200/60 dark:bg-neutral-900/60 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-full">
                <Calendar className="w-3.5 h-3.5 text-black/40 dark:text-white/40" />
                <span className="text-xs text-black/60 dark:text-white/60">{formatDate(tutorial.publishDate)}</span>
              </div>
            </div>

            {/* Title */}
            <div>
              <h1 className="font-display text-black dark:text-white text-5xl md:text-6xl lg:text-7xl mb-6 leading-[0.95] italic">
                {tutorial.title}
              </h1>
              <p className="text-xl md:text-2xl text-black/70 dark:text-white/70 max-w-4xl leading-relaxed">
                {tutorial.description}
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="px-6 lg:px-12">
        <div className="max-w-[1800px] mx-auto space-y-8">
          
          {/* Video Player - Glass Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="bg-neutral-200/60 dark:bg-neutral-900/60 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-3xl overflow-hidden"
          >
            <div className="aspect-video bg-black">
              <iframe
                src={tutorial.videoUrl}
                title={tutorial.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          </motion.div>

          {/* Tabbed Content - Glass Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-neutral-200/60 dark:bg-neutral-900/60 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-3xl overflow-hidden"
          >
            <Tabs defaultValue="overview" className="w-full">
              {/* Tab Navigation */}
              <div className="border-b border-black/10 dark:border-white/10 px-6">
                <TabsList className="w-full justify-start bg-transparent p-0 h-auto gap-0">
                  <TabsTrigger 
                    value="overview" 
                    className="data-[state=active]:bg-black/5 dark:data-[state=active]:bg-white/5 data-[state=active]:border-b-2 data-[state=active]:border-black dark:data-[state=active]:border-white px-6 py-4 font-pixel text-[10px] tracking-[0.2em] rounded-none border-0"
                  >
                    OVERVIEW
                  </TabsTrigger>
                  <TabsTrigger 
                    value="tutorial" 
                    className="data-[state=active]:bg-black/5 dark:data-[state=active]:bg-white/5 data-[state=active]:border-b-2 data-[state=active]:border-black dark:data-[state=active]:border-white px-6 py-4 font-pixel text-[10px] tracking-[0.2em] rounded-none border-0"
                  >
                    <FileText className="w-3.5 h-3.5 mr-2" />
                    TUTORIAL
                  </TabsTrigger>
                  {tutorial.resources && tutorial.resources.length > 0 && (
                    <TabsTrigger 
                      value="resources" 
                      className="data-[state=active]:bg-black/5 dark:data-[state=active]:bg-white/5 data-[state=active]:border-b-2 data-[state=active]:border-black dark:data-[state=active]:border-white px-6 py-4 font-pixel text-[10px] tracking-[0.2em] rounded-none border-0"
                    >
                      <Download className="w-3.5 h-3.5 mr-2" />
                      RESOURCES
                    </TabsTrigger>
                  )}
                  {tutorial.relatedTutorials && tutorial.relatedTutorials.length > 0 && (
                    <TabsTrigger 
                      value="related" 
                      className="data-[state=active]:bg-black/5 dark:data-[state=active]:bg-white/5 data-[state=active]:border-b-2 data-[state=active]:border-black dark:data-[state=active]:border-white px-6 py-4 font-pixel text-[10px] tracking-[0.2em] rounded-none border-0"
                    >
                      <Grid className="w-3.5 h-3.5 mr-2" />
                      RELATED
                    </TabsTrigger>
                  )}
                </TabsList>
              </div>

              {/* Tab Content */}
              <div className="bg-white dark:bg-black">
                {/* Overview Tab */}
                <TabsContent value="overview" className="p-8 md:p-12 m-0">
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-2xl md:text-3xl mb-4">What You'll Learn</h2>
                      <p className="text-lg md:text-xl text-black/70 dark:text-white/70 leading-relaxed">
                        {tutorial.description}
                      </p>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-6 pt-8 border-t border-black/10 dark:border-white/10">
                      <div>
                        <div className="font-pixel text-[10px] tracking-[0.3em] text-black/40 dark:text-white/40 mb-2">DURATION</div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-5 h-5 text-black/60 dark:text-white/60" />
                          <span className="text-lg">{tutorial.duration}</span>
                        </div>
                      </div>
                      <div>
                        <div className="font-pixel text-[10px] tracking-[0.3em] text-black/40 dark:text-white/40 mb-2">CATEGORY</div>
                        <div className="text-lg">{tutorial.category}</div>
                      </div>
                      <div>
                        <div className="font-pixel text-[10px] tracking-[0.3em] text-black/40 dark:text-white/40 mb-2">PUBLISHED</div>
                        <div className="text-lg">{formatDate(tutorial.publishDate)}</div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Tutorial Tab */}
                <TabsContent value="tutorial" className="p-0 m-0">
                  <article className="max-w-4xl mx-auto px-8 md:px-12 py-12 md:py-16">
                    {/* What You'll Learn Section */}
                    <div className="mb-16 pb-12 border-b border-black/10 dark:border-white/10">
                      <div className="flex items-center gap-3 mb-6">
                        <Target className="w-6 h-6 text-black/60 dark:text-white/60" />
                        <h2 className="text-2xl">What You'll Learn</h2>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        {/* These would come from tutorial.learningObjectives in real data */}
                        <div className="flex items-start gap-3 p-4 bg-accent-brand/5 border-l-2 border-accent-brand">
                          <CheckCircle className="w-5 h-5 text-accent-brand flex-shrink-0 mt-0.5" />
                          <p className="text-muted-foreground leading-relaxed">
                            Master core Vectorworks techniques for scenic design
                          </p>
                        </div>
                        <div className="flex items-start gap-3 p-4 bg-accent-brand/5 border-l-2 border-accent-brand">
                          <CheckCircle className="w-5 h-5 text-accent-brand flex-shrink-0 mt-0.5" />
                          <p className="text-muted-foreground leading-relaxed">
                            Create professional 2D drafting from 3D models
                          </p>
                        </div>
                        <div className="flex items-start gap-3 p-4 bg-accent-brand/5 border-l-2 border-accent-brand">
                          <CheckCircle className="w-5 h-5 text-accent-brand flex-shrink-0 mt-0.5" />
                          <p className="text-muted-foreground leading-relaxed">
                            Optimize your workflow with keyboard shortcuts
                          </p>
                        </div>
                        <div className="flex items-start gap-3 p-4 bg-accent-brand/5 border-l-2 border-accent-brand">
                          <CheckCircle className="w-5 h-5 text-accent-brand flex-shrink-0 mt-0.5" />
                          <p className="text-muted-foreground leading-relaxed">
                            Export production-ready technical drawings
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Main Tutorial Content - Blog Style with Enhanced Callouts */}
                    <div className="article-content space-y-8">
                      {tutorial.content}
                      
                      {/* Example of enhanced tutorial sections with callout boxes */}
                      <div className="not-prose my-12">
                        {/* Pro Tip Callout */}
                        <div className="flex gap-4 p-6 bg-accent-brand/5 border border-accent-brand/20 mb-8">
                          <Lightbulb className="w-6 h-6 text-accent-brand flex-shrink-0 mt-1" />
                          <div>
                            <h4 className="mb-2 flex items-center gap-2">
                              <span className="text-sm uppercase tracking-wider text-accent-brand">Pro Tip</span>
                            </h4>
                            <p className="text-muted-foreground leading-relaxed">
                              Use keyboard shortcuts extensively to speed up your workflow. The time you invest in learning them pays dividends across every project.
                            </p>
                          </div>
                        </div>

                        {/* Important Note */}
                        <div className="flex gap-4 p-6 border-l-2 border-accent-brand bg-secondary/30 mb-8">
                          <AlertCircle className="w-6 h-6 text-accent-brand flex-shrink-0 mt-1" />
                          <div>
                            <h4 className="mb-2 flex items-center gap-2">
                              <span className="text-sm uppercase tracking-wider text-muted-foreground">Important</span>
                            </h4>
                            <p className="text-muted-foreground leading-relaxed">
                              Always save your work before running complex operations. Create backup files of your drawing at key milestones.
                            </p>
                          </div>
                        </div>

                        {/* Key Concept Box */}
                        <div className="p-8 bg-accent-brand text-accent-brand-foreground mb-8">
                          <div className="flex items-start gap-4">
                            <BookOpen className="w-7 h-7 flex-shrink-0 mt-1" />
                            <div>
                              <h3 className="mb-4 text-accent-brand-foreground">Key Concept: Viewports</h3>
                              <p className="leading-relaxed opacity-90 text-accent-brand-foreground">
                                Viewports are windows into your 3D model that allow you to create multiple 2D views on your sheet layers. Think of them as cameras positioned around your model, each capturing a specific angle or view that becomes part of your technical drawings.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Reference Section */}
                    <div className="mt-16 pt-12 border-t border-black/10 dark:border-white/10">
                      <h3 className="mb-6">Quick Reference</h3>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="border border-black/10 dark:border-white/10 p-6">
                          <h4 className="mb-4 text-sm uppercase tracking-wider text-muted-foreground">Essential Shortcuts</h4>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center gap-4">
                              <span className="text-muted-foreground">Create Viewport</span>
                              <code className="px-2 py-1 bg-secondary text-sm border border-black/10 dark:border-white/10 whitespace-nowrap">Cmd/Ctrl + '</code>
                            </div>
                            <div className="flex justify-between items-center gap-4">
                              <span className="text-muted-foreground">Toggle to 3D</span>
                              <code className="px-2 py-1 bg-secondary text-sm border border-black/10 dark:border-white/10 whitespace-nowrap">Shift + C</code>
                            </div>
                          </div>
                        </div>
                        
                        <div className="border border-black/10 dark:border-white/10 p-6">
                          <h4 className="mb-4 text-sm uppercase tracking-wider text-muted-foreground">Common Pitfalls</h4>
                          <ul className="space-y-3 text-muted-foreground">
                            <li className="flex items-start gap-2">
                              <span className="text-accent-brand mt-1">•</span>
                              <span>Forgetting to update viewports after model changes</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-accent-brand mt-1">•</span>
                              <span>Using incorrect scale settings for sheet layers</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-accent-brand mt-1">•</span>
                              <span>Not organizing classes and layers properly</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Keep Learning CTA */}
                    {tutorial.relatedTutorials && tutorial.relatedTutorials.length > 0 && (
                      <div className="mt-16 p-8 border border-black/10 dark:border-white/10 bg-secondary/20">
                        <h3 className="mb-4">Keep Learning</h3>
                        <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                          Build on what you've learned with related tutorials that expand these core concepts.
                        </p>
                        <button 
                          onClick={() => {
                            const tabButtons = document.querySelectorAll('[role="tab"]');
                            tabButtons.forEach((btn) => {
                              if (btn.textContent?.includes('RELATED')) {
                                (btn as HTMLElement).click();
                              }
                            });
                          }}
                          className="px-6 py-3 bg-accent-brand text-accent-brand-foreground hover:opacity-90 transition-opacity"
                        >
                          EXPLORE RELATED TUTORIALS
                        </button>
                      </div>
                    )}
                  </article>
                </TabsContent>

                {/* Resources Tab */}
                {tutorial.resources && tutorial.resources.length > 0 && (
                  <TabsContent value="resources" className="p-0 m-0">
                    <div className="max-w-4xl mx-auto px-8 md:px-12 py-12 md:py-16">
                      <h2 className="mb-4">Downloads & Resources</h2>
                      <p className="text-lg text-muted-foreground mb-12 opacity-70 leading-relaxed">
                        Additional materials to enhance your learning and workflow.
                      </p>
                      <div className="space-y-3">
                        {tutorial.resources.map((resource, index) => (
                          <a
                            key={index}
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group block p-6 border border-black/10 dark:border-white/10 hover:border-accent-brand transition-all"
                          >
                            <div className="flex items-start justify-between gap-6">
                              <div className="flex-1">
                                <h3 className="mb-3 group-hover:text-accent-brand transition-colors">
                                  {resource.name}
                                </h3>
                                <p className="text-muted-foreground opacity-70 leading-relaxed">
                                  {resource.description}
                                </p>
                              </div>
                              <ExternalLink className="w-5 h-5 flex-shrink-0 text-muted-foreground group-hover:text-accent-brand transition-colors mt-1" />
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                )}

                {/* Related Tab */}
                {tutorial.relatedTutorials && tutorial.relatedTutorials.length > 0 && (
                  <TabsContent value="related" className="p-0 m-0">
                    <div className="max-w-6xl mx-auto px-8 md:px-12 py-12 md:py-16">
                      <h2 className="mb-4">Continue Your Learning</h2>
                      <p className="text-lg text-muted-foreground mb-12 opacity-70 leading-relaxed">
                        Build on these skills with related tutorials.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {tutorial.relatedTutorials.map((related, index) => (
                          <button
                            key={index}
                            onClick={() => onNavigate(`scenic-studio/${related.slug}`)}
                            className="group text-left"
                          >
                            <div className="aspect-video bg-secondary mb-4 overflow-hidden border border-black/10 dark:border-white/10 group-hover:border-accent-brand transition-all relative">
                              <ImageWithFallback
                                src={related.thumbnail}
                                alt={related.title}
                                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                              />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/50 transition-colors">
                                <PlayCircle className="w-12 h-12 text-white opacity-90 group-hover:opacity-100 transition-opacity" />
                              </div>
                            </div>
                            <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground opacity-60">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{related.duration}</span>
                            </div>
                            <h3 className="group-hover:text-accent-brand transition-colors leading-snug">
                              {related.title}
                            </h3>
                          </button>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                )}
              </div>
            </Tabs>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center"
          >
            <button
              onClick={() => onNavigate('scenic-studio')}
              className="px-8 py-4 bg-foreground text-background hover:opacity-90 transition-opacity"
            >
              VIEW ALL TUTORIALS
            </button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}