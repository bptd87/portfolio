
import { createClient } from '@supabase/supabase-js';

const projectId = "zuycsuajiuqsvopiioer";
const publicAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1eWNzdWFqaXVxc3ZvcGlpb2VyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4Mzk1ODUsImV4cCI6MjA3NzQxNTU4NX0.y7C3gkxAXQvOLRdaebj_3MRww2QjaN9fA2sCUzsdhEM";

const supabase = createClient(`https://${projectId}.supabase.co`, publicAnonKey);

async function testSettingsAccess() {
  console.log("Testing access to 'settings' table...");
  const { data, error } = await supabase.from('settings').select('*').limit(1);
  
  if (error) {
    console.error("Error:", error.message);
  } else {
    console.log("Success! Data:", data);
  }
}

testSettingsAccess();
