import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import 'https://deno.land/std@0.192.0/dotenv/load.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkColumns() {
  const { data, error } = await supabase
    .from('news')
    .select('*')
    .limit(1);
    
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  if (data && data.length > 0) {
    console.log('Columns:', Object.keys(data[0]));
  } else {
    // If no data, we can't easily check keys this way without data, 
    // but usually there's at least one row. 
    // If empty, I'll assume we need to add the column to be safe (idempotent migration).
    console.log('No data found, defaulting to add column.');
  }
}

checkColumns();
