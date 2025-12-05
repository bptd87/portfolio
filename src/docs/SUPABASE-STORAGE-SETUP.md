# Supabase Storage Setup Guide

This guide will help you set up image storage for your theatre design website using Supabase Storage.

## Overview

Your website will use these storage buckets to organize images:

- **portfolio** - Project images, renderings, production photos
- **blog** - Blog post images, diagrams, screenshots
- **software** - App screenshots, mockups, feature images
- **about** - Headshots, bio photos, news images
- **resources** - Tutorial screenshots, tool images

## Step 1: Create Storage Buckets

1. Go to your Supabase Dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **New Bucket** for each of the following:

### Create these buckets:

```
portfolio
blog
software
about
resources
```

**IMPORTANT:** Make sure to check **"Public bucket"** when creating each bucket so images are accessible on your website.

## Step 2: Set Up Storage Policies (If not public)

If you didn't make the buckets public, you'll need to add policies for each bucket:

### Policy for Public Read Access

Go to Storage → Policies → New Policy

**For each bucket, add this policy:**

```sql
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'portfolio' );
```

Replace `'portfolio'` with each bucket name (`blog`, `software`, `about`, `resources`).

### Policy for Authenticated Upload (Optional)

If you want to restrict uploads to authenticated users:

```sql
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'portfolio' 
  AND auth.role() = 'authenticated'
);
```

## Step 3: Using the Image Manager

Once your buckets are set up:

1. Navigate to the Image Manager page in your website
2. Select a bucket (Portfolio, Blog, Software, About, or Resources)
3. Click "Upload Images" to upload files
4. Click the copy icon to copy the public URL
5. Use that URL in your code or give it to me!

## Step 4: Using Images in Your Code

Once uploaded, you can use images like this:

```tsx
// Example: Using an uploaded portfolio image
<img 
  src="https://your-project.supabase.co/storage/v1/object/public/portfolio/your-image.jpg"
  alt="Million Dollar Quartet Set Design"
/>
```

## Folder Organization Suggestions

Within each bucket, you can organize images into folders:

### Portfolio Bucket Structure:
```
portfolio/
├── million-dollar-quartet/
├── much-ado-about-nothing/
├── renderings/
└── documentation/
```

### Blog Bucket Structure:
```
blog/
├── becoming-a-scenic-designer/
├── computer-hardware-guide/
└── video-game-environments/
```

### Software Bucket Structure:
```
software/
├── daedalus/
└── sophia/
```

## Tips

- **Image Optimization**: Compress images before uploading (aim for < 500KB per image)
- **File Naming**: Use descriptive names like `mdq-set-rendering-01.jpg`
- **Formats**: Use JPG for photos, PNG for graphics with transparency
- **Backups**: Keep local copies of original high-res images

## Common Issues

### Issue: "Row Level Security" error
**Solution**: Make sure you've created the public access policy for each bucket

### Issue: 404 when accessing image
**Solution**: Check that the bucket is marked as public

### Issue: Can't upload
**Solution**: Check your Supabase connection and bucket names

## Need Help?

If you run into any issues:
1. Check the Supabase dashboard for error messages
2. Verify bucket names match exactly (lowercase)
3. Confirm policies are set up correctly
4. Make sure your Supabase connection is active

---

Once set up, you'll be able to easily manage all your website images in one place!
