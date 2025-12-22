
const projectId = "zuycsuajiuqsvopiioer";
const publicAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1eWNzdWFqaXVxc3ZvcGlpb2VyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4Mzk1ODUsImV4cCI6MjA3NzQxNTU4NX0.y7C3gkxAXQvOLRdaebj_3MRww2QjaN9fA2sCUzsdhEM";
const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api`;

async function testEndpoint(name, url, method = 'POST') {
    console.log(`\nTesting ${name}...`);
    console.log(`URL: ${url}`);
    try {
        const res = await fetch(url, {
            method,
            headers: {
                'Authorization': `Bearer ${publicAnonKey}`,
                'Content-Type': 'application/json'
            }
        });

        console.log(`Status: ${res.status}`);
        if (res.ok) {
            const data = await res.json();
            console.log('Response:', JSON.stringify(data));
            return true;
        } else {
            const text = await res.text();
            console.log('Error Body:', text);
            return false;
        }
    } catch (e) {
        console.error('Fetch error:', e);
        return false;
    }
}

async function runTests() {
    console.log('Starting Validation Tests...');

    // 1. Project Like
    await testEndpoint('Project Like', `${API_URL}/projects/million-dollar-quartet/like`);

    // 2. Post Like
    await testEndpoint('Post Like', `${API_URL}/posts/test-post-id/like`);

    // 3. Post Unlike
    await testEndpoint('Post Unlike', `${API_URL}/posts/test-post-id/unlike`);

    // 4. Post View
    await testEndpoint('Post View', `${API_URL}/posts/test-post-id/view`);

    console.log('\nTests Completed.');
}

runTests();
