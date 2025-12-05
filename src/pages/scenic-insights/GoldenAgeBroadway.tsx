import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Tag } from 'lucide-react';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { ArticleAuthor } from '../../components/shared/ArticleAuthor';
import { blogPosts } from '../../data/blog-posts';

interface GoldenAgeBroadwayProps {
  onNavigate: (page: string, slug?: string) => void;
}

export function GoldenAgeBroadway({ onNavigate }: GoldenAgeBroadwayProps) {
  const post = blogPosts.find(p => p.id === 'golden-age-broadway');
  const tags = post?.tags || [];

  const handleTagClick = (tag: string) => {
    onNavigate('scenic-insights');
    };

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      question: "What defines the Golden Age of Broadway?",
      answer: "The Golden Age of Broadway (1940s-1960s) is defined by the integration of music, story, and dance into cohesive theatrical experiences. Productions like Oklahoma! pioneered the 'integrated musical' format where songs advanced the plot rather than being standalone performances."
    },
    {
      question: "Who were the most influential creators of this era?",
      answer: "Richard Rodgers & Oscar Hammerstein II revolutionized musical theatre with story-driven compositions. Other key figures include Leonard Bernstein (West Side Story), Jerome Robbins (choreographer/director), Cole Porter (Kiss Me, Kate), Frank Loesser (Guys and Dolls), and Bob Fosse (distinctive choreography style)."
    },
    {
      question: "What is an '11 o'clock number'?",
      answer: "The '11 o'clock number' is a climactic song near the end of Act Two, typically showcasing the protagonist's personal growth or emotional breakthrough. Oklahoma! helped popularize this structural device, which became a Broadway staple and continues to influence modern musicals."
    },
    {
      question: "How did Oklahoma! change musical theatre?",
      answer: "Oklahoma! (1943) integrated music, dance, and storytelling in unprecedented ways. Agnes de Mille's dream ballet pioneered using dance to convey emotion and narrative depth rather than just entertainment. The show established the integrated musical format that became the standard for modern musical theatre."
    },
    {
      question: "What is the modern musical theatre structure?",
      answer: "The structure originated in the Golden Age includes: Opening Number (introduces setting/themes), I Want Song (protagonist's desires), Act One Finale (suspense/intensity), 11 O'Clock Number (climactic emotional breakthrough), and Finale (resolution with reprises). This blueprint continues in contemporary musicals like Hamilton and Wicked."
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white transition-colors duration-300">
      {/* Article Header */}
      <article className="max-w-4xl mx-auto px-6 md:px-8 py-12 md:py-20">
        {/* Breadcrumb Navigation */}
        <nav className="mb-8 flex items-center gap-2 text-xs opacity-60">
            <button 
              onClick={() => onNavigate('scenic-insights')}
              className="hover:opacity-100 transition-opacity"
            >
              ARTICLES
            </button>
          <span>/</span>
          <span>MUSICAL THEATRE</span>
        </nav>

        {/* Title Section */}
        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl leading-tight tracking-tight mb-6">
            THE GOLDEN AGE OF BROADWAY: A DEFINING ERA IN MUSICAL THEATRE
          </h1>
          
          <div className="flex items-center gap-4 text-sm opacity-60 mb-8">
            <span>BY BRANDON PT DAVIS</span>
            <span>•</span>
            <time>FEBRUARY 10, 2025</time>
            <span>•</span>
            <span>5 MIN READ</span>
          </div>

          {/* Hero Image */}
          <div className="my-12 -mx-6 md:mx-0">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1608587446131-b70c4664a62a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwYnJvYWR3YXklMjB0aGVhdHJlJTIwZGlzdHJpY3QlMjAxOTUwc3xlbnwxfHx8fDE3NjE3OTYwMjh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Vintage Broadway theatre district with marquee lights"
              className="w-full h-auto"
            />
            <p className="text-xs opacity-40 mt-4 italic">
              A bustling theatre district captures the lively spirit of the golden era of musical theatre, with elegantly dressed patrons gathering under the bright marquee lights.
            </p>
          </div>
        </header>

        {/* Article Content */}
        <div className="prose-custom">
          <h2 className="text-3xl tracking-tight mb-8 mt-16">Social Change and the Birth of the Golden Age</h2>
          
          <p className="leading-relaxed mb-6">
            The Golden Age of Broadway, spanning from the 1940s to the 1960s, emerged against the backdrop of significant social, economic, and cultural shifts in the United States. The aftermath of the Great Depression, World War II, and the post-war economic boom created an atmosphere ripe for artistic innovation. Americans sought entertainment that reflected their changing world—stories that resonated with their struggles, aspirations, and newfound optimism.
          </p>

          <p className="leading-relaxed mb-12">
            Broadway responded with a new era of musicals that integrated music, story, and dance into cohesive theatrical experiences. Themes of love, identity, and societal issues were explored in ways never before seen on stage, making Broadway not just a form of escapism but a mirror to American life.
          </p>

          <div className="my-12 -mx-6 md:mx-0">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1760835514097-aabbe3cdbda1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicm9hZHdheSUyMG1hcnF1ZWUlMjBsaWdodHMlMjB2aW50YWdlfGVufDF8fHx8MTc2MTc5NjAyOHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Broadway marquee lights illuminating the night"
              className="w-full h-auto"
            />
          </div>

          <h2 className="text-3xl tracking-tight mb-8 mt-16">Oklahoma!: The Birth of a New Musical Era</h2>
          
          <p className="leading-relaxed mb-6">
            <em>Oklahoma!</em> (1943) was a revolutionary moment in musical theatre. The first collaboration between Richard Rodgers and Oscar Hammerstein II, it integrated music, dance, and storytelling in an unprecedented way. The show is widely credited with popularizing the term <strong>"11 o'clock number,"</strong> referring to a climactic song near the end of the second act, a structural device that became a Broadway staple.
          </p>

          <p className="leading-relaxed mb-12">
            Additionally, the dream ballet choreographed by Agnes de Mille introduced a new way of using dance to convey emotion and narrative depth, pioneering the concept of the <strong>"dance ballet"</strong> in musical theatre. This innovative use of dance and song to enhance storytelling became a defining feature of the Golden Age and influenced countless productions that followed.
          </p>

          {/* Oklahoma Video Embed */}
          <div className="my-12 -mx-6 md:mx-0">
            <div className="aspect-video w-full bg-gray-100 dark:bg-gray-900">
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/ZP7K9SycELA"
                title="Oklahoma! - Oh, What a Beautiful Mornin'"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <p className="text-xs opacity-40 mt-4 italic text-center">
              Oklahoma! (1955) - "Oh, What a Beautiful Mornin'" captures the revolutionary spirit of this groundbreaking musical.
            </p>
          </div>

          <div className="my-12 p-8 bg-gray-50 dark:bg-gray-900 border-l-2 border-black dark:border-white">
            <h4 className="text-xl mb-4">Musical Contributions and Terminology</h4>
            <ul className="space-y-4 opacity-70">
              <li>
                <strong>11 O'Clock Number:</strong> Oklahoma! helped solidify this musical structure, where a powerful number near the end of the show serves as an emotional or narrative climax.
              </li>
              <li>
                <strong>Dance Ballet:</strong> Agnes de Mille's dream ballet sequence was groundbreaking, using dance to express characters' inner thoughts and emotions rather than just for entertainment.
              </li>
              <li>
                <strong>Integrated Musical Format:</strong> Songs advanced the plot rather than being standalone performances, setting a standard for musical theatre storytelling.
              </li>
            </ul>
          </div>

          <h2 className="text-3xl tracking-tight mb-8 mt-16">Modern Musical Theatre Structure</h2>
          
          <p className="leading-relaxed mb-6">
            The innovations of the Golden Age laid the groundwork for the structure of modern musical theatre. Contemporary musicals continue to follow a general format that originated during this period, though they have evolved in complexity and style. Key structural elements include:
          </p>

          <div className="my-8 space-y-4 pl-6 border-l-2 border-black dark:border-white">
            <div>
              <h4 className="mb-2">Opening Number</h4>
              <p className="opacity-70 leading-relaxed">Introduces the setting, tone, and major themes of the musical.</p>
            </div>
            <div>
              <h4 className="mb-2">I Want Song</h4>
              <p className="opacity-70 leading-relaxed">A number in which the protagonist expresses their deepest desires and sets their journey in motion.</p>
            </div>
            <div>
              <h4 className="mb-2">Act One Finale</h4>
              <p className="opacity-70 leading-relaxed">A powerful moment that leaves the audience with suspense or emotional intensity, compelling them to return after intermission.</p>
            </div>
            <div>
              <h4 className="mb-2">11 O'Clock Number</h4>
              <p className="opacity-70 leading-relaxed">A climactic song near the end of Act Two, often showcasing the protagonist's personal growth or emotional breakthrough.</p>
            </div>
            <div>
              <h4 className="mb-2">Finale</h4>
              <p className="opacity-70 leading-relaxed">Brings resolution to the narrative and often features a reprise of key themes or melodies.</p>
            </div>
          </div>

          <p className="leading-relaxed mb-12">
            This format remains a blueprint for many contemporary musicals, including <em>Les Misérables</em>, <em>Wicked</em>, and <em>Hamilton</em>, which integrate classic structural elements with modern storytelling techniques.
          </p>

          <h2 className="text-3xl tracking-tight mb-8 mt-16">Key Productions and Innovation</h2>
          
          <p className="leading-relaxed mb-8">
            Beyond <em>Oklahoma!</em>, which redefined musical theatre, several other landmark productions emerged during the Golden Age, each pushing artistic boundaries through complex storytelling, innovative choreography, or groundbreaking music.
          </p>

          <div className="my-12 -mx-6 md:mx-0">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1565798846807-2af22c843402?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxva2xhaG9tYSUyMG11c2ljYWwlMjB0aGVhdHJlJTIwc3RhZ2V8ZW58MXx8fHwxNzYxNzk2MDI5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Theatre stage with dramatic lighting"
              className="w-full h-auto"
            />
          </div>

          <h3 className="text-2xl tracking-tight mb-6 mt-12">Defining Productions of the Golden Age</h3>

          {/* Carousel */}
          <div className="my-12 p-8 bg-gray-50 dark:bg-gray-900 border-l-2 border-black dark:border-white">
            <h4 className="text-xl mb-4">Carousel (1945)</h4>
            <p className="leading-relaxed mb-4">
              A poignant tale of love and redemption, <em>Carousel</em> follows the tumultuous romance between Billy Bigelow, a charismatic but troubled carnival barker, and Julie Jordan, a millworker. The production, featuring music by Richard Rodgers and lyrics by Oscar Hammerstein II, is known for its groundbreaking "Soliloquy" and the emotionally stirring "You'll Never Walk Alone."
            </p>
            <div className="aspect-video w-full bg-gray-100 dark:bg-gray-800 mt-6">
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/4fznUcUTLD0"
                title="Carousel - You'll Never Walk Alone"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>

          {/* South Pacific */}
          <div className="my-12 p-8 bg-gray-50 dark:bg-gray-900 border-l-2 border-black dark:border-white">
            <h4 className="text-xl mb-4">South Pacific (1949)</h4>
            <p className="leading-relaxed mb-4">
              A wartime romance set in the Pacific islands, this Rodgers and Hammerstein musical tackles themes of racial prejudice and cultural conflict. Memorable songs include "Some Enchanted Evening" and "I'm Gonna Wash That Man Right Outa My Hair."
            </p>
          </div>

          {/* The King and I */}
          <div className="my-12 p-8 bg-gray-50 dark:bg-gray-900 border-l-2 border-black dark:border-white">
            <h4 className="text-xl mb-4">The King and I (1951)</h4>
            <p className="leading-relaxed mb-4">
              Based on the true story of Anna Leonowens, a British teacher hired to educate the children of the King of Siam, this Rodgers and Hammerstein classic features timeless songs like "Getting to Know You" and "Shall We Dance?"
            </p>
            <div className="aspect-video w-full bg-gray-100 dark:bg-gray-800 mt-6">
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/K7V5qDJGUpc"
                title="The King and I - Shall We Dance?"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>

          <div className="my-12 -mx-6 md:mx-0">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1752069607051-11136534610f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZXN0JTIwc2lkZSUyMHN0b3J5JTIwbXVzaWNhbCUyMHBlcmZvcm1hbmNlfGVufDF8fHx8MTc2MTc5NjAyOXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Urban street scene evoking West Side Story"
              className="w-full h-auto"
            />
          </div>

          {/* West Side Story */}
          <div className="my-12 p-8 bg-gray-50 dark:bg-gray-900 border-l-2 border-black dark:border-white">
            <h4 className="text-xl mb-4">West Side Story (1957)</h4>
            <p className="leading-relaxed mb-4">
              A modern retelling of <em>Romeo and Juliet</em>, this Leonard Bernstein and Stephen Sondheim masterpiece follows the rivalry between two street gangs, the Jets and the Sharks, and the ill-fated love between Tony and Maria. Jerome Robbins' choreography and songs like "Tonight" and "America" set a new standard for musical theatre.
            </p>
          </div>

          <div className="my-12 -mx-6 md:mx-0">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1718965081549-c6950f53ac72?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb3VuZCUyMG9mJTIwbXVzaWMlMjBoaWxscyUyMGF1c3RyaWF8ZW58MXx8fHwxNzYxNzk2MDMwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Austrian hills landscape reminiscent of The Sound of Music"
              className="w-full h-auto"
            />
          </div>

          {/* The Sound of Music */}
          <div className="my-12 p-8 bg-gray-50 dark:bg-gray-900 border-l-2 border-black dark:border-white">
            <h4 className="text-xl mb-4">The Sound of Music (1959)</h4>
            <p className="leading-relaxed mb-4">
              This beloved musical, also by Rodgers and Hammerstein, follows Maria, a free-spirited postulant who becomes a governess to the von Trapp family in Austria. Featuring classics like "Do-Re-Mi" and "Climb Ev'ry Mountain," the show remains a staple of Broadway and film history.
            </p>
          </div>

          <div className="my-12 -mx-6 md:mx-0">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1749893579188-c1e60baf3c1c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaWRkbGVyJTIwb24lMjB0aGUlMjByb29mJTIwdGhlYXRyZXxlbnwxfHx8fDE3NjE3OTYwMzB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Traditional village scene"
              className="w-full h-auto"
            />
          </div>

          {/* Fiddler on the Roof */}
          <div className="my-12 p-8 bg-gray-50 dark:bg-gray-900 border-l-2 border-black dark:border-white">
            <h4 className="text-xl mb-4">Fiddler on the Roof (1964)</h4>
            <p className="leading-relaxed mb-4">
              Written by Jerry Bock (music), Sheldon Harnick (lyrics), and Joseph Stein (book), this musical explores the struggles of Tevye, a Jewish milkman in Tsarist Russia, as he navigates changing traditions and societal pressures. Songs like "Tradition" and "If I Were a Rich Man" have cemented its place in Broadway history.
            </p>
            <div className="aspect-video w-full bg-gray-100 dark:bg-gray-800 mt-6">
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/gRdfX7ut8gw"
                title="Fiddler on the Roof - Tradition"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>

          <p className="leading-relaxed mb-12 mt-8">
            Each of these musicals pushed artistic boundaries, whether through complex storytelling, innovative choreography, or groundbreaking music.
          </p>

          <div className="my-12 -mx-6 md:mx-0">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1574091103877-2845241b8f44?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHwxOTQwcyUyMHRoZWF0cmUlMjBhdWRpZW5jZSUyMGVsZWdhbnR8ZW58MXx8fHwxNzYxNzk2MDMwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Elegant theatre audience from the 1940s era"
              className="w-full h-auto"
            />
          </div>

          <h2 className="text-3xl tracking-tight mb-8 mt-16">Important Figures of the Golden Age</h2>
          
          <p className="leading-relaxed mb-8">
            Several individuals played a crucial role in shaping this transformative period of Broadway history:
          </p>

          <div className="space-y-6 mb-12">
            <div className="border-l-2 border-black dark:border-white pl-6">
              <h4 className="mb-2">Richard Rodgers & Oscar Hammerstein II</h4>
              <p className="opacity-70 leading-relaxed">
                The duo responsible for <em>Oklahoma!</em>, <em>Carousel</em>, <em>South Pacific</em>, and more, revolutionizing musical theatre with story-driven compositions.
              </p>
            </div>

            <div className="border-l-2 border-black dark:border-white pl-6">
              <h4 className="mb-2">Leonard Bernstein</h4>
              <p className="opacity-70 leading-relaxed">
                Composer of <em>West Side Story</em>, blending classical music with jazz and Latin influences.
              </p>
            </div>

            <div className="border-l-2 border-black dark:border-white pl-6">
              <h4 className="mb-2">Jerome Robbins</h4>
              <p className="opacity-70 leading-relaxed">
                Choreographer and director known for <em>West Side Story</em>, <em>The King and I</em>, and <em>Fiddler on the Roof</em>, incorporating dance as a primary storytelling tool.
              </p>
            </div>

            <div className="border-l-2 border-black dark:border-white pl-6">
              <h4 className="mb-2">Cole Porter</h4>
              <p className="opacity-70 leading-relaxed">
                Composer of <em>Kiss Me, Kate</em>, known for his sophisticated lyrics and jazz-infused melodies.
              </p>
            </div>

            <div className="border-l-2 border-black dark:border-white pl-6">
              <h4 className="mb-2">Frank Loesser</h4>
              <p className="opacity-70 leading-relaxed">
                Composer and lyricist behind <em>Guys and Dolls</em> and <em>How to Succeed in Business Without Really Trying</em>.
              </p>
            </div>

            <div className="border-l-2 border-black dark:border-white pl-6">
              <h4 className="mb-2">Bob Fosse</h4>
              <p className="opacity-70 leading-relaxed">
                Choreographer and director whose distinctive style in <em>Damn Yankees</em> and <em>Sweet Charity</em> left a lasting impact on Broadway dance.
              </p>
            </div>
          </div>

          <div className="my-12 -mx-6 md:mx-0">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1675849255155-262797c7bfbf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyb2RnZXJzJTIwaGFtbWVyc3RlaW4lMjBicm9hZHdheSUyMHZpbnRhZ2V8ZW58MXx8fHwxNzYxNzk2MDMxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Vintage Broadway production scene"
              className="w-full h-auto"
            />
          </div>

          <h2 className="text-3xl tracking-tight mb-8 mt-16">The Legacy of the Golden Age</h2>
          
          <p className="leading-relaxed mb-6">
            The structural and thematic innovations of the Golden Age continue to shape modern musical theatre. Productions today, from Disney's Broadway adaptations to contemporary works like <em>Hamilton</em>, owe much to the narrative-driven approach first solidified during this era.
          </p>

          <p className="leading-relaxed mb-6">
            Even as Broadway continues to evolve, the Golden Age remains a benchmark of excellence, a reminder of a time when musical theatre reached unprecedented artistic heights.
          </p>

          <p className="leading-relaxed mb-12">
            Understanding the Golden Age is not just about nostalgia—it is about recognizing the foundations that continue to define musical theatre today.
          </p>

          {/* FAQ Section */}
          <div className="my-16 border-t border-black dark:border-white pt-16">
            <h2 className="text-3xl tracking-tight mb-8">Frequently Asked Questions</h2>
            
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div 
                  key={index}
                  className="border-b border-black/10 dark:border-white/10 last:border-0"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full py-6 flex items-center justify-between text-left group"
                  >
                    <h3 className="pr-8 group-hover:opacity-60 transition-opacity">
                      {faq.question}
                    </h3>
                    {openFaq === index ? (
                      <ChevronUp className="flex-shrink-0 w-5 h-5" />
                    ) : (
                      <ChevronDown className="flex-shrink-0 w-5 h-5" />
                    )}
                  </button>
                  
                  {openFaq === index && (
                    <div className="pb-6 opacity-70 leading-relaxed">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
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

          {/* Related Articles */}
          <div className="my-16 border-t border-black dark:border-white pt-16">
            <h3 className="text-2xl tracking-tight mb-8">Related Articles</h3>
            
            <div className="grid gap-6">
              <button
                onClick={() => onNavigate('scenic-insights', 'opera-foundations')}
                className="text-left p-6 border border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all duration-300 group"
              >
                <div className="text-xs tracking-wider opacity-60 mb-2 group-hover:opacity-100">MUSICAL THEATRE</div>
                <h4 className="mb-2">Opera's Foundations: The First Act in American Entertainment</h4>
                <p className="text-sm opacity-60 group-hover:opacity-100">
                  Discover how opera laid the groundwork for musical theatre and cinema in American culture.
                </p>
              </button>

              <button
                onClick={() => onNavigate('scenic-insights', 'themed-entertainment-evolution')}
                className="text-left p-6 border border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all duration-300 group"
              >
                <div className="text-xs tracking-wider opacity-60 mb-2 group-hover:opacity-100">EXPERIENTIAL DESIGN</div>
                <h4 className="mb-2">The Evolution of Themed Entertainment</h4>
                <p className="text-sm opacity-60 group-hover:opacity-100">
                  Tracing humanity's enduring quest for wonder from ancient gardens to modern theme parks.
                </p>
              </button>
            </div>
          </div>

          {/* Back to Insights */}
          <div className="mt-16 pt-8 border-t border-black dark:border-white">
            <button
              onClick={() => onNavigate('scenic-insights')}
              className="text-sm tracking-wider opacity-60 hover:opacity-100 transition-opacity"
            >
              ← BACK TO ARTICLES
            </button>
          </div>
        </div>
      </article>
    </div>
  );
}
