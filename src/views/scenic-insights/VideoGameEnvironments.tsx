import React from 'react';
import { ArrowLeft, ArrowRight, Tag } from 'lucide-react';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { ArticleAuthor } from '../../components/shared/ArticleAuthor';
import { blogPosts } from '../../data/blog-posts';

interface VideoGameEnvironmentsProps {
  onNavigate: (page: string, slug?: string) => void;
}

export function VideoGameEnvironments({ onNavigate }: VideoGameEnvironmentsProps) {
  const post = blogPosts.find(p => p.id === 'video-game-environments');
  const tags = post?.tags || [];

  const handleTagClick = (tag: string) => {
    onNavigate('scenic-insights');
    };

  const relatedPosts = [
    {
      title: 'THEMED ENTERTAINMENT EVOLUTION',
      category: 'EXPERIENTIAL DESIGN',
      description: 'From ancient gardens to immersive worlds—tracing the quest for wonder',
      slug: 'themed-entertainment-evolution'
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
            <span className="text-xs">JUNE 8, 2024</span>
          </div>
          
          <h1 className="mb-8 text-5xl md:text-6xl leading-tight tracking-tight">
            BEYOND THE STAGE: WHAT SCENIC DESIGNERS CAN LEARN FROM VIDEO GAME ENVIRONMENTS
          </h1>
          
          <p className="opacity-60 text-xl leading-relaxed max-w-3xl">
            From Skyrim's weathered ruins to theatrical magic—how game design principles transformed my approach to scenic design.
          </p>
        </div>

        {/* Featured Image */}
        <div className="mb-20 -mx-8 md:mx-0">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1760802185763-fe4999466b78?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYW50YXN5JTIwZ2FtZSUyMGNvbmNlcHQlMjBhcnR8ZW58MXx8fHwxNzYxNzk0MTY0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="Fantasy game environment concept art"
            className="w-full"
          />
        </div>

        {/* Article Content */}
        <div className="prose-custom">
          <p className="text-xl leading-relaxed mb-8 opacity-80">
            I have always had a fascination with storytelling through games. This probably began in my youth playing The Legend of Zelda: Ocarina of Time, but it really resonated with me when I was penniless in Chicago, working at Target and living with my best friend Dru. We were in our early/mid 20s in 2011 when Skyrim came out. We would spend hours on our days off taking turns with our characters, exploring different storylines. It was the best entertainment when we could barely afford rent sometimes.
          </p>

          <p className="text-lg leading-relaxed mb-12 opacity-70">
            Those hours lost in digital worlds weren't just escapism—they were unknowingly shaping my approach to scenic design. One night, while I should have been finishing renderings for an upcoming show, I found myself wandering through an ancient Nordic ruin in Skyrim. Something clicked as I took in the weathered stone walls, the subtle moss creeping up broken columns, the way light filtered through cracks in the ceiling—it was exactly the texture and mood I'd been struggling to capture for my current production.
          </p>

          {/* Section Break */}
          <div className="w-16 h-px bg-black dark:bg-white opacity-30 my-16 mx-auto"></div>

          <h2 className="text-3xl tracking-tight mb-8 mt-16">The Shared Language of Illusion</h2>
          
          <p className="leading-relaxed mb-6">
            When you think about it, what we do as scenic designers isn't that different from what game environment artists do. We're both trying to transport an audience somewhere else using limited resources and considerable trickery. The difference? Game developers use polygons and pixels; we use plywood and paint.
          </p>

          <p className="leading-relaxed mb-12">
            Both mediums rely on the audience's willingness to suspend disbelief. Nobody playing Skyrim thinks they're actually traversing a fantasy landscape (well, maybe after hour twelve...), just like no theatergoer believes they're actually sitting in a 19th-century Russian estate during The Cherry Orchard. But the more convincing our illusion, the more willing they are to emotionally invest.
          </p>

          {/* Pull Quote */}
          <div className="my-16 py-8 border-y border-black dark:border-white">
            <p className="text-2xl text-center leading-relaxed opacity-70 italic max-w-2xl mx-auto">
              "As scenic designers, we start the process as level designers, concerned with how spaces connect and how actors move through them."
            </p>
          </div>

          <p className="leading-relaxed mb-12">
            What's fascinating is how our design process actually mirrors the game development pipeline. In video games, they have dedicated "level designers" who focus solely on creating the spatial layout, flow, and basic architecture before any detailed art passes are applied. Sound familiar? That's essentially what we're doing when we create white models and ground plans—functioning as level designers by establishing the fundamental spatial relationships, sightlines, and traffic patterns.
          </p>

          <h2 className="text-3xl tracking-tight mb-8 mt-16">Texture: The Secret Weapon of Immersion</h2>

          <p className="leading-relaxed mb-8">
            Let's talk texture—the unsung hero of scenic design and one of the most powerful tools game developers wield to create believable worlds.
          </p>

          <div className="my-12 -mx-8 md:mx-0">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1760278041709-e54cb1dca123?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aWRlbyUyMGdhbWUlMjBlbnZpcm9ubWVudCUyMGRlc2lnbnxlbnwxfHx8fDE3NjE3OTQxNjV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Video game environment design"
              className="w-full"
            />
          </div>

          <p className="leading-relaxed mb-6">
            In Skyrim, you'll notice how a single stone wall might contain multiple layers of visual information: the base granite material, centuries of weathering, patches of moss, ancient carvings, and perhaps traces of soot from nearby torches. None of these layers requires complex 3D modeling—they're all accomplished through clever texturing techniques.
          </p>

          <p className="leading-relaxed mb-12">
            Fallout 4 takes this approach in a different direction, showing how materials decay over decades of abandonment and nuclear fallout. The peeling paint, rusted metal, and crumbling concrete tell stories of a once-vibrant world suddenly frozen in time. What's brilliant about Fallout's approach is how it juxtaposes the 1950s retro-futuristic aesthetic with dramatic decay—creating an instantly recognizable visual language.
          </p>

          <h3 className="text-2xl tracking-tight mb-6 mt-12">A Practical Application: Barefoot in the Park</h3>

          <p className="leading-relaxed mb-6">
            Last summer, I was designing a production of Barefoot in the Park. The script calls for an aged apartment with unusual features, and I wanted the center of the set to feature painted white brick walls with character. I started the process by painting brick masonite boards with eggshell white paint, and then going over the grout lines with flat white. This simple technique created the illusion of a texture difference between the brick faces and the mortar.
          </p>

          <p className="leading-relaxed mb-12">
            But it was still missing something—that lived-in quality that makes a space feel real. Remembering those weathered walls from Skyrim, I had my team apply several thin brown washes to add a sense of age and grime that had accumulated over decades. We concentrated these washes around areas that would naturally collect dirt: near the baseboards, around light switches, and in the corners. The difference was night and day. What could have been a flat, characterless wall suddenly had stories to tell.
          </p>

          <div className="my-12 -mx-8 md:mx-0">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1737617009800-5d570a8552ee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0aGVhdHJlJTIwc3RhZ2UlMjBwYWludGluZyUyMHNjZW5pY3xlbnwxfHx8fDE3NjE3OTQxNjZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Theatrical scenic painting process"
              className="w-full"
            />
          </div>

          {/* Section Break */}
          <div className="w-16 h-px bg-black dark:bg-white opacity-30 my-16 mx-auto"></div>

          <h2 className="text-3xl tracking-tight mb-8 mt-16">Strategic Detail: Learning Where to Focus</h2>
          
          <p className="leading-relaxed mb-6">
            One brilliant aspect of game design is how it strategically allocates detail. Skyrim's developers know you'll spend more time in town squares and important interiors than in random mountain passes, so that's where they invest their highest-resolution textures and most intricate meshes.
          </p>

          <p className="leading-relaxed mb-12">
            Fallout 4 takes this principle to another level with environmental focal points. The game might place a perfectly preserved red toy rocket in an otherwise drab, desaturated room, drawing your eye immediately to that point of contrast. Or consider how Diamond City (a settlement built in an old baseball stadium) concentrates detailed elements around the central marketplace while keeping the distant stadium walls more simplified.
          </p>

          <div className="my-12 p-8 bg-gray-50 dark:bg-gray-900 border-l-2 border-black dark:border-white">
            <h4 className="text-xl mb-4">Engagement Zones</h4>
            <p className="opacity-70 leading-relaxed mb-4">
              I used to obsess over making every square inch of my sets equally detailed, which was exhausting, expensive, and frankly unnecessary. Now, I focus intensely on what I call "engagement zones"—the areas where the audience's eyes will naturally land and linger:
            </p>
            <ul className="space-y-2 opacity-70 ml-6">
              <li>• Entry points where characters first appear</li>
              <li>• Focal furniture pieces central to the action</li>
              <li>• Areas that get the most stage time</li>
              <li>• Points where important dramatic moments occur</li>
            </ul>
          </div>

          <p className="leading-relaxed mb-12">
            Everything else gets simplified treatment. This approach not only saves time and money but actually improves the overall design by guiding the audience's eye exactly where I want it to go.
          </p>

          {/* Pull Quote */}
          <div className="my-16 py-8 border-y border-black dark:border-white">
            <p className="text-2xl text-center leading-relaxed opacity-70 italic max-w-2xl mx-auto">
              "Much like Fallout 4's approach to contrast, we placed a few carefully chosen, highly detailed props in strategic positions to draw focus exactly where the story needed it most."
            </p>
          </div>

          <h2 className="text-3xl tracking-tight mb-8 mt-16">Environmental Storytelling: Let Your Set Speak</h2>

          <p className="leading-relaxed mb-6">
            What's truly revolutionary about games like Fallout 4 and Skyrim is how the environment itself tells stories. In Fallout 4's abandoned homes, you might find a child's room with a teddy bear positioned at a tiny tea party, undisturbed for 200 years, or a skeleton in a bathtub with empty med-x syringes and a farewell note nearby. Without a word of dialogue, these arrangements tell complete stories about the final moments before the bombs fell.
          </p>

          <p className="leading-relaxed mb-12">
            Similarly, in Skyrim, walk into an abandoned shack, and you'll find overturned furniture, blood stains, and perhaps a hastily written note—all visual clues about what happened there. This "show don't tell" approach is theatrical gold.
          </p>

          <h3 className="text-2xl tracking-tight mb-6 mt-12">Embedding Narrative Clues</h3>

          <p className="leading-relaxed mb-6">
            Taking inspiration from how game environments embed narrative clues, I've incorporated subtle storytelling elements throughout my sets: water damage stains suggesting long-neglected repairs, family photos strategically placed to reveal relationships, half-finished home renovation projects abandoned years ago. Audience members who noticed these details gained an enriched understanding of the characters' history before a single line was spoken.
          </p>

          <p className="leading-relaxed mb-12">
            For a recent show set in the 1950s, I took direct inspiration from Fallout 4's pre-war homes, with their perfectly preserved slices of American optimism, but added subtle signs of financial strain: carefully mended furnishings, strategic placement of "nice" objects in visible areas, and cheaper alternatives hidden from view. These environmental clues helped establish the family's precarious financial situation and social aspirations without a word of exposition.
          </p>

          {/* Section Break */}
          <div className="w-16 h-px bg-black dark:bg-white opacity-30 my-16 mx-auto"></div>

          <h2 className="text-3xl tracking-tight mb-8 mt-16">Digital Tools and Inspiration Across Disciplines</h2>

          <div className="my-12 -mx-8 md:mx-0">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1690177899019-7e459e63a38e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHwzRCUyMG1vZGVsaW5nJTIwYXJjaGl0ZWN0dXJhbCUyMGRlc2lnbnxlbnwxfHx8fDE3NjE3OTQxNjZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="3D architectural modeling"
              className="w-full"
            />
          </div>

          <p className="leading-relaxed mb-6">
            My design process begins in Vectorworks, where I build detailed 3D models of my sets and test how they'll function in the physical space. This digital foundation allows me to work out technical challenges, establish sight lines, and create precise technical drawings before anything is built.
          </p>

          <p className="leading-relaxed mb-12">
            What fascinates me is how the gaming industry's approach to environmental design can enhance our theatrical practice, even without directly using their tools. By studying how game designers create immersive worlds—their techniques for texturing, strategic detail placement, and environmental storytelling—we can bring fresh approaches to our traditional methods.
          </p>

          <h2 className="text-3xl tracking-tight mb-8 mt-16">Bringing It All Together: A New Design Approach</h2>

          <p className="leading-relaxed mb-8">
            Here's how I've been integrating game design principles into my theatrical practice:
          </p>

          <div className="space-y-6 mb-16">
            <div className="border-l-2 border-black dark:border-white pl-6">
              <h3 className="text-xl mb-2">Concept Phase</h3>
              <p className="opacity-70">Identify the emotional and narrative core of each environment, much like game designers do when establishing the "feel" of different areas.</p>
            </div>

            <div className="border-l-2 border-black dark:border-white pl-6">
              <h3 className="text-xl mb-2">Digital Modeling</h3>
              <p className="opacity-70">Build detailed models in Vectorworks to test spatial relationships and technical requirements.</p>
            </div>

            <div className="border-l-2 border-black dark:border-white pl-6">
              <h3 className="text-xl mb-2">Texture Inspiration</h3>
              <p className="opacity-70">Create mood boards that include screenshots from games with textures and environments similar to what I'm trying to achieve.</p>
            </div>

            <div className="border-l-2 border-black dark:border-white pl-6">
              <h3 className="text-xl mb-2">Strategic Detail Planning</h3>
              <p className="opacity-70">Map out where to focus the highest level of detail, using the game design principle of concentrating resources where they'll have the most impact.</p>
            </div>

            <div className="border-l-2 border-black dark:border-white pl-6">
              <h3 className="text-xl mb-2">Environmental Storytelling</h3>
              <p className="opacity-70">Plant visual "Easter eggs" that reward attentive viewers—subtle details that hint at character history or foreshadow events.</p>
            </div>

            <div className="border-l-2 border-black dark:border-white pl-6">
              <h3 className="text-xl mb-2">Material and Paint Treatment Specifications</h3>
              <p className="opacity-70">Develop detailed paint elevations and texture references that communicate to scenic artists exactly how to achieve the desired effects.</p>
            </div>
          </div>

          {/* Section Break */}
          <div className="w-16 h-px bg-black dark:bg-white opacity-30 my-16 mx-auto"></div>

          <h2 className="text-3xl tracking-tight mb-8 mt-16">The Future Is Mixed: Cross-Disciplinary Collaboration</h2>

          <div className="my-12 -mx-8 md:mx-0">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1594501252028-2bb7b21d01b7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYW1lJTIwZGVzaWduJTIwd29ya3NwYWNlfGVufDF8fHx8MTc2MTc5NDE2Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Game design workspace collaboration"
              className="w-full"
            />
          </div>

          <p className="leading-relaxed mb-6">
            The most exciting frontier in theatrical design may be the collaboration between different design disciplines, all drawing inspiration from the immersive environments of video games. While scenic design remains focused on physical environments, there's tremendous potential in how we can work alongside our colleagues in video/projection design, lighting, and sound to create truly cohesive worlds.
          </p>

          <p className="leading-relaxed mb-12">
            Video game environments excel at integration—lighting, textures, sound, and movement all work in concert to create believable spaces. This holistic approach offers a valuable model for theatrical designers across disciplines. As a scenic designer, I've found that early collaboration with projection and lighting designers can lead to more cohesive environments where each element enhances the others.
          </p>

          {/* Pull Quote */}
          <div className="my-16 py-8 border-y border-black dark:border-white">
            <p className="text-2xl text-center leading-relaxed opacity-70 italic max-w-2xl mx-auto">
              "The key is to remember that all design serves storytelling. The most effective theatrical experiences use every available tool to deepen the audience's connection to the narrative."
            </p>
          </div>

          <h3 className="text-2xl tracking-tight mb-6 mt-12">Exciting Possibilities for the Future</h3>

          <p className="leading-relaxed mb-6">
            One of the most intriguing frontiers in theatrical design is the potential integration of physical scenic elements with digital projections. Video game environments offer valuable inspiration for how this might work effectively. Games seamlessly combine static environmental elements with dynamic lighting, particle effects, and atmospheric animations to create truly immersive spaces.
          </p>

          <p className="leading-relaxed mb-12">
            Imagine creating a physical environment of weathered timbers and textured surfaces, then collaborating with projection designers to add subtle animated light patterns and atmospheric effects. When executed thoughtfully, audiences might not be able to tell where the physical set ends and the digital elements begin—achieving the kind of seamless illusion that makes great game environments so compelling.
          </p>

          <h2 className="text-3xl tracking-tight mb-8 mt-16">Your Turn to Level Up</h2>

          <p className="leading-relaxed mb-6">
            Next time you're stuck in a creative rut, try spending some time with an immersive game like Skyrim, Fallout 4, Red Dead Redemption 2, or The Last of Us. Pay attention to the environments—not just how they look, but how they make you feel. Notice the texture work, the strategic detail placement, the environmental storytelling.
          </p>

          <p className="leading-relaxed mb-6">
            I especially recommend exploring Fallout 4's approach to creating contrast between preserved pre-war elements and post-apocalyptic decay. The way they juxtapose clean, colorful 1950s advertising with the grim reality of the wasteland offers powerful lessons in visual tension that can translate beautifully to stage design.
          </p>

          <p className="leading-relaxed mb-12">
            Then ask yourself: "How can I bring this level of immersion to my next design?" Your audience might not consciously notice the difference, but they'll feel it. And isn't that what great scenic design is all about—creating worlds that feel so real, so lived-in, that the audience forgets they're sitting in a theater?
          </p>

          <p className="text-xl leading-relaxed opacity-80 mb-8">
            Now if you'll excuse me, I've got some Nordic ruins to explore. For research purposes, of course. And maybe a trip to post-apocalyptic Boston afterward.
          </p>

          {/* Section Break */}
          <div className="w-16 h-px bg-black dark:bg-white opacity-30 my-16 mx-auto"></div>

          <h2 className="text-3xl tracking-tight mb-8 mt-16">Key Takeaways</h2>

          <div className="space-y-6 mb-16">
            <div className="border-l-2 border-black dark:border-white pl-6">
              <h3 className="text-xl mb-2">Layer Your Textures</h3>
              <p className="opacity-70">Just like game environments, build visual complexity through multiple layers of texture and weathering rather than relying on a single paint treatment.</p>
            </div>

            <div className="border-l-2 border-black dark:border-white pl-6">
              <h3 className="text-xl mb-2">Focus on Engagement Zones</h3>
              <p className="opacity-70">Concentrate your most detailed work where the audience will naturally look, and simplify everything else.</p>
            </div>

            <div className="border-l-2 border-black dark:border-white pl-6">
              <h3 className="text-xl mb-2">Let Environments Tell Stories</h3>
              <p className="opacity-70">Plant visual clues that reveal character and history without exposition—trust your audience to read the details.</p>
            </div>

            <div className="border-l-2 border-black dark:border-white pl-6">
              <h3 className="text-xl mb-2">Think Like a Level Designer</h3>
              <p className="opacity-70">Start with spatial relationships and flow before adding detailed textures and decoration.</p>
            </div>

            <div className="border-l-2 border-black dark:border-white pl-6">
              <h3 className="text-xl mb-2">Collaborate Across Disciplines</h3>
              <p className="opacity-70">Work early with projection and lighting designers to create integrated environments where each element enhances the others.</p>
            </div>
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

        {/* Related Posts */}
        <div className="mt-16 pt-12 border-t border-black dark:border-white">
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
