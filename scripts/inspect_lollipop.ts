import { createClient } from "@supabase/supabase-js";
import { projectId, publicAnonKey } from "../src/utils/supabase/info.tsx";

const supabase = createClient(
    `https://${projectId}.supabase.co`,
    publicAnonKey,
);

async function inspect() {
    console.log("Fetching project 'First Bank Lollipop Pop Up'...");

    // Fetch ALL columns
    const { data: projects, error } = await supabase
        .from("portfolio_projects")
        .select("*")
        .ilike("title", "%Lollipop%");

    if (error) {
        console.error("Error fetching:", error);
        return;
    }

    if (projects?.length) {
        const p = projects[0];
        console.log("--- FOUND PROJECT DATA ---");
        // recursive logging to see everything
        console.log(JSON.stringify(p, null, 2));
    } else {
        console.log("Project not found.");
    }
}

inspect();
