
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

const FALLBACK_PROJECT_ID = "zuycsuajiuqsvopiioer";
const FALLBACK_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1eWNzdWFqaXVxc3ZvcGlpb2VyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4Mzk1ODUsImV4cCI6MjA3NzQxNTU4NX0.y7C3gkxAXQvOLRdaebj_3MRww2QjaN9fA2sCUzsdhEM";

const supabaseUrl = `https://${FALLBACK_PROJECT_ID}.supabase.co`;
const supabaseKey = FALLBACK_ANON_KEY;

async function test() {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log("Supabase client created.");

    console.log("Checking portfolio_projects...");
    const { data: projects, error: projectsError } = await supabase
      .from('portfolio_projects')
      .select('id, title')
      .limit(1);
    
    if (projectsError) {
        console.error("Supabase Error:", projectsError);
    } else {
        console.log("Supabase Success:", projects);
    }

  } catch (err) {
    console.error("Runtime Error:", err);
  }
}

test();
