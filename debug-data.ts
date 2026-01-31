
import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './src/utils/supabase/info';

const supabase = createClient(`https://${projectId}.supabase.co`, publicAnonKey);

async function checkData() {
    const { data: articles, error: artError } = await supabase
        .from('articles')
        .select('slug, content')
        .ilike('content', '%gallery%')
        .limit(1);

    if (artError) {
        console.error("Error fetching articles:", artError);
    } else if (articles && articles.length > 0) {
        console.log(`Found Article with Gallery: ${articles[0].slug}`);
    } else {
        console.log("No articles with gallery found.");
    }
}

checkData();
