// 🚨 COPY AND PASTE THIS ENTIRE FILE INTO BROWSER CONSOLE (F12)
// This will test if you're kicked out of Supabase

(async () => {
  console.log('🔍 ========================================');
  console.log('🔍 SUPABASE CONNECTION TEST');
  console.log('🔍 ========================================\n');

  try {
    const { projectId, publicAnonKey } = await import('./utils/supabase/info.tsx');
    
    console.log('📋 Project Info:');
    console.log('   Project ID:', projectId);
    console.log('   Project URL:', `https://${projectId}.supabase.co`);
    console.log('   Dashboard:', `https://supabase.com/dashboard/project/${projectId}`);
    console.log('');

    // Test 1: Health Check
    console.log('1️⃣ Testing server health endpoint...');
    try {
      const healthResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-980dd7a4/health`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );
      
      console.log('   Status:', healthResponse.status, healthResponse.statusText);
      
      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        console.log('   ✅ SERVER IS ONLINE!', healthData);
      } else {
        console.log('   ❌ SERVER NOT RESPONDING');
        if (healthResponse.status === 404) {
          console.log('   ⚠️  Edge function missing or project paused');
        }
        if (healthResponse.status === 401 || healthResponse.status === 403) {
          console.log('   ⚠️  AUTHENTICATION FAILED - API key issue');
        }
      }
    } catch (healthError) {
      console.log('   ❌ CANNOT REACH SERVER AT ALL');
      console.log('   Error:', healthError.message);
      console.log('   ⚠️  Project is likely PAUSED or DELETED');
    }

    console.log('');

    // Test 2: Database Connection
    console.log('2️⃣ Testing database connection...');
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        `https://${projectId}.supabase.co`,
        publicAnonKey
      );

      const { data, error } = await supabase
        .from('kv_store_980dd7a4')
        .select('key')
        .limit(1);
      
      if (error) {
        console.log('   ❌ DATABASE ERROR:', error.message);
        console.log('   Code:', error.code);
        
        if (error.message.includes('JWT') || error.message.includes('token')) {
          console.log('   ⚠️  API KEY PROBLEM - Keys might be invalid');
        }
        if (error.message.includes('not found') || error.message.includes('does not exist')) {
          console.log('   ⚠️  TABLE MISSING - Database might be reset');
        }
      } else {
        console.log('   ✅ DATABASE CONNECTED!');
        console.log('   Sample:', data);
      }
    } catch (dbError) {
      console.log('   ❌ CANNOT CONNECT TO DATABASE');
      console.log('   Error:', dbError.message);
    }

    console.log('');

    // Test 3: Try to load data
    console.log('3️⃣ Testing data access...');
    try {
      const { getByPrefixFromKV } = await import('./utils/supabase/client.ts');
      
      const posts = await getByPrefixFromKV('blog_post:');
      const projects = await getByPrefixFromKV('project:');
      const news = await getByPrefixFromKV('news:');
      
      console.log('   Blog posts:', posts?.length || 0);
      console.log('   Projects:', projects?.length || 0);
      console.log('   News:', news?.length || 0);
      
      const total = (posts?.length || 0) + (projects?.length || 0) + (news?.length || 0);
      
      if (total > 0) {
        console.log('   ✅ DATA EXISTS IN DATABASE!');
      } else {
        console.log('   ⚠️  NO DATA FOUND (but database is accessible)');
      }
    } catch (dataError) {
      console.log('   ❌ CANNOT ACCESS DATA');
      console.log('   Error:', dataError.message);
    }

    console.log('');
    console.log('🔍 ========================================');
    console.log('🔍 DIAGNOSIS');
    console.log('🔍 ========================================\n');

    // Provide diagnosis
    console.log('Based on the tests above:\n');
    console.log('✅ = Working');
    console.log('❌ = Failed\n');
    console.log('If ALL tests failed:');
    console.log('   → Your Supabase project is likely PAUSED or DELETED');
    console.log('   → Go to https://supabase.com/dashboard');
    console.log('   → Find your project and click "Resume"\n');
    
    console.log('If server failed but database works:');
    console.log('   → Edge function issue');
    console.log('   → Admin panel won\'t work but data is safe\n');
    
    console.log('If everything works but no data:');
    console.log('   → Data was deleted or never imported');
    console.log('   → Use Data Sync to restore from code files\n');
    
    console.log('If database failed with JWT/token error:');
    console.log('   → API keys are invalid or expired');
    console.log('   → Get new keys from Supabase dashboard\n');

    console.log('🔗 Quick Links:');
    console.log(`   Dashboard: https://supabase.com/dashboard/project/${projectId}`);
    console.log('   Status: https://status.supabase.com/');
    console.log('');

  } catch (error) {
    console.log('❌ CRITICAL ERROR RUNNING TEST');
    console.log('Error:', error.message);
    console.log('\nThis usually means:');
    console.log('1. File import failed');
    console.log('2. Supabase client not configured');
    console.log('3. Project setup incomplete');
  }

  console.log('🔍 ========================================');
  console.log('🔍 END TEST');
  console.log('🔍 ========================================');
})();
