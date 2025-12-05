/**
 * Database Connection Test Utility
 * 
 * Run this in the browser console to test your database connection:
 * 
 * const test = await import('./utils/test-database-connection.ts');
 * await test.testConnection();
 */

import { createClient } from './supabase/client';

/**
 * Test the database connection
 */
export async function testConnection() {
  console.log('🔍 Testing database connection...\n');
  
  try {
    const supabase = createClient();
    
    // Test 1: Check if we can connect to Supabase
    console.log('📡 Test 1: Checking Supabase connection...');
    const { data: healthCheck, error: healthError } = await supabase
      .from('kv_store_980dd7a4')
      .select('count')
      .limit(0)
      .single();
    
    if (healthError && healthError.code !== 'PGRST116') {
      // PGRST116 is "no rows returned" which is fine for a count query
      console.error('❌ Connection test failed:', healthError);
      console.error('   Error code:', healthError.code);
      console.error('   Error message:', healthError.message);
      console.error('   Error details:', healthError.details);
      console.error('   Error hint:', healthError.hint);
      
      // Check if it's a table doesn't exist error
      if (healthError.message.includes('does not exist')) {
        console.error('\n⚠️  The table "kv_store_980dd7a4" does not exist!');
        console.error('   This usually means the database needs to be initialized.');
        console.error('   Please check the Supabase dashboard to ensure the table exists.');
        return false;
      }
      
      return false;
    }
    
    console.log('✅ Connection successful!\n');
    
    // Test 2: Try to fetch all keys
    console.log('📊 Test 2: Checking table contents...');
    const { data: allData, error: fetchError } = await supabase
      .from('kv_store_980dd7a4')
      .select('key')
      .limit(100);
    
    if (fetchError) {
      console.error('❌ Failed to fetch data:', fetchError);
      return false;
    }
    
    console.log(`✅ Found ${allData?.length || 0} records in database\n`);
    
    if (allData && allData.length > 0) {
      console.log('📋 First 10 keys:');
      allData.slice(0, 10).forEach((item, idx) => {
        console.log(`   ${idx + 1}. ${item.key}`);
      });
      
      // Count by prefix
      const prefixes = ['blog_post:', 'project:', 'news:', 'tutorial:'];
      console.log('\n📊 Records by type:');
      for (const prefix of prefixes) {
        const count = allData.filter(item => item.key.startsWith(prefix)).length;
        console.log(`   ${prefix} ${count} records`);
      }
    } else {
      console.log('⚠️  Database is empty. You may need to run DataSync in the admin panel.');
    }
    
    // Test 3: Try to fetch blog posts specifically
    console.log('\n📚 Test 3: Fetching blog posts...');
    const { data: posts, error: postsError } = await supabase
      .from('kv_store_980dd7a4')
      .select('key, value')
      .like('key', 'blog_post:%');
    
    if (postsError) {
      console.error('❌ Failed to fetch blog posts:', postsError);
      return false;
    }
    
    console.log(`✅ Found ${posts?.length || 0} blog posts`);
    
    if (posts && posts.length > 0) {
      console.log('\n📝 Blog posts:');
      posts.forEach((post, idx) => {
        const value = post.value;
        console.log(`   ${idx + 1}. ${value.title || 'Untitled'} (${post.key})`);
      });
    }
    
    console.log('\n✅ All tests passed! Database connection is working.\n');
    return true;
    
  } catch (error) {
    console.error('❌ Unexpected error during connection test:', error);
    if (error instanceof Error) {
      console.error('   Error name:', error.name);
      console.error('   Error message:', error.message);
      console.error('   Error stack:', error.stack);
    }
    return false;
  }
}

/**
 * Quick test to check if specific data exists
 */
export async function checkData(prefix: string) {
  console.log(`🔍 Checking data for prefix: ${prefix}\n`);
  
  const supabase = createClient();
  const { data, error } = await supabase
    .from('kv_store_980dd7a4')
    .select('key, value')
    .like('key', `${prefix}%`);
  
  if (error) {
    console.error('❌ Error:', error);
    return [];
  }
  
  console.log(`✅ Found ${data?.length || 0} records`);
  
  if (data && data.length > 0) {
    console.table(data.map(d => ({
      key: d.key,
      title: d.value.title || d.value.name || 'N/A',
      hasContent: d.value.content ? 'Yes' : 'No',
    })));
  }
  
  return data;
}

// Export for browser console usage
if (typeof window !== 'undefined') {
  (window as any).testDB = {
    testConnection,
    checkData,
  };
  
  console.log('%c🔧 Database Test Utilities Loaded', 'background: #4f46e5; color: white; padding: 8px 12px; border-radius: 4px; font-weight: bold;');
  console.log('%cAvailable commands:', 'color: #4f46e5; font-weight: bold; margin-top: 8px;');
  console.log('  %ctestDB.testConnection()%c - Run full connection test', 'background: #f3f4f6; padding: 2px 6px; border-radius: 3px; font-family: monospace;', '');
  console.log('  %ctestDB.checkData("blog_post:")%c - Check specific data type', 'background: #f3f4f6; padding: 2px 6px; border-radius: 3px; font-family: monospace;', '');
  console.log('\n%c💡 Having database issues? Run testDB.testConnection() to diagnose.', 'color: #f59e0b; font-style: italic;');
}