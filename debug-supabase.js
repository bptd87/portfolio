
import { createClient } from '@supabase/supabase-js';

const projectId = "zuycsuajiuqsvopiioer";
const publicAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1eWNzdWFqaXVxc3ZvcGlpb2VyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4Mzk1ODUsImV4cCI6MjA3NzQxNTU4NX0.y7C3gkxAXQvOLRdaebj_3MRww2QjaN9fA2sCUzsdhEM";
const supabaseUrl = `https://${projectId}.supabase.co`;

const supabase = createClient(supabaseUrl, publicAnonKey);

async function testConnection() {
  console.log('Testing Supabase Connection...');

  try {
    // Test 1: Try 'projects' table
    console.log("Attempting to fetch from 'projects'...");
    const { data: projectsData, error: projectsError } = await supabase
      .from('projects')
      .select('count', { count: 'exact', head: true });
    
    if (projectsError) {
      console.log("❌ 'projects' table error:", projectsError.message, projectsError.code);
    } else {
      console.log("✅ 'projects' table exists or is accessible. Count:", projectsData);
    }

    // Test 2: Try 'portfolio_projects' table
    console.log("Attempting to fetch from 'portfolio_projects'...");
    const { data: portData, error: portError } = await supabase
      .from('portfolio_projects')
      .select('count', { count: 'exact', head: true });

    if (portError) {
      console.log("❌ 'portfolio_projects' table error:", portError.message, portError.code);
    } else {
      console.log("✅ 'portfolio_projects' table exists. Count:", portData);
    }

    // Test 3: Try to get one actual row from portfolio_projects if it worked
    if (!portError) {
       const { data } = await supabase.from('portfolio_projects').select('*').limit(1);
       console.log("Sample Data from portfolio_projects:", data ? "Found row" : "No rows");
       if (data && data[0]) console.log("Keys:", Object.keys(data[0]));
    }

  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

testConnection();
