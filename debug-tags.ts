
const API_URL = process.env.WORDPRESS_API_URL;

async function fetchAPI(query: string) {
    const headers = { 'Content-Type': 'application/json' };
    const res = await fetch(API_URL!, {
        headers,
        method: 'POST',
        body: JSON.stringify({ query }),
    });
    const json = await res.json();
    if (json.errors) {
        console.error(json.errors);
        throw new Error('Failed to fetch API');
    }
    return json.data;
}


async function debug() {
  console.log('Fetching recent articles...');
  try {
    const data = await fetchAPI(`
      query AllArticlesCheck {
        articles(first: 5) {
          edges {
            node {
              title
              slug
              articleTags {
                edges {
                  node {
                    name
                  }
                }
              }
            }
          }
        }
      }
    `);
    
    const articles = data.articles.edges;
    console.log(`Found ${articles.length} articles.`);
    articles.forEach((edge: any) => {
        const title = edge.node.title;
        const slug = edge.node.slug;
        const tags = edge.node.articleTags.edges.map((e: any) => e.node.name);
        console.log(`Article: "${title}" (slug: ${slug}) - Tags: [${tags.join(', ')}]`);
    });
    
  } catch (error) {
    console.error('Error fetching articles:', error);
  }
}

debug();
