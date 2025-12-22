
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Manual .env parsing
try {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        process.env[match[1].trim()] = match[2].trim();
      }
    });
  }
} catch (e) {
  console.log('Could not read .env.local file', e);
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkArticles() {
  console.log('Checking articles table...');
  const { data, error } = await supabase
    .from('articles')
    .select('id, title, published')
    .limit(5);

  if (error) {
    console.error('Error fetching articles:', error);
  } else {
    console.log(`Found ${data.length} articles:`);
    if (data.length > 0) {
      console.table(data);
    } else {
      console.log('No articles found in the database. Need to migrate data.');
    }
  }
}

checkArticles();
