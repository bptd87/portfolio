import React from 'react';
import { ArrowLeft, ArrowRight, Tag } from 'lucide-react';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { ArticleAuthor } from '../../components/shared/ArticleAuthor';
import { blogPosts } from '../../data/blog-posts';

interface ComputerLiteracyProps {
  onNavigate: (page: string, slug?: string) => void;
}

export function ComputerLiteracy({ onNavigate }: ComputerLiteracyProps) {
  const post = blogPosts.find(p => p.id === 'computer-literacy');
  const tags = post?.tags || [];

  const handleTagClick = (tag: string) => {
    onNavigate('scenic-insights');
    };

  const relatedPosts = [
    {
      title: 'COMPUTER HARDWARE GUIDE',
      category: 'TECHNOLOGY & TUTORIALS',
      description: 'Understanding specs and making informed hardware decisions',
      slug: 'computer-hardware-guide'
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
            <span className="text-xs tracking-widest uppercase">TECHNOLOGY & TUTORIALS</span>
            <span className="text-xs">•</span>
            <span className="text-xs">SEPTEMBER 17, 2024</span>
          </div>
          
          <h1 className="mb-8 text-4xl md:text-5xl lg:text-6xl leading-tight tracking-tight">
            EMPOWERING THEATRE PRODUCTION STUDENTS WITH COMPUTER LITERACY
          </h1>
          
          <p className="opacity-60 text-xl leading-relaxed max-w-3xl">
            Bridging the generational gap in tech education for the next generation of theatre makers.
          </p>
        </div>

        {/* Featured Image */}
        <div className="mb-20 -mx-8 md:mx-0">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkZW50JTIwY29tcHV0ZXJ8ZW58MXx8fHwxNzYxNjM4MDUyfDA&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Students working on computers"
            className="w-full"
          />
        </div>

        {/* Article Content */}
        <div className="prose-custom">
          <p className="text-xl leading-relaxed mb-8 opacity-80">
            If your students call you a tech guru, you know the flood of emails asking, "Which computer should I buy?" It's a rite of passage. The array of options, each tailored to a specific budget, can make anyone feel a slight sense of anxiety. But fear not! We must teach our students to thrive in today's digital world.
          </p>

          <p className="text-lg leading-relaxed mb-12 opacity-70">
            Incorporating computer literacy into our curricula is paramount. This is the story of how I integrated essential technology education into my Digital Rendering Course—and why it matters more than ever.
          </p>

          {/* Section Break */}
          <div className="w-16 h-px bg-black dark:bg-white opacity-30 my-16 mx-auto"></div>

          <h2 className="text-3xl tracking-tight mb-8 mt-16">Bridging Generational Gaps in Computer Literacy</h2>
          
          <p className="leading-relaxed mb-6">
            Society often assumes that students are inherently tech-savvy. Memes joke about Millennials teaching their Boomer bosses how to create a PDF. However, the reality is that our Gen Z students are the iPad generation. They're accustomed to mobile software designed for intuitive navigation with a few finger gestures.
          </p>

          <p className="leading-relaxed mb-12">
            Traditional PC software can be overwhelming with its myriad hotkeys and hidden menus. Even software like AutoCAD, which has been around since 1982, relies on a command bar that can seem archaic to digital natives. We can't assume digital fluency—we have to teach it.
          </p>

          {/* Pull Quote */}
          <div className="my-16 py-8 border-y border-black dark:border-white">
            <p className="text-2xl text-center leading-relaxed opacity-70 italic max-w-2xl mx-auto">
              "The iPad generation knows gestures and apps, but traditional production software requires a different kind of literacy entirely."
            </p>
          </div>

          <h2 className="text-3xl tracking-tight mb-8 mt-16">A Curriculum Tailored to the Future</h2>

          <p className="leading-relaxed mb-8">
            I've integrated computer literacy into my Digital Rendering Course, a required class for all production students. The curriculum is structured around three core sessions, each building essential knowledge for navigating the technology landscape of modern theatre production.
          </p>

          <h3 className="text-2xl tracking-tight mb-6 mt-12">Day 1: Unraveling Computer Hardware</h3>
          
          <p className="leading-relaxed mb-4">
            The first session demystifies the machine itself. Students learn:
          </p>

          <ul className="space-y-3 mb-8 opacity-80">
            <li>Types of Computers: Strengths and Weaknesses</li>
            <li>Operating Systems: Demystified</li>
            <li>Hardware Components: From Motherboards to GPUs</li>
            <li>The Brain of the Computer: CPU and CPU Cores</li>
            <li>Navigating Graphics: Understanding the GPU</li>
            <li>Balancing Act: Understanding RAM</li>
            <li>Storage Wars: SSD vs. HDD</li>
            <li>Accessories: Their Importance</li>
          </ul>

          <p className="leading-relaxed mb-12">
            I've found that quirky anecdotes help demystify complex ideas. For example, I compare the CPU to the brain and the RAM to a juggler balancing coursework. This session teaches students to assess their software and hardware needs for wise investments—dispelling the myth that they need to spend thousands when a mid-range option might suffice.
          </p>

          <h3 className="text-2xl tracking-tight mb-6 mt-12">Day 2: Mastering File Management and Storage</h3>
          
          <p className="leading-relaxed mb-4">
            The second session addresses something often overlooked but absolutely critical in collaborative production environments:
          </p>

          <ul className="space-y-3 mb-8 opacity-80">
            <li>Organizing Chaos: File Naming Schemes</li>
            <li>Folder Hierarchy: The Art of Organizing</li>
            <li>Files Over Time: Managing and Removing</li>
            <li>The Ageless Files: Storage on Physical Drives</li>
            <li>Embracing the Cloud: Services, Benefits, and Drawbacks</li>
          </ul>

          <p className="leading-relaxed mb-12">
            This session stresses the importance of teamwork and collaboration in production environments where multiple team members need access to the same files. A consistent naming convention like "ProductionName/Department/ElementName_v01" can be the difference between smooth collaboration and complete chaos on show day.
          </p>

          <h3 className="text-2xl tracking-tight mb-6 mt-12">Day 3: The Rise of Artificial Intelligence</h3>
          
          <p className="leading-relaxed mb-4">
            The final lecture dives into the relevance of AI in today's society:
          </p>

          <ul className="space-y-3 mb-8 opacity-80">
            <li>A Journey Through AI History</li>
            <li>AI vs Traditional Computing: How They Differ</li>
            <li>Meeting Chat GPT: Understanding AI Generators</li>
            <li>Impact of AI on the Art Industry</li>
            <li>Ethics in AI: Navigating Uncharted Territory</li>
          </ul>

          <p className="leading-relaxed mb-12">
            It's intriguing how students know of AI tools but haven't explored them deeply. Many haven't made AI art or used ChatGPT for creative purposes beyond basic homework help. The ethics discussion sparks engaging debates about authorship, labor, and the future of creative work—conversations that lead to real personal growth and critical thinking.
          </p>

          {/* Pull Quote */}
          <div className="my-16 py-8 border-y border-black dark:border-white">
            <p className="text-2xl text-center leading-relaxed opacity-70 italic max-w-2xl mx-auto">
              "Students shouldn't rely solely on intuition when making technology choices. A well-versed student can match their hardware needs to software specifications."
            </p>
          </div>

          <h2 className="text-3xl tracking-tight mb-8 mt-16">Empowering Students for the Future</h2>

          <p className="leading-relaxed mb-6">
            The demand for tech competency in theatre production is soaring in today's digital age. We must integrate computer skills education into the theatre production curriculum to empower students to make informed decisions about the technology that supports their craft.
          </p>

          <p className="leading-relaxed mb-6">
            By aligning courses with current technology trends, we bridge the digital divide and make education accessible to all, regardless of background or location. This fosters a more inclusive, diverse community of theatre practitioners who will thrive in an industry increasingly driven by innovation and creativity.
          </p>

          <p className="leading-relaxed mb-12">
            Computer literacy in our curriculums isn't just about technical skills. It's about giving students the confidence to navigate a rapidly changing digital world—empowering them for a future where technology plays an increasingly central role in theatre production.
          </p>

          {/* Section Break */}
          <div className="w-16 h-px bg-black dark:bg-white opacity-30 my-16 mx-auto"></div>

          <h2 className="text-3xl tracking-tight mb-8 mt-16">Key Takeaways</h2>

          <div className="space-y-6 mb-16">
            <div className="border-l-2 border-black dark:border-white pl-6">
              <h3 className="text-xl mb-2">Don't Assume Digital Fluency</h3>
              <p className="opacity-70">Gen Z may know apps and gestures, but traditional production software requires explicit instruction and practice.</p>
            </div>

            <div className="border-l-2 border-black dark:border-white pl-6">
              <h3 className="text-xl mb-2">Hardware Literacy Saves Money</h3>
              <p className="opacity-70">Students who understand specs can make informed purchases instead of overspending or buying inadequate machines.</p>
            </div>

            <div className="border-l-2 border-black dark:border-white pl-6">
              <h3 className="text-xl mb-2">File Management is Collaboration</h3>
              <p className="opacity-70">Consistent naming and organization systems are essential for production teams working with shared resources.</p>
            </div>

            <div className="border-l-2 border-black dark:border-white pl-6">
              <h3 className="text-xl mb-2">AI Ethics Matter</h3>
              <p className="opacity-70">Students need guided conversations about the implications of AI tools in creative work.</p>
            </div>
          </div>

          {/* Closing */}
          <p className="text-xl leading-relaxed opacity-80 mb-8">
            Let's bridge the gap between generations and create a more tech-savvy, informed generation of theatre production professionals who can harness technology to bring their creative visions to life.
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
