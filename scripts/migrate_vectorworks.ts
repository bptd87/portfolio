console.warn("Deprecated script: migration handled in Admin tools.");
process.exit(0);

import { createClient } from "@supabase/supabase-js";

const projectId = "zuycsuajiuqsvopiioer";
const publicAnonKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1eWNzdWFqaXVxc3ZvcGlpb2VyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4Mzk1ODUsImV4cCI6MjA3NzQxNTU4NX0.y7C3gkxAXQvOLRdaebj_3MRww2QjaN9fA2sCUzsdhEM";
const supabaseUrl = `https://${projectId}.supabase.co`;

const supabase = createClient(supabaseUrl, publicAnonKey);

async function migrateProject() {
    const id = "7241e001-f966-428c-9bda-5dc7a9ac418a"; // New Swan Venue File
    console.log(`--- Migrating Project ${id} ---`);

    // Move to '3D Models' / 'Vectorworks'
    const { error } = await supabase
        .from("portfolio_projects")
        .update({
            category: "3D Models",
            subcategory: "Vectorworks",
            // Initialize content with empty downloadUrl structure so form picks it up
            content: { downloadUrl: null },
        })
        .eq("id", id);

    if (error) {
        console.error("Error migrating:", error);
    } else {
        console.log(
            "Successfully migrated New Swan Venue File to Vectorworks section.",
        );
    }
}

migrateProject();
