
import { createClient } from '@supabase/supabase-js';

// Hardcoded keys for debugging context (from previous turns)
const SUPABASE_URL = 'https://ufvbdvclzhhldwrbwiyv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmdmJkdmNsemhobGR3cmJ3aXl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2NTU4NDQ0MzYsImV4cCI6MTk3MTQyMDQzNn0.S0d1_HkX2j6oF8P5x6wz3g9e9_3e3_3e3_3e3_3e3';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Set env var for API
process.env.WORDPRESS_API_URL = 'https://cms.brandonptdavis.com/graphql';

async function testColorLogic() {
  const { getArticle } = await import('./src/lib/api');
  const { findCategoryColor } = await import('./src/utils/categoryHelpers');

  console.log("--- Starting Debug Session (REAL DATA) ---");

  // 1. Fetch Categories from Supabase
  console.log("Fetching Supabase Categories...");
  const { data: categories, error } = await supabase
    .from('categories')
    .select('*')
    .eq('type', 'articles');

  if (error || !categories) {
    console.error("Error fetching categories:", error);
    return;
  }
  console.log(`Fetched ${categories.length} categories.`);
  console.log("Categories Dump:");
  categories.forEach(c => console.log(` - ${c.name}: ${c.color}`));

  // 2. Fetch specific articles to test
  const testSlugs = [
    'urinetown-scenic-design-building-a-dystopia-that-feels-uncomfortably-familiar',
    'the-modern-theatrical-design-portfolio', 
  ];

  console.log("\n--- Manual Test: \"Musical Theatre\" ---");
  console.log(`Resolved: ${findCategoryColor('Musical Theatre', categories)}`);

  for (const slug of testSlugs) {
    console.log(`\n--- Testing Article: ${slug} ---`);
    try {
        const wpArticle = await getArticle(slug);
        
        if (!wpArticle) {
            console.log("Article not found.");
            continue;
        }

        const edges = wpArticle.articleCatagories?.edges;
        const categoryName = edges && edges.length > 0 ? edges[0].node.name : 'Article';
        
        console.log(`Raw WP Category: "${categoryName}"`);
        const color = findCategoryColor(categoryName, categories);
        console.log(`Resolved Color: ${color}`);
        
    } catch (e) {
        console.error("Error fetching article:", e);
    }
  }
}

testColorLogic();
