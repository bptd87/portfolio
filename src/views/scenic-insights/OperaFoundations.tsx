import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, ChevronDown, Tag } from 'lucide-react';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { ArticleAuthor } from '../../components/shared/ArticleAuthor';
import { blogPosts } from '../../data/blog-posts';

interface OperaFoundationsProps {
  onNavigate: (page: string, slug?: string) => void;
}

export function OperaFoundations({ onNavigate }: OperaFoundationsProps) {
  const post = blogPosts.find(p => p.id === 'opera-foundations');
  const tags = post?.tags || [];

  const handleTagClick = (tag: string) => {
    onNavigate('scenic-insights');
    };

  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const faqs = [
    {
      question: 'Is opera always in a foreign language?',
      answer: 'While many famous operas are performed in Italian, German, or French, opera exists in virtually every language. Many companies now offer supertitles (projected translations) above the stage, and some perform translated versions. There\'s also a rich tradition of English-language opera from composers like Benjamin Britten and Philip Glass.'
    },
    {
      question: 'Do I need to understand the language to enjoy opera?',
      answer: 'Not at all! Opera communicates through music, acting, and visual elements in addition to text. Most opera houses provide synopses in programs and project translations during performances. The emotional power of the music often transcends language barriers.'
    },
    {
      question: 'Isn\'t opera just for classical music experts?',
      answer: 'Opera was actually the popular entertainment of its day! While appreciating the musical complexities can enhance your experience, many people connect with opera through its stories, visual spectacle, and emotional power. Many modern productions are specifically designed to welcome newcomers.'
    },
    {
      question: 'How should I dress for the opera?',
      answer: 'While opening nights might feature formal attire, most regular performances welcome a range of dress styles. Business casual is always appropriate, but many opera houses now encourage "come as you are" to make everyone feel welcome. Student and casual performances often have no dress code at all.'
    },
    {
      question: 'What opera should I see first?',
      answer: 'Popular "gateway" operas include Puccini\'s La Bohème (romantic and accessible), Bizet\'s Carmen (filled with familiar melodies), Mozart\'s The Magic Flute (fantasy elements and humor), and Rossini\'s The Barber of Seville (comedy with memorable tunes).'
    },
    {
      question: 'How long is an opera performance?',
      answer: 'Opera length varies widely. Some run just 90 minutes without intermission, while Wagner\'s epic Ring cycle spans four nights and about 15 hours total. Most standard repertory operas run 2-3 hours with intermissions—similar to seeing a movie plus dinner.'
    }
  ];

  const relatedPosts = [
    {
      title: 'THEMED ENTERTAINMENT EVOLUTION',
      category: 'EXPERIENTIAL DESIGN',
      description: 'From ancient gardens to immersive worlds—tracing the quest for wonder',
      slug: 'themed-entertainment-evolution'
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
            <span className="text-xs tracking-widest uppercase">MUSICAL THEATRE</span>
            <span className="text-xs">•</span>
            <span className="text-xs">JANUARY 7, 2025</span>
          </div>
          
          <h1 className="mb-8 text-4xl md:text-5xl lg:text-6xl leading-tight tracking-tight">
            OPERA'S FOUNDATIONS: THE FIRST ACT IN AMERICAN ENTERTAINMENT
          </h1>
          
          <p className="opacity-60 text-xl leading-relaxed max-w-3xl">
            Discover how opera laid the groundwork for musical theatre and cinema in American culture. This is the first installment in our series exploring the interconnected evolution of American entertainment forms.
          </p>
        </div>

        {/* Featured Image */}
        <div className="mb-20 -mx-8 md:mx-0">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1761359841098-8e84b7cf3661?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvcGVyYSUyMGhvdXNlJTIwcGVyZm9ybWFuY2UlMjBzdGFnZXxlbnwxfHx8fDE3NjE3OTUzMjh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="Opera house performance stage"
            className="w-full"
          />
        </div>

        {/* Article Content */}
        <div className="prose-custom">
          <h2 className="text-3xl tracking-tight mb-8">What is Opera?</h2>

          <p className="text-xl leading-relaxed mb-8 opacity-80">
            Opera, derived from the Italian word for "work," represents the perfect marriage of storytelling and musical expression. Unlike modern musicals, opera singers perform without microphones, relying solely on the power and projection of their natural voices. Accompanied by live orchestras, opera creates an immersive experience where narratives unfold through the interplay of melody, voice, and dramatic performance.
          </p>

          <div className="my-12 -mx-8 md:mx-0">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1745328597533-3df3e5db2dec?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvcmNoZXN0cmElMjBzeW1waG9ueSUyMHBlcmZvcm1hbmNlfGVufDF8fHx8MTc2MTc1NTU5M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Orchestra symphony performance"
              className="w-full"
            />
          </div>

          <p className="leading-relaxed mb-6">
            The art form emerged from Renaissance thinkers' attempts to recreate the emotional impact of ancient Greek theater. By blending spoken dialogue with musical accompaniment, early composers developed a new medium that could evoke profound emotional responses from audiences—setting the foundation for what would become one of the most influential art forms in Western culture.
          </p>

          <p className="leading-relaxed mb-12">
            The opening of Teatro San Cassiano in Venice in 1637 marked a pivotal moment in opera's evolution. As the world's first public opera house, it democratized what had previously been reserved for nobility and court performances. Venice quickly became Europe's opera capital, inspiring composers to create works that balanced artistic innovation with widespread appeal.
          </p>

          {/* Section Break */}
          <div className="w-16 h-px bg-black dark:bg-white opacity-30 my-16 mx-auto"></div>

          <h2 className="text-3xl tracking-tight mb-8 mt-16">Opera as a Social Hub</h2>

          <div className="my-12 -mx-8 md:mx-0">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1598868116734-e99ebd8fc926?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYXNxdWVyYWRlJTIwYmFsbCUyMGVsZWdhbnR8ZW58MXx8fHwxNzYxNzQ1OTc0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Elegant masquerade ball"
              className="w-full"
            />
            <p className="text-sm opacity-40 mt-2 text-center italic">Masked Ball at the Opera, 1873, Édouard Manet</p>
          </div>

          <p className="leading-relaxed mb-6">
            Opera's modern reputation as a formal, solemn experience stands in stark contrast to its lively beginnings. In 17th-century Venice, opera houses functioned as vibrant social centers where audiences actively participated—chatting, laughing, and sometimes even singing along with performers.
          </p>

          <div className="my-12 p-8 bg-gray-50 dark:bg-gray-900 border-l-2 border-black dark:border-white">
            <p className="leading-relaxed mb-4">
              These gatherings transcended the performance itself, offering attendees opportunities to:
            </p>
            <ul className="space-y-2 opacity-70">
              <li>• Engage in social networking</li>
              <li>• Discuss current events and politics</li>
              <li>• Share cultural experiences with diverse social groups</li>
              <li>• Form community connections</li>
            </ul>
          </div>

          <p className="leading-relaxed mb-12">
            Think of these early opera houses as Renaissance versions of today's multipurpose entertainment venues, where the social aspect was as important as the artistic content. This communal environment established opera as the centerpiece of urban cultural life, emphasizing connection and shared experience alongside artistic appreciation. As opera gained popularity, it transformed how people interacted with the arts, gradually opening its doors to broader audiences beyond aristocratic circles—creating one of history's first truly widespread entertainment media.
          </p>

          {/* Pull Quote */}
          <div className="my-16 py-8 border-y border-black dark:border-white">
            <p className="text-2xl text-center leading-relaxed opacity-70 italic max-w-2xl mx-auto">
              "Early opera houses were Renaissance versions of today's multipurpose entertainment venues—where the social aspect was as important as the artistic content."
            </p>
          </div>

          <h2 className="text-3xl tracking-tight mb-8 mt-16">The Cultural Foundations of Opera</h2>

          <h3 className="text-2xl tracking-tight mb-6 mt-12">Ancient Greek Influences</h3>

          <div className="my-12 -mx-8 md:mx-0">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1723372401041-d94ab970266d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbmNpZW50JTIwZ3JlZWslMjB0aGVhdHJlJTIwYW1waGl0aGVhdGVyfGVufDF8fHx8MTc2MTc5NTMyOXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Ancient Greek amphitheater"
              className="w-full"
            />
          </div>

          <p className="leading-relaxed mb-6">
            Opera owes much of its structural and thematic elements to Greek theatrical traditions. Greek drama introduced several concepts that became foundational to operatic storytelling:
          </p>

          <div className="space-y-6 mb-12">
            <div className="border-l-2 border-black dark:border-white pl-6">
              <h4 className="text-xl mb-2">Stock Characters</h4>
              <p className="opacity-70">The hero, villain, and comic relief archetypes that make stories universally relatable</p>
            </div>

            <div className="border-l-2 border-black dark:border-white pl-6">
              <h4 className="text-xl mb-2">Moral Lessons</h4>
              <p className="opacity-70">Narratives designed to impart ethical teachings through entertainment</p>
            </div>

            <div className="border-l-2 border-black dark:border-white pl-6">
              <h4 className="text-xl mb-2">Communal Catharsis</h4>
              <p className="opacity-70">The shared emotional release experienced by audiences</p>
            </div>

            <div className="border-l-2 border-black dark:border-white pl-6">
              <h4 className="text-xl mb-2">Chorus Function</h4>
              <p className="opacity-70">Groups that comment on and interpret the main action, similar to operatic ensembles</p>
            </div>
          </div>

          <h3 className="text-2xl tracking-tight mb-6 mt-12">Shakespeare's Dramatic Blueprint</h3>
          
          <p className="leading-relaxed mb-6">
            Shakespeare's works profoundly shaped opera's development, offering composers rich material filled with human complexity and emotional depth. His exploration of universal themes—love, ambition, betrayal, redemption—aligned perfectly with opera's dramatic focus.
          </p>

          <p className="leading-relaxed mb-6">
            Notable Shakespearean adaptations include Verdi's <em>Macbeth</em> and <em>Otello</em>, which preserve the dramatic intensity while amplifying emotional power through music, Gounod's <em>Roméo et Juliette</em>, transforming the tragic romance into soaring musical expression, and Britten's <em>A Midsummer Night's Dream</em> capturing the play's magical elements through innovative composition.
          </p>

          <p className="leading-relaxed mb-12">
            Beyond specific adaptations, Shakespeare's mastery of rhythm, pacing, and dramatic tension inspired operatic structures. His techniques for building suspense and creating memorable character moments became essential tools for opera composers seeking to maximize theatrical impact.
          </p>

          {/* Section Break */}
          <div className="w-16 h-px bg-black dark:bg-white opacity-30 my-16 mx-auto"></div>

          <h2 className="text-3xl tracking-tight mb-8 mt-16">The Evolution of Opera Through History</h2>

          <div className="my-12 -mx-8 md:mx-0">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1737642133766-725eeae44b89?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYXJvcXVlJTIwb3BlcmElMjBjaGFuZGVsaWVyJTIwZWxlZ2FudHxlbnwxfHx8fDE3NjE3OTUzMjl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Baroque opera house with elegant chandelier"
              className="w-full"
            />
          </div>

          <h3 className="text-2xl tracking-tight mb-6 mt-12">Baroque Period (1600-1750)</h3>
          
          <p className="leading-relaxed mb-6">
            Baroque opera established the foundation of the art form, developing two distinct styles to serve different audiences:
          </p>

          <div className="my-12 p-8 bg-gray-50 dark:bg-gray-900 border-l-2 border-black dark:border-white">
            <h4 className="text-xl mb-4">Opera Seria</h4>
            <p className="leading-relaxed mb-4">These serious operas featured:</p>
            <ul className="space-y-2 opacity-70 mb-6">
              <li>• Heroic, historical, and moralistic themes</li>
              <li>• Complex vocal ornamentation showcasing singer virtuosity</li>
              <li>• Formal structures with recitative and aria patterns</li>
              <li>• Notable example: Handel's <em>Giulio Cesare</em></li>
            </ul>

            <h4 className="text-xl mb-4 mt-6">Opera Buffa</h4>
            <p className="leading-relaxed mb-4">These comic operas offered:</p>
            <ul className="space-y-2 opacity-70">
              <li>• Humor and relatable everyday characters</li>
              <li>• More natural singing styles</li>
              <li>• Plots reflecting common social situations</li>
              <li>• Notable example: Pergolesi's <em>La Serva Padrona</em></li>
            </ul>
          </div>

          <p className="leading-relaxed mb-12 opacity-70">
            <strong>Modern Connection:</strong> Today's period dramas often feature Baroque opera, while companies frequently stage these works with minimalist designs to highlight their intricate musical structures.
          </p>

          <h3 className="text-2xl tracking-tight mb-6 mt-12">Classical Period (1750-1820)</h3>
          
          <p className="leading-relaxed mb-6">
            The Classical era refined opera with innovations influenced by Enlightenment ideals:
          </p>

          <ul className="space-y-4 mb-8 opacity-80">
            <li>• <strong>Balance between music and storytelling:</strong> Creating more integrated dramatic experiences</li>
            <li>• <strong>Character development:</strong> More psychologically complex roles</li>
            <li>• <strong>Ensemble pieces:</strong> Advanced musical interactions between multiple characters</li>
            <li>• <strong>Notable composer:</strong> Mozart's revolutionary works like <em>The Marriage of Figaro</em> and <em>Don Giovanni</em></li>
          </ul>

          <p className="leading-relaxed mb-12 opacity-70">
            <strong>Modern Connection:</strong> Mozart's compositions remain among the most frequently performed operas worldwide, while their musical themes appear in countless films, commercials, and popular adaptations.
          </p>

          <h3 className="text-2xl tracking-tight mb-6 mt-12">Romantic Period (1820-1900)</h3>

          <div className="my-12 -mx-8 md:mx-0">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1722562836466-d06c8409bc11?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2ZW5pY2UlMjBjYW5hbCUyMGhpc3RvcmljJTIwYXJjaGl0ZWN0dXJlfGVufDF8fHx8MTc2MTc5NTMzMHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Venice canal with historic architecture"
              className="w-full"
            />
          </div>
          
          <p className="leading-relaxed mb-6">
            Romantic opera embraced emotional intensity and realism (verismo), reflecting broader cultural shifts toward individualism and personal expression:
          </p>

          <div className="space-y-6 mb-12">
            <div className="border-l-2 border-black dark:border-white pl-6">
              <h4 className="text-xl mb-2">Puccini's La Bohème</h4>
              <p className="opacity-70">Explores the struggles of young artists (inspired the Broadway musical <em>Rent</em>)</p>
            </div>

            <div className="border-l-2 border-black dark:border-white pl-6">
              <h4 className="text-xl mb-2">Puccini's Turandot</h4>
              <p className="opacity-70">Features the iconic aria "Nessun Dorma" (frequently featured in sports events and pop culture)</p>
            </div>

            <div className="border-l-2 border-black dark:border-white pl-6">
              <h4 className="text-xl mb-2">Verdi's Falstaff</h4>
              <p className="opacity-70">Showcases humor and complex character interactions (appeals to contemporary comedy audiences)</p>
            </div>
          </div>

          {/* Pull Quote */}
          <div className="my-16 py-8 border-y border-black dark:border-white">
            <p className="text-2xl text-center leading-relaxed opacity-70 italic max-w-2xl mx-auto">
              "Operetta bridged European opera traditions with emerging American entertainment forms—representing a democratization of musical storytelling."
            </p>
          </div>

          <h3 className="text-2xl tracking-tight mb-6 mt-12">Operetta: The Bridge to New Forms</h3>
          
          <p className="leading-relaxed mb-6">
            Operetta represents a crucial evolutionary link in entertainment history:
          </p>

          <ul className="space-y-4 mb-8 opacity-80">
            <li>• Blended spoken dialogue with musical numbers (unlike traditional opera's continuous singing)</li>
            <li>• Incorporated popular dance forms and contemporary references</li>
            <li>• Featured more humorous, accessible stories with relatable characters</li>
            <li>• Explored themes of social class and romance that would influence American entertainment</li>
            <li>• Established the format of "book" (spoken dialogue) and "numbers" (songs) that would shape future forms</li>
          </ul>

          <div className="my-12 p-8 bg-gray-50 dark:bg-gray-900 border-l-2 border-black dark:border-white">
            <h4 className="text-xl mb-4">Key Transitional Works</h4>
            <ul className="space-y-2 opacity-70">
              <li>• Offenbach's <em>Orpheus in the Underworld</em> introduced the can-can dance and satirical elements</li>
              <li>• Johann Strauss II's <em>Die Fledermaus</em> established the waltz as a storytelling device</li>
              <li>• Gilbert and Sullivan's works like <em>H.M.S. Pinafore</em> and <em>The Pirates of Penzance</em> created the template for English-language musical comedy</li>
            </ul>
          </div>

          <div className="my-12 -mx-8 md:mx-0">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1625737251459-017c301457d8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0aGVhdHJpY2FsJTIwc3RhZ2UlMjBjdXJ0YWlucyUyMHJlZHxlbnwxfHx8fDE3NjE3OTUzMzJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Theatrical stage with red curtains"
              className="w-full"
            />
            <p className="text-sm opacity-40 mt-2 text-center italic">The Pirates of Penzance, Utah Shakespeare Festival | 2021</p>
          </div>

          <p className="leading-relaxed mb-12">
            This transition wasn't merely stylistic—it represented a democratization of musical storytelling. While opera maintained its connection to European aristocratic traditions, operetta began catering to middle-class audiences with more accessible themes, humor, and musical styles. This audience shift laid the groundwork for what would eventually become uniquely American forms of entertainment.
          </p>

          {/* Section Break */}
          <div className="w-16 h-px bg-black dark:bg-white opacity-30 my-16 mx-auto"></div>

          <h2 className="text-3xl tracking-tight mb-8 mt-16">Opera's Star System: The Birth of Modern Celebrity</h2>

          <div className="my-12 -mx-8 md:mx-0">
            <ImageWithFallback
              src="https://images.unsplash.com/flagged/photo-1575448056267-834f55896cd8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvcGVyYSUyMHNpbmdlciUyMHBlcmZvcm1hbmNlJTIwZHJhbWF0aWN8ZW58MXx8fHwxNzYxNzk1MzMyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Opera singer performance"
              className="w-full"
            />
          </div>

          <p className="leading-relaxed mb-6">
            Opera helped create the "star performer" concept, introducing a level of celebrity culture that prefigured today's entertainment industry. Legendary singers became international celebrities, known as much for their personalities as their performances:
          </p>

          <div className="space-y-6 mb-12">
            <div className="border-l-2 border-black dark:border-white pl-6">
              <h4 className="text-xl mb-2">Divas</h4>
              <p className="opacity-70">From the Italian for "goddess," female stars with exceptional talent became cultural icons</p>
            </div>

            <div className="border-l-2 border-black dark:border-white pl-6">
              <h4 className="text-xl mb-2">Divos</h4>
              <p className="opacity-70">Male counterparts embodying heroic or romantic ideals</p>
            </div>

            <div className="border-l-2 border-black dark:border-white pl-6">
              <h4 className="text-xl mb-2">Prima Donna</h4>
              <p className="opacity-70">Originally meaning "first lady," came to recognize extraordinary female performers</p>
            </div>
          </div>

          <p className="leading-relaxed mb-12">
            Famous examples include Maria Callas, Enrico Caruso, and Luciano Pavarotti—household names celebrated worldwide for their vocal prowess and larger-than-life personas. This star system established fan cultures, publicity techniques, and performance tours that created templates for today's global entertainment industry.
          </p>

          <h2 className="text-3xl tracking-tight mb-8 mt-16">Setting the Stage for American Entertainment</h2>

          <div className="my-12 -mx-8 md:mx-0">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1758670332213-dfa24f8cfa63?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYWxsZXQlMjBkYW5jZXJzJTIwY2xhc3NpY2FsJTIwcGVyZm9ybWFuY2V8ZW58MXx8fHwxNzYxNzk1MzMxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Ballet dancers classical performance"
              className="w-full"
            />
            <p className="text-sm opacity-40 mt-2 text-center italic">The Dance Foyer at The Opera, 1872 by Edgar Degas</p>
          </div>

          <p className="leading-relaxed mb-6">
            As we explore opera's foundations, we can already see the seeds that would later flourish in American art forms. Opera established several key elements that would become fundamental to future entertainment:
          </p>

          <h3 className="text-2xl tracking-tight mb-6 mt-12">Storytelling Through Music</h3>
          
          <p className="leading-relaxed mb-6">
            Opera demonstrated how music could:
          </p>

          <ul className="space-y-2 mb-12 opacity-80">
            <li>• Establish mood and atmosphere</li>
            <li>• Reveal character psychology and emotion</li>
            <li>• Create narrative tension and release</li>
            <li>• Guide audience emotional responses</li>
          </ul>

          <h3 className="text-2xl tracking-tight mb-6 mt-12">Spectacle and Visual Impact</h3>
          
          <p className="leading-relaxed mb-6">
            Opera pioneered:
          </p>

          <ul className="space-y-2 mb-12 opacity-80">
            <li>• Large-scale scenic effects and transformations</li>
            <li>• Dramatic lighting to focus attention</li>
            <li>• Visual storytelling through tableaux and movement</li>
            <li>• Integration of multiple art forms (music, visual arts, performance)</li>
          </ul>

          <h3 className="text-2xl tracking-tight mb-6 mt-12">Celebrity and Star Power</h3>
          
          <p className="leading-relaxed mb-6">
            Opera's development of the star system established:
          </p>

          <ul className="space-y-2 mb-12 opacity-80">
            <li>• Marketing centered around charismatic performers</li>
            <li>• Fan cultures and personality-driven entertainment</li>
            <li>• Performance styles that highlighted individual talents</li>
            <li>• The concept of the "featured performer"</li>
          </ul>

          <p className="leading-relaxed mb-12">
            As opera traveled to America and encountered new audiences, technologies, and cultural influences, it would transform in ways that reflected American tastes, commercial considerations, and democratic ideals.
          </p>

          {/* Section Break */}
          <div className="w-16 h-px bg-black dark:bg-white opacity-30 my-16 mx-auto"></div>

          <h2 className="text-3xl tracking-tight mb-8 mt-16">Opera Voice Types</h2>

          <div className="my-12 -mx-8 md:mx-0">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1759730840961-09faa5731a3b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwdGhlYXRyZSUyMGludGVyaW9yJTIwYXJjaGl0ZWN0dXJlfGVufDF8fHx8MTc2MTc5NTMzMnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Vintage theatre interior"
              className="w-full"
            />
          </div>

          <h3 className="text-2xl tracking-tight mb-6 mt-12">Female Voice Types</h3>

          <div className="space-y-6 mb-12">
            <div className="border-l-2 border-black dark:border-white pl-6">
              <h4 className="text-xl mb-2">Soprano</h4>
              <p className="opacity-70 mb-1"><strong>Range:</strong> Highest female voice</p>
              <p className="opacity-70 mb-1"><strong>Typical roles:</strong> Heroines, ingénues, romantic leads</p>
              <p className="opacity-70"><strong>Famous example:</strong> Violetta in <em>La Traviata</em></p>
            </div>

            <div className="border-l-2 border-black dark:border-white pl-6">
              <h4 className="text-xl mb-2">Mezzo-soprano</h4>
              <p className="opacity-70 mb-1"><strong>Range:</strong> Middle female voice</p>
              <p className="opacity-70 mb-1"><strong>Typical roles:</strong> Seductresses, villains, complex supporting characters</p>
              <p className="opacity-70"><strong>Famous example:</strong> Carmen in <em>Carmen</em></p>
            </div>

            <div className="border-l-2 border-black dark:border-white pl-6">
              <h4 className="text-xl mb-2">Contralto</h4>
              <p className="opacity-70 mb-1"><strong>Range:</strong> Lowest female voice</p>
              <p className="opacity-70 mb-1"><strong>Typical roles:</strong> Maternal figures, mystical characters, authority figures</p>
              <p className="opacity-70"><strong>Famous example:</strong> Erda in Wagner's <em>Ring</em> cycle</p>
            </div>
          </div>

          <h3 className="text-2xl tracking-tight mb-6 mt-12">Male Voice Types</h3>

          <div className="space-y-6 mb-12">
            <div className="border-l-2 border-black dark:border-white pl-6">
              <h4 className="text-xl mb-2">Tenor</h4>
              <p className="opacity-70 mb-1"><strong>Range:</strong> Highest male voice</p>
              <p className="opacity-70 mb-1"><strong>Typical roles:</strong> Romantic leads, heroes, youthful characters</p>
              <p className="opacity-70"><strong>Famous example:</strong> Rodolfo in <em>La Bohème</em></p>
            </div>

            <div className="border-l-2 border-black dark:border-white pl-6">
              <h4 className="text-xl mb-2">Baritone</h4>
              <p className="opacity-70 mb-1"><strong>Range:</strong> Middle male voice</p>
              <p className="opacity-70 mb-1"><strong>Typical roles:</strong> Villains, fathers, complex characters</p>
              <p className="opacity-70"><strong>Famous example:</strong> Figaro in <em>The Barber of Seville</em></p>
            </div>

            <div className="border-l-2 border-black dark:border-white pl-6">
              <h4 className="text-xl mb-2">Bass</h4>
              <p className="opacity-70 mb-1"><strong>Range:</strong> Lowest male voice</p>
              <p className="opacity-70 mb-1"><strong>Typical roles:</strong> Villains, authority figures, comic relief</p>
              <p className="opacity-70"><strong>Famous example:</strong> Sarastro in <em>The Magic Flute</em></p>
            </div>
          </div>

          {/* Pull Quote */}
          <div className="my-16 py-8 border-y border-black dark:border-white">
            <p className="text-2xl text-center leading-relaxed opacity-70 italic max-w-2xl mx-auto">
              "Opera was the popular entertainment of its day—establishing templates that would echo through Broadway, Hollywood, and beyond."
            </p>
          </div>

          <h2 className="text-3xl tracking-tight mb-8 mt-16">Coming Next: Opera's Evolution</h2>

          <p className="leading-relaxed mb-6">
            In our next installment, we'll explore how opera began transforming and evolving in the 19th century. We'll examine:
          </p>

          <ul className="space-y-2 mb-12 opacity-80">
            <li>• The development of lighter, more accessible forms of musical theater</li>
            <li>• How operetta emerged as a popular alternative to grand opera</li>
            <li>• Key figures like Offenbach, Strauss, and Gilbert & Sullivan</li>
            <li>• The cultural and social factors that drove these changes</li>
            <li>• How these developments set the stage for opera's journey to American shores</li>
          </ul>

          <p className="leading-relaxed mb-12">
            As we continue our series, we'll discover how these developments created new possibilities for musical storytelling that would eventually influence entertainment traditions worldwide.
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

        {/* FAQ Section */}
        <div className="mt-24 pt-16 border-t border-black dark:border-white">
          <h3 className="text-2xl tracking-tight mb-12">Frequently Asked Questions About Opera</h3>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-black/10 dark:border-white/10">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  className="w-full py-6 flex items-start justify-between gap-4 text-left hover:opacity-70 transition-opacity duration-200"
                >
                  <span className="text-lg">{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${
                      expandedFaq === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {expandedFaq === index && (
                  <div className="pb-6 opacity-70 leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
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
