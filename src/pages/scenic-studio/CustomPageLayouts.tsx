import React from 'react';
import { TutorialTemplate } from './TutorialTemplate';

interface CustomPageLayoutsProps {
  onNavigate: (page: string, slug?: string) => void;
}

export function CustomPageLayouts({ onNavigate }: CustomPageLayoutsProps) {
  const tutorial = {
    slug: 'custom-page-layouts',
    title: 'Vectorworks Quick Tip: Creating Custom Page Layouts',
    description: 'Learn how to set up a 24x36 sheet layer and export it to PDF in Vectorworks—without Adobe PDF or a plotter. Ideal for printing scenic drafting plates on standard systems.',
    category: 'Quick Tips',
    thumbnail: 'https://img.youtube.com/vi/Gd9_hB5USkQ/maxresdefault.jpg',
    videoUrl: 'https://www.youtube.com/embed/Gd9_hB5USkQ',
    duration: '3:36',
    publishDate: '2021-02-28',
    content: (
      <>
        <p>
          In this quick tutorial, Brandon PT Davis—Theatrical Scenic Designer—demonstrates how to create a 24x36 sheet layer in Vectorworks even if you don't have Adobe PDF or a connected plotter. This is especially helpful when using default print drivers like Microsoft Print to PDF or when working remotely without access to your typical print setup.
        </p>

        <h2>Step-by-Step Workflow</h2>

        <h3>1. Create a New Sheet Layer</h3>
        <ul>
          <li>Go to your <strong>Navigation Palette</strong> → Right-click → New Sheet Layer</li>
          <li>Name it and assign a sheet title</li>
        </ul>

        <h3>2. Set Up the Page</h3>
        <ul>
          <li>Go to <strong>File → Page Setup</strong></li>
          <li>Under printer options (e.g., Microsoft Print to PDF), uncheck "Choose available print sizes"</li>
          <li>Manually select <strong>ARCH D (24" x 36")</strong> or note the custom page dimensions</li>
          <li>Confirm that <strong>Show Page Breaks</strong> is enabled if you want to visualize how Vectorworks interprets print pages (8.5x11 tiling)</li>
        </ul>

        <h3>3. Layout Your Drawing</h3>
        <ul>
          <li>Add your viewports, title block, and annotations to the sheet layer</li>
          <li>Use the rectangle tool or guidelines to confirm your layout falls within the page edges</li>
        </ul>

        <h3>4. Export Your Sheet</h3>
        <ul>
          <li>Go to <strong>File → Publish</strong></li>
          <li>Add the sheet you just created</li>
          <li>Set format to <strong>PDF</strong></li>
          <li>Under Options, select "Export the whole printable area as one page"</li>
          <li>Click <strong>Publish</strong> and save the output</li>
        </ul>

        <h2>Why This Matters</h2>

        <p>
          This method guarantees a clean, single-sheet 24x36 PDF output—even without Adobe PDF or a large-format printer driver installed. It's particularly valuable for students, freelancers, or designers working from home who need professional-grade outputs without expensive print infrastructure.
        </p>

        {/* Important Callout */}
        <div className="mt-12 p-6 border-l-2 border-accent-brand bg-accent-brand/5">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-accent-brand flex items-center justify-center flex-shrink-0 mt-1">
              <svg className="w-4 h-4 text-accent-brand-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm tracking-wider mb-2">IMPORTANT</h4>
              <p className="text-sm leading-relaxed opacity-80">
                When using File → Publish, make sure to select "Export the whole printable area as one page" under Options. Otherwise, Vectorworks will tile your 24x36 sheet across multiple 8.5x11 pages, which defeats the purpose of this workflow.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Reference */}
        <div className="mt-16 pt-12 border-t border-border">
          <h3 className="mb-6">Quick Reference</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border border-border p-6">
              <h4 className="mb-4 text-sm uppercase tracking-wider text-muted-foreground">Common Page Sizes</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center gap-4">
                  <span className="text-muted-foreground">ARCH D</span>
                  <code className="px-2 py-1 bg-secondary text-sm border border-border whitespace-nowrap">24" × 36"</code>
                </div>
                <div className="flex justify-between items-center gap-4">
                  <span className="text-muted-foreground">ARCH E</span>
                  <code className="px-2 py-1 bg-secondary text-sm border border-border whitespace-nowrap">36" × 48"</code>
                </div>
                <div className="flex justify-between items-center gap-4">
                  <span className="text-muted-foreground">ANSI D</span>
                  <code className="px-2 py-1 bg-secondary text-sm border border-border whitespace-nowrap">22" × 34"</code>
                </div>
              </div>
            </div>
            
            <div className="border border-border p-6">
              <h4 className="mb-4 text-sm uppercase tracking-wider text-muted-foreground">Workflow Checklist</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-accent-brand mt-1">✓</span>
                  <span>Create new sheet layer with descriptive name</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent-brand mt-1">✓</span>
                  <span>Uncheck "Choose available print sizes"</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent-brand mt-1">✓</span>
                  <span>Select ARCH D or custom dimensions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent-brand mt-1">✓</span>
                  <span>Use Publish with "whole printable area"</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border opacity-70">
          <p className="text-sm">
            <strong>Instructor:</strong> Brandon PT Davis<br />
            <strong>Software:</strong> Vectorworks<br />
            <strong>Skill Level:</strong> Beginner
          </p>
        </div>
      </>
    ),
    resources: [
      {
        name: 'Watch on YouTube',
        description: 'See the complete page setup and PDF export process',
        url: 'https://youtu.be/Gd9_hB5USkQ'
      }
    ],
    relatedTutorials: [
      {
        slug: 'camera-tool-rendering',
        title: 'Vectorworks Quick Tips: Camera Tool and Rendering',
        thumbnail: 'https://img.youtube.com/vi/Jp4eG5n3esc/maxresdefault.jpg',
        duration: '10:45'
      },
      {
        slug: 'trim-profiles-polyline',
        title: 'Creating Trim Profiles with the Polyline Tool',
        thumbnail: 'https://img.youtube.com/vi/EZB5O-Wmsk4/maxresdefault.jpg',
        duration: '6:20'
      }
    ]
  };

  return <TutorialTemplate tutorial={tutorial} onNavigate={onNavigate} />;
}
