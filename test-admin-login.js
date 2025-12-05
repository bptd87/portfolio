// Test admin login without browser
// Run this with: node test-admin-login.js

const projectId = 'nmhthjtpmqzzivxydciv';
const publicAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5taHRoaHRwbXF6eml2eHlkY2l2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYxNDA3OTAsImV4cCI6MjA1MTcxNjc5MH0.D2o_4S3IMM7HZFUQvdVzMFHmYWOmjbPPvZRf-CJ-zOY';

// REPLACE THIS WITH YOUR PASSWORD:
const testPassword = 'YOUR_PASSWORD_HERE';

async function testLogin() {
  console.log('🔐 Testing admin login...\n');
  
  try {
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/admin/login`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({ password: testPassword }),
      }
    );

    const data = await response.json();

    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log('\n✅ SUCCESS! Login works!');
      console.log('Token:', data.token);
      
      // Test token decode
      try {
        const decoded = atob(data.token);
        console.log('Decoded token:', decoded);
      } catch (err) {
        console.error('Failed to decode token:', err.message);
      }
    } else {
      console.log('\n❌ FAILED!');
      if (data.error === 'Server configuration error') {
        console.log('\n🔧 FIX: Add ADMIN_PASSWORD environment variable in Supabase:');
        console.log('   1. Go to Supabase Dashboard');
        console.log('   2. Settings → Edge Functions → Environment Variables');
        console.log('   3. Add: ADMIN_PASSWORD = your-password');
      } else if (data.error === 'Invalid password') {
        console.log('\n🔧 FIX: Wrong password. Update testPassword in this script.');
      }
    }
  } catch (err) {
    console.error('\n❌ Network error:', err.message);
    console.log('\n🔧 FIX: Make sure your Edge Function is deployed and running.');
  }
}

testLogin();
