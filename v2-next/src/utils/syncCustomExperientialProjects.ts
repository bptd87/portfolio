/**
 * Sync custom experiential projects with dedicated pages to the database
 * This adds RedLineCafe and SouthsideBethelBaptistChurch to the content manager
 */

import { projectId, publicAnonKey } from './supabase/info';

export async function syncCustomExperientialProjects(adminToken: string) {
  const customProjects = [
    {
      id: 'red-line-cafe',
      title: 'Red Line Café',
      slug: 'red-line-cafe',
      category: 'Experiential Design',
      subcategory: 'Interior Design',
      venue: 'Independent Project',
      location: 'Speculative Design',
      year: 2019,
      month: 1,
      featured: false,
      description: 'Speculative design for an urban café environment that integrates industrial aesthetics with intimate gathering space.',
      cardImage: 'https://zuycsuajiuqsvopiioer.supabase.co/storage/v1/object/public/portfolio/Red%20Line%20Cafe/Red%20Line%20Cafe%20-%20Vectorworks%20Rendering%20by%20Brandon%20PT%20Davis%20-%201.jpeg',
      
      // Experiential Design Template Fields
      clientName: 'Independent Project',
      role: 'Interior Designer & Concept Developer',
      duration: '3 Months',
      
      challenge: 'How do we create an urban café space that balances industrial authenticity with comfort, encouraging both quick coffee stops and extended community gathering?',
      
      solution: `The design embraces the raw industrial character of urban spaces while introducing warm materials and intimate zones that invite lingering. Exposed brick, steel, and concrete provide the structural vocabulary, while wood accents, soft lighting, and strategic planting create pockets of warmth.\n\nThe spatial layout accommodates diverse use patterns—counter service for quick visits, communal tables for working, and cozy corner seating for conversations. Large windows maintain connection to street life while interior depth provides acoustic privacy.`,
      
      keyFeatures: [
        {
          title: 'Industrial-Meets-Intimate Aesthetic',
          description: 'Raw materials like exposed brick and steel beams contrasted with warm wood tables and soft Edison bulb lighting.'
        },
        {
          title: 'Flexible Spatial Zones',
          description: 'Layout accommodates solo workers, small groups, and community events through adaptable furniture arrangements.'
        },
        {
          title: 'Urban Connection',
          description: 'Floor-to-ceiling windows and open facade design maintain visual dialogue with neighborhood streetscape.'
        }
      ],
      
      process: [
        {
          title: 'Concept Development',
          description: 'Initial research into urban café culture and analysis of successful third-place environments. Developed moodboards and spatial diagrams.',
          image: 'https://zuycsuajiuqsvopiioer.supabase.co/storage/v1/object/public/portfolio/Red%20Line%20Cafe/Red%20Line%20Cafe%20-%20Vectorworks%20Rendering%20by%20Brandon%20PT%20Davis%20-%201.jpeg'
        },
        {
          title: '3D Modeling & Rendering',
          description: 'Created detailed Vectorworks model exploring materiality, lighting, and spatial flow. Rendered multiple viewpoints to test design decisions.',
          image: 'https://zuycsuajiuqsvopiioer.supabase.co/storage/v1/object/public/portfolio/Red%20Line%20Cafe/Red%20Line%20Cafe%20-%20Vectorworks%20Rendering%20by%20Brandon%20PT%20Davis%20-%202.jpeg'
        },
        {
          title: 'Material & Lighting Study',
          description: 'Refined material palette and lighting design to balance industrial edge with inviting warmth.',
          image: 'https://zuycsuajiuqsvopiioer.supabase.co/storage/v1/object/public/portfolio/Red%20Line%20Cafe/Red%20Line%20Cafe%20-%20Vectorworks%20Rendering%20by%20Brandon%20PT%20Davis%20-%203.jpeg'
        }
      ],
      
      team: [
        { name: 'Brandon PT Davis', role: 'Designer & Renderer' }
      ],
      
      metrics: [],
      
      testimonial: undefined,
      
      experientialContent: [
        {
          type: 'heading',
          content: 'DESIGN RENDERINGS'
        },
        {
          type: 'gallery',
          images: [
            'https://zuycsuajiuqsvopiioer.supabase.co/storage/v1/object/public/portfolio/Red%20Line%20Cafe/Red%20Line%20Cafe%20-%20Vectorworks%20Rendering%20by%20Brandon%20PT%20Davis%20-%201.jpeg',
            'https://zuycsuajiuqsvopiioer.supabase.co/storage/v1/object/public/portfolio/Red%20Line%20Cafe/Red%20Line%20Cafe%20-%20Vectorworks%20Rendering%20by%20Brandon%20PT%20Davis%20-%202.jpeg',
            'https://zuycsuajiuqsvopiioer.supabase.co/storage/v1/object/public/portfolio/Red%20Line%20Cafe/Red%20Line%20Cafe%20-%20Vectorworks%20Rendering%20by%20Brandon%20PT%20Davis%20-%203.jpeg'
          ],
          captions: [
            'View from entrance showing bar area and seating zones',
            'Corner seating area with industrial details and warm lighting',
            'Overall spatial composition balancing openness and intimacy'
          ],
          layout: 'grid'
        },
        {
          type: 'heading',
          content: 'DESIGN PHILOSOPHY'
        },
        {
          type: 'text',
          content: 'This project explores how interior environments can serve as urban third places—spaces beyond home and work that foster community and belonging. The design language deliberately avoids trendy café clichés, instead seeking timeless industrial authenticity.\n\nBy revealing rather than concealing structural elements, the space celebrates its urban context. Materiality is honest and durable, suggesting permanence and authenticity in an era of temporary pop-ups. The result is a space that feels discovered rather than designed, authentic rather than contrived.'
        }
      ],
      
      tags: ['Interior Design', 'Café Design', 'Speculative Design', 'Urban Design', 'Vectorworks', 'Rendering'],
      
      credits: [
        { name: 'Brandon PT Davis', role: 'Designer & Renderer' }
      ],
      
      seoTitle: 'Red Line Cafe - Experiential Dining Space | Brandon PT Davis',
      seoDescription: 'Speculative design for an urban café environment that integrates industrial aesthetics with intimate gathering space.',
      seoKeywords: ['Red Line Cafe', 'experiential design', 'cafe design', 'interior design', 'Vectorworks', 'rendering'],
      ogImage: 'https://zuycsuajiuqsvopiioer.supabase.co/storage/v1/object/public/portfolio/Red%20Line%20Cafe/Red%20Line%20Cafe%20-%20Vectorworks%20Rendering%20by%20Brandon%20PT%20Davis%20-%201.jpeg',
      
      likes: 0,
      views: 0
    },
    {
      id: 'southside-bethel-baptist-church',
      title: 'Southside Bethel Baptist Church',
      slug: 'southside-bethel-baptist-church',
      category: 'Experiential Design',
      subcategory: 'Sacred Architecture',
      venue: 'Southside Bethel Baptist Church',
      location: 'Los Angeles, CA',
      year: 2020,
      month: 1,
      featured: false,
      description: 'Rendering project reimagining a historic church sanctuary, balancing reverence and functionality while modernizing the space for contemporary worship in a converted vaudeville theatre.',
      cardImage: 'https://zuycsuajiuqsvopiioer.supabase.co/storage/v1/object/public/portfolio/South%20Side%20Baptist%20Church/Southside%20Baptist%20Church%20-%20Vectorworks%20Rending%20by%20Brandon%20PT%20Davis%20-%204.jpeg',
      
      // Experiential Design Template Fields
      clientName: 'Southside Bethel Baptist Church',
      role: 'Interior Designer',
      duration: '4 Months',
      
      challenge: 'How do we honor the historic character of a converted vaudeville theatre while creating a sacred space that serves contemporary worship needs and fosters community connection?',
      
      solution: `The design approach respects the building's theatrical heritage while establishing clear sacred identity through material choices, lighting design, and spatial organization. Rather than erasing the vaudeville past, we layer sacred symbolism and functional worship elements onto the existing architecture.\n\nKey interventions include refined liturgical furnishings, upgraded lighting that supports both intimate worship and larger gatherings, improved acoustics, and accessible pathways that welcome all congregants. The design balances reverence with warmth, tradition with accessibility.`,
      
      keyFeatures: [
        {
          title: 'Sacred Layering in Theatrical Space',
          description: 'Design honors the vaudeville theatre bones while introducing liturgical elements—altar platform, choir placement, processional paths—that establish sacred character.'
        },
        {
          title: 'Community-Centered Layout',
          description: 'Seating arrangement and circulation paths foster connection between congregants while maintaining clear sightlines to liturgical focal points.'
        },
        {
          title: 'Lighting for Worship',
          description: 'Lighting design supports diverse worship modes—contemplative services, celebratory gatherings, community events—through flexible control systems.'
        },
        {
          title: 'Historic Preservation Sensitivity',
          description: 'All interventions designed to respect existing architectural fabric, avoiding permanent alterations to historic elements.'
        }
      ],
      
      process: [
        {
          title: 'Site Analysis & Documentation',
          description: 'Comprehensive documentation of existing conditions, including architectural details, lighting quality, acoustic properties, and circulation patterns.',
          image: 'https://zuycsuajiuqsvopiioer.supabase.co/storage/v1/object/public/portfolio/South%20Side%20Baptist%20Church/Southside%20Baptist%20Church%20-%20Vectorworks%20Rending%20by%20Brandon%20PT%20Davis%20-%204.jpeg'
        },
        {
          title: 'Concept Development',
          description: 'Developed multiple design schemes exploring different approaches to balancing theatrical heritage with sacred program needs.',
          image: 'https://zuycsuajiuqsvopiioer.supabase.co/storage/v1/object/public/portfolio/South%20Side%20Baptist%20Church/Southside%20Baptist%20Church%20-%20Vectorworks%20Rending%20by%20Brandon%20PT%20Davis%20-%201.jpeg'
        },
        {
          title: '3D Modeling & Visualization',
          description: 'Created detailed Vectorworks model for design testing and client presentations. Rendered multiple viewpoints to communicate spatial experience.',
          image: 'https://zuycsuajiuqsvopiioer.supabase.co/storage/v1/object/public/portfolio/South%20Side%20Baptist%20Church/Southside%20Baptist%20Church%20-%20Vectorworks%20Rending%20by%20Brandon%20PT%20Davis%20-%202.jpeg'
        },
        {
          title: 'Design Refinement',
          description: 'Refined material selections, lighting design, and furniture specifications based on client feedback and liturgical requirements.',
          image: 'https://zuycsuajiuqsvopiioer.supabase.co/storage/v1/object/public/portfolio/South%20Side%20Baptist%20Church/Southside%20Baptist%20Church%20-%20Vectorworks%20Rending%20by%20Brandon%20PT%20Davis%20-%203.jpeg'
        }
      ],
      
      team: [
        { name: 'Brandon PT Davis', role: 'Interior Designer' }
      ],
      
      metrics: [],
      
      testimonial: undefined,
      
      experientialContent: [
        {
          type: 'heading',
          content: 'DESIGN RENDERINGS'
        },
        {
          type: 'gallery',
          images: [
            'https://zuycsuajiuqsvopiioer.supabase.co/storage/v1/object/public/portfolio/South%20Side%20Baptist%20Church/Southside%20Baptist%20Church%20-%20Vectorworks%20Rending%20by%20Brandon%20PT%20Davis%20-%204.jpeg',
            'https://zuycsuajiuqsvopiioer.supabase.co/storage/v1/object/public/portfolio/South%20Side%20Baptist%20Church/Southside%20Baptist%20Church%20-%20Vectorworks%20Rending%20by%20Brandon%20PT%20Davis%20-%201.jpeg',
            'https://zuycsuajiuqsvopiioer.supabase.co/storage/v1/object/public/portfolio/South%20Side%20Baptist%20Church/Southside%20Baptist%20Church%20-%20Vectorworks%20Rending%20by%20Brandon%20PT%20Davis%20-%202.jpeg',
            'https://zuycsuajiuqsvopiioer.supabase.co/storage/v1/object/public/portfolio/South%20Side%20Baptist%20Church/Southside%20Baptist%20Church%20-%20Vectorworks%20Rending%20by%20Brandon%20PT%20Davis%20-%203.jpeg'
          ],
          captions: [
            'View toward altar platform showing liturgical focus and seating arrangement',
            'Side view revealing architectural details and lighting design',
            'Perspective from congregation showing spatial warmth and sacred character',
            'Detail of altar area with updated furnishings and lighting'
          ],
          layout: 'grid'
        },
        {
          type: 'heading',
          content: 'DESIGN APPROACH'
        },
        {
          type: 'text',
          content: 'Sacred architecture carries the weight of tradition while serving the evolving needs of living communities. This project explores that tension—how do we create spaces that feel both timeless and contemporary, reverential and welcoming?\n\nThe design strategy acknowledges the building\'s theatrical origins as part of its story rather than something to overcome. Vaudeville theatres were gathering places, sites of community and shared experience. That spirit aligns with congregational worship. By preserving theatrical elements while introducing sacred markers—liturgical furnishings, processional paths, symbolic lighting—we create layered meaning that honors both histories.'
        }
      ],
      
      tags: ['Sacred Architecture', 'Church Design', 'Interior Design', 'Historic Preservation', 'Vectorworks', 'Rendering'],
      
      credits: [
        { name: 'Brandon PT Davis', role: 'Interior Designer' },
        { name: 'Southside Bethel Baptist Church', role: 'Client' }
      ],
      
      seoTitle: 'Southside Bethel Baptist Church - Sacred Architecture | Brandon PT Davis',
      seoDescription: 'Rendering project reimagining a historic church sanctuary, balancing reverence and functionality while modernizing the space for contemporary worship in a converted vaudeville theatre.',
      seoKeywords: ['church design', 'sacred architecture', 'sanctuary rendering', 'Vectorworks', 'worship space', 'interior design', 'religious architecture'],
      ogImage: 'https://zuycsuajiuqsvopiioer.supabase.co/storage/v1/object/public/portfolio/South%20Side%20Baptist%20Church/Southside%20Baptist%20Church%20-%20Vectorworks%20Rending%20by%20Brandon%20PT%20Davis%20-%204.jpeg',
      
      likes: 0,
      views: 0
    }
  ];

  const results = {
    success: 0,
    failed: 0,
    errors: [] as string[]
  };

  for (const project of customProjects) {
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
          body: JSON.stringify(project)
        }
      );

      const data = await response.json();
      
      if (data.success) {
        results.success++;
        console.log(`✅ Synced: ${project.title}`);
      } else {
        results.failed++;
        results.errors.push(`${project.title}: ${data.error}`);
        console.error(`❌ Failed to sync ${project.title}:`, data.error);
      }
    } catch (error) {
      results.failed++;
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      results.errors.push(`${project.title}: ${errorMsg}`);
      console.error(`❌ Error syncing ${project.title}:`, error);
    }
  }

  return results;
}
