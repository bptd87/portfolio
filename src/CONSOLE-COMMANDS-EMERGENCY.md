# 🚨 EMERGENCY CONSOLE COMMANDS

## Copy and paste these into your browser console (F12 → Console tab)

### 🔴 CRITICAL: Test Supabase Connection FIRST!

**Most likely issue: Your Supabase project is paused!**

```javascript
// Quick Supabase connection test
try{const{projectId,publicAnonKey}=await import('./utils/supabase/info.tsx');const r=await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-980dd7a4/health`,{headers:{'Authorization':`Bearer ${publicAnonKey}`}});if(r.ok){console.log('✅ SUPABASE CONNECTED');const d=await r.json();console.log(d)}else{console.log('❌ SUPABASE NOT RESPONDING - Status:',r.status);console.log('🔗 Go to: https://supabase.com/dashboard/project/'+projectId);console.log('⚠️  Your project might be PAUSED - click Resume!')}}catch(e){console.log('❌ CANNOT REACH SUPABASE');console.log('⚠️  Project likely PAUSED or DELETED');console.log('🔗 Go to: https://supabase.com/dashboard')}
```

**If you see "❌ SUPABASE NOT RESPONDING":**
1. Go to https://supabase.com/dashboard
2. Find your project
3. Click "Resume Project"
4. Wait 1-2 minutes
5. Refresh your admin panel

**Free tier projects pause after 7 days of inactivity!**

---

### 1. FIRST: Check if your data still exists

```javascript
// ============================================
// DATA EXISTENCE CHECK - RUN THIS FIRST!
// ============================================
const { getByPrefixFromKV } = await import('./utils/supabase/client.ts');

const posts = await getByPrefixFromKV('blog_post:');
const projects = await getByPrefixFromKV('project:');
const news = await getByPrefixFromKV('news:');

console.log('\n🔍 === DATA CHECK ===');
console.log('📚 Blog Posts:', posts?.length || 0);
console.log('📊 Projects:', projects?.length || 0);
console.log('📰 News:', news?.length || 0);
console.log('📦 TOTAL:', (posts?.length || 0) + (projects?.length || 0) + (news?.length || 0));

if ((posts?.length || 0) + (projects?.length || 0) > 0) {
  console.log('\n✅ ✅ ✅ YOUR DATA IS SAFE! ✅ ✅ ✅');
  console.log('The admin panel just needs to be fixed.');
} else {
  console.log('\n⚠️  NO DATA FOUND - You may need to run Data Sync');
}
```

### 2. View all your blog posts/articles

```javascript
const { getByPrefixFromKV } = await import('./utils/supabase/client.ts');
const posts = await getByPrefixFromKV('blog_post:');
console.table(posts.map(p => ({
  id: p.id,
  title: p.title,
  category: p.category,
  date: p.date
})));
```

### 3. View all your projects

```javascript
const { getByPrefixFromKV } = await import('./utils/supabase/client.ts');
const projects = await getByPrefixFromKV('project:');
console.table(projects.map(p => ({
  id: p.id,
  title: p.title,
  category: p.category,
  featured: p.featured || false,
  year: p.year
})));
```

### 4. Test if the server endpoint works

```javascript
const { projectId, publicAnonKey } = await import('./utils/supabase/info.tsx');
const token = sessionStorage.getItem('admin_token');

console.log('🔑 Token exists:', !!token);

