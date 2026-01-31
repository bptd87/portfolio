const API_URL = process.env.WORDPRESS_API_URL;

async function fetchAPI(query: string, { variables }: { variables?: any } = {}) {
  const headers = { "Content-Type": "application/json" };

  if (process.env.WORDPRESS_AUTH_REFRESH_TOKEN) {
    headers[
      "Authorization"
    ] = `Bearer ${process.env.WORDPRESS_AUTH_REFRESH_TOKEN}`;
  }

  // WPGraphQL Plugin must be enabled
  const res = await fetch(API_URL!, {
    headers,
    method: "POST",
    body: JSON.stringify({
      query,
      variables,
    }),
    next: { revalidate: 60 }, // Revalidate every 60 seconds
  });

  const json = await res.json();
  if (json.errors) {
    console.error(json.errors);
    throw new Error("Failed to fetch API");
  }
  return json.data;
}

export async function getAllArticles() {
  try {
    const data = await fetchAPI(
      `
      query AllArticles {
        articles(first: 100, where: { orderby: { field: DATE, order: DESC } }) {
          edges {
            node {
              title
              excerpt
              slug
              date
              content
              featuredImage {
                node {
                  sourceUrl
                  mediaDetails {
                      width
                      height
                  }
                }
              }
              articleCatagories {
                edges {
                  node {
                    name
                    slug
                  }
                }
              }
              articleTags {
                edges {
                  node {
                    name
                    slug
                  }
                }
              }
            }
          }
        }
      }
    `
    );

    return data?.articles?.edges || [];
  } catch (error) {
    console.error('Error fetching all articles:', error);
    return [];
  }
}

export async function getArticle(slug: string) {
    const data = await fetchAPI(
      `
      query ArticleBySlug($id: ID!, $idType: ArticleIdType!) {
        article(id: $id, idType: $idType) {
          title
          slug
          date
          content
          excerpt
          featuredImage {
            node {
              sourceUrl
            }
          }
          articleCatagories {
            edges {
              node {
                name
                slug
              }
            }
          }
          articleTags {
            edges {
              node {
                name
                slug
              }
            }
          }
        }
      }
    `,
      {
        variables: {
          id: slug,
          idType: 'SLUG'
        }
      }
    );
  
    return data?.article;
  }
