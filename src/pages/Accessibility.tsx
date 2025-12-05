import React from 'react';
import { PageHeader } from '../components/shared/PageHeader';
import { SEO } from '../components/SEO';
import { PAGE_METADATA } from '../utils/seo/metadata';

interface AccessibilityProps {
  onNavigate: (page: string, slug?: string) => void;
}

export function Accessibility({ onNavigate }: AccessibilityProps) {
  return (
    <>
      <SEO metadata={PAGE_METADATA['accessibility']} />
      
      <div className="min-h-screen bg-white dark:bg-black">
        <PageHeader 
          title="Accessibility Statement"
          subtitle="Our commitment to inclusive design and accessible content"
          onNavigate={onNavigate}
        />
        
        <div className="max-w-4xl mx-auto px-8 md:px-16 py-16 md:py-24">
          
          {/* Effective Date */}
          <div className="mb-12 pb-8 border-b border-black/10 dark:border-white/10">
            <p className="text-sm text-black/60 dark:text-white/60">
              Effective Date: July 5, 2025
            </p>
          </div>

          {/* Introduction */}
          <div className="mb-12">
            <p className="text-black/60 dark:text-white/60 leading-relaxed">
              Brandon PT Davis is committed to providing a website that is inclusive and 
              accessible to all users, including individuals with disabilities. My goal is to make{' '}
              <a 
                href="https://www.brandonptdavis.com" 
                className="text-accent-brand hover:underline"
              >
                brandonptdavis.com
              </a>{' '}
              a usable and welcoming experience for everyone.
            </p>
          </div>

          {/* What I'm Doing */}
          <section className="mb-12">
            <h2 className="mb-6">What I'm Doing</h2>
            <p className="text-black/60 dark:text-white/60 leading-relaxed mb-4">
              This website is designed with accessibility in mind and follows the Web Content Accessibility 
              Guidelines (WCAG) 2.1, Level AA wherever possible. Current efforts include:
            </p>
            <ul className="space-y-2 text-black/60 dark:text-white/60">
              <li>Clear and legible typography with sufficient color contrast</li>
              <li>Keyboard-navigable menus and forms</li>
              <li>Descriptive alt text for images</li>
              <li>Consistent structure and layout across pages</li>
            </ul>
            <p className="text-black/60 dark:text-white/60 leading-relaxed mt-4">
              The site is built with modern web technologies and custom code enhancements to improve 
              usability and clarity. Accessibility is an ongoing process, and I continue to test new 
              content for screen reader compatibility and overall usability.
            </p>
          </section>

          {/* Known Limitations */}
          <section className="mb-12">
            <h2 className="mb-6">Known Limitations</h2>
            <p className="text-black/60 dark:text-white/60 leading-relaxed">
              While I work to ensure all aspects of the site meet accessibility standards, some areas 
              may still need improvement—particularly legacy blog posts or embedded third-party tools 
              like video players and search overlays. These issues are being addressed as part of 
              ongoing development.
            </p>
          </section>

          {/* Contact for Accessibility Issues */}
          <section className="pt-12 border-t border-black/10 dark:border-white/10">
            <h2 className="mb-6">Contact for Accessibility Issues</h2>
            <p className="text-black/60 dark:text-white/60 leading-relaxed mb-4">
              If you encounter any content or features that are not fully accessible or have suggestions 
              for improving the experience, I welcome your feedback.
            </p>
            <p className="text-black/60 dark:text-white/60 leading-relaxed mb-4">
              Please contact:
            </p>
            <p className="text-black/60 dark:text-white/60 leading-relaxed mb-6">
              Email:{' '}
              <a 
                href="mailto:info@brandonptdavis.com" 
                className="text-accent-brand hover:underline"
              >
                info@brandonptdavis.com
              </a>
            </p>
            <p className="text-black/60 dark:text-white/60 leading-relaxed">
              You can expect a response within two business days.
            </p>
          </section>

        </div>
      </div>
    </>
  );
}
