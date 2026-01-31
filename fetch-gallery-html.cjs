const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = "https://zuycsuajiuqsvopiioer.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1eWNzdWFqaXVxc3ZvcGlpb2VyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4Mzk1ODUsImV4cCI6MjA3NzQxNTU4NX0.y7C3gkxAXQvOLRdaebj_3MRww2QjaN9fA2sCUzsdhEM";

const supabase = createClient(supabaseUrl, supabaseKey);

async function fetchGalleryHtml() {
  const { data, error } = await supabase
    .from('articles')
    .select('slug, content')
    .limit(10);

  if (error) {
    console.error('Error fetching data:', error);
    return;
  }

  if (data && data.length > 0) {
    console.log('--- Checking Content Types ---');
    data.forEach(a => {
        console.log(`Slug: ${a.slug}`);
        console.log(`Type: ${typeof a.content}`);
        if (Array.isArray(a.content)) {
            console.log('Is Array: Yes');
            const hasGallery = a.content.some(b => b.type === 'gallery');
            console.log('Has Gallery Block:', hasGallery);
        } else {
            console.log('Is Array: No');
            console.log('Preview:', String(a.content).substring(0, 50));
        }
        console.log('---');
    });
  } else {
    console.log('No articles found.');
  }
}

fetchGalleryHtml();
