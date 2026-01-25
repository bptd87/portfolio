import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, ChevronDown, Tag } from 'lucide-react';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { ArticleAuthor } from '../../components/shared/ArticleAuthor';
import { blogPosts } from '../../data/blog-posts';

interface ComputerHardwareGuideProps {
  onNavigate: (page: string, slug?: string) => void;
}

export function ComputerHardwareGuide({ onNavigate }: ComputerHardwareGuideProps) {
  const post = blogPosts.find(p => p.id === 'computer-hardware-guide');
  const tags = post?.tags || [];

  const handleTagClick = (tag: string) => {
    onNavigate('scenic-insights');
    };

  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const faqs = [
    {
      question: "What's more important for scenic design CAD work: CPU or GPU?",
      answer: "For CAD work, both are important but serve different purposes. The CPU handles the calculations for modeling and generating drawings, while the GPU accelerates 3D visualization and rendering. For programs like Vectorworks or SketchUp, prioritize a strong CPU (8+ cores) first, then invest in a mid-to-high-end GPU for smooth viewport performance and faster rendering."
    },
    {
      question: "Is a desktop still necessary for professional theatre design?",
      answer: "Not necessarily. Modern high-performance laptops, especially Apple's M-series MacBooks, can handle most professional design work. However, desktops offer better performance per dollar, easier upgrades, and better cooling for sustained workloads. Many designers use a powerful laptop for mobility and a desktop workstation for heavy rendering or complex projects."
    },
    {
      question: "What's the minimum computer setup for a student theatre designer?",
      answer: "For students, aim for: a laptop with at least an 8-core CPU (Intel i7 or AMD Ryzen 7, or Apple M2), 16GB RAM minimum (32GB preferred), 512GB SSD storage, and a dedicated GPU or integrated graphics like Apple's M-series. This will handle most educational design software and serve you through graduation and into early professional work."
    }
  ];

  const resources = [
    {
      category: "Theatre-Specific Technology Resources",
      links: [
        { name: "Control Booth Forums", description: "Active community of theatre technicians and designers discussing technology" },
        { name: "Theatre Projects Consultants", description: "Resources on theatre technology" },
        { name: "American Theatre", description: "Design section with insights for scenic designers" }
      ]
    },
    {
      category: "Computer Hardware for Scenic Design",
      links: [
        { name: "Logical Increments", description: "Guide to building PCs at different budget levels" },
        { name: "r/buildapc Subreddit", description: "Community for computer building advice" },
        { name: "Tom's Hardware", description: "Hardware reviews and performance comparisons" }
      ]
    },
    {
      category: "Scenic Design Software Resources",
      links: [
        { name: "Vectorworks University", description: "Training resources for Vectorworks" },
        { name: "The Set-Design Channel", description: "Resources for SketchUp modeling in theatre" },
        { name: "USITT Digital Media Commission", description: "Resources for digital tools in theatrical design" }
      ]
    }
  ];

  const relatedPosts = [
    {
      title: 'COMPUTER LITERACY FOR THEATRE STUDENTS',
      category: 'TECHNOLOGY & TUTORIALS',
      description: 'Empowering the next generation with essential tech skills',
      slug: 'computer-literacy'
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
            <span className="text-xs">MARCH 17, 2025</span>
          </div>
          
          <h1 className="mb-8 text-4xl md:text-5xl lg:text-6xl leading-tight tracking-tight">
            UNDERSTANDING COMPUTER HARDWARE FOR THEATRE DESIGNERS
          </h1>
          
          <p className="opacity-60 text-xl leading-relaxed max-w-3xl">
            A practical guide to making informed hardware decisions in an era where software is outpacing our machines.
          </p>
        </div>

        {/* Featured Image */}
        <div className="mb-20 -mx-8 md:mx-0">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1642736656789-65a6a0abbf04?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21wdXRlciUyMGhhcmR3YXJlJTIwdGVjaG5vbG9neXxlbnwxfHx8fDE3NjE2Mzc5ODF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="Computer hardware components"
            className="w-full"
          />
        </div>

        {/* Article Content */}
        <div className="prose-custom">
          <p className="text-xl leading-relaxed mb-8 opacity-80">
            Has this happened to you? You're in the middle of tech week, making crucial last-minute adjustments to your light plot or sound cues, when suddenly your trusty computer freezes. Again. That software that ran perfectly last season now crawls along, struggling to keep up with each new update.
          </p>

          <p className="text-lg leading-relaxed mb-12 opacity-70">
            Welcome to the modern design dilemma: software is outpacing hardware at an alarming rate, and theatre designers are caught in the middle.
          </p>

          {/* Section Break */}
          <div className="w-16 h-px bg-black dark:bg-white opacity-30 my-16 mx-auto"></div>

          <h2 className="text-3xl tracking-tight mb-8 mt-16">The Software-Hardware Flip: What Changed?</h2>
          
          <p className="leading-relaxed mb-6">
            Back in the glorious 1990s and early 2000s—when digital gobos were revolutionary and sound designers still carried CDs—software developers created programs that worked within hardware limitations. Everyone's Windows 95/98 machines had roughly similar specs, and most users could run standard software without their computers having existential crises.
          </p>

          <p className="leading-relaxed mb-6">
            Fast-forward to today, and the script has flipped dramatically. Software developers regularly push out updates that demand increasingly powerful hardware. That Vectorworks upgrade needs more RAM. The latest QLab is hungry for processing power. Your computer rendering software wonders why you're still using last decade's graphics card.
          </p>

          <p className="leading-relaxed mb-12">
            This isn't just frustrating—for theatre designers working on tight deadlines and tighter budgets, it's a creative emergency waiting to happen.
          </p>

          {/* Image Break */}
          <div className="my-16 -mx-8 md:mx-0">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1698151256842-e658014ea99a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYXB0b3AlMjBkZXNpZ24lMjB3b3Jrc3BhY2V8ZW58MXx8fHwxNzYxNzI1NzA2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Designer workspace with laptop"
              className="w-full"
            />
          </div>

          <h2 className="text-3xl tracking-tight mb-8 mt-16">Why Theatre Designers Should Care About Hardware</h2>
          
          <p className="leading-relaxed mb-8">
            Your computer is your primary collaborator as a theatre designer, whether creating lighting, scenery, costumes, projections, or sound. Here's why understanding its components matters:
          </p>

          <h3 className="text-2xl tracking-tight mb-6 mt-12">1. Your Creative Vision Depends On It</h3>
          
          <p className="leading-relaxed mb-6">
            When your hardware can't keep up with your software, your creative process suffers. Imagine trying to program complex lighting cues when your computer freezes every few minutes, or attempting to render a 3D scenic model when your machine crashes repeatedly. Technical limitations become creative limitations.
          </p>

          <h3 className="text-2xl tracking-tight mb-6 mt-12">2. Theatre Work Has Unique Computing Demands</h3>
          
          <p className="leading-relaxed mb-4">Different design disciplines have different hardware needs:</p>

          <ul className="space-y-3 mb-8 ml-6 opacity-80">
            <li className="leading-relaxed">Scenic designers require substantial CPU power for 3D modeling and rendering</li>
            <li className="leading-relaxed">Costume designers need color-accurate displays and decent graphics for rendering</li>
            <li className="leading-relaxed">Lighting designers need strong GPUs for visualization software</li>
            <li className="leading-relaxed">Sound designers benefit from specialized audio processing capabilities</li>
            <li className="leading-relaxed">Projection designers need both powerful graphics processing and storage for video files</li>
          </ul>

          <h3 className="text-2xl tracking-tight mb-6 mt-12">3. Budget Realities in Theatre</h3>
          
          <p className="leading-relaxed mb-12">
            Let's be honest—theatre rarely comes with Silicon Valley budgets. Making smart investments in the right computer components means stretching limited resources further. Understanding what hardware matters for your specific design discipline helps you invest wisely.
          </p>

          {/* Pull Quote */}
          <div className="my-16 py-8 border-y border-black dark:border-white">
            <p className="text-2xl text-center leading-relaxed opacity-70 italic max-w-2xl mx-auto">
              "The expensive part isn't the software—it's the hardware needed to run it without losing your mind."
            </p>
          </div>

          <h2 className="text-3xl tracking-tight mb-8 mt-16">Operating Systems: The Foundation of Your Design Environment</h2>
          
          <p className="leading-relaxed mb-8">
            Before diving into hardware specifics, it's important to understand the operating system options, as this choice affects available software, workflow, and integration with production teams:
          </p>

          <div className="space-y-8 mb-12">
            <div>
              <h3 className="text-xl tracking-tight mb-4">Windows (Microsoft)</h3>
              <ul className="space-y-2 ml-6 opacity-80">
                <li className="leading-relaxed">Most widely used OS globally</li>
                <li className="leading-relaxed">Compatible with the broadest range of design software</li>
                <li className="leading-relaxed">Popular foundation for lighting consoles and visualization tools</li>
                <li className="leading-relaxed">Available on devices at various price points</li>
                <li className="leading-relaxed">Latest versions: Windows 10/11</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl tracking-tight mb-4">macOS (Apple)</h3>
              <ul className="space-y-2 ml-6 opacity-80">
                <li className="leading-relaxed">Favored by many professional designers in theater</li>
                <li className="leading-relaxed">Known for color accuracy and consistency</li>
                <li className="leading-relaxed">Exclusive access to some design applications like QLab (crucial for sound designers)</li>
                <li className="leading-relaxed">Seamless integration with other Apple devices</li>
                <li className="leading-relaxed">Latest versions include Ventura, Monterey, and Big Sur</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl tracking-tight mb-4">Linux</h3>
              <ul className="space-y-2 ml-6 opacity-80">
                <li className="leading-relaxed">Open-source and customizable</li>
                <li className="leading-relaxed">Free to use</li>
                <li className="leading-relaxed">Various distributions available</li>
                <li className="leading-relaxed">Limited compatibility with mainstream theater design software</li>
                <li className="leading-relaxed">Occasionally used for specific technical applications like show control systems</li>
              </ul>
            </div>
          </div>

          {/* Section Break */}
          <div className="w-16 h-px bg-black dark:bg-white opacity-30 my-16 mx-auto"></div>

          <h2 className="text-3xl tracking-tight mb-8 mt-16">The New Computing Hierarchy (Thanks, Smartphones)</h2>
          
          <p className="leading-relaxed mb-6">
            Another significant shift has been created by the rise of mobile devices and apps. Today's computing landscape has developed a complex hierarchy:
          </p>

          <div className="space-y-4 mb-8 ml-6">
            <p className="leading-relaxed"><strong>Basic Computing Tasks:</strong> Social media, email, web browsing (can be done on almost any device)</p>
            <p className="leading-relaxed"><strong>Intermediate Tasks:</strong> Basic photo editing, simple drafting, music playback (requires moderate computing power)</p>
            <p className="leading-relaxed"><strong>Professional Creative Work:</strong> Lighting visualization, complex CAD drafting, video editing, sound design (demands high-performance hardware)</p>
          </div>

          <p className="leading-relaxed mb-12 opacity-80 italic">
            This hierarchy barely existed in the earlier computing era when most users had machines with relatively similar capabilities. We can partially thank the gaming community for driving hardware innovation—their demand for powerful graphics processing has inadvertently benefited designers who need that same processing power for visualization software. So maybe don't judge the assistant lighting designer for their Steam library; their gaming habit might be indirectly improving your production values!
          </p>

          {/* Image Break */}
          <div className="my-16 -mx-8 md:mx-0">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1672854207187-e70df893755b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB3b3Jrc3RhdGlvbiUyMHNldHVwfGVufDF8fHx8MTc2MTcyNTcwNnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Modern workstation setup"
              className="w-full"
            />
          </div>

          <h2 className="text-3xl tracking-tight mb-8 mt-16">Desktop, Laptop, or Tablet: The Theatre Designer's Dilemma</h2>

          <h3 className="text-2xl tracking-tight mb-6 mt-12">Laptop Computers: The Production Essential</h3>

          <p className="leading-relaxed mb-4"><strong>Advantages for Theatre Designers</strong></p>
          <ul className="space-y-2 mb-8 ml-6 opacity-80">
            <li className="leading-relaxed">Mobility: Go from the design table to the tech table to backstage without unplugging your entire setup</li>
            <li className="leading-relaxed">Client-Friendly: Present work during meetings without everyone crowding around your phone</li>
            <li className="leading-relaxed">Flexible Workspaces: Ideal for working in coffee shops, rehearsal halls, or your living room</li>
            <li className="leading-relaxed">Compact Footprint: Valuable in tight spaces or shared design studios</li>
          </ul>

          <p className="leading-relaxed mb-4"><strong>Considerations</strong></p>
          <ul className="space-y-2 mb-12 ml-6 opacity-80">
            <li className="leading-relaxed">Less power than desktops at the same price point</li>
            <li className="leading-relaxed">Tends to overheat during long tech days (just like your stage manager)</li>
            <li className="leading-relaxed">Limited upgrade paths as projects get more demanding</li>
          </ul>

          <h3 className="text-2xl tracking-tight mb-6 mt-12">Tablets & Smartphones: The Supplementary Tools</h3>

          <p className="leading-relaxed mb-4"><strong>Advantages for Theatre Designers</strong></p>
          <ul className="space-y-2 mb-8 ml-6 opacity-80">
            <li className="leading-relaxed">Quick Access: Instantly reference sketches, notes, or cue sheets during rehearsals</li>
            <li className="leading-relaxed">Light Edits: Great for markup or minor adjustments on the fly</li>
            <li className="leading-relaxed">Connectivity: Stay in sync with your team through messages and shared files</li>
            <li className="leading-relaxed">Photo Capture: Snap documentation shots or grab visual inspiration in real-time</li>
          </ul>

          <p className="leading-relaxed mb-4"><strong>Considerations</strong></p>
          <ul className="space-y-2 mb-12 ml-6 opacity-80">
            <li className="leading-relaxed">Not suited for heavy design work</li>
            <li className="leading-relaxed">Software is limited compared to full workstations</li>
            <li className="leading-relaxed">Best used as support tools—not standalone design platforms</li>
          </ul>

          {/* Section Break */}
          <div className="w-16 h-px bg-black dark:bg-white opacity-30 my-16 mx-auto"></div>

          <h2 className="text-3xl tracking-tight mb-8 mt-16">Key Components That Will Make or Break Your Next Production</h2>

          {/* Image Break */}
          <div className="my-12 -mx-8 md:mx-0">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1672165407865-424aadab20cc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21wdXRlciUyMGNvbXBvbmVudHMlMjBwcm9jZXNzb3J8ZW58MXx8fHwxNzYxNzI1NzA2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Computer processor and components"
              className="w-full"
            />
          </div>

          <h3 className="text-2xl tracking-tight mb-6 mt-12">CPU (Central Processing Unit)</h3>
          
          <p className="leading-relaxed mb-6">
            The processor affects how quickly your computer can calculate complex operations—like rendering a light plot or processing sound effects:
          </p>

          <ul className="space-y-2 mb-8 ml-6 opacity-80">
            <li className="leading-relaxed">For Lighting/Projection: 6+ cores for visualization software</li>
            <li className="leading-relaxed">For Scenic Design: Higher clock speeds for CAD programs</li>
            <li className="leading-relaxed">For Sound: Multi-core processing for audio workstations</li>
          </ul>

          <p className="leading-relaxed mb-6">Major manufacturers and their latest offerings as of 2025 include:</p>

          <div className="space-y-6 mb-12 ml-6">
            <div>
              <p className="leading-relaxed mb-2"><strong>Intel:</strong></p>
              <ul className="space-y-2 ml-6 opacity-80">
                <li className="leading-relaxed">14th generation Core processors (i5-14600K, i7-14700K, i9-14900K)</li>
                <li className="leading-relaxed">Core Ultra 9 series with integrated AI acceleration</li>
                <li className="leading-relaxed">Higher numbers indicate better performance within each generation</li>
              </ul>
            </div>

            <div>
              <p className="leading-relaxed mb-2"><strong>AMD:</strong></p>
              <ul className="space-y-2 ml-6 opacity-80">
                <li className="leading-relaxed">Ryzen 5, 7, 9 series (9600X, 9800X, 9950X) featuring Zen 5 architecture</li>
                <li className="leading-relaxed">Threadripper 7000 series for extreme workstation needs</li>
                <li className="leading-relaxed">Offering excellent multi-core performance for rendering tasks</li>
              </ul>
            </div>

            <div>
              <p className="leading-relaxed mb-2"><strong>Apple:</strong></p>
              <ul className="space-y-2 ml-6 opacity-80">
                <li className="leading-relaxed">M3, M3 Pro, M3 Max, and M3 Ultra chips</li>
                <li className="leading-relaxed">Custom ARM-based silicon with integrated CPU, GPU, and Neural Engine</li>
                <li className="leading-relaxed">Exceptional power efficiency ideal for laptop-based designers</li>
              </ul>
            </div>
          </div>

          <h3 className="text-2xl tracking-tight mb-6 mt-12">GPU (Graphics Processing Unit)</h3>
          
          <p className="leading-relaxed mb-6">
            Particularly critical for lighting and projection designers, but increasingly important for all visual designers:
          </p>

          <ul className="space-y-2 mb-8 ml-6 opacity-80">
            <li className="leading-relaxed">Essential for 3D visualization programs</li>
            <li className="leading-relaxed">Accelerates rendering times dramatically</li>
            <li className="leading-relaxed">Handles video processing for projection design</li>
            <li className="leading-relaxed">Improves performance with vector-based drafting programs</li>
          </ul>

          <p className="leading-relaxed mb-6">Leading manufacturers and their current offerings:</p>

          <div className="space-y-6 mb-12 ml-6">
            <div>
              <p className="leading-relaxed mb-2"><strong>NVIDIA:</strong></p>
              <ul className="space-y-2 ml-6 opacity-80">
                <li className="leading-relaxed">GeForce RTX 4070, 4080, and 4090 series (Ada Lovelace architecture)</li>
                <li className="leading-relaxed">Professional RTX 6000 cards for high-end visualization</li>
                <li className="leading-relaxed">Excellent for real-time lighting visualization and rendering</li>
                <li className="leading-relaxed">Enhanced ray tracing capabilities benefit realistic previews</li>
              </ul>
            </div>

            <div>
              <p className="leading-relaxed mb-2"><strong>AMD:</strong></p>
              <ul className="space-y-2 ml-6 opacity-80">
                <li className="leading-relaxed">Radeon RX 7700 XT, 7800 XT, and 7900 XTX series</li>
                <li className="leading-relaxed">Radeon Pro W7900 for professional workloads</li>
                <li className="leading-relaxed">Strong performance-per-dollar for CAD applications</li>
              </ul>
            </div>

            <div>
              <p className="leading-relaxed mb-2"><strong>Apple:</strong></p>
              <ul className="space-y-2 ml-6 opacity-80">
                <li className="leading-relaxed">Integrated graphics in M3-series chips</li>
                <li className="leading-relaxed">Surprisingly capable for many design applications</li>
                <li className="leading-relaxed">Best when using Apple-optimized software</li>
              </ul>
            </div>
          </div>

          <h3 className="text-2xl tracking-tight mb-6 mt-12">RAM (Memory)</h3>
          
          <p className="leading-relaxed mb-6">
            Determines how many programs you can run simultaneously—crucial during tech when you might have drafting software, visualization programs, and communication tools all running at once:
          </p>

          <ul className="space-y-2 mb-12 ml-6 opacity-80">
            <li className="leading-relaxed">32GB minimum for professional theatre design in 2025</li>
            <li className="leading-relaxed">64GB recommended for complex visualization, 3D modeling, or video work</li>
            <li className="leading-relaxed">128GB for high-end projection design with multiple video layers</li>
            <li className="leading-relaxed">More RAM means less time waiting and more time creating during critical tech periods</li>
          </ul>

          <h3 className="text-2xl tracking-tight mb-6 mt-12">Storage</h3>
          
          <p className="leading-relaxed mb-6">
            Affects how quickly you can access show files and how many productions you can keep readily available:
          </p>

          <ul className="space-y-2 mb-8 ml-6 opacity-80">
            <li className="leading-relaxed">NVMe SSD: The fastest current storage technology, essential for primary drive</li>
            <li className="leading-relaxed">SATA SSD: Good secondary storage, much faster than HDDs</li>
            <li className="leading-relaxed">HDD (Hard Disk Drive): Budget option for archival storage only</li>
          </ul>

          <p className="leading-relaxed mb-4">Storage recommendations by discipline:</p>

          <ul className="space-y-2 mb-12 ml-6 opacity-80">
            <li className="leading-relaxed">Scenic: 2TB NVMe SSD for project files and textures</li>
            <li className="leading-relaxed">Lighting: 1TB NVMe SSD minimum</li>
            <li className="leading-relaxed">Sound: 1TB NVMe system drive + 4TB+ secondary SSD for libraries</li>
            <li className="leading-relaxed">Projection: 4TB+ high-speed storage array</li>
            <li className="leading-relaxed">Consider portable SSDs for transporting show files between venues</li>
          </ul>

          {/* Section Break */}
          <div className="w-16 h-px bg-black dark:bg-white opacity-30 my-16 mx-auto"></div>

          <h2 className="text-3xl tracking-tight mb-8 mt-16">Design Discipline-Specific Recommendations</h2>

          <div className="space-y-12 mb-12">
            <div className="border-l-2 border-black dark:border-white pl-8">
              <h3 className="text-xl tracking-tight mb-6">Scenic Design</h3>
              <ul className="space-y-3 opacity-80">
                <li className="leading-relaxed"><strong>CPU:</strong> 12+ core processor from Intel i9 or AMD Ryzen 9 series for 3D modeling and rendering</li>
                <li className="leading-relaxed"><strong>GPU:</strong> NVIDIA RTX 4080 or AMD Radeon 7900 XT for CAD and visualization programs</li>
                <li className="leading-relaxed"><strong>RAM:</strong> 64GB recommended for complex models with detailed textures</li>
                <li className="leading-relaxed"><strong>Storage:</strong> 2TB NVMe SSD for project files and material libraries</li>
                <li className="leading-relaxed"><strong>Display:</strong> Color-accurate monitor with at least 27" screen and QHD resolution</li>
                <li className="leading-relaxed"><strong>Special considerations:</strong> Consider a separate render machine for complex visualizations during tech</li>
              </ul>
            </div>

            <div className="border-l-2 border-black dark:border-white pl-8">
              <h3 className="text-xl tracking-tight mb-6">Costume Design</h3>
              <ul className="space-y-3 opacity-80">
                <li className="leading-relaxed"><strong>CPU:</strong> 8+ core processor from mid-range Intel or AMD lineup</li>
                <li className="leading-relaxed"><strong>GPU:</strong> Mid-range graphics card with good color processing</li>
                <li className="leading-relaxed"><strong>RAM:</strong> 32GB for design software and image editing</li>
                <li className="leading-relaxed"><strong>Storage:</strong> 1TB SSD for system and design files</li>
                <li className="leading-relaxed"><strong>Display:</strong> Color-calibrated display with excellent color accuracy</li>
              </ul>
            </div>

            <div className="border-l-2 border-black dark:border-white pl-8">
              <h3 className="text-xl tracking-tight mb-6">Lighting Design</h3>
              <ul className="space-y-3 opacity-80">
                <li className="leading-relaxed"><strong>CPU:</strong> Minimum 8-core processor from Intel i7/i9 or AMD Ryzen 7/9 series for visualization software</li>
                <li className="leading-relaxed"><strong>GPU:</strong> NVIDIA RTX 4070 or better for real-time lighting visualization</li>
                <li className="leading-relaxed"><strong>RAM:</strong> 32GB minimum for complex shows with multiple visualization windows</li>
                <li className="leading-relaxed"><strong>Storage:</strong> 1TB NVMe SSD for quick file access during tech</li>
              </ul>
            </div>

            <div className="border-l-2 border-black dark:border-white pl-8">
              <h3 className="text-xl tracking-tight mb-6">Sound Design</h3>
              <ul className="space-y-3 opacity-80">
                <li className="leading-relaxed"><strong>CPU:</strong> Multi-core processor with high single-thread performance (Intel i7-14700K or better)</li>
                <li className="leading-relaxed"><strong>GPU:</strong> Mid-range graphics card sufficient (RTX 4070 or Radeon 7700 XT)</li>
                <li className="leading-relaxed"><strong>RAM:</strong> 32GB for large sample libraries and multi-track projects</li>
                <li className="leading-relaxed"><strong>Storage:</strong> Multiple drives: 1TB NVMe SSD for system/software and 4TB+ SSD for sound libraries</li>
              </ul>
            </div>

            <div className="border-l-2 border-black dark:border-white pl-8">
              <h3 className="text-xl tracking-tight mb-6">Projection Design</h3>
              <ul className="space-y-3 opacity-80">
                <li className="leading-relaxed"><strong>CPU:</strong> High-end Intel i9-14900K or AMD Ryzen 9950X/Threadripper</li>
                <li className="leading-relaxed"><strong>GPU:</strong> NVIDIA RTX 4080/4090 or equivalent professional card</li>
                <li className="leading-relaxed"><strong>RAM:</strong> 64GB minimum, 128GB ideal for complex video projects</li>
                <li className="leading-relaxed"><strong>Storage:</strong> 4TB+ high-speed storage array for video content</li>
              </ul>
            </div>
          </div>

          {/* Section Break */}
          <div className="w-16 h-px bg-black dark:bg-white opacity-30 my-16 mx-auto"></div>

          <h2 className="text-3xl tracking-tight mb-8 mt-16">The Mac vs. PC Debate: A Personal Take</h2>
          
          <p className="leading-relaxed mb-6 text-lg opacity-90">
            I am a big advocate for Apple Computing. I used to have PCs. I remember when Tony-winning scenic designer Beowulf Boritt was in a commercial for Microsoft... This was a terrible purchase for myself, and Beowulf, if you are reading this, I want my money back.
          </p>

          <p className="leading-relaxed mb-8">
            Here's why I've come to prefer Macs for most design tasks:
          </p>

          <h3 className="text-2xl tracking-tight mb-6 mt-12">The Case for Apple in Theatre Design</h3>

          <div className="space-y-8 mb-12">
            <div>
              <p className="leading-relaxed mb-3"><strong>Workflow Focus:</strong></p>
              <p className="leading-relaxed opacity-80">PCs offer endless customization options—which sounds great until you realize you've spent three hours tweaking settings instead of designing. Apple's more contained ecosystem creates a "swim lane" effect that keeps you focused on creating rather than computing.</p>
            </div>

            <div>
              <p className="leading-relaxed mb-3"><strong>The M-Series Revolution:</strong></p>
              <p className="leading-relaxed opacity-80">Apple's M-series chips aren't just powerful—they're remarkably energy-efficient. This means less fan noise during quiet moments in tech (your sound designer will thank you), longer battery life when the nearest outlet is occupied by a prop phone charger, and less environmental impact.</p>
            </div>

            <div>
              <p className="leading-relaxed mb-3"><strong>The GPU Situation:</strong></p>
              <p className="leading-relaxed opacity-80">Let's address the elephant in the room—GPU prices. Between cryptocurrency mining bros and the AI gold rush, graphics card pricing has become almost comical. This puts powerful PCs increasingly out of reach for many freelance designers. Apple's integrated approach offers a more predictable investment.</p>
            </div>

            <div>
              <p className="leading-relaxed mb-3"><strong>The Longevity Factor:</strong></p>
              <p className="leading-relaxed opacity-80">Here's a challenge—try to find a Windows laptop more than two years old still being used professionally in a demanding creative field. Now look around the tech table at any major regional theatre. Spot that lighting designer running QLab on what appears to be a MacBook Pro from the Obama administration? Somehow, these Mac-Brick Pros just keep chugging along year after year.</p>
            </div>
          </div>

          <p className="leading-relaxed mb-6">
            Yes, the Apple price point is higher initially. But when you amortize that cost over the actual usable lifespan, the math starts looking much more favorable. Many designers I know have had their Macs last through multiple production cycles, while colleagues with Windows laptops often find themselves shopping for replacements much sooner.
          </p>

          <p className="leading-relaxed mb-6 opacity-80 italic">
            Of course, many designers create brilliant work on Windows machines. There's no "wrong" choice here—just different paths with different trade-offs. And I must confess: if you're in Video Design where GPU-powered outputs are crucial, PC is often the way to go. I've been known to begrudgingly keep a Windows machine around specifically for certain projection and visualization software applications. Sometimes the right tool for the job overrules brand loyalty.
          </p>

          <p className="leading-relaxed mb-12">
            But for most general design tasks, if you're on the fence and can make the initial investment, the Mac ecosystem offers some compelling advantages for the working theatre designer.
          </p>

          {/* Pull Quote */}
          <div className="my-16 py-8 border-y border-black dark:border-white">
            <p className="text-2xl text-center leading-relaxed opacity-70 italic max-w-2xl mx-auto">
              "Your computer budget should match the professional tier of your software."
            </p>
          </div>

          <h2 className="text-3xl tracking-tight mb-8 mt-16">The Real Cost of Inadequate Hardware</h2>
          
          <p className="leading-relaxed mb-6">
            For theatre designers, the real cost of underpowered hardware isn't just frustration—it's lost time during already tight production schedules. When your computer crashes during technical rehearsals, it's not just inconvenient; it can delay the entire production process and create unnecessary stress in an already high-pressure environment.
          </p>

          <p className="leading-relaxed mb-12">
            Consider this scenario: You're three hours from opening, making final adjustments to a complex projection sequence. Suddenly, your underpowered laptop freezes, forcing a reboot and potentially losing recent changes. The entire production team—actors, stage management, crew—all wait while you troubleshoot. That's dozens of person-hours and significant labor costs wasted because of inadequate hardware.
          </p>

          <h2 className="text-3xl tracking-tight mb-8 mt-16">The Designer's Rule of Hardware Investment</h2>
          
          <p className="leading-relaxed mb-6">
            Here's a hard truth that might save you thousands of dollars and countless headaches: Your computer budget should match the professional tier of your software.
          </p>

          <p className="leading-relaxed mb-4">Think about it this way:</p>

          <ul className="space-y-2 mb-8 ml-6 opacity-80">
            <li className="leading-relaxed">Entry-level design software demands at least entry-level professional hardware</li>
            <li className="leading-relaxed">Professional design software requires professional-grade computing power</li>
            <li className="leading-relaxed">High-end 3D and rendering software needs serious workstation power</li>
          </ul>

          <p className="leading-relaxed mb-6">
            In real terms: If you're investing in Vectorworks Spotlight, you should be prepared to spend at least $1,500 on a computer that can run it properly. Running $2,000+ professional software on a $700 laptop and wondering why it's painfully slow is like putting ketchup on a $60 dry-aged steak. Sure, you can do it, but you're completely missing the point and wasting your investment.
          </p>

          <p className="leading-relaxed mb-12">
            I've watched designers drop thousands on software licenses only to run them on outdated hardware, then spend countless billable hours waiting for renders or recovering from crashes. The software developers aren't building these applications with your five-year-old consumer laptop in mind—they're assuming you're making a proportional investment in hardware.
          </p>

          {/* Final Section */}
          <div className="my-16 py-12 text-center">
            <h2 className="text-3xl tracking-tight mb-8">Conclusion</h2>
            
            <p className="leading-relaxed mb-6 text-lg max-w-2xl mx-auto">
              As theatre designers, our focus will always be on the art—the emotional impact of a lighting change, the storytelling power of a scenic element, or the atmospheric transformation of a sound cue. However, understanding the tools that help us realize these visions is increasingly important in a world where software capabilities are expanding faster than hardware can keep up.
            </p>

            <p className="leading-relaxed mb-6 max-w-2xl mx-auto">
              By understanding computer components and making informed choices about your hardware, you remove technical barriers that might otherwise limit your creative expression. In a field where time is always short and budgets are often tight, the right computer isn't a luxury—it's an essential investment in your creative process and professional growth.
            </p>

            <p className="leading-relaxed max-w-2xl mx-auto opacity-80 italic">
              Whether you're a seasoned designer struggling with increasingly demanding software or a student just building your first professional toolkit, understanding the hardware that powers your creative work is no longer optional—it's a necessary part of the modern theatre designer's skill set.
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

        {/* FAQ Section */}
        <div className="mt-24 pt-16 border-t border-black dark:border-white">
          <h3 className="text-2xl tracking-tight mb-12">Frequently Asked Questions</h3>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-black/10 dark:border-white/10 last:border-b-0">
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

        {/* Resources Section */}
        <div className="mt-16 pt-16 border-t border-black dark:border-white">
          <h3 className="text-2xl tracking-tight mb-12">Additional Resources for Scenic Designers</h3>
          
          <div className="space-y-12">
            {resources.map((section, index) => (
              <div key={index}>
                <h4 className="text-xl tracking-tight mb-6">{section.category}</h4>
                <div className="space-y-4">
                  {section.links.map((link, linkIndex) => (
                    <div key={linkIndex} className="opacity-80 hover:opacity-100 transition-opacity duration-200">
                      <p className="leading-relaxed mb-1"><strong>{link.name}</strong></p>
                      <p className="text-sm opacity-70">{link.description}</p>
                    </div>
                  ))}
                </div>
              </div>
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
