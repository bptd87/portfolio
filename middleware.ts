// Middleware for Bot Detection to serve Server-Side OpenGraph directly
// Refactored to avoid redirects and internal rewrites for maximum compatibility

export const config = {
  matcher: [
    "/project/:path*",
    "/scenic-insights/:path*",
    "/about",
    "/portfolio",
  ],
};

export default async function middleware(req: Request) {
  const url = new URL(req.url);
  const userAgent = req.headers.get("user-agent") || "";
  const isBot =
    /bot|googlebot|crawler|spider|robot|crawling|facebookexternalhit|linkedinbot|twitterbot|slackbot|whatsapp|telegram/i
      .test(userAgent);

  if (isBot) {
    const path = url.pathname;
    // Default metadata
    let title = "Brandon PT Davis | Scenic Designer";
    let description = "Scenic Designer for Theatre, Opera, and Experiential.";
    let image = "https://brandonptdavis.com/og-default.jpg";

    // Logic to fetch data directly in middleware (Edge Runtime)
    try {
      if (path.includes("/project/")) {
        const rawSlug = path.split("/project/")[1];
        const slug = rawSlug?.split("?")[0];

        if (slug) {
          console.log(`[Middleware] Fetching project: ${slug}`);
          const projectId = "zuycsuajiuqsvopiioer";
          // Public Anon Key
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
              // Check multiple image sources
              let img = project.og_image || project.card_image ||
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
              console.log(`[Middleware] Found: ${title}`);
            }
          }
        }
      }
    } catch (e) {
      console.error("[Middleware] Error fetching data:", e);
    }

    const ogImageUrl = new URL("https://brandonptdavis.com/api/og");
    ogImageUrl.searchParams.set("title", title);
    ogImageUrl.searchParams.set("description", description.substring(0, 100));
    if (image && image.startsWith("http")) {
      ogImageUrl.searchParams.set("image", image);
    }
    const finalImageUrl = ogImageUrl.toString();

    // Valid HTML response
    const html = `
    <!DOCTYPE html>
    <html lang="en" prefix="og: https://ogp.me/ns#">
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <meta name="description" content="${description}">
      
      <!-- Open Graph / Facebook -->
      <meta property="og:type" content="website">
      <meta property="og:url" content="https://brandonptdavis.com${path}">
      <meta property="og:title" content="${title}">
      <meta property="og:description" content="${description}">
      <meta property="og:image" content="${finalImageUrl}">
      <meta property="og:image:type" content="image/png">
      <meta property="og:image:width" content="1200">
      <meta property="og:image:height" content="630">
      <meta property="og:image:alt" content="${title}">

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
        "Cache-Control":
          "public, max-age=60, s-maxage=60, stale-while-revalidate=60",
      },
    });
  }
}
