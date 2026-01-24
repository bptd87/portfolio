
import { createClient } from '@supabase/supabase-js';

const projectId = "zuycsuajiuqsvopiioer";
const publicAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1eWNzdWFqaXVxc3ZvcGlpb2VyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4Mzk1ODUsImV4cCI6MjA3NzQxNTU4NX0.y7C3gkxAXQvOLRdaebj_3MRww2QjaN9fA2sCUzsdhEM";
const supabaseUrl = `https://${projectId}.supabase.co`;

const supabase = createClient(supabaseUrl, publicAnonKey);

async function checkSchema() {
    console.log("Checking 'portfolio_projects' schema...");
    
    const columnsToCheck = [
        'id', 'title', 'project_overview', 'design_notes', 'venue', 'client_name', 
        'software_used', 'process', 'content', 'youtube_videos', 'card_image_alt', 
        'seo_title', 'role', 'tags'
    ];

    for (const col of columnsToCheck) {
        process.stdout.write(`Checking '${col}'... `);
        const { error } = await supabase.from('portfolio_projects').select(col).limit(1);
        if (error) console.log(`FAILED: ${error.message}`);
        else console.log("Success.");
    }

    // Check nullability
    console.log("\nChecking Nullability:");
    const { count: nullVenue } = await supabase.from('portfolio_projects').select('*', { count: 'exact', head: true }).is('venue', null);
    console.log(`  Null 'venue' rows: ${nullVenue} (Nullable: ${nullVenue > 0})`);

    const { count: nullContent } = await supabase.from('portfolio_projects').select('*', { count: 'exact', head: true }).is('content', null);
    console.log(`  Null 'content' rows: ${nullContent} (Nullable: ${nullContent > 0})`);

    const { count: nullSoftware } = await supabase.from('portfolio_projects').select('*', { count: 'exact', head: true }).is('software_used', null);
    console.log(`  Null 'software_used' rows: ${nullSoftware} (Nullable: ${nullSoftware > 0})`);

    // Check Distinct Enums
    console.log("\nChecking Distinct Values (Enum Inference):");
    
    const { data: catData, error: catErr } = await supabase.from('portfolio_projects').select('category');
    if (!catErr) {
        const unique = [...new Set(catData.map(c => c.category))];
        console.log("  Categories:", unique);
    } else console.log("  Categories Error:", catErr.message);

    const { data: subData, error: subErr } = await supabase.from('portfolio_projects').select('subcategory');
    if (!subErr) {
        const unique = [...new Set(subData.map(c => c.subcategory))];
        console.log("  Subcategories:", unique);
    } else console.log("  Subcategories Error:", subErr.message);
}

checkSchema();
