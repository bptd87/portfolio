import React from 'react';
import { TutorialTemplate } from './TutorialTemplate';

interface CameraToolRenderingProps {
  onNavigate: (page: string, slug?: string) => void;
}

export function CameraToolRendering({ onNavigate }: CameraToolRenderingProps) {
  const tutorial = {
    slug: 'camera-tool-rendering',
    title: 'Vectorworks Quick Tips: Camera Tool and Rendering',
    description: 'Learn how to light, frame, and render your 3D model in Vectorworks using cameras and Renderworks styles. This quick tutorial covers spotlight setup, camera views, and exporting high-quality image files for presentations.',
    category: 'Quick Tips',
    thumbnail: 'https://img.youtube.com/vi/Jp4eG5n3esc/maxresdefault.jpg',
    videoUrl: 'https://www.youtube.com/embed/Jp4eG5n3esc',
    duration: '10:45',
    publishDate: '2025-05-21',
    content: (
      <>
        <p>
          In this Vectorworks Quick Tip, Brandon PT Davis—Theatrical Scenic Designer—demonstrates how to set up a camera and lighting system for rendering a 3D model in Vectorworks. Whether you're preparing scenic models for presentations, drafting plates, or design lookbooks, this fast and functional method helps you produce clean, stylized renderings directly from the design layer.
        </p>

        <h2>Complete Rendering Workflow</h2>

        <p>This tutorial demonstrates a professional rendering workflow using only built-in Vectorworks tools. You'll learn how to set up virtual lighting, position cameras, apply render styles, and export high-resolution images suitable for presentations, portfolios, and client reviews.</p>

        <h3>Lighting Setup</h3>
        <ul>
          <li>Insert and aim spotlights using the Visualization Tool Palette</li>
          <li>Set up layered lighting with a white key light for primary illumination</li>
          <li>Add dramatic color accents (pink and blue) for theatrical contrast</li>
          <li>Place spotlights at 90° tilt to simulate overhead stage lighting</li>
        </ul>

        <h3>Camera Configuration</h3>
        <ul>
          <li>Switch from orthographic to perspective view for realistic depth</li>
          <li>Use the Camera Tool to define a 16:9 frame (cinematic ratio: 1.78:1)</li>
          <li>Fine-tune camera positioning with the Walkthrough Tool and Flyover Tool</li>
          <li>Create a linked viewport from the camera for sheet layer rendering</li>
        </ul>

        <h3>Rendering & Export</h3>
        <ul>
          <li>Apply Renderworks Style (Realistic Final for quality, Fast for preview)</li>
          <li>Export the finished rendering as a high-resolution image</li>
          <li>Use 120 DPI or higher for clean presentation-ready outputs</li>
        </ul>

        {/* Pro Tip Callout */}
        <div className="mt-12 p-6 border-l-2 border-accent-brand bg-accent-brand/5">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-accent-brand flex items-center justify-center flex-shrink-0 mt-1">
              <svg className="w-4 h-4 text-accent-brand-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm tracking-wider mb-2">PRO TIP</h4>
              <p className="text-sm leading-relaxed opacity-80">
                Link your camera to the viewport so updates reflect instantly. This allows you to adjust framing, test different angles, and see results in real-time without re-creating the viewport each time.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Reference */}
        <div className="mt-16 pt-12 border-t border-border">
          <h3 className="mb-6">Quick Reference</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border border-border p-6">
              <h4 className="mb-4 text-sm uppercase tracking-wider text-muted-foreground">Essential Tools</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-start gap-4">
                  <span className="text-muted-foreground">Visualization Palette</span>
                  <span className="text-right">Insert lights & cameras</span>
                </div>
                <div className="flex justify-between items-start gap-4">
                  <span className="text-muted-foreground">Camera Tool</span>
                  <span className="text-right">Define 16:9 frame</span>
                </div>
                <div className="flex justify-between items-start gap-4">
                  <span className="text-muted-foreground">Walkthrough Tool</span>
                  <span className="text-right">Adjust positioning</span>
                </div>
              </div>
            </div>
            
            <div className="border border-border p-6">
              <h4 className="mb-4 text-sm uppercase tracking-wider text-muted-foreground">Recommended Settings</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-start gap-4">
                  <span className="text-muted-foreground">Aspect Ratio</span>
                  <span className="text-right">1.78:1 (16:9)</span>
                </div>
                <div className="flex justify-between items-start gap-4">
                  <span className="text-muted-foreground">Export Resolution</span>
                  <span className="text-right">120 DPI minimum</span>
                </div>
                <div className="flex justify-between items-start gap-4">
                  <span className="text-muted-foreground">Spotlight Angle</span>
                  <span className="text-right">90° tilt (overhead)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border opacity-70">
          <p className="text-sm">
            <strong>Instructor:</strong> Brandon PT Davis<br />
            <strong>Software:</strong> Vectorworks<br />
            <strong>Skill Level:</strong> Beginner to Intermediate
          </p>
        </div>
      </>
    ),
    resources: [
      {
        name: 'Watch on YouTube',
        description: 'Follow along with the full step-by-step camera and rendering tutorial',
        url: 'https://youtu.be/Jp4eG5n3esc'
      }
    ],
    relatedTutorials: [
      {
        slug: 'custom-page-layouts',
        title: 'Vectorworks Quick Tip: Creating Custom Page Layouts',
        thumbnail: 'https://img.youtube.com/vi/Gd9_hB5USkQ/maxresdefault.jpg',
        duration: '3:36'
      },
      {
        slug: 'creating-2d-drafting-from-3d-model',
        title: 'Creating 2D Drafting from a 3D Model',
        thumbnail: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&q=80',
        duration: '25:05'
      }
    ]
  };

  return <TutorialTemplate tutorial={tutorial} onNavigate={onNavigate} />;
}
