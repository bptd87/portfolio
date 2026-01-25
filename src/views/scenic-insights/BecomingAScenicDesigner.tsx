import React from 'react';
import { ArrowLeft, ArrowRight, Tag } from 'lucide-react';
import studioImage from '../../assets/6cce818b58c05ae0468590bbf53ddfb73955cea0.webp';
import { ArticleAuthor } from '../../components/shared/ArticleAuthor';
import { blogPosts } from '../../data/blog-posts';

interface BecomingAScenicDesignerProps {
  onNavigate: (page: string, slug?: string) => void;
}

export function BecomingAScenicDesigner({ onNavigate }: BecomingAScenicDesignerProps) {
  // Get the post data to access tags
  const post = blogPosts.find(p => p.id === 'becoming-a-scenic-designer');
  const tags = post?.tags || [];

  const handleTagClick = (tag: string) => {
    // Navigate to Scenic Insights and filter by tag
    onNavigate('scenic-insights');
    };

  // Related posts data - this would eventually come from the blog system
  const relatedPosts = [
    {
      title: 'VIDEO GAME ENVIRONMENTS',
      category: 'DESIGN PHILOSOPHY',
      description: 'Learning from Skyrim and Fallout to create immersive theatrical worlds',
      slug: 'video-game-environments'
    },
    {
      title: 'PRESENTING LIKE APPLE',
      category: 'DESIGN PHILOSOPHY',
      description: 'Captivating your creative collaborators with compelling presentations',
      slug: 'presenting-like-apple'
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white transition-colors duration-300">
      {/* Back Button */}
      <div className="border-b border-black/10 dark:border-white/10">
        <div className="max-w-4xl mx-auto px-8 py-6">
          <button
            onClick={() => onNavigate('scenic-insights')}
            className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs tracking-wider">BACK TO ARTICLES</span>
          </button>
        </div>
      </div>

      {/* Article Header */}
      <article className="max-w-4xl mx-auto px-8 py-16">
        <div className="pb-12 mb-16">
          <div className="flex items-center gap-3 mb-8 opacity-60">
            <span className="text-xs tracking-widest uppercase">DESIGN PHILOSOPHY</span>
            <span className="text-xs">•</span>
            <span className="text-xs">AUGUST 31, 2024</span>
          </div>
          
          <h1 className="mb-8 text-4xl md:text-5xl lg:text-6xl leading-tight tracking-tight">
            BECOMING A SCENIC DESIGNER: WHEN THE WORK STARTS TO FEEL LIKE YOURS
          </h1>
          
          <p className="opacity-60 text-xl leading-relaxed max-w-3xl">
            A reflection for emerging scenic designers finding their voice.
          </p>
        </div>

        {/* Featured Image */}
        <div className="mb-20 -mx-8 md:mx-0">
          <img
            src={studioImage}
            alt="Dimly lit scenic design studio with white model box"
            className="w-full"
          />
        </div>

        {/* Article Content */}
        <div className="prose-custom">
          <p className="text-xl leading-relaxed mb-8 opacity-80">
            Starting out as a scenic designer can feel like navigating a storm of excitement, doubt, and discovery. You've got your training, your taste, and maybe a few portfolio pieces—but nothing quite prepares you for that moment when someone hands you a script and says, "Let's build a world."
          </p>

          <p className="text-lg leading-relaxed mb-12 opacity-70">
            This post is for emerging scenic designers—those navigating their first few productions and wondering: <em>When does it start to feel like mine?</em> And if you're further along in your career, maybe you'll recognize yourself in this, too—a reflection of how far you've come and what still resonates.
          </p>

          {/* Section Break */}
          <div className="w-16 h-px bg-black dark:bg-white opacity-30 my-16 mx-auto"></div>

          <h2 className="text-3xl tracking-tight mb-8 mt-16">Your First Scenic Design Job: Everything to Prove</h2>
          
          <p className="leading-relaxed mb-6">
            That first opportunity is sacred. Someone trusts you to design. You print your ground plans with extra care. You over-label everything. The director—maybe a little anxious themselves—offers a lot of input, and the collaboration can feel more like correction.
          </p>

          <p className="leading-relaxed mb-6">
            You're revising and re-revising—version 15 of the ground plan is on your desktop. You've tested twelve different shades of beige, trying to strike the right balance between "period appropriate" and "not completely lifeless." The couch has been re-sourced four times. You're zooming in on every inch of your render, worried someone might question the molding detail on the back wall.
          </p>

          <p className="leading-relaxed mb-12">
            You go through every revision like it's a final exam. And by the time the show opens, you're proud—but not sure if what's on stage still feels like your work. You smile through the celebration, but part of you wonders if you even recognize the set anymore.
          </p>

          {/* Pull Quote */}
          <div className="my-16 py-8 border-y border-black dark:border-white">
            <p className="text-2xl text-center leading-relaxed opacity-70 italic max-w-2xl mx-auto">
              "You're dependable. But still… it doesn't quite feel like your voice is leading the way."
            </p>
          </div>

          <h2 className="text-3xl tracking-tight mb-8 mt-16">Early Scenic Design Experiences: Repetition Without Ownership</h2>
          
          <p className="leading-relaxed mb-6">
            The second production moves a little faster. There's less hand-holding. Maybe fewer revisions. But that spark you remember from design class—the rush of creative ownership—feels a little out of reach.
          </p>

          <p className="leading-relaxed mb-12">
            By the third or fourth show, you're learning how to be efficient. You start anticipating changes before they're asked for. You're dependable. But still… it doesn't quite feel like your voice is leading the way.
          </p>

          {/* Section Break */}
          <div className="w-16 h-px bg-black dark:bg-white opacity-30 my-16 mx-auto"></div>

          <h2 className="text-3xl tracking-tight mb-8 mt-16">Submitting a Scenic Design That Lands</h2>
          
          <p className="leading-relaxed mb-6 text-lg opacity-80">
            And then, one day, it happens.
          </p>

          <p className="leading-relaxed mb-6">
            You send in a design, and the director replies with simple, thoughtful notes:
          </p>

          <div className="pl-8 py-6 my-8 opacity-60 italic border-l-2 border-black dark:border-white">
            <p className="mb-2">"Can we nudge this table to the right?"</p>
            <p>"Can this chair sit more downstage?"</p>
          </div>

          <p className="leading-relaxed mb-12">
            They're not asking for conceptual changes. You nailed it. The world you imagined supports the story, fits the tone, and speaks clearly. There's less fanfare and fewer rounds of applause. But for the first time, you feel it: <em>this is my work</em>.
          </p>

          <h2 className="text-3xl tracking-tight mb-8 mt-16">Collaborating as a Scenic Designer: From Contributor to Vision Partner</h2>
          
          <p className="leading-relaxed mb-6">
            As your confidence grows, so does your role in the process. Directors begin coming to you without a visual plan. You help shape the world from the ground up.
          </p>

          <p className="leading-relaxed mb-6">
            You're no longer just reacting to input—you're generating it. You're leading conversations. You're influencing tone, not just executing logistics. You become an asset.
          </p>

          <p className="leading-relaxed mb-12 opacity-70 italic">
            The process gets smoother. And a little quieter.
          </p>

          {/* Section Break */}
          <div className="w-16 h-px bg-black dark:bg-white opacity-30 my-16 mx-auto"></div>

          <h2 className="text-3xl tracking-tight mb-8 mt-16">When Scenic Design Becomes a Career, Not Just a Gig</h2>
          
          <p className="leading-relaxed mb-6">
            Eventually, the work stops feeling like a breakthrough every time. It starts to feel like something you can do again and again—skillfully, intentionally, with clarity and ease.
          </p>

          <p className="leading-relaxed mb-6 opacity-80">
            It becomes a job.
          </p>

          <p className="leading-relaxed mb-12">
            Not a disappointment. Not a letdown. But a sign that you've crossed a threshold: you're no longer proving yourself. You're just doing the work. And the work is good.
          </p>

          {/* Final Pull Quote */}
          <div className="my-16 py-12 text-center">
            <h2 className="text-3xl tracking-tight mb-6">The Quiet Win for Emerging Scenic Designers</h2>
            
            <p className="leading-relaxed mb-6 text-lg max-w-2xl mx-auto">
              This career isn't always built on standing ovations. Sometimes, the most meaningful victories happen before the audience even enters the room.
            </p>

            <p className="leading-relaxed mb-6 max-w-2xl mx-auto">
              If you're early in your scenic design journey, take heart. That shift will come. One day, the notes will be small. The feedback will be minimal. And you'll feel something more profound than validation:
            </p>

            <p className="text-2xl tracking-tight mt-8">
              You'll feel like a designer.
            </p>
          </div>
        </div>

        {/* Author */}
        <div className="mt-16">
          <ArticleAuthor onNavigate={onNavigate} />
        </div>

        {/* Tags */}
        <div className="mt-8 pt-8 border-t border-black/10 dark:border-white/10">
          <div className="flex items-center gap-2 mb-4">
            <Tag className="w-4 h-4 opacity-40" />
            <span className="text-xs tracking-widest uppercase opacity-40">Topics</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagClick(tag)}
                className="px-3 py-1.5 text-xs tracking-wider border border-black/10 dark:border-white/10 hover:border-accent-brand transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Read More Section */}
        <div className="mt-24 pt-16 border-t border-black dark:border-white">
          <div className="flex items-center justify-between mb-12">
            <h3 className="text-2xl tracking-tight">READ MORE</h3>
            <button
              onClick={() => onNavigate('scenic-insights')}
              className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity duration-200"
            >
              <span className="text-xs tracking-wider">VIEW ALL POSTS</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {relatedPosts.map((post, index) => (
              <button
                key={index}
                onClick={() => onNavigate('scenic-insights', post.slug)}
                className="group cursor-pointer opacity-40 hover:opacity-100 transition-opacity duration-300 text-left"
              >
                <div className="aspect-[16/10] bg-black dark:bg-white opacity-10 mb-4"></div>
                <p className="text-xs tracking-wider opacity-60 mb-3">{post.category}</p>
                <h4 className="text-xl mb-2">{post.title}</h4>
                <p className="opacity-60 text-sm">{post.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Back to Top */}
        <div className="mt-16 text-center">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="opacity-60 hover:opacity-100 transition-opacity duration-200 text-xs tracking-wider"
          >
            BACK TO TOP ↑
          </button>
        </div>
      </article>
    </div>
  );
}
