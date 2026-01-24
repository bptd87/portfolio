import { createClient } from "@supabase/supabase-js";

// Keys from check_tables.ts (assuming they are valid for this env)
const projectId = "zuycsuajiuqsvopiioer";
const publicAnonKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1eWNzdWFqaXVxc3ZvcGlpb2VyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4Mzk1ODUsImV4cCI6MjA3NzQxNTU4NX0.y7C3gkxAXQvOLRdaebj_3MRww2QjaN9fA2sCUzsdhEM";

const supabaseUrl = `https://${projectId}.supabase.co`;
const supabase = createClient(supabaseUrl, publicAnonKey);

async function checkCategories() {
    console.log("Fetching all portfolio_projects to analyze categories...");

    const { data, error } = await supabase
        .from("portfolio_projects")
        .select("category, title, published");

    if (error) {
        console.error("Error fetching data:", error);
        return;
    }

    if (!data || data.length === 0) {
        console.log("No projects found.");
        return;
    }

    console.log(`Found ${data.length} total projects.`);

    const categoryCounts: Record<string, number> = {};
    const publishedCounts: Record<string, number> = {};

    data.forEach((p) => {
        const cat = p.category || "Uncategorized";
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;

        if (p.published) {
            publishedCounts[cat] = (publishedCounts[cat] || 0) + 1;
        }
    });

    console.log("\nCategory Counts (All):");
    console.table(categoryCounts);

    console.log("\nCategory Counts (Published Only):");
    console.table(publishedCounts);

    console.log("\nSample Titles per Category:");
    const samples: Record<string, string[]> = {};
    data.forEach((p) => {
        const cat = p.category || "Uncategorized";
        if (!samples[cat]) samples[cat] = [];
        if (samples[cat].length < 3) samples[cat].push(p.title);
    });
    console.log(samples);
}

checkCategories();
