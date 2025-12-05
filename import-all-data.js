import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Import data files
const blogPostsData = [
  {
    id: 'artistic-vision-finding-creative-voice',
    title: 'Artistic Vision in Scenic Design: Finding My Creative Voice',
    category: 'Design Philosophy & Scenic Insights',
    date: '2025-01-31',
    lastModified: '2025-01-31',
    readTime: '10 min read',
    excerpt: 'A reflection on artistic identity, creative independence, and building a scenic design career driven by authenticity rather than algorithmic validation.',
    featured: true,
    coverImage: 'https://ckxcybhlkvbojllqzwyv.supabase.co/storage/v1/object/public/blog/12f1929965876b365a06a763a7a59a0f9313be85.png',
    tags: ['Design Philosophy', 'Artistic Vision', 'Creative Process', 'Portfolio Development', 'Theatre Career']
  },
  {
    id: 'becoming-a-scenic-designer',
    title: 'Becoming a Scenic Designer: A Comprehensive Guide',
    category: 'Design Philosophy & Scenic Insights',
    date: '2025-09-16',
    lastModified: '2025-09-16',
    readTime: '12 min read',
    excerpt: 'Everything you need to know about pursuing a career in scenic design, from education to professional practice.',
    featured: true,
    coverImage: 'https://ckxcybhlkvbojllqzwyv.supabase.co/storage/v1/object/public/blog/6cce818b58c05ae0468590bbf53ddfb73955cea0.png',
    tags: ['Scenic Design', 'Career Guide', 'Theatre Education', 'BFA Programs', 'MFA Programs', 'Portfolio']
  },
  {
    id: 'scenic-rendering-principles',
    title: 'What Makes a Good Scenic Design Rendering?',
    category: 'Technology & Tutorials',
    date: '2025-09-16',
    lastModified: '2025-09-16',
    readTime: '10 min read',
    excerpt: 'Drawing lessons from the Old Masters: atmospheric lighting, focal points, visual hierarchy, and architectural framing in scenic design visualization.',
    featured: false,
    tags: ['Rendering', 'Vectorworks', 'Design Process', 'Visual Communication']
  }
];

const projectsData = [
  {
    id: 'million-dollar-quartet',
    title: 'Million Dollar Quartet',
    category: 'Scenic Design',
    subcategory: 'Musical Theatre',
    venue: 'South Coast Repertory',
    location: 'Costa Mesa, CA',
    year: 2025,
    cardImage: 'https://ckxcybhlkvbojllqzwyv.supabase.co/storage/v1/object/public/projects/2c1c79039cfd4381f506e8c95ec032cea353ba13.png',
    featured: true,
    description: 'Co-scenic design for the 2025 production of Million Dollar Quartet, featuring the legendary recording session of Elvis Presley, Johnny Cash, Jerry Lee Lewis, and Carl Perkins.',
    credits: {
      director: 'James Moye',
      coDesigner: 'Efren Delgadillo Jr',
      costumeDesigner: 'Kish Finnegan',
      lightingDesigner: 'Lonnie Rafael Alcaraz',
      soundDesigner: 'Jeff Polunas'
    }
  },
  {
    id: 'much-ado-about-nothing',
    title: 'Much Ado About Nothing',
    category: 'Scenic Design',
    subcategory: 'Shakespeare',
    venue: 'Sample Theatre',
    location: 'Los Angeles, CA',
    year: 2024,
    cardImage: 'https://ckxcybhlkvbojllqzwyv.supabase.co/storage/v1/object/public/projects/4e3beab39841f6cce072c59b365308d5507baf12.png',
    featured: true,
    description: 'A vibrant production of Shakespeare\'s romantic comedy.',
    credits: {
      director: 'Sample Director'
    }
  }
];

