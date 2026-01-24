import React from 'react';
import { TutorialTemplate } from './TutorialTemplate';

interface Creating2DDraftingFrom3DModelProps {
  onNavigate: (page: string) => void;
}

export function Creating2DDraftingFrom3DModel({ onNavigate }: Creating2DDraftingFrom3DModelProps) {
  const tutorial = {
    title: 'Creating 2D Drafting from a 3D Model',
    description: 'Transform 3D models into construction-ready 2D drawings. Learn viewports, render styles, class organization, and professional documentation workflow.',
    category: '2D Drafting & Docs',
    duration: '25:05',
    publishDate: '2021-03-08',
    videoUrl: 'https://www.youtube.com/embed/Q-oM0jkKuS0',
    content: (
      <>
        <p>
          This tutorial demonstrates the complete workflow for converting 3D scenic models into clear, buildable 2D construction drawings. You'll learn how to create viewports, control line weights, organize classes, and export print-ready documentation.
        </p>

        <h2>Core Techniques</h2>
        <ul>
          <li>Hybrid symbols containing both 2D and 3D components</li>
          <li>Viewport creation from plan, elevation, and section views</li>
          <li>Hidden Line and Custom Renderworks rendering styles</li>
          <li>Section viewports with accurate cut directions</li>
          <li>Advanced properties for line weight separation</li>
          <li>Detail viewports using crop shapes for close-ups</li>
          <li>Dimension and label alignment using snapping tools</li>
          <li>2D human figures for scale reference</li>
          <li>Class-based styling for line weights and annotations</li>
          <li>PDF export using the Publish tool</li>
        </ul>

        <h2>Professional Workflow</h2>
        <p>
          The tutorial covers class organization strategies that keep your drawings manageable and consistent. By structuring your classes properly from the start, you can make global changes efficiently and maintain a professional standard across all documentation.
        </p>

        <h2>Viewport Types</h2>
        <ul>
          <li>Plan views for top-down layout</li>
          <li>Front elevations with controlled line weights</li>
          <li>Section cuts revealing interior construction</li>
          <li>Detail crops for complex joinery and decorative elements</li>
        </ul>

        <h2>From Design to Documentation</h2>
        <p>
          This workflow is designed for the transition from 3D concept modeling to traditional 2D drafting. The result is documentation that scenic shops can build from—clear dimensions, accurate details, professional presentation.
        </p>
      </>
    ),
    resources: [
      {
        name: 'Vectorworks Documentation Guide',
        description: 'Official Vectorworks guide for creating viewports and sheet layers.',
        url: 'https://app-help.vectorworks.net/'
      },
      {
        name: 'Custom Renderworks Styles',
        description: 'Download Brandon\'s custom render styles for clean drafting output.',
        url: 'https://www.vectorworks.net/'
      },
      {
        name: 'Class Organization Template',
        description: 'Pre-configured class structure for scenic design drafting.',
        url: 'https://www.vectorworks.net/'
      },
      {
        name: '2D Human Figures Library',
        description: 'Collection of scaled human figures for elevations and sections.',
        url: 'https://www.vectorworks.net/'
      }
    ],
    relatedTutorials: [
      {
        title: 'Creating Your First Scenic Model',
        slug: 'first-scenic-model',
        thumbnail: 'https://images.unsplash.com/photo-1558655146-d09347e92766?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHwzZCUyMG1vZGVsaW5nJTIwc29mdHdhcmV8ZW58MXx8fHwxNzYxNzI2MTAzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        duration: '24:15'
      },
      {
        title: 'Mastering 2D Drafting Tools',
        slug: 'mastering-2d-drafting',
        thumbnail: 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkcmFmdGluZyUyMGJsdWVwcmludCUyMGRlc2lnbnxlbnwxfHx8fDE3NjE3MjYxMDN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        duration: '18:45'
      },
      {
        title: 'Efficient Workflow Tips',
        slug: 'efficient-workflow-tips',
        thumbnail: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b3JrZmxvdyUyMHByb2R1Y3Rpdml0eXxlbnwxfHx8fDE3NjE3MjYxMDN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        duration: '15:20'
      }
    ]
  };

  return <TutorialTemplate onNavigate={onNavigate} tutorial={tutorial} />;
}
