export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  const projectId = 'zuycsuajiuqsvopiioer';
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1eWNzdWFqaXVxc3ZvcGlpb2VyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4Mzk1ODUsImV4cCI6MjA3NzQxNTU4NX0.y7C3gkxAXQvOLRdaebj_3MRww2QjaN9fA2sCUzsdhEM';

  try {
    // Fetch projects
    const res = await fetch(`https://${projectId}.supabase.co/rest/v1/portfolio_projects?select=title,slug,description,created_at&order=created_at.desc&limit=20`, {
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`
      }
    });

    let items = '';
    if (res.ok) {
      const data = await res.json();
      items = data.map((item: any) => `
        <item>
          <title><![CDATA[${item.title}]]></title>
          <link>https://brandonptdavis.com/project/${item.slug}</link>
          <guid>https://brandonptdavis.com/project/${item.slug}</guid>
          <description><![CDATA[${item.description || ''}]]></description>
          <pubDate>${new Date(item.created_at).toUTCString()}</pubDate>
        </item>
      `).join('');
    }

    const rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
<channel>
 <title>Brandon PT Davis | Portfolio</title>
 <description>Scenic Designer for Theatre, Opera, and Experiential.</description>
 <link>https://brandonptdavis.com</link>
 <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
 <language>en-us</language>
 ${items}
</channel>
</rss>`;

    return new Response(rss, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 's-maxage=3600, stale-while-revalidate'
      },
    });
  } catch (e) {
    return new Response('Error generating feed', { status: 500 });
  }
}
