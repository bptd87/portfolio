/**
 * Sample Experiential Design Project
 * This demonstrates the new agency-flavored experiential design template
 */

import { projectId, publicAnonKey } from './supabase/info';

export async function addSampleExperientialProject(adminToken: string) {
  const sampleProject = {
    id: 'experiential-immersive-worlds-2024',
    title: 'Immersive Worlds: A Multi-Sensory Brand Experience',
    slug: 'immersive-worlds-brand-experience',
    category: 'Experiential Design',
    subcategory: 'Brand Activation',
    venue: 'Metropolitan Convention Center',
    location: 'New York, NY',
    year: 2024,
    month: 6,
    featured: true,
    description: 'A groundbreaking multi-sensory brand activation that transported 10,000+ attendees through immersive storytelling environments, combining physical sets, projection mapping, and interactive installations.',
    cardImage: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200',
    
    // New Experiential Design Template Fields
    clientName: 'Global Tech Innovations',
    role: 'Lead Experience Designer & Creative Director',
    duration: '6 Months',
    
    challenge: 'How do we transform a traditional product launch into an unforgettable brand experience that resonates with both industry professionals and consumers, while driving measurable engagement across multiple demographics?',
    
    solution: `We designed a 15,000 sq ft immersive journey divided into five distinct experiential zones, each telling a chapter of the brand's innovation story. The experience combined physical scenic design, cutting-edge projection mapping, interactive installations, and carefully choreographed lighting to create emotional moments that connected visitors to the brand's core values.\n\nOur approach prioritized accessibility and flow, ensuring that the experience could accommodate high traffic while maintaining intimacy and impact. Each zone featured multiple interaction points, allowing visitors to engage at their own pace and level of comfort.`,
    
    keyFeatures: [
      {
        title: 'Multi-Sensory Storytelling',
        description: 'Five interconnected zones featuring synchronized projection mapping, spatial audio design, and environmental effects that created a cohesive narrative journey.'
      },
      {
        title: 'Adaptive Technology Integration',
        description: 'RFID-enabled visitor tracking allowed personalized experiences while providing valuable analytics on engagement patterns and dwell time.'
      },
      {
        title: 'Sustainable Design Practices',
        description: 'All scenic elements were built using modular, reusable components with 85% of materials recycled or repurposed post-event.'
      },
      {
        title: 'Inclusive Experience Design',
        description: 'Universal design principles ensured accessibility for visitors of all abilities, with tactile elements, audio descriptions, and wheelchair-friendly pathways.'
      }
    ],
    
    process: [
      {
        title: 'Discovery & Concepting',
        description: 'Collaborative workshops with stakeholders to define brand objectives, audience personas, and experience goals. Developed initial concept sketches and spatial planning studies.',
        image: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800'
      },
      {
        title: 'Design Development',
        description: 'Created detailed 3D renderings, technical drawings, and material specifications. Prototyped key interactive elements to test user engagement and technical feasibility.',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'
      },
      {
        title: 'Technical Integration',
        description: 'Coordinated with lighting designers, projection specialists, and audio engineers to integrate all technical systems. Developed content for 12 projectors and 40+ lighting fixtures.',
        image: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=800'
      },
      {
        title: 'Fabrication & Installation',
        description: 'Oversaw construction of custom scenic elements, supervised installation, and conducted extensive testing of all interactive systems before soft opening.',
        image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800'
      },
      {
        title: 'Opening & Operations',
        description: 'Managed opening day operations and gathered real-time feedback for adjustments. Provided training for experience guides and technical support staff.',
        image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800'
      }
    ],
    
    team: [
      { name: 'Brandon PT Davis', role: 'Lead Experience Designer' },
      { name: 'Sarah Chen', role: 'Technical Director' },
      { name: 'Marcus Johnson', role: 'Lighting Designer' },
      { name: 'Elena Rodriguez', role: 'Projection Designer' },
      { name: 'Alex Kim', role: 'Interactive Developer' },
      { name: 'Jordan Taylor', role: 'Production Manager' },
      { name: 'Samira Patel', role: 'Sound Designer' },
      { name: 'Chris Anderson', role: 'Fabrication Lead' },
      { name: 'Maya Williams', role: 'Content Strategist' }
    ],
    
    metrics: [
      { value: '10,000+', label: 'VISITORS' },
      { value: '27 min', label: 'AVG DWELL TIME' },
      { value: '94%', label: 'SATISFACTION RATE' }
    ],
    
    testimonial: {
      quote: 'This experience exceeded every expectation. Brandon and the team transformed our vision into something truly magical that resonated deeply with our audience. The attention to detail and commitment to creating meaningful interactions was evident in every element.',
      author: 'Jennifer Martinez',
      role: 'VP of Brand Experience, Global Tech Innovations'
    },
    
    // Additional content blocks (blog-style)
    content: [
      {
        type: 'heading',
        content: 'PHOTO GALLERY'
      },
      {
        type: 'gallery',
        images: [
          'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800',
          'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800',
          'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800',
          'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800'
        ],
        captions: [
          'Entry portal with dynamic projection mapping',
          'Central interactive installation with touch-responsive LED walls',
          'Immersive tunnel experience with synchronized lighting',
          'Final reveal space with 360° projection environment'
        ],
        layout: 'grid'
      },
      {
        type: 'heading',
        content: 'DESIGN PHILOSOPHY'
      },
      {
        type: 'text',
        content: 'Our design philosophy centered on creating moments of wonder that feel both technologically advanced and deeply human. Rather than overwhelming visitors with technology for technology\'s sake, we carefully crafted each interaction to serve the emotional narrative.\n\nThe spatial design drew inspiration from theatrical stagecraft, using forced perspective, layered depth, and carefully controlled sightlines to guide visitors through the journey. Each zone transition was designed as a "scene change," complete with lighting and audio cues that signaled shifts in mood and narrative tone.'
      }
    ],
    
    tags: ['Brand Activation', 'Immersive Design', 'Projection Mapping', 'Interactive Installation', 'Experience Design', 'Sustainable Design', 'Multi-Sensory', 'Corporate Events'],
    
    // SEO fields
    seoTitle: 'Immersive Worlds Brand Experience | Brandon PT Davis',
    seoDescription: 'A multi-sensory brand activation featuring immersive storytelling environments, projection mapping, and interactive installations that engaged 10,000+ visitors.',
    seoKeywords: ['experiential design', 'brand activation', 'immersive experience', 'projection mapping', 'interactive installation'],
    ogImage: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200',
    
    // Engagement
    likes: 0,
    views: 0,
    
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  try {
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/admin/projects`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'X-Admin-Token': adminToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sampleProject)
      }
    );

    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Sample experiential project created successfully!');
      console.log('   Project ID:', data.projectId);
      return { success: true, projectId: data.projectId };
    } else {
      console.error('❌ Failed to create sample project:', data.error);
      return { success: false, error: data.error };
    }
  } catch (error) {
    console.error('❌ Error creating sample project:', error);
    return { success: false, error: String(error) };
  }
}