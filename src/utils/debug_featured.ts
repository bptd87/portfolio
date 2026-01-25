
import { createClient } from "@supabase/supabase-js";

const projectId = "zuycsuajiuqsvopiioer";
const publicAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1eWNzdWFqaXVxc3ZvcGlpb2VyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4Mzk1ODUsImV4cCI6MjA3NzQxNTU4NX0.y7C3gkxAXQvOLRdaebj_3MRww2QjaN9fA2sCUzsdhEM";

const supabase = createClient(`https://${projectId}.supabase.co`, publicAnonKey);

async function main() {
  console.log("Checking portfolio_projects...");
  
  // Check Total
  const { count: total, error: err1 } = await supabase
    .from('portfolio_projects')
    .select('*', { count: 'exact', head: true });
    
  if (err1) console.error("Error fetching total:", err1);
  else console.log("Total projects:", total);

  // Check Published
  const { count: published, error: err2 } = await supabase
    .from('portfolio_projects')
    .select('*', { count: 'exact', head: true })
    .eq('published', true);
    
  if (err2) console.error("Error fetching published:", err2);
  else console.log("Published projects:", published);

  // Check Featured
  const { count: featured, data: featuredData, error: err3 } = await supabase
    .from('portfolio_projects')
    .select('*', { count: 'exact' })
    .eq('published', true)
    .eq('featured', true);
    
  if (err3) console.error("Error fetching featured:", err3);
  else {
    console.log("Featured projects:", featured);
    if (featuredData && featuredData.length > 0) {
        console.log("Sample featured project:", featuredData[0].title, "| Card Image:", featuredData[0].card_image);
    }
  }
}

main();
