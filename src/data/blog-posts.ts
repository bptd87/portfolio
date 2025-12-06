import image_6cce818b58c05ae0468590bbf53ddfb73955cea0 from 'figma:asset/6cce818b58c05ae0468590bbf53ddfb73955cea0.png';
import image_12f1929965876b365a06a763a7a59a0f9313be85 from 'figma:asset/12f1929965876b365a06a763a7a59a0f9313be85.png';
// Centralized blog post data for Scenic Insights

export interface BlogPost {
  id: string;
  title: string;
  category: 'Design Philosophy & Scenic Insights' | 'Scenic Design Process & Highlights' | 'Technology & Tutorials' | 'Experiential Design';
  date: string; // YYYY-MM-DD format
  lastModified: string;
  readTime: string;
  excerpt: string;
  featured: boolean;
  coverImage?: string; // Will be imported in ScenicInsights.tsx
  tags: string[];
}

export const blogPosts: BlogPost[] = [
  {
    id: 'artistic-vision-finding-creative-voice',
    title: 'Artistic Vision in Scenic Design: Finding My Creative Voice',
    category: 'Design Philosophy & Scenic Insights',
    date: '2025-01-31',
    lastModified: '2025-01-31',
    readTime: '10 min read',
    excerpt: 'A reflection on artistic identity, creative independence, and building a scenic design career driven by authenticity rather than algorithmic validation.',
    featured: true,
    coverImage: image_12f1929965876b365a06a763a7a59a0f9313be85,
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
    coverImage: image_6cce818b58c05ae0468590bbf53ddfb73955cea0,
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
    featured: true,
    coverImage: 'https://images.unsplash.com/photo-1604952703578-8ae924053711?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcmNoaXRlY3R1cmFsJTIwcmVuZGVyaW5nJTIwc2tldGNofGVufDF8fHx8MTc2MTg5Njk5OHww&ixlib=rb-4.1.0&q=80&w=1080',
    tags: ['Rendering', 'Vectorworks', 'Digital Design', 'Twinmotion', 'Concept Art', 'Lighting']
  },
  {
    id: 'romero-set-design',
    title: 'Framing the Martyr: Scenic Design as Memory Work in Romero',
    category: 'Scenic Design Process & Highlights',
    date: '2025-08-31',
    lastModified: '2025-08-31',
    readTime: '8 min read',
    excerpt: 'A deep dive into the scenic design process for Romero, exploring how physical space can frame memory and martyrdom.',
    featured: true,
    coverImage: 'https://images.unsplash.com/photo-1747999827332-163aa33cd597?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXNpZ24lMjBwcm9jZXNzJTIwd29ya3NwYWNlfGVufDF8fHx8MTc2MTg5Njk5OHww&ixlib=rb-4.1.0&q=80&w=1080',
    tags: ['Design Process', 'Case Study', 'University Production', 'Set Design', 'Symbolism']
  },
  {
    id: 'scenic-design-lesson-youre-wasting-my-time',
    title: '"You\'re Wasting My Time" — A Scenic Design Lesson in Growth and Revision',
    category: 'Design Philosophy & Scenic Insights',
    date: '2025-09-16',
    lastModified: '2025-09-16',
    readTime: '7 min read',
    excerpt: 'A formative moment at URTAs taught me the importance of intentionality, revision, and knowing your worth as a designer.',
    featured: false,
    coverImage: 'https://images.unsplash.com/photo-1758669919394-b3eb103f5e48?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0aGVhdHJlJTIwc3RhZ2UlMjBkZXNpZ258ZW58MXx8fHwxNzYxODk2OTk3fDA&ixlib=rb-4.1.0&q=80&w=1080',
    tags: ['Design Philosophy', 'Graduate School', 'Portfolio Review', 'Mentorship', 'URTA']
  },
  {
    id: 'the-lights-were-already-on-maude-adams-legacy-at-stephens-college',
    title: 'The Lights Were Already On: Maude Adams\' Legacy at Stephens College',
    category: 'Design Philosophy & Scenic Insights',
    date: '2025-04-27',
    lastModified: '2025-04-27',
    readTime: '15 min read',
    excerpt: 'Exploring the remarkable legacy of actress and lighting innovator Maude Adams at Stephens College.',
    featured: false,
    coverImage: 'https://images.unsplash.com/photo-1580060372014-711bda378d20?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0aGVhdHJlJTIwbGlnaHRpbmclMjBkZXNpZ258ZW58MXx8fHwxNzYxODk2OTk5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    tags: ['Theatre History', 'Lighting', 'Architecture', 'Women in Theatre', 'Historic Theatres']
  },
  {
    id: 'sora-in-the-studio-testing-ais-potential-for-theatrical-design',
    title: 'Sora in the Studio: Testing AI\'s Potential for Theatrical Design',
    category: 'Technology & Tutorials',
    date: '2025-09-16',
    lastModified: '2025-09-16',
    readTime: '11 min read',
    excerpt: 'Exploring OpenAI\'s Sora video generation tool as a potential resource for scenic design visualization and concept development.',
    featured: true,
    coverImage: 'https://images.unsplash.com/photo-1697577418970-95d99b5a55cf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnRpZmljaWFsJTIwaW50ZWxsaWdlbmNlJTIwdGVjaG5vbG9neXxlbnwxfHx8fDE3NjE4MzY4OTF8MA&ixlib=rb-4.1.0&q=80&w=1080',
    tags: ['AI Tools', 'Technology', 'Sora', 'Visualization', 'Digital Design', 'Innovation']
  },
  {
    id: 'jvtt8t7ek9xhgcd28j0zt2qha0v5cd',
    title: 'Designing the Keller Home: A Look Back at All My Sons',
    category: 'Scenic Design Process & Highlights',
    date: '2025-08-31',
    lastModified: '2025-08-31',
    readTime: '6 min read',
    excerpt: 'Reflecting on the scenic design for Arthur Miller\'s All My Sons at Stephens College in 2010.',
    featured: false,
    coverImage: 'https://images.unsplash.com/photo-1760768550727-00f5e02feb72?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0aGVhdHJlJTIwYmFja3N0YWdlJTIwdGVjaG5pY2FsfGVufDF8fHx8MTc2MTg5Njk5OHww&ixlib=rb-4.1.0&q=80&w=1080',
    tags: ['Design Process', 'Case Study', 'Arthur Miller', 'Realism', 'University Production']
  },
  {
    id: 'computer-hardware-guide',
    title: 'Understanding Computer Hardware: Why Scenic Designers (and All Theatre Designers) Need to Care',
    category: 'Technology & Tutorials',
    date: '2025-08-31',
    lastModified: '2025-08-31',
    readTime: '14 min read',
    excerpt: 'A comprehensive guide to computer hardware for theatre designers, from CPUs and GPUs to RAM and storage.',
    featured: false,
    coverImage: 'https://images.unsplash.com/photo-1642736656789-65a6a0abbf04?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21wdXRlciUyMGhhcmR3YXJlJTIwdGVjaG5vbG9neXxlbnwxfHx8fDE3NjE2Mzc5ODF8MA&ixlib=rb-4.1.0&q=80&w=1080',
    tags: ['Technology', 'Hardware', 'Computer Guide', 'Tech Education', 'Vectorworks']
  },
  {
    id: 'scenic-design-vision',
    title: 'Scenic Design Vision: Brandon PT Davis Creates Artistic Spaces Beyond the Traditional Portfolio',
    category: 'Design Philosophy & Scenic Insights',
    date: '2025-08-31',
    lastModified: '2025-08-31',
    readTime: '5 min read',
    excerpt: 'An overview of my design philosophy and approach to creating immersive theatrical environments.',
    featured: false,
    coverImage: 'https://images.unsplash.com/photo-1758669919394-b3eb103f5e48?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0aGVhdHJlJTIwc3RhZ2UlMjBkZXNpZ258ZW58MXx8fHwxNzYxODk2OTk3fDA&ixlib=rb-4.1.0&q=80&w=1080',
    tags: ['Design Philosophy', 'Scenic Design', 'Creative Process', 'Portfolio']
  },
  {
    id: 'themed-entertainment-evolution',
    title: 'Themed Entertainment Design: Studio Ghibli-Inspired Immersive Dining Experience by Theatre Students',
    category: 'Experiential Design',
    date: '2025-09-15',
    lastModified: '2025-09-15',
    readTime: '10 min read',
    excerpt: 'Stephens College theatre students create an immersive dining experience inspired by Studio Ghibli films.',
    featured: true,
    coverImage: 'https://images.unsplash.com/photo-1692057418762-eeab24cd8505?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0aGVtZSUyMHBhcmslMjBjYXN0bGUlMjBtYWdpY3xlbnwxfHx8fDE3NjE3OTQ3NDJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    tags: ['Experiential Design', 'Themed Entertainment', 'Immersive Design', 'Student Project', 'Theme Parks']
  },
  {
    id: 'presenting-like-apple',
    title: 'The Art of Presenting Theatre Design: A Guide for Designers',
    category: 'Technology & Tutorials',
    date: '2025-04-23',
    lastModified: '2025-04-23',
    readTime: '9 min read',
    excerpt: 'Best practices for presenting your scenic design work to directors, collaborators, and production teams.',
    featured: false,
    coverImage: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcmVzZW50YXRpb24lMjBkZXNpZ258ZW58MXx8fHwxNzYxNjM5Mjg1fDA&ixlib=rb-4.1.0&q=80&w=1080',
    tags: ['Presentation Skills', 'Design Process', 'Communication', 'Keynote', 'Professional Skills']
  },
  {
    id: 'navigating-the-scenic-design-process-a-comprehensive-guide',
    title: 'Navigating the Scenic Design Process: A Comprehensive Guide',
    category: 'Scenic Design Process & Highlights',
    date: '2025-08-31',
    lastModified: '2025-08-31',
    readTime: '13 min read',
    excerpt: 'A step-by-step guide through the complete scenic design process, from script analysis to opening night.',
    featured: false,
    coverImage: 'https://images.unsplash.com/photo-1747999827332-163aa33cd597?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXNpZ24lMjBwcm9jZXNzJTIwd29ya3NwYWNlfGVufDF8fHx8MTc2MTg5Njk5OHww&ixlib=rb-4.1.0&q=80&w=1080',
    tags: ['Design Process', 'Workflow', 'Production Design', 'Creative Process', 'Guide']
  },
  {
    id: 'computer-literacy',
    title: 'Empowering Theatre Production Students with Computer Literacy',
    category: 'Technology & Tutorials',
    date: '2025-09-15',
    lastModified: '2025-09-15',
    readTime: '7 min read',
    excerpt: 'Why computer literacy matters for theatre production students and how to develop these essential skills.',
    featured: false,
    coverImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkZW50JTIwY29tcHV0ZXJ8ZW58MXx8fHwxNzYxNjM4MDUyfDA&ixlib=rb-4.1.0&q=80&w=1080',
    tags: ['Theatre Education', 'Tech Education', 'Digital Skills', 'Teaching', 'Computer Literacy']
  },
  {
    id: 'video-game-environments',
    title: 'Video Game Environments: Lessons for Scenic Design',
    category: 'Design Philosophy & Scenic Insights',
    date: '2025-07-12',
    lastModified: '2025-07-12',
    readTime: '11 min read',
    excerpt: 'Exploring how video game environment design principles can inform and enhance theatrical scenic design.',
    featured: true,
    coverImage: 'https://images.unsplash.com/photo-1760802185763-fe4999466b78?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYW50YXN5JTIwZ2FtZSUyMGNvbmNlcHQlMjBhcnR8ZW58MXx8fHwxNzYxNzk0MTY0fDA&ixlib=rb-4.1.0&q=80&w=1080',
    tags: ['Game Design', 'Environment Design', 'Digital Design', 'Design Philosophy', 'Innovation']
  },
  {
    id: 'opera-foundations',
    title: 'Opera\'s Foundations: The Evolution of Scenic Design in Opera',
    category: 'Design Philosophy & Scenic Insights',
    date: '2025-06-18',
    lastModified: '2025-06-18',
    readTime: '13 min read',
    excerpt: 'A journey through the history of scenic design in opera, from the Baroque era to contemporary practice.',
    featured: false,
    coverImage: 'https://images.unsplash.com/photo-1761359841098-8e84b7cf3661?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvcGVyYSUyMGhvdXNlJTIwcGVyZm9ybWFuY2UlMjBzdGFnZXxlbnwxfHx8fDE3NjE3OTUzMjh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    tags: ['Opera', 'Theatre History', 'Design History', 'Baroque', 'Historical Design']
  },
  {
    id: 'golden-age-broadway',
    title: 'The Golden Age of Broadway: Scenic Design Excellence',
    category: 'Design Philosophy & Scenic Insights',
    date: '2025-05-22',
    lastModified: '2025-05-22',
    readTime: '15 min read',
    excerpt: 'Celebrating the legendary scenic designers who defined Broadway\'s Golden Age and their lasting influence.',
    featured: true,
    coverImage: 'https://images.unsplash.com/photo-1608587446131-b70c4664a62a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwYnJvYWR3YXklMjB0aGVhdHJlJTIwZGlzdHJpY3QlMjAxOTUwc3xlbnwxfHx8fDE3NjE3OTYwMjh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    tags: ['Broadway', 'Theatre History', 'Design History', 'Golden Age', 'Historic Designers']
  }
];

