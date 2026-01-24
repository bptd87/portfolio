import { createClient } from "@supabase/supabase-js";

const projectId = "zuycsuajiuqsvopiioer";
const publicAnonKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1eWNzdWFqaXVxc3ZvcGlpb2VyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4Mzk1ODUsImV4cCI6MjA3NzQxNTU4NX0.y7C3gkxAXQvOLRdaebj_3MRww2QjaN9fA2sCUzsdhEM";

const supabaseUrl = `https://${projectId}.supabase.co`;
const supabase = createClient(supabaseUrl, publicAnonKey);

async function deleteProject() {
    const targetSlug = "first-bank-lollipop-pop-up";

    console.log(`Attempting to delete project with slug: ${targetSlug}`);

    // 1. Find the project first to confirm it exists and get its ID
    const { data: projects, error: findError } = await supabase
        .from("portfolio_projects")
        .select("id, title")
        .eq("slug", targetSlug);

    if (findError) {
        console.error("Error finding project:", findError);
        return;
    }

    if (!projects || projects.length === 0) {
        console.log("Project not found. It might have already been deleted.");
        return;
    }

    const project = projects[0];
    console.log(`Found project: "${project.title}" (ID: ${project.id})`);

    // 2. Delete the project
    const { data: deleteData, error: deleteError } = await supabase
        .from("portfolio_projects")
        .delete()
        .eq("id", project.id)
        .select();

    if (deleteError) {
        console.error("Error deleting project:", deleteError);
        console.error(
            "This might be due to Row Level Security (RLS) policies.",
        );
        console.error(
            "You may need to use the Supabase dashboard or a service role key to delete this project.",
        );
    } else {
        console.log("Delete operation completed.");
        console.log("Deleted data:", deleteData);

        // Verify deletion
        const { data: verifyData } = await supabase
            .from("portfolio_projects")
            .select("id, title")
            .eq("id", project.id);

        if (verifyData && verifyData.length > 0) {
            console.log(
                "WARNING: Project still exists in database after delete operation!",
            );
            console.log(
                "This is likely due to RLS policies preventing deletion with the anon key.",
            );
        } else {
            console.log("Successfully verified: Project has been deleted.");
        }
    }
}

deleteProject();
