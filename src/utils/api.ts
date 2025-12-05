import { projectId, publicAnonKey } from './supabase/info';

// Centralized API configuration
// The Supabase Edge Function is deployed at /functions/v1/make-server-74296234
// And all routes have the prefix /make-server-74296234
export const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-74296234`;

export const getHeaders = (adminToken?: string) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${publicAnonKey}`,
  };

  if (adminToken) {
    headers['X-Admin-Token'] = adminToken;
  }

  return headers;
};

// Mock/fallback data for local development when Edge Function isn't available
const MOCK_POSTS = [
  {
    id: 'becoming-a-scenic-designer',
    slug: 'becoming-a-scenic-designer',
    title: 'Becoming a Scenic Designer: When the Work Starts to Feel Like Yours',
    excerpt: 'A reflection for emerging scenic designers finding their voice.',
    category: 'Design Philosophy & Scenic Insights',
    date: '2024-08-31',
    readTime: '8 min read',
    coverImage: 'https://images.unsplash.com/photo-1549887534-7f9e3e82e6e3',
    tags: ['scenic design', 'career', 'design philosophy'],
  },
  {
    id: 'video-game-environments',
    slug: 'video-game-environments',
    title: 'Video Game Environments as Design References',
    excerpt: 'Learning from Skyrim and Fallout to create immersive theatrical worlds',
    category: 'Design Philosophy & Scenic Insights',
    date: '2024-09-15',
    readTime: '6 min read',
    tags: ['design references', 'digital design', 'immersive design'],
  },
];

const MOCK_CATEGORIES = [
  { id: 'philosophy', name: 'Design Philosophy & Scenic Insights', slug: 'philosophy', color: '#3B82F6' },
  { id: 'process', name: 'Scenic Design Process & Highlights', slug: 'process', color: '#10B981' },
  { id: 'tech', name: 'Technology & Tutorials', slug: 'tech', color: '#7c48f4' },
  { id: 'experiential', name: 'Experiential Design', slug: 'experiential', color: '#F59E0B' },
];

const MOCK_NEWS = [
  {
    id: 'news-1',
    title: 'New Portfolio Section Launched',
    excerpt: 'Explore updated theatrical design work',
    date: '2025-01-15',
    thumbnail: 'https://images.unsplash.com/photo-1549887534-7f9e3e82e6e3',
  },
];

const MOCK_PROJECTS = [
  {
    id: 'million-dollar-quartet',
    slug: 'million-dollar-quartet',
    title: 'Million Dollar Quartet',
    type: 'scenic',
    year: 2024,
    venue: 'Regional Theatre',
  },
];

// Helper function to make API calls with fallback
export async function apiCall(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    console.log(`🌐 API: Attempting to fetch ${endpoint}`);
    const response = await fetch(url, {
      ...options,
      headers: {
        ...getHeaders(),
        ...options.headers,
      },
    });

    if (!response.ok) {
      console.warn(`⚠️ API: ${endpoint} returned ${response.status}`);
    }

    return response;
  } catch (err) {
    console.error(`❌ API: Failed to fetch ${endpoint}`, err);
    // Return a fallback response with mock data
    return provideMockResponse(endpoint, options);
  }
}

// Provide mock/fallback response
function provideMockResponse(endpoint: string, options: RequestInit) {
  console.log(`📦 API: Using mock fallback for ${endpoint}`);
  
  let data = { success: true, error: null };

  if (endpoint === '/api/posts') {
    data = { ...data, posts: MOCK_POSTS };
  } else if (endpoint.startsWith('/api/posts/')) {
    const slug = endpoint.replace('/api/posts/', '');
    const post = MOCK_POSTS.find(p => p.slug === slug || p.id === slug);
    if (post) {
      data = { ...data, post };
    } else {
      data = { error: 'Post not found', post: null };
    }
  } else if (endpoint === '/api/categories/articles') {
    data = { ...data, categories: MOCK_CATEGORIES };
  } else if (endpoint === '/api/news') {
    data = { ...data, news: MOCK_NEWS };
  } else if (endpoint === '/api/projects') {
    data = { ...data, projects: MOCK_PROJECTS };
  }

  // Return a Response-like object
  return {
    ok: true,
    status: 200,
    json: async () => data,
    text: async () => JSON.stringify(data),
  } as any;
}