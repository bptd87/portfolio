// 🚨 COPY THIS ENTIRE FILE INTO BROWSER CONSOLE (F12)
// This checks BOTH possible table names to find your data

(async () => {
  console.log('🔍 ========================================');
  console.log('🔍 TABLE NAME MISMATCH CHECK');
  console.log('🔍 ========================================\n');

  try {
    const { createClient } = await import('@supabase/supabase-js');
    const { projectId, publicAnonKey } = await import('./utils/supabase/info.tsx');

    const supabase = createClient(
      `https://${projectId}.supabase.co`,
      publicAnonKey
    );

    console.log('📋 Project ID:', projectId);
    console.log('');

    // Test Table 1: kv_store_980dd7a4 (what code expects)
    console.log('1️⃣ Testing: kv_store_980dd7a4 (current code)');
    try {
      const { data: data1, error: error1 } = await supabase
        .from('kv_store_980dd7a4')
        .select('key')
        .limit(10);
      
      if (error1) {
        console.log('   ❌ ERROR:', error1.message);
        if (error1.message.includes('not found') || error1.message.includes('does not exist')) {
          console.log('   ⚠️  TABLE DOES NOT EXIST!');
        }
      } else {
        const count = data1?.length || 0;
        console.log(`   ✅ Table exists with ${count} items (showing max 10)`);
        if (count > 0) {
          console.log('   📦 Sample keys:');
          data1.slice(0, 5).forEach(d => console.log('      -', d.key));
        } else {
          console.log('   ⚠️  Table is EMPTY');
        }
      }
    } catch (e) {
      console.log('   ❌ CANNOT ACCESS:', e.message);
    }

    console.log('');

    // Test Table 2: kv_store_74296234 (from Supabase warning)
    console.log('2️⃣ Testing: kv_store_74296234 (from Supabase warning)');
    try {
      const { data: data2, error: error2 } = await supabase
        .from('kv_store_74296234')
        .select('key')
        .limit(10);
      
      if (error2) {
        console.log('   ❌ ERROR:', error2.message);
        if (error2.message.includes('not found') || error2.message.includes('does not exist')) {
          console.log('   ⚠️  TABLE DOES NOT EXIST!');
        }
      } else {
        const count = data2?.length || 0;
        console.log(`   ✅ Table exists with ${count} items (showing max 10)`);
        if (count > 0) {
          console.log('   📦 Sample keys:');
          data2.slice(0, 5).forEach(d => console.log('      -', d.key));
          console.log('');
          console.log('   🎯 YOUR DATA IS IN THIS TABLE!');
        } else {
          console.log('   ⚠️  Table is EMPTY');
        }
      }
    } catch (e) {
      console.log('   ❌ CANNOT ACCESS:', e.message);
    }

    console.log('');
    console.log('🔍 ========================================');
    console.log('🔍 DIAGNOSIS');
    console.log('🔍 ========================================\n');

    // Try to count items in both tables
    let count1 = 0, count2 = 0;
    
    try {
      const { data: d1 } = await supabase.from('kv_store_980dd7a4').select('key', { count: 'exact', head: true });
      count1 = d1?.length || 0;
    } catch (e) {}

    try {
      const { data: d2 } = await supabase.from('kv_store_74296234').select('key', { count: 'exact', head: true });
      count2 = d2?.length || 0;
    } catch (e) {}

    console.log('📊 Summary:');
    console.log(`   kv_store_980dd7a4: ~${count1} items (what code uses)`);
    console.log(`   kv_store_74296234: ~${count2} items (from warning)`);
    console.log('');

    if (count2 > 0 && count1 === 0) {
      console.log('🎯 FOUND THE ISSUE!');
      console.log('');
      console.log('Your data is in: kv_store_74296234');
      console.log('But code looks at: kv_store_980dd7a4');
      console.log('');
      console.log('✅ SOLUTION: Update the code to use kv_store_74296234');
      console.log('   OR migrate data from 74296234 to 980dd7a4');
      console.log('');
      console.log('Tell the AI: "Update the table name to kv_store_74296234"');
    } else if (count1 > 0 && count2 === 0) {
      console.log('✅ Code is using correct table');
      console.log('   kv_store_74296234 warning is about an old empty table');
      console.log('   You can safely ignore the Supabase warning');
      console.log('');
      console.log('The empty admin panel is a different issue.');
      console.log('Go back to troubleshooting guides.');
    } else if (count1 === 0 && count2 === 0) {
      console.log('⚠️  BOTH TABLES ARE EMPTY');
      console.log('');
      console.log('Your data was never imported or was deleted.');
      console.log('');
      console.log('✅ SOLUTION: Use Data Sync to restore from code files');
      console.log('   1. Go to Admin panel');
      console.log('   2. Click "Data Sync" tab');
      console.log('   3. Click "Sync All Data to Database"');
    } else {
      console.log('✅ Both tables have data');
      console.log('   The code should be working with kv_store_980dd7a4');
      console.log('   kv_store_74296234 might be old/backup data');
    }

    console.log('');
    console.log('🔗 View tables in Supabase Dashboard:');
    console.log(`   https://supabase.com/dashboard/project/${projectId}/database/tables`);

  } catch (error) {
    console.log('❌ CRITICAL ERROR:', error.message);
    console.log('');
    console.log('This usually means:');
    console.log('1. Not connected to Supabase');
    console.log('2. Project is paused');
    console.log('3. API keys are invalid');
  }

  console.log('');
  console.log('🔍 ========================================');
  console.log('🔍 END CHECK');
  console.log('🔍 ========================================');
})();
