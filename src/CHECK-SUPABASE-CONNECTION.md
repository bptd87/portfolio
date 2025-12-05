# 🔌 SUPABASE CONNECTION CHECK

## You might have been kicked out of Supabase!

This would explain:
- ✅ Empty admin panel
- ✅ No data showing
- ✅ Blank screens everywhere
- ✅ Nothing loading

## QUICK TEST - Run This Now!

Open browser console (F12) and paste:

```javascript
// Test Supabase connection
const { projectId, publicAnonKey } = await import('./utils/supabase/info.tsx');

console.log('🔍 Testing Supabase connection...');
console.log('Project ID:', projectId);

// Test health endpoint
try {
  const response = await fetch(
    `https://${projectId}.supabase.co/functions/v1/make-server-980dd7a4/health`,
    {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`
      }
    }
  );
  
  console.log('Server Status:', response.status);
  
  if (response.ok) {
    console.log('✅ SUPABASE IS CONNECTED AND WORKING!');
    const data = await response.json();
    console.log('Health check:', data);
  } else {
    console.log('❌ SUPABASE SERVER NOT RESPONDING');
    console.log('Status:', response.status, response.statusText);
    
    if (response.status === 404) {
      console.log('⚠️  Possible issues:');
      console.log('   - Edge function not deployed');
      console.log('   - Project paused');
      console.log('   - Server region changed');
    }
    
    if (response.status === 401 || response.status === 403) {
      console.log('⚠️  AUTHENTICATION ISSUE');
      console.log('   - API key expired or invalid');
      console.log('   - Project access removed');
      console.log('   - Billing issue');
    }
  }
} catch (error) {
  console.log('❌ CANNOT REACH SUPABASE AT ALL');
  console.log('Error:', error.message);
  console.log('\n⚠️  Possible causes:');
  console.log('   1. Supabase project paused (free tier inactive)');
  console.log('   2. Project deleted');
  console.log('   3. API keys revoked');
  console.log('   4. Network/DNS issue');
  console.log('   5. Supabase service outage');
}
```

---

## Common Supabase Issues

### 1. Free Tier Project Paused

**Supabase pauses free tier projects after:**
- 7 days of inactivity
- Exceeding database limits
- Billing issues

**Symptoms:**
- Everything blank
- No data loads
- Health check fails
- 404 or 503 errors

**Fix:**
1. Go to https://supabase.com/dashboard
2. Log in
3. Find your project
4. Check for "PAUSED" status
5. Click "Resume" or "Restore"

### 2. API Keys Expired/Changed

**Symptoms:**
- 401 Unauthorized errors
- Authentication failures
- "Invalid API key" messages

**Fix:**
1. Go to Supabase dashboard
2. Project Settings → API
3. Copy the new keys
4. Update environment variables

### 3. Edge Function Not Deployed

**Symptoms:**
- 404 Not Found on `/api/admin/*` routes
- Health check fails

**Fix:**
- Edge function might need redeployment
- Check Supabase Functions tab in dashboard

---

## Step-by-Step: Check Supabase Dashboard

### 1. Go to Supabase Dashboard
**URL:** https://supabase.com/dashboard

### 2. Sign In
Use your Supabase account credentials

### 3. Find Your Project
Look for a project with ID matching what you see in console

### 4. Check Project Status
Look for these indicators:

**🟢 Active** - Everything should work
- Green status indicator
- "Active" badge
- No warnings

**🟡 Paused** - THIS IS THE PROBLEM!
- Yellow/orange status
- "Paused" badge
- "Resume" button visible
- **FIX:** Click "Resume Project"

**🔴 Issues**
- Red status indicator
- Error messages
- Billing warnings
- Database full warnings

### 5. Check Billing Status
- Go to Project Settings → Billing
- Free tier limits:
  - 500 MB database
  - 1 GB file storage
  - 2 GB bandwidth
- **If exceeded:** Upgrade or delete old data

### 6. Check Database Activity
- Go to Database → Tables
- Click on `kv_store_980dd7a4` table
- Can you see data?
- If error loading: Project is paused or has issues

---

## Quick Supabase Project Info Check

```javascript
// Get your current Supabase project info
const { projectId, publicAnonKey } = await import('./utils/supabase/info.tsx');

console.log('📋 YOUR SUPABASE PROJECT INFO');
console.log('================================');
console.log('Project ID:', projectId);
console.log('Project URL:', `https://${projectId}.supabase.co`);
console.log('Dashboard URL:', `https://supabase.com/dashboard/project/${projectId}`);
console.log('API Key (first 20 chars):', publicAnonKey.substring(0, 20) + '...');
console.log('\n👆 Copy the Dashboard URL and open it in a new tab');
```

---

## If Project Is Paused

### Immediate Actions:

1. **Resume the project** in Supabase dashboard
2. **Wait 1-2 minutes** for it to fully restart
3. **Refresh your admin panel**
4. **Try accessing data again**

### If Resume Button Doesn't Work:

**Option A: Free Tier Inactivity**
- Free projects pause after 7 days inactive
- Resume in dashboard
- Projects will pause again if inactive

**Option B: Database Full**
- Free tier: 500 MB limit
- Check Database → Disk Usage
- Delete old data or upgrade plan

**Option C: Exceeded Limits**
- Too many API requests
- Too much bandwidth
- Wait for limit reset or upgrade

---

## Test Database Connection Directly

```javascript
// Try to connect to database directly
const { createClient } = await import('@supabase/supabase-js');
const { projectId, publicAnonKey } = await import('./utils/supabase/info.tsx');

const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

console.log('🔌 Testing direct database connection...');

try {
  const { data, error } = await supabase
    .from('kv_store_980dd7a4')
    .select('key')
    .limit(1);
  
  if (error) {
    console.log('❌ DATABASE ERROR:', error.message);
    console.log('Error code:', error.code);
    
    if (error.message.includes('JWT')) {
      console.log('⚠️  API KEY ISSUE - Keys might have changed');
    }
    if (error.message.includes('not found')) {
      console.log('⚠️  TABLE NOT FOUND - Database might be reset');
    }
  } else {
    console.log('✅ DATABASE CONNECTED!');
    console.log('Sample data:', data);
  }
} catch (err) {
  console.log('❌ CANNOT CONNECT TO DATABASE');
  console.log('Error:', err.message);
  console.log('⚠️  Project is likely PAUSED or DELETED');
}
```

---

## If Your Project Is Deleted or Can't Be Found

### Don't Panic - You Can Recreate It

Your data should be in code files:
- `/data/projects.ts`
- `/data/articles.ts`
- `/data/news.ts`

### Recovery Steps:

1. **Create new Supabase project**
2. **Copy new API keys**
3. **Update environment variables** (use the secrets modal)
4. **Run Data Sync** to import from code files
5. **All your data will be restored!**

---

## Check Supabase Service Status

Sometimes Supabase itself has outages:

**Status Page:** https://status.supabase.com/

If there's an outage:
- 🔴 Major outage: Wait for Supabase to fix
- 🟡 Partial outage: Some features might not work
- 🟢 All systems operational: Problem is with your project

---

## Most Likely Scenarios (In Order)

### 1. Project Paused (90% probability)
- **Symptom:** Everything blank, no errors in console
- **Cause:** Free tier project inactive for 7+ days
- **Fix:** Resume in Supabase dashboard

### 2. API Keys Changed (5% probability)
- **Symptom:** 401/403 errors
- **Cause:** Keys regenerated or expired
- **Fix:** Update environment variables

### 3. Edge Function Issue (3% probability)
- **Symptom:** 404 on API routes
- **Cause:** Function not deployed
- **Fix:** Redeploy function

### 4. Database Full (2% probability)
- **Symptom:** Can't save new data
- **Cause:** Exceeded 500 MB limit
- **Fix:** Delete old data or upgrade

---

## Action Plan

**Right now, do these in order:**

1. **Run the connection test** (command at top of this file)
2. **Go to Supabase dashboard** (https://supabase.com/dashboard)
3. **Check project status** - Is it paused?
4. **If paused**: Click "Resume Project"
5. **Wait 1-2 minutes** for restart
6. **Refresh your admin panel**
7. **Run the data check** to confirm data is back

---

## If Everything Fails

**You have backups!**

All your content should be in:
- Code files in `/data/` folder
- Previous git commits
- Data Sync system can restore

**Worst case scenario:**
1. Create new Supabase project
2. Update API keys
3. Run Data Sync
4. Everything restored!

---

## Next Steps After Confirming Supabase Status

Once you know if Supabase is connected or not:

**If connected**: Problem is elsewhere (go back to main troubleshooting)
**If NOT connected**: Follow steps above to resume/restore project

---

## Quick Checklist

- [ ] Ran connection test
- [ ] Checked Supabase dashboard
- [ ] Confirmed project status (Active/Paused/Other)
- [ ] If paused, clicked Resume
- [ ] Waited for restart
- [ ] Refreshed admin panel
- [ ] Ran data check to confirm data exists

---

**Run the connection test at the top of this file first!**

It will tell you immediately if this is the issue.
