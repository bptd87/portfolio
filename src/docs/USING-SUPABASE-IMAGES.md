# Using Supabase Images in Your Website

Once you've uploaded images using the Image Manager, here's how to use them throughout your site.

## Getting Image URLs

1. Navigate to **Resources** → **Image Manager**
2. Select the appropriate bucket (Portfolio, Blog, Software, etc.)
3. Find your image and click the **Copy** icon
4. The full URL is now in your clipboard!

Example URL format:
```
https://yourproject.supabase.co/storage/v1/object/public/portfolio/your-image.jpg
```

## Common Use Cases

### 1. Portfolio Project Images

**Upload to:** `portfolio` bucket

**Usage Example:**
```tsx
<ImageWithFallback
  src="https://yourproject.supabase.co/storage/v1/object/public/portfolio/mdq-set-rendering.jpg"
  alt="Million Dollar Quartet Set Rendering"
  className="w-full h-auto rounded-lg"
/>
```

### 2. Blog Post Header Images

**Upload to:** `blog` bucket

**Usage Example:**
```tsx
<ImageWithFallback
  src="https://yourproject.supabase.co/storage/v1/object/public/blog/hardware-guide-header.jpg"
  alt="Computer Hardware Guide"
  className="w-full aspect-video object-cover"
/>
```

### 3. Software Screenshots

**Upload to:** `software` bucket

**Usage Example:**
```tsx
<ImageWithFallback
  src="https://yourproject.supabase.co/storage/v1/object/public/software/daedalus-screenshot.png"
  alt="Daedalus App Interface"
  className="rounded-lg shadow-2xl"
/>
```

### 4. About/Bio Photos

**Upload to:** `about` bucket

**Usage Example:**
```tsx
<ImageWithFallback
  src="https://yourproject.supabase.co/storage/v1/object/public/about/headshot-2025.jpg"
  alt="Brandon PT Davis"
  className="w-48 h-48 rounded-full object-cover"
/>
```

## Quick Reference: Image Components

### Using ImageWithFallback (Recommended)

```tsx
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

<ImageWithFallback
  src="YOUR_SUPABASE_URL_HERE"
  alt="Descriptive alt text"
  className="w-full h-auto"
/>
```

### Standard img tag

```tsx
<img
  src="YOUR_SUPABASE_URL_HERE"
  alt="Descriptive alt text"
  className="w-full h-auto"
/>
```

## Updating Existing Content

### Replace Unsplash Images with Your Own

**Current (Unsplash placeholder):**
```tsx
<ImageWithFallback
  src="https://images.unsplash.com/photo-123456789"
  alt="Theatre stage"
/>
```

**Updated (Your image):**
```tsx
<ImageWithFallback
  src="https://yourproject.supabase.co/storage/v1/object/public/portfolio/my-theatre-stage.jpg"
  alt="My Theatre Production"
/>
```

### Data Files

You can also update image URLs in your data files:

**Example: `/data/projects.ts`**
```typescript
{
  id: 'million-dollar-quartet',
  title: 'Million Dollar Quartet',
  image: 'https://yourproject.supabase.co/storage/v1/object/public/portfolio/mdq-hero.jpg',
  gallery: [
    'https://yourproject.supabase.co/storage/v1/object/public/portfolio/mdq-rendering-01.jpg',
    'https://yourproject.supabase.co/storage/v1/object/public/portfolio/mdq-rendering-02.jpg',
    'https://yourproject.supabase.co/storage/v1/object/public/portfolio/mdq-photos-01.jpg',
  ]
}
```

## Working Together

### Tell Me What You Want to Update

**Option 1: Give me URLs**
```
"Here are the images for Million Dollar Quartet:
- Hero: [URL]
- Rendering 1: [URL]
- Rendering 2: [URL]
Please update the project page"
```

**Option 2: Tell me where they are**
```
"I uploaded 5 images to the portfolio bucket for Much Ado About Nothing.
Can you add them to the project page?"
```

**Option 3: Bulk update**
```
"I uploaded all my headshots to the about bucket.
Use the one called 'headshot-professional-2025.jpg' for the bio page"
```

## Best Practices

### Image Optimization

**Before uploading:**
- Resize images to appropriate dimensions
- Compress with tools like TinyPNG or Squoosh
- Target file sizes:
  - Hero images: < 500KB
  - Thumbnails: < 200KB
  - Icons/logos: < 50KB

### Alt Text

Always provide descriptive alt text:
```tsx
// ❌ Bad
<ImageWithFallback src="..." alt="image" />

// ✅ Good
<ImageWithFallback src="..." alt="Million Dollar Quartet set design rendering showing Sun Records studio" />
```

### Responsive Images

Use responsive classes for different screen sizes:
```tsx
<ImageWithFallback
  src="..."
  alt="..."
  className="w-full md:w-1/2 lg:w-1/3"
/>
```

### Image Aspect Ratios

Common aspect ratios for your use cases:
- **16:9** - Blog headers, video thumbnails → `aspect-video`
- **4:3** - Portfolio images → `aspect-4/3`
- **1:1** - Profile photos, thumbnails → `aspect-square`
- **21:9** - Ultra-wide hero images → custom

## Troubleshooting

### Image not showing
1. Check the URL is copied correctly
2. Verify bucket is set to Public in Supabase
3. Check image file name matches URL
4. Try accessing URL directly in browser

### Slow loading
1. Optimize/compress the image
2. Reduce file size before uploading
3. Consider using WebP format

### 403 Forbidden error
1. Bucket must be Public
2. Check storage policies in Supabase
3. Verify Supabase project is active

## Next Steps

1. **Upload your best work** - Start with portfolio hero images
2. **Replace placeholders** - Swap Unsplash images with your content
3. **Organize systematically** - Use folders within buckets
4. **Share URLs with me** - Tell me what needs updating

Your website will look amazing with your real work showcased! 🎭✨
