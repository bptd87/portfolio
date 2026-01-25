import { motion } from 'motion/react';
import { ArrowLeft, User, Eye, Keyboard } from 'lucide-react';
import { SEO } from '../components/SEO';
import { PAGE_METADATA } from '../utils/seo/metadata';

interface AccessibilityProps {
  onNavigate?: (page: string, slug?: string) => void;
}

export function Accessibility({ onNavigate }: AccessibilityProps) {
  const effectiveDate = "January 22, 2026";

  return (
    <>
      <SEO metadata={PAGE_METADATA['accessibility']} />

      <div className="min-h-screen bg-background text-foreground pt-32 pb-24">
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
              <User className="w-3 h-3" />
              <span>Inclusivity & Access</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display mb-6 tracking-tight">
              Accessibility
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed mb-8">
              Design is for everyone. I am committed to making this website inclusive and accessible to all users.
            </p>

            <div className="flex items-center gap-4 text-sm font-mono text-muted-foreground uppercase tracking-wider">
              <span>Effective Date: {effectiveDate}</span>
              <span className="w-1 h-1 bg-border rounded-full" />
              <span>WCAG 2.1 Level AA</span>
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
              My goal is to provide a website that is usable and welcoming for everyone, regardless of ability or technology.
            </p>

            <div className="grid md:grid-cols-2 gap-6 my-12 not-prose">
              <div className="p-6 bg-secondary/30 rounded-lg border border-border/50">
                <div className="bg-background rounded-full w-10 h-10 flex items-center justify-center mb-4">
                  <Eye className="w-5 h-5 text-accent-brand" />
                </div>
                <h3 className="text-lg font-medium mb-2">Visual Clarity</h3>
                <p className="text-sm text-muted-foreground">High contrast text, descriptive alt text for images, and scalable typography.</p>
              </div>
              <div className="p-6 bg-secondary/30 rounded-lg border border-border/50">
                <div className="bg-background rounded-full w-10 h-10 flex items-center justify-center mb-4">
                  <Keyboard className="w-5 h-5 text-accent-brand" />
                </div>
                <h3 className="text-lg font-medium mb-2">Navigation</h3>
                <p className="text-sm text-muted-foreground">Keyboard-accessible menus, logical tab order, and clear focus indicators.</p>
              </div>
            </div>

            <h2>What I'm Doing</h2>
            <p>
              This website follows the Web Content Accessibility Guidelines (WCAG) 2.1 standards. Current efforts include:
            </p>
            <ul>
              <li>Semantic HTML structure for screen readers.</li>
              <li>Aria labels for interactive elements without visible text.</li>
              <li>Consistent navigation and layout across all pages.</li>
              <li>Testing with different browsers and devices.</li>
            </ul>

            <h2>Known Limitations</h2>
            <p>
              While I strive for full accessibility, some legacy content or third-party integrations (like video players) may have limitations. I am actively working to improve these areas.
            </p>

            <h2>Feedback & Support</h2>
            <p>
              If you encounter any barriers or have suggestions for improvement, please reach out. I value your feedback and will work to address any issues promptly.
            </p>

            <div className="mt-8 not-prose">
              <a
                href="mailto:info@brandonptdavis.com"
                className="inline-flex items-center justify-center px-6 py-3 bg-foreground text-background font-medium hover:bg-foreground/90 transition-colors"
                style={{ borderRadius: 0 }}
              >
                Report an Issue
              </a>
            </div>

            <div className="mt-16 pt-8 border-t border-border text-sm text-muted-foreground">
              <p>
                Response time target: 2 business days.
              </p>
            </div>
          </motion.div>

        </div>
      </div>
    </>
  );
}
