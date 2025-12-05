import React, { useState } from 'react';
import { PageHeader } from '../components/shared/PageHeader';
import { SEO } from '../components/SEO';
import { PAGE_METADATA } from '../utils/seo/metadata';
import { ChevronDown } from 'lucide-react';

interface FAQProps {
  onNavigate: (page: string, slug?: string) => void;
}

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: 'How would you describe your approach to scenic design?',
    answer: 'I approach scenic design as a balance between storytelling, functionality, and artistic expression. My work is deeply informed by the script, the director\'s vision, and the production\'s technical needs. Whether designing for theatre, film, or live events, I focus on creating immersive, visually compelling environments that enhance the overall narrative.',
  },
  {
    question: 'What is your design process like?',
    answer: 'My process typically begins with script analysis and conceptual research, followed by sketching and digital modeling in Vectorworks. I then refine the design using Twinmotion to create high-quality visualizations. Collaboration with directors and production teams ensures the design is both artistically compelling and technically feasible.',
  },
  {
    question: 'Do you specialize in a particular style of scenic design?',
    answer: 'While I\'ve designed for a wide range of productions, I\'m particularly drawn to visually dynamic, technically ambitious, and thematically rich designs. I enjoy working on projects that push the boundaries of scenic storytelling—whether through abstract visuals, immersive environments, or intricate period detail.',
  },
  {
    question: 'Do you create physical models for your scenic designs?',
    answer: 'Yes. I use laser cutting and 3D printing to construct detailed scenic models. These models are valuable tools for visualizing a set in three dimensions before full-scale production.',
  },
  {
    question: 'What software do you use for rendering and visualization?',
    answer: 'I primarily use Vectorworks and Twinmotion to create high-quality renderings and animations. These tools allow directors and production teams to preview the set in a highly detailed, immersive format.',
  },
  {
    question: 'Do you take on freelance or commission-based projects?',
    answer: 'Yes. I\'m open to freelance scenic design work, consulting, and visualization projects. If you\'re interested in collaborating, feel free to reach out through my contact page.',
  },
  {
    question: 'What types of productions do you typically work on?',
    answer: 'My experience includes theatre, live events, themed entertainment, and concept design for film and television. I\'ve designed everything from intimate black-box plays to large-scale musicals and immersive experiences.',
  },
  {
    question: 'Can you collaborate remotely?',
    answer: 'Yes. My workflow is designed for digital collaboration. I use tools for virtual modeling, rendering, and communication that make it seamless to work with teams anywhere in the world.',
  },
  {
    question: 'Where are you based?',
    answer: 'I\'m based in Orange County, California, but I work with clients and collaborators across the country.',
  },
  {
    question: 'Are you available for guest lectures or workshops?',
    answer: 'Yes. I\'ve taught scenic design, visualization, and digital tools in both classroom and workshop settings. I\'m happy to discuss opportunities for guest lectures or educational partnerships.',
  },
];

function FAQAccordionItem({ item, isOpen, onToggle }: { item: FAQItem; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-black/10 dark:border-white/10">
      <button
        onClick={onToggle}
        className="w-full py-6 flex items-start justify-between gap-6 text-left group"
      >
        <span className="text-black dark:text-white transition-colors group-hover:text-accent-brand">
          {item.question}
        </span>
        <ChevronDown
          className={`flex-shrink-0 w-5 h-5 text-black/40 dark:text-white/40 transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? 'max-h-96 mb-6' : 'max-h-0'
        }`}
      >
        <p className="text-black/60 dark:text-white/60 leading-relaxed">
          {item.answer}
        </p>
      </div>
    </div>
  );
}

export function FAQ({ onNavigate }: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <>
      <SEO metadata={PAGE_METADATA.faq} />
      
      <div className="min-h-screen bg-white dark:bg-black">
        <PageHeader 
          title="Frequently Asked Questions"
          subtitle="Common questions about my work, process, and services"
          onNavigate={onNavigate}
        />
        
        <div className="max-w-4xl mx-auto px-8 md:px-16 py-16 md:py-24">
          {/* Introduction */}
          <div className="mb-12 pb-12 border-b border-black/10 dark:border-white/10">
            <p className="text-black/60 dark:text-white/60 leading-relaxed">
              Below are answers to some of the most common questions about my scenic design work, 
              design process, technical capabilities, and collaboration opportunities. If you have 
              additional questions, please feel free to{' '}
              <button 
                onClick={() => onNavigate('contact')}
                className="text-accent-brand hover:underline"
              >
                reach out
              </button>
              .
            </p>
          </div>

          {/* FAQ Accordion */}
          <div className="space-y-0">
            {faqData.map((item, index) => (
              <FAQAccordionItem
                key={index}
                item={item}
                isOpen={openIndex === index}
                onToggle={() => handleToggle(index)}
              />
            ))}
          </div>

          {/* CTA */}
          <div className="mt-16 pt-16 border-t border-black/10 dark:border-white/10 text-center">
            <h3 className="text-lg mb-4">Still have questions?</h3>
            <p className="text-black/60 dark:text-white/60 mb-8">
              I'm happy to discuss your project, answer specific questions, or explore collaboration opportunities.
            </p>
            <button
              onClick={() => onNavigate('contact')}
              className="inline-block px-8 py-3 border border-black dark:border-white text-black dark:text-white hover:bg-accent-brand hover:border-accent-brand hover:text-white dark:hover:text-black transition-colors"
            >
              Get in Touch
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
