import React from 'react';
import { ArrowLeft, Tag } from 'lucide-react';
import brandonImage from '../../assets/cb85beb743df137728b4c7e481be722df9145e87.png';
import gretchenImage from '../../assets/f36cef92f2f50ef7172a4e11c2d669c5cf616b8c.png';
import { ArticleAuthor } from '../../components/shared/ArticleAuthor';
import { blogPosts } from '../../data/blog-posts';

interface ArtisticVisionFindingCreativeVoiceProps {
  onNavigate: (page: string) => void;
}

export function ArtisticVisionFindingCreativeVoice({ onNavigate }: ArtisticVisionFindingCreativeVoiceProps) {
  // Get the post data to access tags
  const post = blogPosts.find(p => p.id === 'artistic-vision-finding-creative-voice');
  const tags = post?.tags || [];

  const handleTagClick = (tag: string) => {
    // Navigate to Scenic Insights and filter by tag
    onNavigate('scenic-insights');
    // In the future, we can add URL params to filter by tag
    };

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Back Navigation */}
      <div className="max-w-4xl mx-auto px-8 pt-12">
        <div className="mb-8">
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
            <span className="text-xs">JANUARY 31, 2025</span>
            <span className="text-xs">•</span>
            <span className="text-xs">10 MIN READ</span>
          </div>
          
          <h1 className="mb-8 text-4xl md:text-5xl lg:text-6xl leading-tight tracking-tight">
            ARTISTIC VISION IN SCENIC DESIGN: FINDING MY CREATIVE VOICE
          </h1>
          
          <p className="opacity-60 text-xl leading-relaxed max-w-3xl">
            A reflection on artistic identity, creative independence, and building a scenic design career driven by authenticity rather than algorithmic validation.
          </p>
        </div>

        {/* Featured Image */}
        <div className="mb-20 -mx-8 md:mx-0">
          <img
            src={brandonImage}
            alt="Brandon PT Davis circa 2012 by the ocean"
            className="w-full"
          />
          <p className="text-sm opacity-60 text-center mt-4">Brandon PT Davis, circa 2012</p>
        </div>

        {/* Article Content */}
        <div className="prose-custom">
          <p className="text-xl leading-relaxed mb-8 opacity-80">
            Recently, I watched <em>A Complete Unknown</em>, the Bob Dylan film, and it sparked a profound reflection on my journey as a scenic designer. Who am I as an artist? How has my experience in theatre design and experiential spaces shaped my creative perspective? Where will my artistic path lead next?
          </p>

          <p className="leading-relaxed mb-6">
            These questions follow me throughout my career in scenic design and experiential art. After years crafting immersive theatrical worlds and designing experiential environments, I continually revisit what it means to create work that resonates with audiences long after they've left the theatre.
          </p>

          <p className="leading-relaxed mb-6">
            That's why I developed Brandonptdavis.com – not merely as a scenic design portfolio, but as a creative platform where artistic expression exists free from commercial constraints and algorithmic validation. This space showcases my theatre design work while serving as a hub for artistic collaboration and knowledge sharing.
          </p>

          <p className="leading-relaxed mb-12">
            This isn't just a portfolio site. It's a declaration of artistic independence in scenic design and experiential art.
          </p>

          {/* Section Break */}
          <div className="w-16 h-px bg-black dark:bg-white opacity-30 my-16 mx-auto"></div>

          <h2 className="text-3xl tracking-tight mb-8 mt-16">Professional Scenic Designer: The Artist Behind the Designs</h2>

          <p className="leading-relaxed mb-6">
            As a professional Scenic designer, experiential architect, and creative problem solver, I've built a career spanning diverse theatrical and design roles. My experience includes work as an Assistant Scenic Designer, Technical Director Consultant, CAD Draftsperson, Adjunct Lecturer in theatrical design, Carpenter, and Scenic Painter – but titles have always felt too limiting for the creative work that drives me.
          </p>

          <p className="leading-relaxed mb-12">
            At my core, I transform empty theatrical spaces into living, breathing environments that challenge audiences to see the world through new perspectives.
          </p>

          {/* Pull Quote */}
          <div className="my-16 py-8 border-y border-black dark:border-white">
            <p className="text-2xl text-center leading-relaxed opacity-70 italic max-w-2xl mx-auto">
              "No, I think he'll be smoking cigarettes, drinking Coke, and making theatre."
            </p>
          </div>

          <p className="leading-relaxed mb-6">
            During my undergraduate theatre studies, my friend Dylan captured something essential with those words. Fifteen years into my scenic design career, I remain committed to theatrical creation – minus the cigarettes, but still fueled by caffeine and the passion to develop meaningful design work.
          </p>

          <p className="leading-relaxed mb-6">
            Early in my career, I dreamed about designing for the Provincetown Players – imagining myself creating original scenic designs with Eugene O'Neill and Susan Glaspell, developing productions untouched by conventional interpretation. The concept of designing directly from the source material, free from theatrical convention, continues to drive my creative approach to scenic design.
          </p>

          <p className="leading-relaxed mb-12">
            Now approaching 40, I gravitate toward theatrical environments where passion drives creative decisions, where collaborative design processes flow without hierarchy, and where ego takes a backseat to collective artistic vision. The most meaningful scenic design projects emerge from communities of theatre artists who care deeply about their creative contribution to our understanding of human experience.
          </p>

          <h2 className="text-3xl tracking-tight mb-8 mt-16">Theatre Technology Meets Artistic Craftsmanship</h2>

          <p className="leading-relaxed mb-6">
            I embrace technology in scenic design as a tool for creative liberation, while maintaining my foundation as a theatre artist first.
          </p>

          <p className="leading-relaxed mb-6">
            In contemporary scenic design, technology serves as an extension of creative vision – allowing designers to explore spatial possibilities before committing valuable production resources. In theatre, where budgets are increasingly limited, tools like previsualization, AI-assisted design workflows, and digital modeling free scenic designers to envision boldly while working within practical constraints.
          </p>

          <p className="leading-relaxed mb-12">
            Despite technological advancements in theatrical design, I believe scenic design must always carry the unmistakable imprint of human creativity, the beautiful imperfections of hands-on scenic craftsmanship, and the emotional resonance that only emerges from work created with artistic intention and care.
          </p>

          {/* Second Image */}
          <div className="my-20 -mx-8 md:mx-0">
            <img
              src={gretchenImage}
              alt="Brandon and Gretchen, 2025"
              className="w-full"
            />
            <p className="text-sm opacity-60 text-center mt-4">Brandon and Gretchen, 2025</p>
          </div>

          <h2 className="text-3xl tracking-tight mb-8 mt-16">Digital Theatre Portfolio: Reclaiming Creative Space Online</h2>

          <p className="leading-relaxed mb-6">
            Brandonptdavis.com has evolved through multiple iterations over the past decade, each version expressing my scenic design philosophy and artistic values better.
          </p>

          <p className="leading-relaxed mb-6">
            While the site showcases my theatrical portfolio, in 2025, I believe a scenic designer's website should offer more than a digital resume of past productions.
          </p>

          <p className="leading-relaxed mb-6">
            The current social media landscape, with its metrics obsession, pressures to monetize creative expression, and algorithms determining which artistic voices gain visibility, has become increasingly problematic for theatre artists. I miss the time when online interaction facilitated genuine connections between scenic designers and theatre collaborators rather than optimizing engagement. I miss when discovering fellow theatre artists' work felt like genuine exploration rather than consuming content packaged for maximum clicks.
          </p>

          <p className="leading-relaxed mb-6">
            More fundamentally, I miss the ideal of artistic patronage in theatre – supporting scenic designers and other theatre artists for the value and truth in their work, not for their ability to generate viral content or conversion metrics.
          </p>

          <p className="leading-relaxed mb-12">
            That's why this scenic design website charts a different course. It serves as a space for authentic connection between theatre professionals, knowledge exchange about scenic design techniques, and artistic exploration that prioritizes theatrical integrity over algorithmic approval.
          </p>

          <h2 className="text-3xl tracking-tight mb-8 mt-16">Innovative Theatre Design: Building Against Conventional Limitations</h2>

          <p className="leading-relaxed mb-6">
            Creating this scenic design platform has been an act of creative resistance in the digital age. I've integrated AI-generated design elements, automation tools, and functionality that prioritizes artistic vision over convention. When consulting web developers, I frequently heard: "You're trying to do too much with a theatre portfolio."
          </p>

          <p className="leading-relaxed mb-6">
            But I believe meaningful scenic design often emerges from pushing beyond perceived limitations and questioning accepted theatrical boundaries.
          </p>

          <p className="leading-relaxed mb-12">
            If you've explored this far, I appreciate your interest in my scenic design approach – and hope you discover theatrical elements here that challenge conventional thinking or open new possibilities for experiential design.
          </p>

          <h2 className="text-3xl tracking-tight mb-8 mt-16">Scenic Design Philosophy: Values That Guide My Theatrical Approach</h2>

          <h3 className="text-2xl tracking-tight mb-6 mt-12">Authentic Theatre Creation</h3>

          <p className="leading-relaxed mb-6">
            In scenic design and theatrical collaboration, I value authenticity, loyalty, and genuine creative partnership. I've never been comfortable with transactional networking in theatre – forming connections primarily for professional advancement feels fundamentally at odds with creating meaningful scenic design.
          </p>

          <p className="leading-relaxed mb-12">
            I don't want to network. I want to build lasting relationships with fellow theatre artists on this creative journey. I want to create scenic designs that ask difficult questions and challenge comfortable assumptions about theatrical space. I want to continue this exploration throughout my career as a scenic designer.
          </p>

          <h3 className="text-2xl tracking-tight mb-6 mt-12">Theatre Education as Creative Revolution</h3>

          <p className="leading-relaxed mb-6">
            Teaching scenic design has profoundly influenced my own theatrical practice. During my four years as a theatre professor, I often told students:
          </p>

          {/* Pull Quote */}
          <div className="my-12 py-8 border-y border-black dark:border-white">
            <p className="text-2xl text-center leading-relaxed opacity-70 italic max-w-2xl mx-auto">
              "I love this job—the only downside is that it's getting in the way of my education."
            </p>
          </div>

          <p className="leading-relaxed mb-12">
            I teach because I believe in democratizing theatrical knowledge and the power of collective learning in scenic design. I continue teaching because I value exchanging design ideas, challenging assumptions about theatrical spaces, and building more inclusive artistic communities in theatre. I collaborate with theatre organizations that share these values, using this platform to further accessible education in scenic design and creative exchange among theatre professionals.
          </p>

          <h2 className="text-3xl tracking-tight mb-8 mt-16">The Future of Scenic Design: My Path Forward</h2>

          <p className="leading-relaxed mb-12">
            My goal as a scenic designer remains beautifully simple yet endlessly complex: to continue growing as a theatre artist and human being, to remain open to new design perspectives and approaches, and to collaborate with theatre professionals who understand that scenic design isn't merely decorative – it's a crucial medium for processing and challenging our shared reality through theatrical experience.
          </p>

          <h2 className="text-3xl tracking-tight mb-8 mt-16">Connect with a Professional Scenic Designer: An Open Invitation</h2>

          <p className="leading-relaxed mb-6">
            Brandonptdavis.com represents more than just another theatre portfolio in the digital landscape. It's a space where scenic design values take precedence over commercial imperatives in theatre production.
          </p>

          <p className="leading-relaxed mb-6">
            Explore my theatrical designs at your own pace. Question the spatial concepts you find here. Reach out if particular scenic elements speak to you or challenge conventional design approaches.
          </p>

          <p className="leading-relaxed mb-6">
            I hope you discover theatrical design that shifts your perspective or affirms your own creative journey in theatre. If our paths intersect professionally, I look forward to creating scenic designs that matter in a theatrical landscape that desperately needs authentic artistic voices.
          </p>

          <p className="text-xl leading-relaxed mt-12 opacity-80">
            Let's create theatrical spaces that stand for something meaningful.
          </p>
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
      </article>
    </div>
  );
}
