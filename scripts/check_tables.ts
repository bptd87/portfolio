import { createClient } from "@supabase/supabase-js";

const projectId = "zuycsuajiuqsvopiioer";
const publicAnonKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1eWNzdWFqaXVxc3ZvcGlpb2VyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4Mzk1ODUsImV4cCI6MjA3NzQxNTU4NX0.y7C3gkxAXQvOLRdaebj_3MRww2QjaN9fA2sCUzsdhEM";

const supabaseUrl = `https://${projectId}.supabase.co`;
const supabase = createClient(supabaseUrl, publicAnonKey);

const runCheck = async () => {
    console.log(
        "\nChecking 'portfolio_projects' schema by selecting potential new columns:",
    );

    // We try to select the columns that might be missing.
    // If a column doesn't exist, Supabase API usually returns an error "Could not find the 'xyz' column of 'portfolio_projects' in the schema cache"
    const columnsToCheck =
        "id, project_overview, design_notes, software_used, content, process";

    const { data: colCheck, error: colError } = await supabase
        .from("portfolio_projects")
        .select(columnsToCheck)
        .limit(1);

    if (colError) {
        console.error("  Column Check Error:", colError.message);
        console.error("  Full Error:", colError);
    } else {
        console.log("  Columns exist! Sample data:", colCheck);
    }
};

runCheck();
