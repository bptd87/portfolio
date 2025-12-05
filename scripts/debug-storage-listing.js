
const { createClient } = require('@supabase/supabase-js');

const projectId = "zuycsuajiuqsvopiioer";
const publicAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1eWNzdWFqaXVxc3ZvcGlpb2VyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4Mzk1ODUsImV4cCI6MjA3NzQxNTU4NX0.y7C3gkxAXQvOLRdaebj_3MRww2QjaN9fA2sCUzsdhEM";

const supabaseUrl = `https://${projectId}.supabase.co`;
const supabase = createClient(supabaseUrl, publicAnonKey);

async function testStorage() {
    console.log('--- Testing Supabase Storage Listing ---');
    const bucketName = 'make-74296234-images';

    // 1. List Buckets
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    if (bucketError) {
        console.error('Error listing buckets:', bucketError);
    } else {
        console.log('Buckets found:', buckets.map(b => b.name));
        const targetBucket = buckets.find(b => b.name === bucketName);
        if (targetBucket) {
            console.log(`Target bucket '${bucketName}' exists. Public: ${targetBucket.public}`);
        } else {
            console.error(`Target bucket '${bucketName}' NOT found!`);
        }
    }

    // 2. List Root
    console.log(`\nListing root of '${bucketName}'...`);
    const { data: rootFiles, error: rootError } = await supabase.storage.from(bucketName).list('', { limit: 10, sortBy: { column: 'created_at', order: 'desc' } });
    if (rootError) console.error('Error listing root:', rootError);
    else console.log('Root files:', rootFiles);

    // 3. List 'image' folder
    console.log(`\nListing 'image' folder of '${bucketName}'...`);
    const { data: imageFiles, error: imageError } = await supabase.storage.from(bucketName).list('image', { limit: 10 });
    if (imageError) console.error('Error listing image folder:', imageError);
    else console.log('image/ files:', imageFiles);

    // 4. List 'images' folder
    console.log(`\nListing 'images' folder of '${bucketName}'...`);
    const { data: imagesFiles, error: imagesError } = await supabase.storage.from(bucketName).list('images', { limit: 10 });
    if (imagesError) console.error('Error listing images folder:', imagesError);
    else console.log('images/ files:', imagesFiles);

}

testStorage();
