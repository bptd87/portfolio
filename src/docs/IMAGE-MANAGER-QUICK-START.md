# Image Manager - Quick Start Guide

## Accessing the Image Manager

Navigate to: **Image Manager** (you can add a link from Resources or anywhere on your site)

Or navigate directly via: `onNavigate('image-manager')`

## What You Can Do

The Image Manager allows you to:

✅ Upload images to organized buckets (Portfolio, Blog, Software, About, Resources)
✅ View all your uploaded images
✅ Copy public URLs with one click
✅ Delete images you no longer need
✅ Organize by category/bucket

## First Time Setup

Before using the Image Manager, you need to set up Supabase Storage:

### Step 1: Create Storage Buckets

1. Open your Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Go to **Storage** in the left sidebar
4. Click **New Bucket** and create these 5 buckets:

   - `portfolio` (Public)
   - `blog` (Public)
   - `software` (Public)
   - `about` (Public)
   - `resources` (Public)

**IMPORTANT:** Make sure to check "Public bucket" when creating each one!

### Step 2: Verify Setup

1. Go to the Image Manager page
2. Select a bucket (Portfolio, Blog, etc.)
3. Try uploading a test image
4. If it works, you're all set! ✨

## How to Use Images

Once uploaded:

1. Click the **Copy** icon on any image
2. The full URL is copied to your clipboard
3. Give me the URL and tell me where to use it, or paste it directly in your code

Example URL:
```
https://yourproject.supabase.co/storage/v1/object/public/portfolio/image-name.jpg
```

## Organizing Your Images

### Recommended Folder Structure:

**Portfolio Bucket:**
- Project-specific folders: `million-dollar-quartet/`, `much-ado/`
- Category folders: `renderings/`, `documentation/`, `photos/`

**Blog Bucket:**
- Post-specific folders: `becoming-a-scenic-designer/`, `hardware-guide/`

**Software Bucket:**
- App folders: `daedalus/`, `sophia/`

**About Bucket:**
- `headshots/`, `news/`, `collaborators/`

**Resources Bucket:**
- `tutorials/`, `tools/`, `diagrams/`

## Tips for Best Results

📸 **Image Optimization:**
- Compress images before uploading (< 500KB is ideal)
- Use tools like TinyPNG or Squoosh
- Aim for 1920px max width for full-width images
- Aim for 800px for thumbnail images

🏷️ **Naming Convention:**
- Use descriptive names: `mdq-set-rendering-wide.jpg`
- Use hyphens, not spaces: `much-ado-costume-01.jpg`
- Include numbers for sequences: `photo-01.jpg`, `photo-02.jpg`

📁 **File Formats:**
- **JPG** - Photos and production images (smaller file size)
- **PNG** - Graphics with transparency, logos, icons
- **WebP** - Best compression, modern browsers only

## Common Use Cases

### Adding Portfolio Project Images

1. Go to Image Manager → Portfolio bucket
2. Upload all project images (renderings, photos, documentation)
3. Copy URLs
4. Tell me: "Use these URLs for Million Dollar Quartet project page"

### Adding Blog Post Images

1. Go to Image Manager → Blog bucket
2. Upload header images, diagrams, screenshots
3. Copy URLs
4. Tell me which blog post to update

### Adding Software Screenshots

1. Go to Image Manager → Software bucket
2. Upload app screenshots, UI mockups
3. Copy URLs for Daedalus or Sophia pages

## Troubleshooting

### "Failed to upload" error
- Check that you created the storage bucket in Supabase
- Verify the bucket name matches exactly (lowercase)
- Ensure the bucket is set to Public

### "Failed to load images" error
- Check your Supabase connection is active
- Verify bucket exists in Supabase dashboard

### Can't see uploaded image
- Wait a few seconds and refresh
- Check the correct bucket is selected
- Verify file uploaded successfully (no error message)

### 404 when using URL
- Ensure bucket is set to Public in Supabase
- Check the URL was copied correctly
- Verify the file still exists in storage

## Next Steps

Once you've uploaded images:

1. Copy the URLs you want to use
2. Tell me which page/component needs them
3. I'll update the code with your real images
4. Your site will look professional with your actual content! 🎭✨

---

Need help? Just ask and I'll guide you through the setup!
