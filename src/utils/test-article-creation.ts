/**
 * Article Creation Test Utility
 * 
 * This utility helps you test and debug article creation issues.
 * 
 * Run in the browser console:
 * const test = await import('./utils/test-article-creation.ts');
 * await test.runFullTest();
 */

import { projectId, publicAnonKey } from './supabase/info';

/**
 * Step 1: Check if admin token exists
 */
export function checkAdminToken() {
  const token = sessionStorage.getItem('admin_token');
  
  if (!token) {
    console.error('❌ No admin token found');
    console.log('   → Please log in to the admin panel first');
    return false;
  }
  
  console.log('✅ Admin token found');
  console.log('   Token value:', token.substring(0, 20) + '...');
  
  // Try to decode the token
  try {
    const decoded = atob(token);
    console.log('   Decoded token:', decoded.substring(0, 30) + '...');
    
    if (decoded.startsWith('admin:')) {
      console.log('✅ Token format is valid');
      return true;
    } else {
      console.error('❌ Token format is invalid');
      return false;
    }
  } catch (e) {
    console.error('❌ Could not decode token');
    return false;
  }
}

/**
 * Step 2: Test network connectivity to the server
 */
export async function testServerConnectivity() {
  console.log('\n🌐 Testing server connectivity...');
  
  const healthUrl = `https://${projectId}.supabase.co/functions/v1/make-server-74296234/health`;
  console.log('   URL:', healthUrl);
  
  try {
    const response = await fetch(healthUrl, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
      },
    });
    
    console.log('   Response status:', response.status);
    
    if (!response.ok) {
      console.error('❌ Server health check failed');
      console.error('   Status:', response.status, response.statusText);
      return false;
    }
    
    const data = await response.json();
    console.log('   Response data:', data);
    
    if (data.status === 'ok') {
      console.log('✅ Server is reachable and healthy');
      return true;
    } else {
      console.error('❌ Server responded but health status is not OK');
      return false;
    }
  } catch (err) {
    console.error('❌ Network error:', err);
    console.error('   This means the server is not reachable');
    return false;
  }
}

/**
 * Step 3: Test authentication with the server
 */
export async function testAuthentication() {
  console.log('\n🔐 Testing authentication...');
  
  const token = sessionStorage.getItem('admin_token');
  if (!token) {
    console.error('❌ No admin token');
    return false;
  }
  
  const url = `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/admin/posts`;
  console.log('   URL:', url);
  console.log('   Token:', token.substring(0, 20) + '...');
  
  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'X-Admin-Token': token,
      },
    });
    
    console.log('   Response status:', response.status);
    
    if (response.status === 401) {
      console.error('❌ Authentication failed');
      console.error('   The admin token is not valid');
      console.error('   → Try logging out and logging back in');
      return false;
    }
    
    if (!response.ok) {
      console.error('❌ Request failed with status:', response.status);
      const errorData = await response.json().catch(() => ({}));
      console.error('   Error:', errorData);
      return false;
    }
    
    const data = await response.json();
    console.log('   Response data:', {
      success: data.success,
      postsCount: data.posts?.length || 0,
    });
    
    if (data.success) {
      console.log('✅ Authentication successful');
      console.log('   Current articles:', data.posts?.length || 0);
      return true;
    } else {
      console.error('❌ Response indicates failure');
      return false;
    }
  } catch (err) {
    console.error('❌ Network error:', err);
    return false;
  }
}

/**
 * Step 4: Test creating an article
 */
export async function testCreateArticle() {
  console.log('\n📝 Testing article creation...');
  
  const token = sessionStorage.getItem('admin_token');
  if (!token) {
    console.error('❌ No admin token');
    return false;
  }
  
  const testArticle = {
    title: `Test Article ${Date.now()}`,
    category: 'Design Philosophy & Scenic Insights',
    date: new Date().toISOString().split('T')[0],
    lastModified: new Date().toISOString().split('T')[0],
    readTime: '5 min read',
    excerpt: 'This is a test article created by the test utility',
    featured: false,
    tags: ['test', 'debugging'],
    content: [
      {
        id: 'block-1',
        type: 'paragraph',
        content: 'This is test content.',
      },
    ],
    slug: `test-article-${Date.now()}`,
  };
  
  console.log('   Test article:', {
    title: testArticle.title,
    excerpt: testArticle.excerpt,
    slug: testArticle.slug,
  });
  
  const url = `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/admin/posts`;
  console.log('   URL:', url);
  
  try {
    console.log('   Sending POST request...');
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
        'X-Admin-Token': token,
      },
      body: JSON.stringify(testArticle),
    });
    
    console.log('   Response status:', response.status);
    
    if (!response.ok) {
      console.error('❌ Article creation failed');
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('   Error:', errorData);
      
      if (response.status === 401) {
        console.error('   → Authentication failed. Log out and log back in.');
      } else if (response.status === 500) {
        console.error('   → Server error. Check Supabase logs for details.');
        console.error('   → Make sure the kv_store_980dd7a4 table exists in your database.');
      }
      
      return false;
    }
    
    const data = await response.json();
    console.log('   Response data:', data);
    
    if (data.success) {
      console.log('✅ Article created successfully!');
      console.log('   Post ID:', data.postId);
      console.log('   You can now try creating articles normally.');
      return true;
    } else {
      console.error('❌ Response indicates failure');
      console.error('   Data:', data);
      return false;
    }
  } catch (err) {
    console.error('❌ Network error:', err);
    console.error('   Error details:', {
      name: err instanceof Error ? err.name : 'Unknown',
      message: err instanceof Error ? err.message : String(err),
    });
    return false;
  }
}

