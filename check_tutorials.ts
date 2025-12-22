
import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './src/utils/supabase/info.ts';

const supabase = createClient('https://' + projectId + '.supabase.co', publicAnonKey);

async function check() {
  const { count, error } = await supabase.from('tutorials').select('*', { count: 'exact', head: true });
  if (error) console.error('Error:', error);
  else console.log('Tutorials count:', count);
}

check();

