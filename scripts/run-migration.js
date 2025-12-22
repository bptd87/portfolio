/**
 * Run KV to SQL Migration
 * 
 * This script triggers the migration Edge Function to move data from KV to SQL.
 * 
 * Usage: node run-migration.js
 */

const projectId = "zuycsuajiuqsvopiioer";
const publicAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1eWNzdWFqaXVxc3ZvcGlpb2VyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4Mzk1ODUsImV4cCI6MjA3NzQxNTU4NX0.y7C3gkxAXQvOLRdaebj_3MRww2QjaN9fA2sCUzsdhEM";

// You'll need to get your admin token - it's the base64 encoded string from your login
const adminToken = process.env.ADMIN_TOKEN || btoa(`admin:${Date.now()}`);

const MIGRATION_URL = `https://${projectId}.supabase.co/functions/v1/kv-migration/migrate`;

async function runMigration() {
    console.log('🚀 Starting KV to SQL migration...\n');
    console.log(`Endpoint: ${MIGRATION_URL}\n`);

    try {
        const response = await fetch(MIGRATION_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${publicAnonKey}`,
                'X-Admin-Token': adminToken,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('❌ Migration failed:', data.error);
            if (data.results) {
                console.log('\nPartial results:', JSON.stringify(data.results, null, 2));
            }
            process.exit(1);
        }

        console.log('✅ Migration completed successfully!\n');
        console.log('Summary:');
        console.log(`  Total migrated: ${data.summary.totalMigrated}`);
        console.log(`  Total errors: ${data.summary.totalErrors}\n`);

        console.log('Detailed Results:');
        console.log(`  News: ${data.results.news.migrated} migrated, ${data.results.news.errors.length} errors`);
        console.log(`  Tutorials: ${data.results.tutorials.migrated} migrated, ${data.results.tutorials.errors.length} errors`);
        console.log(`  Collaborators: ${data.results.collaborators.migrated} migrated, ${data.results.collaborators.errors.length} errors`);
        console.log(`  Bio Links: ${data.results.bioLinks.migrated} migrated, ${data.results.bioLinks.errors.length} errors`);
        console.log(`  Config: ${data.results.config.migrated} migrated, ${data.results.config.errors.length} errors`);

        if (data.summary.totalErrors > 0) {
            console.log('\n⚠️  Errors encountered:');
            if (data.results.news.errors.length > 0) {
                console.log('\n  News errors:', data.results.news.errors);
            }
            if (data.results.tutorials.errors.length > 0) {
                console.log('\n  Tutorial errors:', data.results.tutorials.errors);
            }
            if (data.results.collaborators.errors.length > 0) {
                console.log('\n  Collaborator errors:', data.results.collaborators.errors);
            }
            if (data.results.bioLinks.errors.length > 0) {
                console.log('\n  Bio Link errors:', data.results.bioLinks.errors);
            }
            if (data.results.config.errors.length > 0) {
                console.log('\n  Config errors:', data.results.config.errors);
            }
        }

    } catch (error) {
        console.error('❌ Failed to run migration:', error.message);
        process.exit(1);
    }
}

runMigration();