const newsData = [
  {
    id: 'million-dollar-quartet-scr-debut',
    title: 'Making My SCR Debut: Million Dollar Quartet (2025)',
    date: '2025-08-29',
    lastModified: '2025-08-29',
    category: 'Project Launch',
    excerpt: 'Co-designing my first production at South Coast Repertory, one of the nation\'s leading regional theaters.',
    tags: ['SCR', 'South Coast Rep', 'Million Dollar Quartet', 'Co-Design Debut', 'Musical Theatre']
  },
  {
    id: 'assisting-the-play-that-goes-wrong',
    title: 'Assisting Tom Buderwitz on The Play That Goes Wrong at Seattle Rep',
    date: '2025-08-28',
    lastModified: '2025-08-28',
    category: 'Collaboration',
    excerpt: 'Assisting renowned scenic designer Tom Buderwitz on this hilarious farce.',
    tags: ['Seattle Rep', 'Assistant Designer', 'Comedy']
  }
];

const categoriesData = [
  { name: 'Design Philosophy & Scenic Insights', slug: 'design-philosophy', type: 'articles' },
  { name: 'Scenic Design Process & Highlights', slug: 'scenic-design-process', type: 'articles' },
  { name: 'Technology & Tutorials', slug: 'technology-tutorials', type: 'articles' },
  { name: 'Experiential Design', slug: 'experiential-design', type: 'articles' },
  { name: 'Scenic Design', slug: 'scenic-design', type: 'projects' },
  { name: 'Experiential Design', slug: 'experiential-design-projects', type: 'projects' },
  { name: 'Rendering & Visualization', slug: 'rendering-visualization', type: 'projects' }
];

async function importData() {
  console.log('🚀 Starting data import...\n');

  // 1. Import Categories
  console.log('📁 Importing categories...');
  for (const category of categoriesData) {
    const { data, error } = await supabase
      .from('categories')
      .upsert(category, { onConflict: 'slug' });
    
    if (error) {
      console.error(`❌ Error importing category "${category.name}":`, error.message);
    } else {
      console.log(`✅ Imported category: ${category.name}`);
    }
  }

  // 2. Import Blog Posts
  console.log('\n📝 Importing blog posts...');
  for (const post of blogPostsData) {
    const { data, error } = await supabase
      .from('posts')
      .upsert({
        id: post.id,
        title: post.title,
        category: post.category,
        date: post.date,
        last_modified: post.lastModified,
        read_time: post.readTime,
        excerpt: post.excerpt,
        featured: post.featured,
        cover_image: post.coverImage,
        tags: post.tags,
        published: true
      }, { onConflict: 'id' });
    
    if (error) {
      console.error(`❌ Error importing post "${post.title}":`, error.message);
    } else {
      console.log(`✅ Imported post: ${post.title}`);
    }
  }

  // 3. Import Projects
  console.log('\n🎭 Importing projects...');
  for (const project of projectsData) {
    const { data, error } = await supabase
      .from('productions')
      .upsert({
        id: project.id,
        title: project.title,
        category: project.category,
        subcategory: project.subcategory,
        venue: project.venue,
        location: project.location,
        year: project.year,
        card_image: project.cardImage,
        featured: project.featured,
        description: project.description,
        credits: project.credits,
        published: true
      }, { onConflict: 'id' });
    
    if (error) {
      console.error(`❌ Error importing project "${project.title}":`, error.message);
    } else {
      console.log(`✅ Imported project: ${project.title}`);
    }
  }

  // 4. Import News
  console.log('\n📰 Importing news items...');
  for (const news of newsData) {
    const { data, error } = await supabase
      .from('news')
      .upsert({
        id: news.id,
        title: news.title,
        date: news.date,
        last_modified: news.lastModified,
        category: news.category,
        excerpt: news.excerpt,
        tags: news.tags,
        published: true
      }, { onConflict: 'id' });
    
    if (error) {
      console.error(`❌ Error importing news "${news.title}":`, error.message);
    } else {
      console.log(`✅ Imported news: ${news.title}`);
    }
  }

  console.log('\n✨ Data import complete!\n');
}

importData().catch(console.error);
