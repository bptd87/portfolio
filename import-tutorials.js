
const fetch = require('node-fetch'); // Assuming node-fetch is available or using native fetch in newer Node

const projectId = "zuycsuajiuqsvopiioer";
const publicAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1eWNzdWFqaXVxc3ZvcGlpb2VyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4Mzk1ODUsImV4cCI6MjA3NzQxNTU4NX0.y7C3gkxAXQvOLRdaebj_3MRww2QjaN9fA2sCUzsdhEM";

const TUTORIALS = [
  {
    id: 'creating-2d-drafting-from-3d-model',
    slug: 'creating-2d-drafting-from-3d-model',
    title: 'Vectorworks Tutorial: Creating 2D Drafting from a 3D Model',
    description: 'Complete process of turning a 3D model into clear 2D drafting for construction drawings. Learn viewports, rendering styles, and professional documentation.',
    category: '2d-drafting',
    duration: '25:05',
    thumbnail: 'https://img.youtube.com/vi/Q-oM0jkKuS0/maxresdefault.jpg',
    videoUrl: 'https://www.youtube.com/embed/Q-oM0jkKuS0',
    publishDate: '2021-03-08',
    resources: [
      {
        name: 'Watch on YouTube',
        description: 'Full tutorial video with timestamps and comments',
        url: 'https://youtu.be/Q-oM0jkKuS0'
      }
    ],
    relatedTutorials: [
      {
        title: 'Camera Tool and Rendering',
        slug: 'camera-tool-rendering',
        thumbnail: 'https://img.youtube.com/vi/Jp4eG5n3esc/maxresdefault.jpg',
        duration: '10:45'
      },
      {
        title: 'Custom Page Layouts',
        slug: 'custom-page-layouts',
        thumbnail: 'https://img.youtube.com/vi/Gd9_hB5USkQ/maxresdefault.jpg',
        duration: '3:36'
      }
    ]
  },
  {
    id: 'footloose-walkthrough',
    slug: 'footloose-walkthrough',
    title: 'Footloose (2024) Scenic Design Walkthrough – Stephens College | Vectorworks + Twinmotion',
    description: 'Go behind the scenes of my 2024 scenic design for Footloose at Stephens College. Built in Vectorworks and rendered in Twinmotion, this walkthrough explores how movement and energy informed each design choice.',
    category: 'walkthroughs',
    duration: '1:20',
    thumbnail: 'https://img.youtube.com/vi/9CgllDnbSHU/maxresdefault.jpg',
    videoUrl: 'https://www.youtube.com/embed/9CgllDnbSHU',
    publishDate: '2025-05-21',
    resources: [
      {
        name: 'Watch on YouTube',
        description: 'Full Footloose walkthrough with design commentary',
        url: 'https://youtu.be/9CgllDnbSHU'
      }
    ]
  },
  {
    id: 'coraline-walkthrough',
    slug: 'coraline-walkthrough',
    title: 'The Coraline Experience: Twinmotion Walkthrough of the Other World',
    description: 'Explore the Other World in this Twinmotion walkthrough of The Coraline Experience, a collaborative MFA Design project at UC Irvine that brought together scenic, lighting, costume, sound, and stage management.',
    category: 'walkthroughs',
    duration: '2:10',
    thumbnail: 'https://img.youtube.com/vi/fazgboSnrQc/maxresdefault.jpg',
    videoUrl: 'https://www.youtube.com/embed/fazgboSnrQc',
    publishDate: '2025-05-21',
    resources: [
      {
        name: 'Watch on YouTube',
        description: 'Full Coraline Experience walkthrough',
        url: 'https://youtu.be/fazgboSnrQc'
      }
    ]
  },
  {
    id: 'lysistrata-walkthrough',
    slug: 'lysistrata-walkthrough',
    title: 'Lysistrata (2021) Scenic Design – Outdoor Theatre During COVID',
    description: 'An outdoor production reimagined for a pandemic era—this scenic design for Lysistrata balanced ancient ritual with contemporary safety.',
    category: 'walkthroughs',
    duration: '1:45',
    thumbnail: 'https://img.youtube.com/vi/ZjGy_3Ipk_w/maxresdefault.jpg',
    videoUrl: 'https://www.youtube.com/embed/ZjGy_3Ipk_w',
    publishDate: '2025-05-21',
    resources: [
      {
        name: 'Watch on YouTube',
        description: 'Full Lysistrata design walkthrough',
        url: 'https://youtu.be/ZjGy_3Ipk_w'
      }
    ]
  },
  {
    id: 'camera-tool-rendering',
    slug: 'camera-tool-rendering',
    title: 'Vectorworks Quick Tips: Camera Tool and Rendering',
    description: 'Learn how to light, frame, and render your 3D model in Vectorworks using cameras and Renderworks styles. This quick tutorial covers spotlight setup, camera views, and exporting high-quality image files for presentations.',
    category: 'quick-tips',
    duration: '10:45',
    thumbnail: 'https://img.youtube.com/vi/Jp4eG5n3esc/maxresdefault.jpg',
    videoUrl: 'https://www.youtube.com/embed/Jp4eG5n3esc',
    publishDate: '2025-05-21',
    resources: [
      {
        name: 'Watch on YouTube',
        description: 'Follow along with the full step-by-step camera and rendering tutorial',
        url: 'https://youtu.be/Jp4eG5n3esc'
      }
    ],
    relatedTutorials: [
      {
        title: 'Custom Page Layouts',
        slug: 'custom-page-layouts',
        thumbnail: 'https://img.youtube.com/vi/Gd9_hB5USkQ/maxresdefault.jpg',
        duration: '3:36'
      },
      {
        title: 'Creating 2D Drafting from 3D Model',
        slug: 'creating-2d-drafting-from-3d-model',
        thumbnail: 'https://img.youtube.com/vi/Q-oM0jkKuS0/maxresdefault.jpg',
        duration: '25:05'
      }
    ]
  },
  {
    id: 'custom-page-layouts',
    slug: 'custom-page-layouts',
    title: 'Vectorworks Quick Tip: Creating Custom Page Layouts',
    description: 'Learn how to set up a 24x36 sheet layer and export it to PDF in Vectorworks—without Adobe PDF or a plotter. Ideal for printing scenic drafting plates on standard systems.',
    category: 'quick-tips',
    duration: '3:36',
    thumbnail: 'https://img.youtube.com/vi/Gd9_hB5USkQ/maxresdefault.jpg',
    videoUrl: 'https://www.youtube.com/embed/Gd9_hB5USkQ',
    publishDate: '2021-02-28',
    resources: [
      {
        name: 'Watch on YouTube',
        description: 'Quick tip on custom page layouts',
        url: 'https://youtu.be/Gd9_hB5USkQ'
      }
    ],
    relatedTutorials: [
      {
        title: 'Creating 2D Drafting from 3D Model',
        slug: 'creating-2d-drafting-from-3d-model',
        thumbnail: 'https://img.youtube.com/vi/Q-oM0jkKuS0/maxresdefault.jpg',
        duration: '25:05'
      },
      {
        title: 'Trim Profiles with Polyline Tool',
        slug: 'trim-profiles-polyline',
        thumbnail: 'https://img.youtube.com/vi/EZB5O-Wmsk4/maxresdefault.jpg',
        duration: '6:20'
      }
    ]
  },
  {
    id: 'trim-profiles-polyline',
    slug: 'trim-profiles-polyline',
    title: 'Vectorworks Quick Tip: Creating Trim Profiles with the Polyline Tool',
    description: 'Learn how to trace and scale trim profiles in Vectorworks using the Polyline Tool. This tutorial covers vertex modes, symbol creation, and scaling based on real-world data for accurate 2D drafting in scenic design.',
    category: 'quick-tips',
    duration: '6:20',
    thumbnail: 'https://img.youtube.com/vi/EZB5O-Wmsk4/maxresdefault.jpg',
    videoUrl: 'https://www.youtube.com/embed/EZB5O-Wmsk4',
    publishDate: '2021-01-31',
    resources: [
      {
        name: 'Watch on YouTube',
        description: 'Quick tip on creating trim profiles',
        url: 'https://youtu.be/EZB5O-Wmsk4'
      }
    ],
    relatedTutorials: [
      {
        title: 'Custom Page Layouts',
        slug: 'custom-page-layouts',
        thumbnail: 'https://img.youtube.com/vi/Gd9_hB5USkQ/maxresdefault.jpg',
        duration: '3:36'
      },
      {
        title: 'Creating 2D Drafting from 3D Model',
        slug: 'creating-2d-drafting-from-3d-model',
        thumbnail: 'https://img.youtube.com/vi/Q-oM0jkKuS0/maxresdefault.jpg',
        duration: '25:05'
      }
    ]
  }
];

async function importTutorials() {
  console.log(`Starting import of ${TUTORIALS.length} tutorials...`);
  
  for (const tutorial of TUTORIALS) {
    try {
      console.log(`Importing: ${tutorial.title}`);
      
      const response = await fetch(`http://localhost:3000/api/tutorials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
          'X-Import-Secret': 'temp-secret-123'
        },
        body: JSON.stringify(tutorial)
      });
      
      if (response.ok) {
        console.log(`✅ Success: ${tutorial.title}`);
      } else {
        const error = await response.text();
        console.error(`❌ Failed: ${tutorial.title} - ${response.status} ${error}`);
      }
    } catch (err) {
      console.error(`❌ Error importing ${tutorial.title}:`, err);
    }
  }
  
  console.log('Import complete!');
}

importTutorials();
