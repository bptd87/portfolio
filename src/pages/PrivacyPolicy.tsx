import { motion } from 'motion/react';
import { ArrowLeft, Shield } from 'lucide-react';
import { SEO } from '../components/SEO';
import { PAGE_METADATA } from '../utils/seo/metadata';
import { useTheme } from '../components/ThemeProvider';

interface PrivacyPolicyProps {
  onNavigate?: (page: string, slug?: string) => void;
}

export function PrivacyPolicy({ onNavigate }: PrivacyPolicyProps) {
  const { theme } = useTheme();
  const effectiveDate = "June 8, 2025";

  return (
    <>
      <SEO metadata={PAGE_METADATA['privacy-policy']} />

      <div
        className="min-h-screen bg-background text-foreground pt-32 pb-24"
        data-nav={theme === 'dark' ? 'dark' : 'light'}
      >
        <div className="max-w-4xl mx-auto px-6">

          {/* Back Navigation */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <button
              onClick={(e) => { e.preventDefault(); if (onNavigate) onNavigate('home'); else window.location.href = '/'; }}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </button>
          </motion.div>

          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-16 border-b border-border pb-12"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary rounded-full text-xs font-medium text-secondary-foreground mb-6">
              <Shield className="w-3 h-3" />
              <span>Legal Documentation</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display mb-6 tracking-tight">
              Privacy Policy
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed mb-8">
              Transparency is key. Here's how we collect, use, and protect your data when you visit our site.
            </p>

            <div className="flex items-center gap-4 text-sm font-mono text-muted-foreground uppercase tracking-wider">
              <span>Effective Date: {effectiveDate}</span>
              <span className="w-1 h-1 bg-border rounded-full" />
              <span>Version 2.0</span>
            </div>
          </motion.div>

          {/* Content Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-display prose-headings:font-normal prose-a:text-accent-brand prose-a:no-underline hover:prose-a:underline"
          >
            <p className="lead text-2xl text-foreground font-light mb-12">
              Brandon PT Davis ("we," "our," or "us") is committed to protecting your privacy.
              This Privacy Policy explains how we collect, use, and protect your information when you
              visit our website.
            </p>

            <section className="mb-12">
              <h2 className="text-3xl mb-6">Information We Collect</h2>
              <div className="grid md:grid-cols-2 gap-8 not-prose">
                <div className="p-6 bg-secondary/30 border border-border/50 rounded-lg">
                  <h3 className="text-lg font-medium mb-3 text-foreground">Personal Information</h3>
                  <p className="text-muted-foreground text-sm mb-4">Information you voluntarily provide to us.</p>
                  <ul className="space-y-2 text-sm text-foreground/80">
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 w-1 h-1 bg-accent-brand rounded-full" />
                      Name and email address via contact forms
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 w-1 h-1 bg-accent-brand rounded-full" />
                      Project collaboration inquiries
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 w-1 h-1 bg-accent-brand rounded-full" />
                      Newsletter subscriptions
                    </li>
                  </ul>
                </div>
                <div className="p-6 bg-secondary/30 border border-border/50 rounded-lg">
                  <h3 className="text-lg font-medium mb-3 text-foreground">Automated Information</h3>
                  <p className="text-muted-foreground text-sm mb-4">Data automatically collected when you visit.</p>
                  <ul className="space-y-2 text-sm text-foreground/80">
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 w-1 h-1 bg-accent-brand rounded-full" />
                      Browser type and device info
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 w-1 h-1 bg-accent-brand rounded-full" />
                      IP address and general location
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 w-1 h-1 bg-accent-brand rounded-full" />
                      Usage analytics (via Google Analytics)
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <h2>How We Use Your Information</h2>
            <p>
              We use the collected information primarily to improve your experience and communicate with you.
              Specific uses include:
            </p>
            <ul>
              <li>Responding to your inquiries or collaboration requests.</li>
              <li>Improving site performance, security, and user experience.</li>
              <li>Sending updates or newsletters (only if you have explicitly opted in).</li>
              <li>Troubleshooting technical issues and maintaining site security.</li>
            </ul>
            <p className="bg-secondary/20 p-4 border-l-2 border-accent-brand text-sm">
              <strong>Note:</strong> We do not sell, rent, or share your personal data with third parties for marketing purposes.
            </p>

            <h2>Third-Party Services & Cookies</h2>
            <p>
              This website uses third-party tools to enhance functionality. These may include:
            </p>
            <ul>
              <li><strong>Google Analytics:</strong> To understand site traffic and user behavior.</li>
              <li><strong>YouTube/Vimeo:</strong> To host and display video content.</li>
            </ul>
            <p>
              These services may use cookies and have their own privacy policies. You can manage your cookie preferences through your browser settings at any time.
            </p>

            <h2>Your Rights & Contact</h2>
            <p>
              You have the right to request access to, correction of, or deletion of your personal data.
              If you have any questions about this policy or our data practices, please contact us.
            </p>

            <div className="mt-8 not-prose">
              <a
                href="mailto:info@brandonptdavis.com"
                className="inline-flex items-center justify-center px-6 py-3 bg-foreground text-background font-medium hover:bg-foreground/90 transition-colors"
                style={{ borderRadius: 0 }}
              >
                Contact Privacy Team
              </a>
            </div>

            <div className="mt-16 pt-8 border-t border-border text-sm text-muted-foreground">
              <p>
                We may update this policy from time to time. Changes will be posted on this page with the revised date.
              </p>
            </div>
          </motion.div>

        </div>
      </div>
    </>
  );
}