const response = await fetch(
  `https://${projectId}.supabase.co/functions/v1/make-server-980dd7a4/api/admin/posts`,
  {
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`,
      'X-Admin-Token': token
    }
  }
);

console.log('📡 Status:', response.status, response.statusText);

const data = await response.json();
console.log('📦 Response:', data);
console.log('📚 Posts in response:', data.posts?.length || 0);
```

### 5. Check if you're logged in

```javascript
const token = sessionStorage.getItem('admin_token');
console.log('Token exists:', !!token);
console.log('Token value:', token);

if (!token) {
  console.log('❌ NOT LOGGED IN - Log in again!');
} else {
  console.log('✅ Logged in');
}
```

### 6. Force logout and clear session

```javascript
sessionStorage.removeItem('admin_token');
console.log('✅ Logged out. Refresh page and log in again.');
```

### 7. Check projects endpoint

```javascript
const { projectId, publicAnonKey } = await import('./utils/supabase/info.tsx');
const token = sessionStorage.getItem('admin_token');

const response = await fetch(
  `https://${projectId}.supabase.co/functions/v1/make-server-980dd7a4/api/admin/projects`,
  {
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`,
      'X-Admin-Token': token
    }
  }
);

const data = await response.json();
console.log('📊 Projects response:', data);
console.log('📊 Projects count:', data.projects?.length || 0);
```

### 8. Check news endpoint

```javascript
const { projectId, publicAnonKey } = await import('./utils/supabase/info.tsx');
const token = sessionStorage.getItem('admin_token');

const response = await fetch(
  `https://${projectId}.supabase.co/functions/v1/make-server-980dd7a4/api/admin/news`,
  {
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`,
      'X-Admin-Token': token
    }
  }
);

const data = await response.json();
console.log('📰 News response:', data);
console.log('📰 News count:', data.news?.length || 0);
```

### 9. Full diagnostic (run all checks at once)

```javascript
// FULL DIAGNOSTIC SUITE
console.log('🔍 ========================================');
console.log('🔍 FULL DIAGNOSTIC CHECK');
console.log('🔍 ========================================\n');

const { projectId, publicAnonKey } = await import('./utils/supabase/info.tsx');
const { getByPrefixFromKV } = await import('./utils/supabase/client.ts');
const token = sessionStorage.getItem('admin_token');

// 1. Check auth
console.log('1️⃣ AUTHENTICATION');
console.log('   Token exists:', !!token);
if (!token) {
  console.log('   ❌ NOT LOGGED IN!');
} else {
  console.log('   ✅ Logged in');
}

// 2. Check KV store directly
console.log('\n2️⃣ DATABASE (KV STORE)');
const posts = await getByPrefixFromKV('blog_post:');
const projects = await getByPrefixFromKV('project:');
const news = await getByPrefixFromKV('news:');
console.log('   Blog posts:', posts?.length || 0);
console.log('   Projects:', projects?.length || 0);
console.log('   News:', news?.length || 0);

if ((posts?.length || 0) + (projects?.length || 0) > 0) {
  console.log('   ✅ DATA EXISTS IN DATABASE');
} else {
  console.log('   ⚠️  NO DATA IN DATABASE');
}

// 3. Check server endpoints
console.log('\n3️⃣ SERVER ENDPOINTS');

try {
  const postsResponse = await fetch(
    `https://${projectId}.supabase.co/functions/v1/make-server-980dd7a4/api/admin/posts`,
    { headers: { 'Authorization': `Bearer ${publicAnonKey}`, 'X-Admin-Token': token } }
  );
  const postsData = await postsResponse.json();
  console.log('   Posts endpoint:', postsResponse.status, postsData.posts?.length || 0, 'items');
} catch (e) {
  console.log('   Posts endpoint: ❌ ERROR', e.message);
}

try {
  const projectsResponse = await fetch(
    `https://${projectId}.supabase.co/functions/v1/make-server-980dd7a4/api/admin/projects`,
    { headers: { 'Authorization': `Bearer ${publicAnonKey}`, 'X-Admin-Token': token } }
  );
  const projectsData = await projectsResponse.json();
  console.log('   Projects endpoint:', projectsResponse.status, projectsData.projects?.length || 0, 'items');
} catch (e) {
  console.log('   Projects endpoint: ❌ ERROR', e.message);
}

try {
  const newsResponse = await fetch(
    `https://${projectId}.supabase.co/functions/v1/make-server-980dd7a4/api/admin/news`,
    { headers: { 'Authorization': `Bearer ${publicAnonKey}`, 'X-Admin-Token': token } }
  );
  const newsData = await newsResponse.json();
  console.log('   News endpoint:', newsResponse.status, newsData.news?.length || 0, 'items');
} catch (e) {
  console.log('   News endpoint: ❌ ERROR', e.message);
}

console.log('\n🔍 ========================================');
console.log('🔍 END DIAGNOSTIC');
console.log('🔍 ========================================');
```

### 10. View what the homepage sees

```javascript
const { getByPrefixFromKV } = await import('./utils/supabase/client.ts');
const projects = await getByPrefixFromKV('project:');
const featured = projects.filter(p => p.featured === true);

console.log('📊 Total projects:', projects.length);
console.log('🌟 Featured projects:', featured.length);
console.log('\nFeatured projects that will show on homepage:');
console.table(featured.map(p => ({
  title: p.title,
  category: p.category,
  year: p.year
})));
```

---

## Quick Action Plan

### If you see "YOUR DATA IS SAFE" message:

1. ✅ Data exists in database
2. ❌ Admin panel not displaying it
3. **Next step**: Log out and log back in
4. If still broken, run diagnostic command #9

### If you see "NO DATA FOUND" message:

1. ⚠️  Database is empty
2. **Next step**: Go to Admin → Data Sync tab
3. Click "Sync All Data to Database"
4. This will restore from code files

### If server endpoints show errors:

1. ❌ Server connection issue
2. **Next step**: Check https://status.supabase.com
3. Wait a few minutes and try again
4. Server might be restarting

### If logged out (no token):

1. ❌ Not authenticated
2. **Next step**: Log in to admin panel again
3. Run checks again after logging in

---

## Copy This First!

The most important command - tells you if data is safe:

```javascript
const{getByPrefixFromKV}=await import('./utils/supabase/client.ts');const p=await getByPrefixFromKV('blog_post:');const r=await getByPrefixFromKV('project:');const n=await getByPrefixFromKV('news:');console.log('📚Posts:',p?.length||0,'📊Projects:',r?.length||0,'📰News:',n?.length||0);((p?.length||0)+(r?.length||0)>0)?console.log('✅ DATA IS SAFE!'):console.log('⚠️ NO DATA');
```

(One-liner version - easy to copy/paste)