export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  const url = new URL(req.url);
  const path = url.searchParams.get('path') || '/';
  
  // Default metadata
  let title = 'Brandon PT Davis | Scenic Designer';
  let description = 'Scenic Designer for Theatre, Opera, and Experiential.';
  let image = 'https://brandonptdavis.com/og-default.jpg';

  // Basic logic to fetch data based on path
  // Note: For a robust solution, we'd query Supabase here. 
  // For the MVP, we'll parse the URL and try to fetch from our own API or query Supabase directly.
  // Using direct Supabase REST API is fastest for Edge.
  
  try {
    if (path.includes('/project/')) {
      const rawSlug = path.split('/project/')[1];
      const slug = rawSlug?.split('?')[0]; // Remove query params
      
      if (slug) {
        console.log(`[SocialCard] Fetching project: ${slug}`);
        // Fetch project data using publicly known keys (safe for anon access)
        const projectId = 'zuycsuajiuqsvopiioer';
        const anonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1eWNzdWFqaXVxc3ZvcGlpb2VyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4Mzk1ODUsImV4cCI6MjA3NzQxNTU4NX0.y7C3gkxAXQvOLRdaebj_3MRww2QjaN9fA2sCUzsdhEM';
        
        const res = await fetch(`https://${projectId}.supabase.co/rest/v1/portfolio_projects?slug=eq.${slug}&select=*`, {
          headers: {
            'apikey': anonKey,
            'Authorization': `Bearer ${anonKey}`
          }
        });
        
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            const project = data[0];
            title = `${project.title} | Brandon PT Davis`;
            description = project.description || description;
            
            // Prefer og_image, then card, then banner, then cover
            // Note: banner_image is often available in the keys
            let img = project.og_image || project.card_image || project.banner_image || project.cover_image;
            
            console.log(`[SocialCard] Found project: ${project.title}, Image: ${img}`);
            
            if (img && !img.startsWith('http')) {
               if (img.startsWith('/')) {
                 image = `https://brandonptdavis.com${img}`;
               } else {
                 image = img;
               }
            } else if (img) {
              image = img;
            }
          } else {
             console.log(`[SocialCard] No project found for slug: ${slug}`);
          }
        } else {
           console.log(`[SocialCard] Supabase error: ${res.status}`);
        }
      }
    }
    // ... logic for articles would go here similarly
  } catch (e) {
    console.error('Error fetching metadata', e);
  }

  // Construct efficient OG Image URL
  const ogImageUrl = new URL('https://brandonptdavis.com/api/og');
  ogImageUrl.searchParams.set('title', title);
  ogImageUrl.searchParams.set('description', description.substring(0, 100)); // Truncate
  if (image && image.startsWith('http')) {
    ogImageUrl.searchParams.set('image', image);
  }

  // Return static HTML with strict OpenGraph compliance
  return new Response(`
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
      <meta property="og:image" content="${ogImageUrl.toString()}">
      <meta property="og:image:type" content="image/png">
      <meta property="og:image:width" content="1200">
      <meta property="og:image:height" content="630">
      <meta property="og:image:alt" content="${title}">

      <!-- Twitter -->
      <meta name="twitter:card" content="summary_large_image">
      <meta name="twitter:url" content="https://brandonptdavis.com${path}">
      <meta name="twitter:title" content="${title}">
      <meta name="twitter:description" content="${description}">
      <meta name="twitter:image" content="${ogImageUrl.toString()}">
      <meta name="twitter:image:alt" content="${title}">
    </head>
    <body>
      <h1>${title}</h1>
      <p>${description}</p>
      <img src="${ogImageUrl.toString()}" alt="${title}" width="1200" height="630" />
      <p>Redirecting to full site...</p>
      <script>window.location.href = "${path}";</script>
    </body>
    </html>
  `, {
    headers: { 
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=60, s-maxage=60, stale-while-revalidate=60' // Cache for performance
    },
  });
}
