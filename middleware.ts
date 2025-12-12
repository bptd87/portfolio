// Vercel Edge Middleware for Social Crawler Detection
// Routes social media crawlers to the OG Edge Function for proper meta tags

export const config = {
  matcher: ['/project/:path*', '/news/:path*'],
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

function isSocialCrawler(userAgent: string): boolean {
  return SOCIAL_CRAWLERS.some(crawler => 
    userAgent.toLowerCase().includes(crawler.toLowerCase())
  );
}

export default function middleware(request: Request): Response | undefined {
  const userAgent = request.headers.get('user-agent') || '';
  
  // Only intercept for social crawlers
  if (!isSocialCrawler(userAgent)) {
    return undefined; // Continue to SPA
  }

  const url = new URL(request.url);
  const pathname = url.pathname;
  
  // Rewrite to OG Edge Function
  // /project/slug -> /api/og/project/slug
  // /news/id -> /api/og/news/id
  const ogUrl = new URL(`/api/og${pathname}`, url.origin);
  
  return Response.redirect(ogUrl.toString(), 302);
}
