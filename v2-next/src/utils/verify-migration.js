
const projectId = "zuycsuajiuqsvopiioer";
const publicAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1eWNzdWFqaXVxc3ZvcGlpb2VyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4Mzk1ODUsImV4cCI6MjA3NzQxNTU4NX0.y7C3gkxAXQvOLRdaebj_3MRww2QjaN9fA2sCUzsdhEM";
const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api`;

async function testEndpoint(name, url) {
    console.log(`\nTesting ${name}...`);
    console.log(`URL: ${url}`);
    try {
        const res = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${publicAnonKey}`,
                'Content-Type': 'application/json'
            }
        });

        console.log(`Status: ${res.status}`);
        if (res.ok) {
            const data = await res.json();
            // console.log('Response:', JSON.stringify(data).substring(0, 200) + '...');
            console.log('Response Success:', data.success !== false);
            if (data.error) console.log('Error in body:', data.error);
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
    console.log('Starting Migration Verification Tests...');

    // 1. News (New Table)
    await testEndpoint('News (GET)', `${API_URL}/news`);

    // 2. Tutorials (New Table)
    await testEndpoint('Tutorials (GET)', `${API_URL}/tutorials`);

    // 3. Collaborators (New Table)
    await testEndpoint('Collaborators (GET)', `${API_URL}/collaborators`);

    // 4. Settings (New Table)
    await testEndpoint('Settings (GET)', `${API_URL}/settings`);

    // 5. Tutorial Categories (Should return defaults from code if table empty)
    await testEndpoint('Tutorial Categories (GET)', `${API_URL}/tutorial-categories`);

    console.log('\nTests Completed.');
}

runTests();
