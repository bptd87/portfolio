
import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './src/utils/supabase/info';

const supabase = createClient(`https://${projectId}.supabase.co`, publicAnonKey);

async function checkData() {
    console.log("Checking Supabase Connection...");
    const { data: projects, error } = await supabase
        .from('portfolio_projects')
        .select('*')
        .eq('featured', true)
        .eq('published', true);

    if (error) {
        console.error("Error fetching projects:", error);
    } else {
        console.log(`Found ${projects.length} featured projects.`);
        if (projects.length > 0) {
            console.log("Sample Project:", projects[0].title);
            console.log("Image URL:", projects[0].card_image);
        }
    }

    const { data: news, error: newsError } = await supabase
        .from('news')
        .select('*')
        .limit(5);

    if (newsError) {
        console.error("Error fetching news:", newsError);
    } else {
        console.log(`Found ${news.length} news items.`);
    }
}

checkData();
