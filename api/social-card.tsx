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
      const slug = path.split('/project/')[1];
      if (slug) {
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
            // Use custom OG image, or card image, or cover image
            // We need to resolve relative URLs if they are relative
            let img = project.og_image || project.card_image || project.cover_image;
            if (img && !img.startsWith('http')) {
               // Assuming these are supabase storage paths if not absolute? 
               // Actually the frontend maps them.
               // Let's assume standard supabase pattern if it's a path
               // But usually the DB stores full paths or we need to construct it.
               // For now, let's pass it through and let the OG generator handle or fallback.
               // If it's a relative path starting with /, prepend siteUrl?
               // Actually, `og:image` MUST be absolute.
               if (img.startsWith('/')) {
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

  // Return static HTML
  return new Response(`
    <!DOCTYPE html>
    <html lang="en">
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

      <!-- Twitter -->
      <meta property="twitter:card" content="summary_large_image">
      <meta property="twitter:url" content="https://brandonptdavis.com${path}">
      <meta property="twitter:title" content="${title}">
      <meta property="twitter:description" content="${description}">
      <meta property="twitter:image" content="${ogImageUrl.toString()}">
    </head>
    <body>
      <h1>${title}</h1>
      <p>${description}</p>
      <img src="${ogImageUrl.toString()}" alt="${title}" />
      <p>Redirecting to full site...</p>
      <script>window.location.href = "${path}";</script>
    </body>
    </html>
  `, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
