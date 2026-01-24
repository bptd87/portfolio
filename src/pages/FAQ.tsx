import React from 'react';
import { PageHeader } from '../components/shared/PageHeader';
import { SEO } from '../components/SEO';
import { PAGE_METADATA } from '../utils/seo/metadata';
import { FAQ_ITEMS } from '../data/faq';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../components/ui/accordion';

interface FAQProps {
  onNavigate: (page: string, slug?: string) => void;
}

export function FAQ({ onNavigate }: FAQProps) {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": FAQ_ITEMS.map(item => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer
      }
    }))
  };

  return (
    <>
      <SEO metadata={PAGE_METADATA.faq} structuredData={faqSchema} />

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
              {FAQ_ITEMS.map((item, index) => (
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
