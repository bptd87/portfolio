/**
 * EMERGENCY TABLE CONSOLIDATION SCRIPT
 * This will read all individual project-* and news-* tables and consolidate them
 * into single 'projects' and 'news' tables for the admin panel to work
 */

const projectId = "zuycsuajiuqsvopiioer";
const serviceKey = prompt("Paste your Supabase SERVICE_ROLE key (from dashboard Settings > API):");

if (!serviceKey) {
  console.error("❌ Service key required. Get it from: https://supabase.com/dashboard/project/" + projectId + "/settings/api");
} else {
  console.log("🔄 Starting table consolidation...");
  
  // This will use the Supabase Management API to:
  // 1. List all tables starting with 'projects-' and 'news-'
  // 2. Read the data from each
  // 3. Insert into consolidated 'projects' and 'news' tables
  // 4. Optionally delete the old individual tables
  
  async function consolidate() {
    try {
      // First, let's just see what tables exist
      const response = await fetch(`https://${projectId}.supabase.co/rest/v1/?apikey=${serviceKey}`, {
        headers: {
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`
        }
      });
      
      const data = await response.json();
      console.log("📋 Available tables:", data);
      
      // Get list of all tables from pg_tables
      const tablesResponse = await fetch(
        `https://${projectId}.supabase.co/rest/v1/rpc/get_table_list`,
        {
          method: 'POST',
          headers: {
            'apikey': serviceKey,
            'Authorization': `Bearer ${serviceKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log("Tables response:", await tablesResponse.text());
      
    } catch (error) {
      console.error("❌ Error:", error);
    }
  }
  
  consolidate();
}
