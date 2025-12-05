import React from 'react';
import { PageHeader } from '../components/shared/PageHeader';
import { SEO } from '../components/SEO';
import { PAGE_METADATA } from '../utils/seo/metadata';

interface PrivacyPolicyProps {
  onNavigate: (page: string, slug?: string) => void;
}

export function PrivacyPolicy({ onNavigate }: PrivacyPolicyProps) {
  return (
    <>
      <SEO metadata={PAGE_METADATA['privacy-policy']} />
      
      <div className="min-h-screen bg-white dark:bg-black">
        <PageHeader 
          title="Privacy Policy"
          subtitle="How we collect, use, and protect your information"
          onNavigate={onNavigate}
        />
        
        <div className="max-w-4xl mx-auto px-8 md:px-16 py-16 md:py-24">
          
          {/* Effective Date */}
          <div className="mb-12 pb-8 border-b border-black/10 dark:border-white/10">
            <p className="text-sm text-black/60 dark:text-white/60">
              Effective Date: June 8, 2025
            </p>
          </div>

          {/* Introduction */}
          <div className="mb-12">
            <p className="text-black/60 dark:text-white/60 leading-relaxed">
              Brandon PT Davis ("we," "our," or "us") is committed to protecting your privacy. 
              This Privacy Policy explains how we collect, use, and protect your information when you 
              visit our website:{' '}
              <a 
                href="https://www.brandonptdavis.com" 
                className="text-accent-brand hover:underline"
              >
                https://www.brandonptdavis.com
              </a>.
            </p>
          </div>

          {/* Information We Collect */}
          <section className="mb-12">
            <h2 className="mb-6">Information We Collect</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-sm mb-3">1. Personal Information (if submitted by you):</h3>
                <ul className="space-y-2 text-black/60 dark:text-white/60">
                  <li>Name and email address via contact forms or newsletter sign-ups</li>
                  <li>Project details or professional inquiries submitted voluntarily</li>
                </ul>
              </div>

              <div>
                <h3 className="text-sm mb-3">2. Non-Personal Information (automatically collected):</h3>
                <ul className="space-y-2 text-black/60 dark:text-white/60">
                  <li>Browser type and device information</li>
                  <li>IP address and general location data</li>
                  <li>Pages visited and time spent on the site</li>
                  <li>Cookies and usage analytics (via tools like Google Analytics)</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How We Use Your Information */}
          <section className="mb-12">
            <h2 className="mb-6">How We Use Your Information</h2>
            <p className="text-black/60 dark:text-white/60 leading-relaxed mb-4">
              We use the information we collect to:
            </p>
            <ul className="space-y-2 text-black/60 dark:text-white/60">
              <li>Respond to inquiries or collaboration requests</li>
              <li>Improve site performance and user experience</li>
              <li>Share updates or blog posts (only if you opt in to a mailing list)</li>
              <li>Maintain site security and troubleshoot technical issues</li>
            </ul>
            <p className="text-black/60 dark:text-white/60 leading-relaxed mt-4">
              We do not sell, rent, or share your personal data with third parties for marketing purposes.
            </p>
          </section>

          {/* Third-Party Services */}
          <section className="mb-12">
            <h2 className="mb-6">Third-Party Services</h2>
            <p className="text-black/60 dark:text-white/60 leading-relaxed">
              This website may use third-party tools or embedded content (such as YouTube, Google Analytics, 
              or social media sharing plugins). These services may collect information according to their own 
              privacy policies.
            </p>
          </section>

          {/* Cookies */}
          <section className="mb-12">
            <h2 className="mb-6">Cookies</h2>
            <p className="text-black/60 dark:text-white/60 leading-relaxed">
              We use cookies to track website usage and performance. You can disable cookies in your browser 
              settings. By using this site, you consent to the use of cookies.
            </p>
          </section>

          {/* Your Rights */}
          <section className="mb-12">
            <h2 className="mb-6">Your Rights</h2>
            <p className="text-black/60 dark:text-white/60 leading-relaxed">
              If you've submitted personal information and would like it removed, updated, or reviewed, 
              you can contact us at:{' '}
              <a 
                href="mailto:info@brandonptdavis.com" 
                className="text-accent-brand hover:underline"
              >
                info@brandonptdavis.com
              </a>
            </p>
          </section>

          {/* Updates to This Policy */}
          <section className="mb-12">
            <h2 className="mb-6">Updates to This Policy</h2>
            <p className="text-black/60 dark:text-white/60 leading-relaxed">
              We may update this policy from time to time. Changes will be posted on this page with 
              the revised date.
            </p>
          </section>

          {/* Contact */}
          <section className="pt-12 border-t border-black/10 dark:border-white/10">
            <h2 className="mb-6">Contact</h2>
            <div className="space-y-2 text-black/60 dark:text-white/60">
              <p>Brandon PT Davis</p>
              <p>
                <a 
                  href="mailto:info@brandonptdavis.com" 
                  className="text-accent-brand hover:underline"
                >
                  info@brandonptdavis.com
                </a>
              </p>
              <p>
                <a 
                  href="https://www.brandonptdavis.com" 
                  className="text-accent-brand hover:underline"
                >
                  https://www.brandonptdavis.com
                </a>
              </p>
            </div>
          </section>

        </div>
      </div>
    </>
  );
}
