
import { createClient } from '@supabase/supabase-js';

const projectId = "zuycsuajiuqsvopiioer";
const publicAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1eWNzdWFqaXVxc3ZvcGlpb2VyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4Mzk1ODUsImV4cCI6MjA3NzQxNTU4NX0.y7C3gkxAXQvOLRdaebj_3MRww2QjaN9fA2sCUzsdhEM";

const supabaseUrl = `https://${projectId}.supabase.co`;
const supabase = createClient(supabaseUrl, publicAnonKey);

async function checkColumns() {
    console.log('Checking database columns...');

    // Try to select ALL the columns we expect
    const { data, error } = await supabase
        .from('portfolio_projects')
        .select('id, software_used, client_name, challenge, key_features')
        .limit(1);

    if (error) {
        console.error('❌ Error selecting columns:', error.message);
        if (error.message.includes('column') && error.message.includes('does not exist')) {
            console.error('!! MISSING COLUMNS DETECTED !!');
            console.error('It seems you ran the Rendering migration, but MISSED the Experiential migration.');
            console.error('Please run: supabase/migrations/20251214_add_missing_portfolio_columns.sql');
        }
    } else {
        console.log('✅ ALL Columns exist! Query success.');
        console.log('Sample data:', data);
    }
}

checkColumns();
