import React from 'react';
import { PageHeader } from '../components/shared/PageHeader';
import { SEO } from '../components/SEO';
import { PAGE_METADATA } from '../utils/seo/metadata';

interface TermsOfUseProps {
  onNavigate: (page: string, slug?: string) => void;
}

export function TermsOfUse({ onNavigate }: TermsOfUseProps) {
  return (
    <>
      <SEO metadata={PAGE_METADATA['terms-of-use']} />
      
      <div className="min-h-screen bg-white dark:bg-black">
        <PageHeader 
          title="Terms of Use"
          subtitle="Terms and conditions for using this website"
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
              Welcome to{' '}
              <a 
                href="https://www.brandonptdavis.com" 
                className="text-accent-brand hover:underline"
              >
                brandonptdavis.com
              </a>, the official website of Brandon PT Davis. By accessing or using this 
              website, you agree to be bound by the following Terms of Use. If you do not agree, 
              please do not use this site.
            </p>
          </div>

          {/* 1. Use of Site */}
          <section className="mb-12">
            <h2 className="mb-6">1. Use of Site</h2>
            <p className="text-black/60 dark:text-white/60 leading-relaxed">
              You may use this website for personal, non-commercial purposes related to viewing design 
              work, reading blog content, accessing resources, and submitting materials (if applicable). 
              You agree not to use the site in any way that could harm, disable, or impair it.
            </p>
          </section>

          {/* 2. Intellectual Property */}
          <section className="mb-12">
            <h2 className="mb-6">2. Intellectual Property</h2>
            <p className="text-black/60 dark:text-white/60 leading-relaxed mb-4">
              All content on this website—including but not limited to text, images, renderings, videos, 
              blog posts, downloadable assets, and branding elements—is the intellectual property of 
              Brandon PT Davis, unless otherwise credited.
            </p>
            <p className="text-black/60 dark:text-white/60 leading-relaxed mb-4">
              You may not reproduce, distribute, modify, or publicly display any content without prior 
              written permission, except where materials are specifically marked as free to use.
            </p>
            <p className="text-black/60 dark:text-white/60 leading-relaxed">
              Free educational materials and resources are provided for personal and educational use only,
              but resale or redistribution is prohibited.
            </p>
          </section>

          {/* 3. User Submissions */}
          <section className="mb-12">
            <h2 className="mb-6">3. User Submissions</h2>
            <p className="text-black/60 dark:text-white/60 leading-relaxed mb-4">
              If you submit content to the site (e.g., Vectorworks files for The Vault), you grant 
              Brandon PT Davis a non-exclusive, royalty-free license to store, display, and 
              share your submission with proper credit. You affirm that you own the rights to anything 
              you submit.
            </p>
            <p className="text-black/60 dark:text-white/60 leading-relaxed">
              Submissions may be curated, edited, or declined at the discretion of the site owner.
            </p>
          </section>

          {/* 4. Links to Other Websites */}
          <section className="mb-12">
            <h2 className="mb-6">4. Links to Other Websites</h2>
            <p className="text-black/60 dark:text-white/60 leading-relaxed">
              This site may include links to third-party websites. These links are provided for your 
              convenience. Brandon PT Davis is not responsible for the content or privacy 
              practices of those external sites.
            </p>
          </section>

          {/* 5. Limitation of Liability */}
          <section className="mb-12">
            <h2 className="mb-6">5. Limitation of Liability</h2>
            <p className="text-black/60 dark:text-white/60 leading-relaxed">
              This site is provided "as is" without warranties of any kind. Brandon PT Davis is not 
              liable for any damages arising from your use of the site, including but not limited to 
              errors, outages, data loss, or third-party misuse of downloaded materials.
            </p>
          </section>

          {/* 6. Changes to These Terms */}
          <section className="mb-12">
            <h2 className="mb-6">6. Changes to These Terms</h2>
            <p className="text-black/60 dark:text-white/60 leading-relaxed">
              These Terms of Use may be updated from time to time. Your continued use of the site after 
              changes are posted indicates your acceptance of those changes.
            </p>
          </section>

          {/* 7. Governing Law */}
          <section className="mb-12">
            <h2 className="mb-6">7. Governing Law</h2>
            <p className="text-black/60 dark:text-white/60 leading-relaxed">
              These Terms are governed by the laws of the State of California, without regard to its 
              conflict of law principles.
            </p>
          </section>

          {/* 8. Contact */}
          <section className="pt-12 border-t border-black/10 dark:border-white/10">
            <h2 className="mb-6">8. Contact</h2>
            <p className="text-black/60 dark:text-white/60 leading-relaxed">
              For questions about these terms, please contact:{' '}
              <a 
                href="mailto:info@brandonptdavis.com" 
                className="text-accent-brand hover:underline"
              >
                info@brandonptdavis.com
              </a>
            </p>
          </section>

        </div>
      </div>
    </>
  );
}