/**
 * Step 5: Verify the article was saved
 */
export async function verifyArticleSaved() {
  console.log('\n🔍 Verifying articles in database...');
  
  const token = sessionStorage.getItem('admin_token');
  if (!token) {
    console.error('❌ No admin token');
    return false;
  }
  
  const url = `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/admin/posts`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'X-Admin-Token': token,
      },
    });
    
    if (!response.ok) {
      console.error('❌ Failed to fetch articles');
      return false;
    }
    
    const data = await response.json();
    
    if (data.success && data.posts) {
      console.log('✅ Articles retrieved successfully');
      console.log('   Total articles:', data.posts.length);
      
      if (data.posts.length > 0) {
        console.log('\n   Articles in database:');
        data.posts.forEach((post: any, index: number) => {
          console.log(`   ${index + 1}. ${post.title}`);
          console.log(`      Category: ${post.category}`);
          console.log(`      Date: ${post.date}`);
          console.log(`      Slug: ${post.slug || post.id}`);
        });
      } else {
        console.log('   No articles found. Try creating one.');
      }
      
      return true;
    } else {
      console.error('❌ Failed to retrieve articles');
      return false;
    }
  } catch (err) {
    console.error('❌ Network error:', err);
    return false;
  }
}

/**
 * Run all tests in sequence
 */
export async function runFullTest() {
  console.log('🚀 Running full article creation test suite\n');
  console.log('═'.repeat(60));
  
  const step1 = checkAdminToken();
  if (!step1) {
    console.log('\n❌ Test failed at Step 1: Admin token check');
    console.log('   Please log in to the admin panel and try again.');
    return;
  }
  
  console.log('═'.repeat(60));
  
  const step2 = await testServerConnectivity();
  if (!step2) {
    console.log('\n❌ Test failed at Step 2: Server connectivity');
    console.log('   The server is not reachable. Check your internet connection.');
    console.log('   Also verify the Edge Function is deployed in Supabase.');
    return;
  }
  
  console.log('═'.repeat(60));
  
  const step3 = await testAuthentication();
  if (!step3) {
    console.log('\n❌ Test failed at Step 3: Authentication');
    console.log('   Your admin token is not valid. Log out and log back in.');
    return;
  }
  
  console.log('═'.repeat(60));
  
  const step4 = await testCreateArticle();
  if (!step4) {
    console.log('\n❌ Test failed at Step 4: Article creation');
    console.log('   Article creation failed. Check the error messages above.');
    console.log('   Common causes:');
    console.log('   1. Database table (kv_store_980dd7a4) does not exist');
    console.log('   2. Supabase service error (check dashboard)');
    console.log('   3. Server configuration issue (check logs)');
    return;
  }
  
  console.log('═'.repeat(60));
  
  await verifyArticleSaved();
  
  console.log('═'.repeat(60));
  console.log('\n✅ All tests passed!');
  console.log('   Article creation is working correctly.');
  console.log('   You can now use the admin panel normally.');
}

/**
 * Quick diagnostic check
 */
export async function quickCheck() {
  console.log('🔍 Quick Diagnostic Check\n');
  
  const hasToken = !!sessionStorage.getItem('admin_token');
  const projectIdValue = projectId;
  const anonKeyValue = publicAnonKey ? '✓ Present' : '✗ Missing';
  
  console.log('Authentication:');
  console.log(`   Admin Token: ${hasToken ? '✓ Present' : '✗ Missing'}`);
  console.log(`   Project ID: ${projectIdValue}`);
  console.log(`   Anon Key: ${anonKeyValue}`);
  
  console.log('\nEndpoints:');
  console.log(`   Health: https://${projectId}.supabase.co/functions/v1/make-server-74296234/health`);
  console.log(`   Posts: https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/admin/posts`);
  
  if (!hasToken) {
    console.log('\n⚠️  No admin token found. Please log in first.');
    return false;
  }
  
  console.log('\n✓ Basic configuration looks good');
  console.log('  Run `await runFullTest()` to perform full testing');
  return true;
}

// Export for browser console usage
if (typeof window !== 'undefined') {
  (window as any).articleTest = {
    checkAdminToken,
    testServerConnectivity,
    testAuthentication,
    testCreateArticle,
    verifyArticleSaved,
    runFullTest,
    quickCheck,
  };
  
  console.log('%c🧪 Article Creation Test Utility Loaded', 'background: #3b82f6; color: white; padding: 8px 12px; border-radius: 4px; font-weight: bold;');
  console.log('%cAvailable commands:', 'color: #3b82f6; font-weight: bold; margin-top: 8px;');
  console.log('  %carticleTest.quickCheck()%c - Quick diagnostic', 'background: #f3f4f6; padding: 2px 6px; border-radius: 3px; font-family: monospace;', '');
  console.log('  %carticleTest.runFullTest()%c - Run complete test suite', 'background: #f3f4f6; padding: 2px 6px; border-radius: 3px; font-family: monospace;', '');
  console.log('  %carticleTest.checkAdminToken()%c - Check authentication', 'background: #f3f4f6; padding: 2px 6px; border-radius: 3px; font-family: monospace;', '');
  console.log('  %carticleTest.testCreateArticle()%c - Test article creation', 'background: #f3f4f6; padding: 2px 6px; border-radius: 3px; font-family: monospace;', '');
  console.log('  %carticleTest.verifyArticleSaved()%c - Check saved articles', 'background: #f3f4f6; padding: 2px 6px; border-radius: 3px; font-family: monospace;', '');
}