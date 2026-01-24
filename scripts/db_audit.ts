import { createClient } from "@supabase/supabase-js";

// Hardcoded for script use based on src/utils/supabase/info.tsx
const projectId = "zuycsuajiuqsvopiioer";
const publicAnonKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1eWNzdWFqaXVxc3ZvcGlpb2VyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4Mzk1ODUsImV4cCI6MjA3NzQxNTU4NX0.y7C3gkxAXQvOLRdaebj_3MRww2QjaN9fA2sCUzsdhEM";
const supabaseUrl = `https://${projectId}.supabase.co`;

const supabase = createClient(supabaseUrl, publicAnonKey);

async function findLostProjects() {
    console.log("--- Hunting for Lost Vectorworks/3D Projects ---");

    // 1. Fetch ALL projects to do a broad client-side search (assuming DB isn't huge)
    // or fetch fields we care about.
    const { data, error } = await supabase
        .from("portfolio_projects")
        .select("*")
        .order("created_at", { ascending: false, nullsFirst: false }); // Check recent first if created_at exists, else just all.

    if (error) {
        console.error("Error fetching projects:", error);
        return;
    }

    console.log(`Scanned ${data.length} total projects.`);

    const matches = data.filter((p) => {
        const raw = JSON.stringify(p).toLowerCase();
        return raw.includes("vectorworks") ||
            raw.includes("vwx") ||
            raw.includes("3d model") ||
            raw.includes("resource") ||
            (p.category && p.category.toLowerCase().includes("model")) ||
            (p.subcategory &&
                p.subcategory.toLowerCase().includes("vectorworks"));
    });

    if (matches.length === 0) {
        console.log(
            'No matching projects found containing "Vectorworks", "vwx", or "3D Model".',
        );
    } else {
        console.table(matches.map((p) => ({
            id: p.id,
            title: p.title,
            category: p.category,
            subcategory: p.subcategory,
            // Show a snippet of where the match might be
            match_reason:
                (p.title && p.title.toLowerCase().includes("vectorworks"))
                    ? "Title"
                    : (p.category === "3D Models")
                    ? "Category"
                    : "Deep Search",
        })));
    }

    // Also check if there's a totally different table?
    // Not easily possible via JS client without knowing schema, but we assume portfolio_projects.
}

findLostProjects();
