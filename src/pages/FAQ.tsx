import React from 'react';
import { PageHeader } from '../components/shared/PageHeader';
import { SEO } from '../components/SEO';
import { PAGE_METADATA } from '../utils/seo/metadata';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../components/ui/accordion';

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

export function FAQ({ onNavigate }: FAQProps) {
  return (
    <>
      <SEO metadata={PAGE_METADATA.faq} />

      <div className="min-h-screen bg-white dark:bg-black pt-32 pb-24">
        <div className="max-w-4xl mx-auto px-6">
          <PageHeader
            title="Frequently Asked Questions"
            subtitle="Common questions about my work, process, and services"
            variant="minimal"
          />

          <div className="mt-12 space-y-12">
            {/* Introduction */}
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-lg text-muted-foreground leading-relaxed">
                Below are answers to some of the most common questions about my scenic design work,
                design process, technical capabilities, and collaboration opportunities. If you have
                additional questions, please feel free to{' '}
                <button
                  onClick={() => onNavigate('contact')}
                  className="text-accent-brand hover:underline font-medium"
                >
                  reach out
                </button>
                .
              </p>
            </div>

            {/* FAQ Accordion */}
            <Accordion type="single" collapsible className="w-full">
              {faqData.map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-xl font-medium text-left hover:text-accent-brand hover:no-underline py-6">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-base text-muted-foreground leading-relaxed pb-6">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            {/* CTA */}
            <div className="pt-16 border-t border-border text-center space-y-6">
              <div className="space-y-2">
                <h3 className="text-2xl font-display">Still have questions?</h3>
                <p className="text-muted-foreground">
                  I'm happy to discuss your project, answer specific questions, or explore collaboration opportunities.
                </p>
              </div>

              <button
                onClick={() => onNavigate('contact')}
                className="inline-flex items-center justify-center px-8 py-3 
                  bg-black dark:bg-white text-white dark:text-black 
                  font-pixel text-xs tracking-[0.2em] uppercase rounded-full 
                  hover:opacity-80 transition-opacity"
              >
                Get in Touch
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
