import { createClient } from "@supabase/supabase-js";

const projectId = "zuycsuajiuqsvopiioer";
const publicAnonKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1eWNzdWFqaXVxc3ZvcGlpb2VyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4Mzk1ODUsImV4cCI6MjA3NzQxNTU4NX0.y7C3gkxAXQvOLRdaebj_3MRww2QjaN9fA2sCUzsdhEM";
const supabaseUrl = `https://${projectId}.supabase.co`;

const supabase = createClient(supabaseUrl, publicAnonKey);

async function inspectProject() {
    const id = "7241e001-f966-428c-9bda-5dc7a9ac418a"; // New Swan Venue File
    console.log(`--- Inspecting Project ${id} ---`);

    const { data, error } = await supabase
        .from("portfolio_projects")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
        console.error("Error:", error);
        return;
    }

    console.log(JSON.stringify(data, null, 2));
}

inspectProject();
