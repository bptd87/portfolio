import { createClient } from "@supabase/supabase-js";

// Correct credentials from info.tsx
const projectId = "zuycsuajiuqsvopiioer";
const publicAnonKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1eWNzdWFqaXVxc3ZvcGlpb2VyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4Mzk1ODUsImV4cCI6MjA3NzQxNTU4NX0.y7C3gkxAXQvOLRdaebj_3MRww2QjaN9fA2sCUzsdhEM";

const supabaseUrl = `https://${projectId}.supabase.co`;
const supabase = createClient(supabaseUrl, publicAnonKey);

async function inspect() {
    console.log("--- Inspecting Categories & Subcategories ---");

    // 1. Get all unique subcategories for ALL projects to see what we have
    const { data: allData, error: allError } = await supabase
        .from("portfolio_projects")
        .select("category, subcategory, title, id")
        .order("category");

    if (allError) {
        console.error("Error fetching all:", allError);
        return;
    }

    const uniqueStructure = new Set();
    allData.forEach((p) =>
        uniqueStructure.add(`${p.category} -> ${p.subcategory}`)
    );

    console.log("Unique Category -> Subcategory pairs:");
    uniqueStructure.forEach((s) => console.log(s));

    // 2. Specific check for models confusion
    const scenicModels = allData.filter((p) =>
        p.subcategory === "Scenic Models"
    );
    console.log(
        `\nFound ${scenicModels.length} projects with subcategory 'Scenic Models':`,
    );
    scenicModels.forEach((p) => console.log(`- [${p.category}] ${p.title}`));

    // 3. Search for Vectorworks
    const vectorWorks = allData.filter((p) =>
        JSON.stringify(p).toLowerCase().includes("vectorworks")
    );
    console.log(
        `\nFound ${vectorWorks.length} projects mentioning 'vectorworks':`,
    );
    vectorWorks.forEach((p) =>
        console.log(`- [${p.category}/${p.subcategory}] ${p.title}`)
    );
}

inspect();
