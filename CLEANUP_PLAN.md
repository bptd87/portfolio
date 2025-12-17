# File Cleanup Plan

## Files to Remove

### 1. Unused Home Page
- ✅ `src/pages/HomeApple.tsx` - Replaced by `Home.tsx`, not imported anywhere

### 2. Backup Files
- ✅ `src/components/admin/ResumeManager_BACKUP.tsx` - Backup file, no longer needed

### 3. Unused Editor Components
- ✅ `src/components/admin/EasyArticleEditor.tsx` - Not imported anywhere
- ✅ `src/components/admin/MediumEditor.tsx` - Not imported anywhere
- ✅ `src/components/admin/ImprovedBlockEditor.tsx` - Not imported (only imports other unused editors)
- ✅ `src/components/admin/SimpleArticleEditor.tsx` - Not imported anywhere
- ✅ `src/components/admin/UnifiedTextEditor.tsx` - Only used by ImprovedBlockEditor (unused)
- ✅ `src/components/admin/TipTapEditor.tsx` - Only used by ImprovedBlockEditor (unused)

### 4. Old Studio Page
- ✅ `src/pages/Studio.tsx` - Removed (App.tsx uses `StudioNew.tsx`)

### 5. Hardcoded Project Pages (if using dynamic routing)
- ⚠️ `src/pages/projects/AllMySons.tsx`
- ⚠️ `src/pages/projects/Lysistrata.tsx`
- ⚠️ `src/pages/projects/MuchAdoAboutNothing.tsx`
- ⚠️ `src/pages/projects/NewSwanVenueFile.tsx`
- ⚠️ `src/pages/projects/ParkAndShop.tsx`
- ⚠️ `src/pages/projects/RedLineCafe.tsx`
- ⚠️ `src/pages/projects/SouthsideBethelBaptistChurch.tsx`

## Files to Keep (Still Used)

### Editor Components
- ✅ `src/components/admin/BlockEditor.tsx` - Used by TutorialsManager, ExperientialDesignEditor, ContentFormatter, BlockRenderer
- ✅ `src/components/admin/RichTextEditor.tsx` - Used by BlockEditor, SimpleArticleEditor, ImprovedBlockEditor
- ✅ `src/components/admin/WYSIWYGEditor.tsx` - Active main article editor
- ✅ `src/components/admin/UnifiedPortfolioEditor.tsx` - Active portfolio editor

## Notes
- BlockEditor and RichTextEditor are still used, so keep them
- Need to verify hardcoded project pages are not used before removing
- Studio.tsx needs verification before removal

