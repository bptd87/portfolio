
import { createClient } from '@supabase/supabase-js';

const projectId = "zuycsuajiuqsvopiioer";
const publicAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1eWNzdWFqaXVxc3ZvcGlpb2VyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4Mzk1ODUsImV4cCI6MjA3NzQxNTU4NX0.y7C3gkxAXQvOLRdaebj_3MRww2QjaN9fA2sCUzsdhEM";

const supabaseUrl = `https://${projectId}.supabase.co`;
const supabase = createClient(supabaseUrl, publicAnonKey);

async function checkConstraint() {
    console.log('Checking check constraints...');

    // We cannot easily query internal postgres tables via the client API (usually restricted).
    // But we can try to insert a dummy row with a known BAD category to see if we get the same error
    // and then try to infer, OR we can try to insert a known GOOD category to verify.

    // Let's print out what the constraint expects by trying to insert a bad value and hoping the error message is descriptive (it was for the user).
    // Actually, I'll just check what values are currently in the DB to see what is allowed.

    const { data, error } = await supabase
        .from('portfolio_projects')
        .select('category')
        .limit(50);

    if (data) {
        const distinct = [...new Set(data.map(d => d.category))];
        const rendering = distinct.find(c => c.includes('Rendering'));
        if (rendering) {
            console.log('Rendering Category Code Points:');
            console.log(JSON.stringify(rendering.split('').map(c => c.charCodeAt(0))));
        } else {
            console.log('Rendering category NOT FOUND in existing data.');
        }
    }
}

checkConstraint();
