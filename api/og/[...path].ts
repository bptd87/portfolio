// Vercel Edge Function for Social Media Crawler OG Image Injection
// This intercepts social crawler requests and returns HTML with proper og:image tags

export const config = {
  runtime: 'edge',
};

// Social media crawler user agents
const SOCIAL_CRAWLERS = [
  'LinkedInBot',
  'facebookexternalhit',
  'Facebot',
  'Twitterbot',
  'Slackbot',
  'Discord',
  'WhatsApp',
  'TelegramBot',
  'Pinterest',
  'Applebot',
];

const API_BASE_URL = 'https://rrglglyqbvtwxjqphirb.supabase.co/functions/v1/make-server-74296234';
const SITE_URL = 'https://www.brandonptdavis.com';
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.jpg`;
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJyZ2xnbHlxYnZ0d3hqcXBoaXJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI2NTI4NTAsImV4cCI6MjA0ODIyODg1MH0.K-hNwrSLO5SY-JNn5E9u2A8LN3u9h5aT98GxnVQlxlY';

function isSocialCrawler(userAgent: string): boolean {
  return SOCIAL_CRAWLERS.some(crawler => 
    userAgent.toLowerCase().includes(crawler.toLowerCase())
  );
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function generateHTML(meta: {
  title: string;
  description: string;
  image: string;
  url: string;
  type?: string;
}): string {
  const { title, description, image, url, type = 'article' } = meta;
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  
  <!-- Open Graph -->
  <meta property="og:site_name" content="Brandon PT Davis">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:image" content="${image}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:url" content="${url}">
  <meta property="og:type" content="${type}">
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${image}">
  <meta name="twitter:creator" content="@brandonptdavis">
  
  <!-- Redirect non-crawler browsers to actual page -->
  <script>window.location.href = "${url}";</script>
  <noscript><meta http-equiv="refresh" content="0;url=${url}"></noscript>
</head>
<body>
  <p>Redirecting to <a href="${url}">${escapeHtml(title)}</a>...</p>
</body>
</html>`;
}

export default async function handler(request: Request): Promise<Response> {
  const userAgent = request.headers.get('user-agent') || '';
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  // Extract type and slug from path (e.g., /api/og/project/slug or /api/og/news/slug)
  const pathParts = pathname.replace('/api/og/', '').split('/');
  const type = pathParts[0]; // 'project' or 'news'
  const slug = pathParts.slice(1).join('/'); // The slug/ID
  
  if (!slug) {
    return new Response('Missing slug', { status: 400 });
  }

  const pageUrl = `${SITE_URL}/${type}/${slug}`;

  // For non-crawlers, redirect directly to the page
  if (!isSocialCrawler(userAgent)) {
    return Response.redirect(pageUrl, 302);
  }

  try {
    // Handle project pages
    if (type === 'project') {
      const response = await fetch(`${API_BASE_URL}/api/projects/${slug}`, {
        headers: { 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` },
      });

      if (response.ok) {
        const data = await response.json();
        const project = data.project || data;
        
        if (project) {
          const title = project.seoTitle || `${project.title} | Brandon PT Davis`;
          const description = project.seoDescription || project.description?.substring(0, 160) || 
            `Scenic design for ${project.venue || 'theatrical production'}`;
          const image = project.ogImage || project.heroImage || project.cardImage || DEFAULT_OG_IMAGE;
          const fullImage = image.startsWith('http') ? image : `${SITE_URL}${image}`;

          return new Response(
            generateHTML({ title, description, image: fullImage, url: pageUrl }),
            { 
              status: 200, 
              headers: { 'Content-Type': 'text/html; charset=utf-8' }
            }
          );
        }
      }
    }

    // Handle news pages
    if (type === 'news') {
      const response = await fetch(`${API_BASE_URL}/api/news/${slug}`, {
        headers: { 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` },
      });

      if (response.ok) {
        const data = await response.json();
        const newsItem = data.newsItem || data;
        
        if (newsItem) {
          const title = `${newsItem.title} | Brandon PT Davis`;
          const description = newsItem.excerpt || newsItem.description?.substring(0, 160) || 
            'Latest news from Brandon PT Davis, Scenic Designer';
          const image = newsItem.coverImage || DEFAULT_OG_IMAGE;
          const fullImage = image.startsWith('http') ? image : `${SITE_URL}${image}`;

          return new Response(
            generateHTML({ title, description, image: fullImage, url: pageUrl }),
            { 
              status: 200, 
              headers: { 'Content-Type': 'text/html; charset=utf-8' }
            }
          );
        }
      }
    }
  } catch (error) {
    console.error('OG Generation error:', error);
  }

  // Fallback - redirect to page
  return Response.redirect(pageUrl, 302);
}
