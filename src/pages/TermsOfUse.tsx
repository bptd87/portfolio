import { motion } from 'motion/react';
import { ArrowLeft, FileText } from 'lucide-react';
import { SEO } from '../components/SEO';
import { PAGE_METADATA } from '../utils/seo/metadata';
import { useTheme } from '../components/ThemeProvider';

interface TermsOfUseProps {
  onNavigate?: (page: string, slug?: string) => void;
}

export function TermsOfUse({ onNavigate }: TermsOfUseProps) {
  const { theme } = useTheme();
  const effectiveDate = "July 5, 2025";

  return (
    <>
      <SEO metadata={PAGE_METADATA['terms-of-use']} />

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
              <FileText className="w-3 h-3" />
              <span>Legal Documentation</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display mb-6 tracking-tight">
              Terms of Use
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed mb-8">
              Rules of the road. By using our site, you agree to these terms and conditions.
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
              Welcome to brandonptdavis.com. By accessing or using this website, you agree to be bound by the following Terms of Use.
            </p>

            <h2>1. Use of Site</h2>
            <p>
              You may use this website for personal, non-commercial purposes related to viewing design work, reading blog content, and accessing resources.
              You agree not to use the site in any way that could harm, disable, or impair it.
            </p>

            <h2>2. Intellectual Property</h2>
            <p>
              All content on this website—including but not limited to text, images, renderings, and videos—is the intellectual property of Brandon PT Davis unless otherwise credited.
            </p>
            <div className="bg-secondary/30 p-6 border-l-2 border-foreground my-8 not-prose">
              <h4 className="font-display text-lg mb-2">Usage Rights</h4>
              <p className="text-muted-foreground">
                You may not reproduce, distribute, modify, or publicly display any content without prior written permission, except where materials are specifically marked as free to use.
              </p>
            </div>

            <h2>3. User Submissions</h2>
            <p>
              If you submit content to the site (e.g., via The Vault), you grant us a license to store, display, and share your submission with proper credit. You affirm that you own the rights to anything you submit.
            </p>

            <h2>4. Limitation of Liability</h2>
            <p>
              This site is provided "as is" without warranties of any kind. We are not liable for any damages arising from your use of the site, including errors, outages, or data loss.
            </p>

            <h2>5. Governing Law</h2>
            <p>
              These Terms are governed by the laws of the State of California, without regard to its conflict of law principles.
            </p>

            <div className="mt-16 pt-8 border-t border-border text-sm text-muted-foreground">
              <p>
                Last modification: {effectiveDate}
              </p>
            </div>
          </motion.div>

        </div>
      </div>
    </>
  );
}