// Helper functions with memoization for performance
let _featuredPostsCache: BlogPost[] | null = null;
const _recentPostsCache: Map<number, BlogPost[]> = new Map();
let _sortedPosts: BlogPost[] | null = null;

const getSortedPosts = () => {
  if (!_sortedPosts) {
    _sortedPosts = [...blogPosts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
  return _sortedPosts;
};

export const getFeaturedPosts = () => {
  if (!_featuredPostsCache) {
    _featuredPostsCache = blogPosts.filter(p => p.featured);
  }
  return _featuredPostsCache;
};

export const getPostsByCategory = (category: BlogPost['category']) => 
  blogPosts.filter(p => p.category === category);

export const getPostById = (id: string) => blogPosts.find(p => p.id === id);

export const getRecentPosts = (count: number = 3) => {
  if (!_recentPostsCache.has(count)) {
    _recentPostsCache.set(count, getSortedPosts().slice(0, count));
  }
  return _recentPostsCache.get(count)!;
};

export const getRelatedPosts = (currentPost: BlogPost, count: number = 3) => 
  blogPosts
    .filter(p => p.id !== currentPost.id && p.category === currentPost.category)
    .slice(0, count);

export const getPostsByTag = (tag: string) =>
  blogPosts.filter(p => p.tags.includes(tag));

export const getAllTags = () => {
  const tagsSet = new Set<string>();
  blogPosts.forEach(post => {
    post.tags.forEach(tag => tagsSet.add(tag));
  });
  return Array.from(tagsSet).sort();
};
