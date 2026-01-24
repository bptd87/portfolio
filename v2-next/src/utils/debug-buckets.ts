import { createClient } from './supabase/client';

export async function listAllBuckets() {
  const supabase = createClient();
  const { data, error } = await supabase.storage.listBuckets();
  
  if (error) {
    console.error('Error listing buckets:', error);
    return;
  }

  console.log('--- SUPABASE BUCKETS ---');
  data.forEach(bucket => {
    console.log(`- ${bucket.id} (Public: ${bucket.public})`);
  });
  console.log('------------------------');
}

listAllBuckets();
