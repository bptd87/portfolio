
import { createClient } from '@supabase/supabase-js';

const projectId = "zuycsuajiuqsvopiioer";
const publicAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1eWNzdWFqaXVxc3ZvcGlpb2VyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4Mzk1ODUsImV4cCI6MjA3NzQxNTU4NX0.y7C3gkxAXQvOLRdaebj_3MRww2QjaN9fA2sCUzsdhEM";

const supabaseUrl = `https://${projectId}.supabase.co`;
const supabase = createClient(supabaseUrl, publicAnonKey);

async function testInsert() {
    console.log('Attempting to insert a Rendering & Visualization project...');

    const payload = {
        title: 'Test Rendering Project ' + Date.now(),
        category: 'Rendering & Visualization', // This is the value we want to test
        year: 2025,
        description: 'Test description',
        featured: false,
        published: false,
        software_used: ['Cinema 4D'],
        project_overview: 'Test overview'
    };

    const { data, error } = await supabase
        .from('portfolio_projects')
        .insert([payload])
        .select()
        .single();

    if (error) {
        console.error('❌ Insertion FAILED:', error);
        if (error.message.includes('constraint')) {
            console.error('VERDSCT: The database constraint is STILL rejecting the category.');
        }
    } else {
        console.log('✅ Insertion SUCCESS:', data);
        console.log('VERDICT: The database allows this category. The issue must be in the frontend payload.');

        // Clean up
        await supabase.from('portfolio_projects').delete().eq('id', data.id);
    }
}

testInsert();
