// Middleware for Bot Detection to serve Server-Side OpenGraph directly
// Config: Global middleware (no matcher) to ensure execution on all paths.

export default async function middleware(req: Request) {
  const url = new URL(req.url);

  // 1. Component/Asset exclusions (Fast Exit)
  if (
    /\.(png|jpg|jpeg|svg|gif|webp|ico|css|js|woff|woff2|ttf|eot|xml|txt)$/.test(
      url.pathname,
    ) ||
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/_vercel/")
  ) {
    return;
  }

  // 2. Bot Detection (Expanded List for Validators)
  const userAgent = req.headers.get("user-agent") || "";
  const isBot =
    /bot|googlebot|crawler|spider|robot|crawling|facebookexternalhit|linkedinbot|twitterbot|slackbot|whatsapp|telegram|vercel|validator|preview|meta|opengraph/i
      .test(userAgent);

  if (!isBot) {
    return;
  }

  // 3. Bot Handling Logic
  const path = url.pathname;
  console.log(`[Middleware] Bot/Validator detected on: ${path} (${userAgent})`);

  // Default metadata
  let title = "Brandon PT Davis | Scenic Designer";
  let description = "Scenic Designer for Theatre, Opera, and Experiential.";
  // Default to static site image
  let image = "https://brandonptdavis.com/og-default.jpg";

  try {
    if (path.includes("/project/")) {
      const rawSlug = path.split("/project/")[1];
      const slug = rawSlug?.split("?")[0];

      if (slug) {
        const projectId = "zuycsuajiuqsvopiioer";
        const anonKey =
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1eWNzdWFqaXVxc3ZvcGlpb2VyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4Mzk1ODUsImV4cCI6MjA3NzQxNTU4NX0.y7C3gkxAXQvOLRdaebj_3MRww2QjaN9fA2sCUzsdhEM";

        const res = await fetch(
          `https://${projectId}.supabase.co/rest/v1/portfolio_projects?slug=eq.${slug}&select=*`,
          {
            headers: {
              "apikey": anonKey,
              "Authorization": `Bearer ${anonKey}`,
            },
          },
        );

        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            const project = data[0];
            title = `${project.title} | Brandon PT Davis`;
            description = project.description || description;
            const img = project.card_image || project.og_image ||
              project.banner_image || project.cover_image;

            if (img && !img.startsWith("http")) {
              if (img.startsWith("/")) {
                image = `https://brandonptdavis.com${img}`;
              } else {
                image = img;
              }
            } else if (img) {
              image = img;
            }
          }
        }
      }
    }
  } catch (e) {
    console.error("[Middleware] Error:", e);
  }

  // Logic: If we found a specific project image, use it directly (Raw).
  // If not, use the static default.
  // We avoid wrapping it in api/og to prevent double-text overlay or loading issues.
  let finalImageUrl = image;
  if (!finalImageUrl) {
    finalImageUrl = "https://brandonptdavis.com/og-default.jpg";
  }

  const html = `
  <!DOCTYPE html>
  <html lang="en" prefix="og: https://ogp.me/ns#">
  <head>
    <meta charset="UTF-8">
    <title>${title}</title>
    <meta name="description" content="${description}">
    
    <!-- Open Graph -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://brandonptdavis.com${path}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:image" content="${finalImageUrl}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="${title}">
    <meta property="og:site_name" content="Brandon PT Davis">

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="https://brandonptdavis.com${path}">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${description}">
    <meta name="twitter:image" content="${finalImageUrl}">
    <meta name="twitter:image:alt" content="${title}">
  </head>
  <body>
    <h1>${title}</h1>
    <p>${description}</p>
    <img src="${finalImageUrl}" alt="${title}" width="1200" height="630" />
  </body>
  </html>`;

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "X-Middleware-Status": "Active-Bot-Response",
    },
  });
}
