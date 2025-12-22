/**
 * Migrate data from old Edge Function API to new SQL tables
 * 
 * This fetches data from the old make-server-980dd7a4 function
 * and inserts it into the new SQL tables.
 */

const projectId = "zuycsuajiuqsvopiioer";
const anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1eWNzdWFqaXVxc3ZvcGlpb2VyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4Mzk1ODUsImV4cCI6MjA3NzQxNTU4NX0.y7C3gkxAXQvOLRdaebj_3MRww2QjaN9fA2sCUzsdhEM";

const OLD_API = `https://${projectId}.supabase.co/functions/v1/make-server-980dd7a4`;
const NEW_API = `https://${projectId}.supabase.co/functions/v1/make-server-74296234`;

async function getAdminToken(password) {
    const response = await fetch(`${NEW_API}/api/admin/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${anonKey}`
        },
        body: JSON.stringify({ password })
    });
    const data = await response.json();
    return data.token;
}

async function migrateData(adminToken) {
    console.log('🚀 Starting data migration from old API to SQL...\n');

    // Fetch news from old API
    console.log('📰 Fetching news from old API...');
    const newsResponse = await fetch(`${OLD_API}/api/news`, {
        headers: { 'Authorization': `Bearer ${anonKey}` }
    });
    const newsData = await newsResponse.json();
    const newsItems = newsData.success ? newsData.news : [];
    console.log(`Found ${newsItems.length} news items\n`);

    // Migrate each news item
    let migrated = 0;
    let errors = 0;

    for (const item of newsItems) {
        try {
            const response = await fetch(`${NEW_API}/api/admin/news`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${anonKey}`,
                    'X-Admin-Token': adminToken
                },
                body: JSON.stringify({
                    slug: item.slug,
                    title: item.title,
                    excerpt: item.excerpt,
                    content: item.content || item.blocks,
                    date: item.date,
                    category: item.category,
                    tags: item.tags || [],
                    cover_image: item.coverImage, // Map camelCase to snake_case
                    link: item.link,
                    location: item.location,
                    published: true
                })
            });

            if (response.ok) {
                migrated++;
                console.log(`✅ Migrated: ${item.title}`);
            } else {
                errors++;
                const error = await response.text();
                console.log(`❌ Failed: ${item.title} - ${error}`);
            }
        } catch (err) {
            errors++;
            console.log(`❌ Error migrating ${item.title}: ${err.message}`);
        }
    }

    console.log(`\n📊 Migration complete!`);
    console.log(`  Migrated: ${migrated}`);
    console.log(`  Errors: ${errors}`);
}

// Run migration
const password = process.argv[2];
if (!password) {
    console.error('Usage: node migrate-from-old-api.js YOUR_ADMIN_PASSWORD');
    process.exit(1);
}

getAdminToken(password)
    .then(token => migrateData(token))
    .catch(err => {
        console.error('Migration failed:', err);
        process.exit(1);
    });
