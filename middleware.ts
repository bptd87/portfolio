// Middleware for Bot Detection to serve Server-Side OpenGraph
// Refactored to avoid 'next/server' dependencies in a Vite project

export const config = {
  matcher: [
    "/project/:path*",
    "/scenic-insights/:path*",
    "/about",
    "/portfolio",
  ],
};

export default function middleware(req: Request) {
  const url = new URL(req.url);
  const userAgent = req.headers.get("user-agent") || "";
  const isBot =
    /bot|googlebot|crawler|spider|robot|crawling|facebookexternalhit|linkedinbot|twitterbot|slackbot|whatsapp|telegram/i
      .test(userAgent);

  if (isBot) {
    // Determine the actual path
    const path = url.pathname;

    // Construct the API URL to redirect to
    // We use a 307 redirect so the bot fetches the API response (HTML with meta tags)
    // Note: Some robust bots follow redirects.
    // If 'Rewrite' is strictly needed without 'next/server', we'd fetch and return Response.
    // However, 307 is safer/easier for this stack.
    const apiUrl = new URL("/api/social-card", req.url);
    apiUrl.searchParams.set("path", path);

    return Response.redirect(apiUrl.toString(), 307);
  }
}
