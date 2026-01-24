import React from 'react';
import { TutorialTemplate } from './TutorialTemplate';

interface TrimProfilesPolylineProps {
  onNavigate: (page: string, slug?: string) => void;
}

export function TrimProfilesPolyline({ onNavigate }: TrimProfilesPolylineProps) {
  const tutorial = {
    slug: 'trim-profiles-polyline',
    title: 'Vectorworks Quick Tip: Creating Trim Profiles with the Polyline Tool',
    description: 'Learn how to trace and scale trim profiles in Vectorworks using the Polyline Tool. This tutorial covers vertex modes, symbol creation, and scaling based on real-world data for accurate 2D drafting in scenic design.',
    category: 'Quick Tips',
    thumbnail: 'https://img.youtube.com/vi/EZB5O-Wmsk4/maxresdefault.jpg',
    videoUrl: 'https://www.youtube.com/embed/EZB5O-Wmsk4',
    duration: '6:20',
    publishDate: '2021-01-31',
    content: (
      <>
        <p>
          In this tutorial, Brandon PT Davis—Theatrical Scenic Designer—demonstrates how to use the Polyline Tool in Vectorworks to trace and build accurate 2D trim profiles from real-world references. This workflow is ideal for scenic designers who want clean, scalable molding and architectural detail profiles for drafting or rendering.
        </p>

        <h2>The Process</h2>

        <p>
          The process begins by sourcing a profile image from <strong>udehome.com</strong>, a vendor that provides crown molding and base trim product images with scale dimensions. This tutorial walks you through the complete workflow:
        </p>

        <h3>Import and Setup</h3>
        <ul>
          <li>Download and import an image using <strong>File → Import → Image File</strong></li>
          <li>Choose between JPEG and PNG file types depending on file size and transparency needs</li>
          <li>Avoid pre-scaling imported images—instead, trace first, then scale</li>
        </ul>

        <h3>Tracing with the Polyline Tool</h3>
        <ul>
          <li>Use the <strong>Polyline Tool (5)</strong> with different vertex modes (<strong>U</strong> to toggle) to trace complex curves and contours</li>
          <li>Refine points using <strong>Add Vertex</strong>, <strong>Point on Arc</strong>, and <strong>Move Polygon Point</strong> tools for smoother curves and closer accuracy</li>
        </ul>

        <h3>Scaling and Symbol Creation</h3>

        <p>After tracing the trim shape:</p>

        <ul>
          <li>Scale the object using real-world height and width data from the vendor (e.g., 4" x 4")</li>
          <li>Convert the shape into a 2D Symbol using <strong>Cmd/Ctrl + K</strong>, name it "Crown Molding," and store it in the Resource Manager</li>
          <li>Set the object's class to "Section Hatch" for consistent styling and rendering</li>
        </ul>

        <h2>Why This Workflow Works</h2>

        <p>
          This efficient workflow creates clean, editable 2D symbols for consistent use in scenic sections and details. By sourcing manufacturer data and tracing accurately scaled profiles, you ensure your technical drawings reflect real-world materials—critical for accurate construction documentation.
        </p>

        {/* Key Concept Callout */}
        <div className="mt-12 p-6 border-l-2 border-accent-brand bg-accent-brand/5">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-accent-brand flex items-center justify-center flex-shrink-0 mt-1">
              <svg className="w-4 h-4 text-accent-brand-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm tracking-wider mb-2">KEY CONCEPT</h4>
              <p className="text-sm leading-relaxed opacity-80">
                Always trace the profile first, <em>then</em> scale it using real-world dimensions. If you try to scale the imported image before tracing, you risk distortion and measurement errors. The Object Info Palette is your friend for precise scaling after the fact.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Reference */}
        <div className="mt-16 pt-12 border-t border-border">
          <h3 className="mb-6">Quick Reference</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border border-border p-6">
              <h4 className="mb-4 text-sm uppercase tracking-wider text-muted-foreground">Essential Shortcuts</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center gap-4">
                  <span className="text-muted-foreground">Activate Polyline Tool</span>
                  <code className="px-2 py-1 bg-secondary text-sm border border-border whitespace-nowrap">5</code>
                </div>
                <div className="flex justify-between items-center gap-4">
                  <span className="text-muted-foreground">Cycle Vertex Modes</span>
                  <code className="px-2 py-1 bg-secondary text-sm border border-border whitespace-nowrap">U</code>
                </div>
                <div className="flex justify-between items-center gap-4">
                  <span className="text-muted-foreground">Create Symbol</span>
                  <code className="px-2 py-1 bg-secondary text-sm border border-border whitespace-nowrap">Cmd/Ctrl + K</code>
                </div>
              </div>
            </div>
            
            <div className="border border-border p-6">
              <h4 className="mb-4 text-sm uppercase tracking-wider text-muted-foreground">Workflow Steps</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-accent-brand mt-1">1.</span>
                  <span>Import reference image (JPEG or PNG)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent-brand mt-1">2.</span>
                  <span>Trace profile with Polyline Tool (toggle U)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent-brand mt-1">3.</span>
                  <span>Scale using vendor dimensions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent-brand mt-1">4.</span>
                  <span>Convert to Symbol and store in library</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border opacity-70">
          <p className="text-sm">
            <strong>Instructor:</strong> Brandon PT Davis<br />
            <strong>Software:</strong> Vectorworks<br />
            <strong>Skill Level:</strong> Intermediate
          </p>
        </div>
      </>
    ),
    resources: [
      {
        name: 'Watch on YouTube',
        description: 'Follow the complete polyline tracing and symbol creation workflow',
        url: 'https://youtu.be/EZB5O-Wmsk4'
      },
      {
        name: 'UDE Home (Trim Profiles)',
        description: 'Browse architectural trim profiles with dimensions for accurate modeling',
        url: 'https://udehome.com'
      }
    ],
    relatedTutorials: [
      {
        slug: 'creating-2d-drafting-from-3d-model',
        title: 'Creating 2D Drafting from a 3D Model',
        thumbnail: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&q=80',
        duration: '25:05'
      },
      {
        slug: 'custom-page-layouts',
        title: 'Vectorworks Quick Tip: Creating Custom Page Layouts',
        thumbnail: 'https://img.youtube.com/vi/Gd9_hB5USkQ/maxresdefault.jpg',
        duration: '3:36'
      }
    ]
  };

  return <TutorialTemplate tutorial={tutorial} onNavigate={onNavigate} />;
}
