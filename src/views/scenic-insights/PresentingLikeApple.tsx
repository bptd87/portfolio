import React from 'react';
import { ArrowLeft, ArrowRight, Tag } from 'lucide-react';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { ArticleAuthor } from '../../components/shared/ArticleAuthor';
import { blogPosts } from '../../data/blog-posts';

interface PresentingLikeAppleProps {
  onNavigate: (page: string, slug?: string) => void;
}

export function PresentingLikeApple({ onNavigate }: PresentingLikeAppleProps) {
  const post = blogPosts.find(p => p.id === 'presenting-like-apple');
  const tags = post?.tags || [];

  const handleTagClick = (tag: string) => {
    onNavigate('scenic-insights');
    };

  const relatedPosts = [
    {
      title: 'VIDEO GAME ENVIRONMENTS',
      category: 'DESIGN PHILOSOPHY',
      description: 'Learning from Skyrim and Fallout to create immersive theatrical worlds',
      slug: 'video-game-environments'
    },
    {
      title: 'BECOMING A SCENIC DESIGNER',
      category: 'DESIGN PHILOSOPHY',
      description: 'Finding your voice and ownership in the work',
      slug: 'becoming-a-scenic-designer'
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
            <span className="text-xs">OCTOBER 24, 2024</span>
          </div>
          
          <h1 className="mb-8 text-4xl md:text-5xl lg:text-6xl leading-tight tracking-tight">
            PRESENTING LIKE APPLE: A GUIDE FOR THEATRICAL DESIGNERS
          </h1>
          
          <p className="opacity-60 text-xl leading-relaxed max-w-3xl">
            Lessons from tech's greatest showmen on captivating your creative collaborators.
          </p>
        </div>

        {/* Featured Image */}
        <div className="mb-20 -mx-8 md:mx-0">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1475721027785-f74eccf877e2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcmVzZW50YXRpb24lMjBkZXNpZ258ZW58MXx8fHwxNzYxNjM5Mjg1fDA&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Design presentation in progress"
            className="w-full"
          />
        </div>

        {/* Article Content */}
        <div className="prose-custom">
          <p className="text-xl leading-relaxed mb-8 opacity-80">
            As Theatrical Designers, our role often extends beyond the confines of the stage and into the realm of presentations, be it in front of a captivated audience of actors during the first rehearsal or in a crucial concept or budget meeting with a team of producers. In these moments, our primary objective is to infuse a sense of wonder and anticipation into our work, captivating our audience with the potential of our designs.
          </p>

          <p className="text-lg leading-relaxed mb-12 opacity-70">
            One of the most exemplary models for this kind of compelling presentation can be observed in Apple's Quarterly Keynotes. The tech giant has perfected the art of intertwining their products with the human experience, seamlessly blending innovation with emotion. Their signature "and there's more" approach keeps viewers on the edge of their seats, eagerly awaiting the next big reveal. Within hours of their presentation, the internet is abuzz with excitement as bloggers and news outlets rush to share the latest and greatest from Apple's lineup.
          </p>

          {/* Section Break */}
          <div className="w-16 h-px bg-black dark:bg-white opacity-30 my-16 mx-auto"></div>

          <h2 className="text-3xl tracking-tight mb-8 mt-16">Planning the Design Presentation</h2>
          
          <p className="leading-relaxed mb-6">
            As designers, we often find ourselves immersed in the intricate process of developing our design concepts, dedicating weeks or even months to bring our visions to life. However, equally challenging and essential is the task of conveying these rich, complex ideas during a presentation to our peers and collaborators, often condensed into a brief 5 to 10-minute window.
          </p>

          <p className="leading-relaxed mb-12">
            Drawing from my years of experience as a professional designer, I've developed a structured approach to craft presentations that simplify the complex narrative of our design process and magnify the impact of our message. The presentation is a pivotal aspect of our role as designers—it's our platform to illustrate our unique artistic contributions and the value we add to a production.
          </p>

          {/* Pull Quote */}
          <div className="my-16 py-8 border-y border-black dark:border-white">
            <p className="text-2xl text-center leading-relaxed opacity-70 italic max-w-2xl mx-auto">
              "A well-orchestrated presentation is an opportunity to share our passion and define our role within the collaborative fabric of the creative team."
            </p>
          </div>

          <h2 className="text-3xl tracking-tight mb-8 mt-16">The Presentation Format</h2>

          <p className="leading-relaxed mb-8">
            A successful design presentation follows a clear structure that builds anticipation and understanding:
          </p>

          <ol className="space-y-4 mb-12 opacity-80 pl-6">
            <li><strong>Introduction</strong> – Establish your presence and connection to the work</li>
            <li><strong>Research</strong> – Guide the audience through your creative process</li>
            <li><strong>Design Concept</strong> – The grand unveiling of your vision</li>
            <li><strong>Technical Details</strong> – The "and there's more" moment</li>
            <li><strong>Concluding Remarks and Open Forum</strong> – Invite collaboration</li>
          </ol>

          <h3 className="text-2xl tracking-tight mb-6 mt-12">The Introduction</h3>
          
          <p className="leading-relaxed mb-6">
            The opening moments of a presentation are crucial. As a design team member, you will present before or after one of your colleagues. This is your golden opportunity to take command of the room and establish a strong presence. Start by introducing yourself clearly and straightforwardly, such as, "Hello, my name is [Your Name], and for this production, I am the [Scenic, Costume, Lighting, Sound, or Projection] Designer."
          </p>

          <p className="leading-relaxed mb-12">
            Your first slide should be simple and effective, featuring your name and job title, complemented by a color palette and typography that resonates with the production's mood. Once the formalities are out of the way, the floor is yours to delve into the essence of the production from your perspective. Share what emotions the production evokes in you, pinpoint the central theme as you perceive it, or weave in a personal anecdote that connects your life experiences with the production's narrative.
          </p>

          <h3 className="text-2xl tracking-tight mb-6 mt-12">Research and Visual Presentation</h3>
          
          <p className="leading-relaxed mb-8">
            Following your introduction, guide your audience through your unique design process. This journey unfolds in three distinct phases:
          </p>

          <div className="space-y-8 mb-12">
            <div className="border-l-2 border-black dark:border-white pl-6">
              <h4 className="text-xl mb-3">Initial Research</h4>
              <p className="opacity-70 leading-relaxed">
                Share preliminary research images, detailing your first impressions upon reading the script, and describing pivotal conversations with the director and other design team members. This initial stage sets the stage, steering your audience toward understanding your theatrical concept.
              </p>
            </div>

            <div className="border-l-2 border-black dark:border-white pl-6">
              <h4 className="text-xl mb-3">Contextual Research</h4>
              <p className="opacity-70 leading-relaxed">
                Delve into contextual or historical research. This segment is dedicated to connecting the dots between the script's reality and your conceptual vision. Build the world of the production, laying out critical elements such as time period, locale, and social class. Your visual aids might include historical photographs or personal images that tie into the production's setting.
              </p>
            </div>

            <div className="border-l-2 border-black dark:border-white pl-6">
              <h4 className="text-xl mb-3">Emotional Research</h4>
              <p className="opacity-70 leading-relaxed">
                Having laid down the realities of the world you've created, shift the focus to the emotional landscape of the production. Discuss how you wish the audience to perceive and feel about the production and how you plan to weave in the central theme. Showcase your selected color palettes, cinematic references, or other artistic inspirations.
              </p>
            </div>
          </div>

          <div className="my-12 p-8 bg-gray-50 dark:bg-gray-900 border-l-2 border-black dark:border-white">
            <h4 className="text-xl mb-4">Research Notes</h4>
            <p className="opacity-70 leading-relaxed">
              Remember that you, the designer, are the bridge between your concept and the audience. Don't overwhelm your audience with an excess of images; instead, carefully curate key visuals that adeptly navigate your audience through your creative thought process. I recommend using <strong>no more than six images per slide</strong> to maintain clarity and focus. Establish a clear hierarchy within your images to highlight specific details that merit attention.
            </p>
          </div>

          {/* Section Break */}
          <div className="w-16 h-px bg-black dark:bg-white opacity-30 my-16 mx-auto"></div>

          <h2 className="text-3xl tracking-tight mb-8 mt-16">The Design Concept: Your Hero Moment</h2>

          <p className="leading-relaxed mb-6">
            After thoroughly laying out the intricacies of your design process, you are primed for the grand unveiling of your masterpiece. I personally like to kick off this pivotal section of the presentation with what I've affectionately dubbed <strong>"The Hero Slide."</strong>
          </p>

          <p className="leading-relaxed mb-12">
            This is the slide that brings your audience face-to-face with the culmination of your hard work and creativity. Depending on your specific design role, this could be a stunning Scenic Design Rendering, a collection of principal renderings for a Costume Design, an evocative Flash and Trash Lighting Rendering, or for Sound Design, a poignant Emotional Research Image harmoniously overlaid with a soundscape or piece of music you've composed.
          </p>

          {/* Pull Quote */}
          <div className="my-16 py-8 border-y border-black dark:border-white">
            <p className="text-2xl text-center leading-relaxed opacity-70 italic max-w-2xl mx-auto">
              "Your images must adhere to a 16:9 aspect ratio, filling the entire screen to forge a direct connection between your audience, yourself, and your work."
            </p>
          </div>

          <h3 className="text-2xl tracking-tight mb-6 mt-12">Discipline-Specific Approaches</h3>

          <div className="space-y-8 mb-12">
            <div>
              <h4 className="text-xl mb-3">Scenic Design</h4>
              <p className="opacity-70 leading-relaxed mb-3">
                Provide a clear and comprehensive understanding of the spatial relationships within the set. Present the ground plan and section, highlighting how different scenic elements interact and potential blocking scenarios.
              </p>
              <p className="opacity-70 leading-relaxed">
                Follow this up with additional renderings for each scene, including human figures to establish scale and incorporating general lighting to convey the intended mood.
              </p>
            </div>

            <div>
              <h4 className="text-xl mb-3">Costume Design</h4>
              <p className="opacity-70 leading-relaxed mb-3">
                Prioritize showcasing the principal characters of the production. A useful approach is to display the character's progression throughout the production by including multiple costume looks on a single slide.
              </p>
              <p className="opacity-70 leading-relaxed">
                Follow this with a final slide dedicated to ensemble characters, providing a holistic view of the production's costume design.
              </p>
            </div>

            <div>
              <h4 className="text-xl mb-3">Lighting Design</h4>
              <p className="opacity-70 leading-relaxed mb-3">
                If you are proficient with software like Vectorworks, utilize lighting renderings to demonstrate how the set transitions between scenes.
              </p>
              <p className="opacity-70 leading-relaxed">
                If not, lean on your emotional research to guide you through the presentation, utilizing color palettes and images from related media to communicate your ideas effectively.
              </p>
            </div>

            <div>
              <h4 className="text-xl mb-3">Sound Design</h4>
              <p className="opacity-70 leading-relaxed mb-3">
                While Sound Design is inherently a non-visual form, incorporating images that support the theme and mood derived from your emotional research can significantly enhance audience engagement.
              </p>
              <p className="opacity-70 leading-relaxed">
                Complement these visuals with soundscapes encapsulating key moments in the production, creating a multisensory presentation that vividly brings your sound design to life.
              </p>
            </div>
          </div>

          {/* Section Break */}
          <div className="w-16 h-px bg-black dark:bg-white opacity-30 my-16 mx-auto"></div>

          <h2 className="text-3xl tracking-tight mb-8 mt-16">Technical Details: "And There's More"</h2>

          <p className="leading-relaxed mb-6">
            This segment of the presentation embodies the exhilarating "and there's more" ethos familiar from Apple Keynotes. It's the moment where theatrical designers can truly flaunt the innovative and standout aspects of their designs.
          </p>

          <ul className="space-y-6 mb-12 opacity-80">
            <li>
              <strong>For Scenic Designers:</strong> Delve into the specifics of incorporating practical light fixtures, cutting-edge LEDs, or the intricacies of automated scenery that bring dynamic motion to the stage.
            </li>
            <li>
              <strong>For Costume Designers:</strong> Discuss the theatrical magic underpinning moments like on-stage transformations, the meticulous craftsmanship behind historically accurate corsets, or the sourcing of rare and authentic materials.
            </li>
            <li>
              <strong>For Lighting and Sound Designers:</strong> Emphasize advancements and unique touches in your domain. Discuss new technologies being leveraged, rented equipment that enhances atmospheric elements, or pioneering techniques employed to create a truly immersive experience.
            </li>
          </ul>

          <p className="leading-relaxed mb-12">
            In essence, this segment is a celebration of the designer's artistry, innovation, and the special touches that elevate a production from ordinary to extraordinary.
          </p>

          <h2 className="text-3xl tracking-tight mb-8 mt-16">Concluding Remarks and Open Forum</h2>

          <p className="leading-relaxed mb-6">
            As you approach the final moments of your presentation, wrap up your narrative with concluding remarks that encapsulate the essence of your design vision and its significance to the production. Reflect on the key points you've shared, reiterating the innovative aspects and creative prowess that you, as a designer, bring to the table.
          </p>

          <p className="leading-relaxed mb-12">
            After your concluding remarks, transition into an open forum, inviting questions and fostering a dialogue with your audience. Opening the floor to questions demonstrates your openness to collaboration and your commitment to the collective success of the production. It also allows you to glean insights from different perspectives, which can be instrumental in refining and enhancing your design as you move forward.
          </p>

          {/* Pull Quote */}
          <div className="my-16 py-8 border-y border-black dark:border-white">
            <p className="text-2xl text-center leading-relaxed opacity-70 italic max-w-2xl mx-auto">
              "The concluding remarks and open forum serve as a bridge, connecting the realm of your creative vision with the collaborative ecosystem of the production."
            </p>
          </div>

          {/* Section Break */}
          <div className="w-16 h-px bg-black dark:bg-white opacity-30 my-16 mx-auto"></div>

          <h2 className="text-3xl tracking-tight mb-8 mt-16">Key Takeaways</h2>

          <div className="space-y-6 mb-16">
            <div className="border-l-2 border-black dark:border-white pl-6">
              <h3 className="text-xl mb-2">Build Anticipation</h3>
              <p className="opacity-70">Like Apple's keynotes, structure your presentation to create excitement and anticipation for each reveal.</p>
            </div>

            <div className="border-l-2 border-black dark:border-white pl-6">
              <h3 className="text-xl mb-2">Show, Don't Overwhelm</h3>
              <p className="opacity-70">Curate your visuals carefully—no more than six images per slide—to maintain focus and clarity.</p>
            </div>

            <div className="border-l-2 border-black dark:border-white pl-6">
              <h3 className="text-xl mb-2">Tell Your Story</h3>
              <p className="opacity-70">Guide your audience through your research journey, from initial impressions to emotional landscape to final vision.</p>
            </div>

            <div className="border-l-2 border-black dark:border-white pl-6">
              <h3 className="text-xl mb-2">Create Your Hero Moment</h3>
              <p className="opacity-70">Build to a grand unveiling with full-screen, 16:9 images that forge a direct connection with your audience.</p>
            </div>

            <div className="border-l-2 border-black dark:border-white pl-6">
              <h3 className="text-xl mb-2">Save Something Special</h3>
              <p className="opacity-70">Use the "and there's more" approach to showcase technical innovations and special details that make your design unique.</p>
            </div>
          </div>

          <p className="text-xl leading-relaxed opacity-80 mb-8">
            Just as Apple's Keynotes have captivated the world with their seamless blending of innovation and human experience, we, as theatrical designers, can wield our presentations as a tool of enchantment. Through careful planning, clear communication, and a dash of flair, we can elevate our presentations to be not just a mere sharing of ideas but an experience that leaves our audience eagerly awaiting the moment the curtain rises.
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

        {/* Related Posts */}
        <div className="mt-24 pt-12 border-t border-black dark:border-white">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xs tracking-widest uppercase opacity-60">RELATED ARTICLES</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {relatedPosts.map((post, index) => (
              <button
                key={index}
                onClick={() => onNavigate('scenic-insights', post.slug)}
                className="group text-left border border-black dark:border-white p-6 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all duration-300"
              >
                <div className="flex items-center gap-2 mb-3 opacity-60 group-hover:opacity-80">
                  <span className="text-xs tracking-wider uppercase">{post.category}</span>
                  <ArrowRight className="w-3 h-3 ml-auto transform group-hover:translate-x-1 transition-transform" />
                </div>
                <h4 className="text-lg mb-2 tracking-tight">{post.title}</h4>
                <p className="text-sm opacity-60 group-hover:opacity-80">{post.description}</p>
              </button>
            ))}
          </div>
        </div>
      </article>
    </div>
  );
}
