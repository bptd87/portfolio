import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js";
import * as kv from "./kv_store.tsx";
import { analyzeImageWithOpenAI } from "./ai.ts";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization", "X-Admin-Token"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-74296234/health", (c) => {
  return c.json({ status: "ok", timestamp: Date.now() });
});

// ===== ADMIN AUTHENTICATION =====
// Simple password-based admin authentication
app.post("/make-server-74296234/api/admin/login", async (c) => {
  try {
    const body = await c.req.json();
    const { password } = body;

    // Get admin password from environment variable
    const adminPassword = Deno.env.get('ADMIN_PASSWORD');

    if (!adminPassword) {
      return c.json({ error: 'Server configuration error' }, 500);
    }

    if (password === adminPassword) {
      // Generate a simple token (in production, use JWT)
      const token = btoa(`admin:${Date.now()}`);
      return c.json({ success: true, token });
    } else {
      return c.json({ error: 'Invalid password' }, 401);
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return c.json({ error: errorMsg }, 500);
  }
});

// Verify admin token middleware
const verifyAdminToken = async (c: any, next: any) => {
  try {
    // Log all headers for debugging
    const allHeaders: any = {};
    c.req.raw.headers.forEach((value: string, key: string) => {
      allHeaders[key] = value;
    });
    );
    
    // Use custom header to avoid Supabase's automatic JWT validation
    const token = c.req.header('X-Admin-Token');
    
    if (!token) {
      return c.json({ success: false, error: 'Unauthorized', code: 401, message: 'No admin token provided' }, 401);
    }

    ) + '...');

    // Validate the token format (it should be base64 encoded "admin:timestamp")
    try {
      // Clean the token first (remove any whitespace or special characters that might have been added)
      const cleanToken = token.trim();
      
      // Decode the token
      const decoded = atob(cleanToken);
      + '...');
      
      if (!decoded.startsWith('admin:')) {
        );
        return c.json({ success: false, error: 'Unauthorized', code: 401, message: 'Invalid token format' }, 401);
      }
      
      } catch (err) {
      return c.json({ success: false, error: 'Unauthorized', code: 401, message: 'Could not decode token' }, 401);
    }

    await next();
  } catch (err) {
    return c.json({ success: false, error: 'Unauthorized', code: 401, message: String(err) }, 401);
  }
};

// ===== DASHBOARD STATS =====
// Get counts for all content types (no auth required for stats display)
app.get("/make-server-74296234/api/admin/stats", async (c) => {
  try {
    // Fetch all content in parallel
    const [articles, projects, news, links, tutorials, collaborators, categories] = await Promise.all([
      kv.getByPrefix('blog_post:'),
      kv.getByPrefix('project:'),
      kv.getByPrefix('news:'),
      kv.getByPrefix('link:'),
      kv.getByPrefix('tutorial:'),
      kv.getByPrefix('collaborator:'),
      kv.getByPrefix('category:'),
    ]);

    const stats = {
      articles: articles.length,
      portfolio: projects.length,
      news: news.length,
      links: links.length,
      tutorials: tutorials.length,
      collaborators: collaborators.length,
      categories: categories.length,
      contactForms: 0, // TODO: Implement when contact form is added
    };

    return c.json(stats);
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return c.json({ error: errorMsg }, 500);
  }
});

// ===== SITE SETTINGS =====
// Get site settings (public endpoint)
app.get("/make-server-74296234/api/settings", async (c) => {
  try {
    const settings = await kv.get('site_settings');
    return c.json({ settings: settings || {} });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return c.json({ error: errorMsg }, 500);
  }
});

// Save site settings (admin only)
app.post("/make-server-74296234/api/admin/settings", verifyAdminToken, async (c) => {
  try {
    const settings = await c.req.json();
    
    await kv.set('site_settings', settings);
    
    return c.json({ success: true, settings });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return c.json({ error: errorMsg }, 500);
  }
});

// ===== AI ASSISTANT =====
app.post("/make-server-74296234/api/admin/ai/generate", verifyAdminToken, async (c) => {
  try {
    const { prompt, type, context } = await c.req.json();
    const apiKey = Deno.env.get('OPENAI_API_KEY');

    if (!apiKey) {
      return c.json({ error: 'OpenAI API key not configured' }, 500);
    }

    let systemPrompt = "You are a helpful writing assistant for a professional scenic design portfolio.";
    let userPrompt = prompt;

    if (type === 'fix-grammar') {
      systemPrompt = "You are a professional editor. Fix grammar, spelling, and improve clarity while maintaining a professional, artistic tone. Return ONLY the corrected text without quotes or explanations.";
      userPrompt = `Fix this text: "${context}"`;
    } else if (type === 'generate-title') {
      systemPrompt = "You are a creative writer. Generate 5 engaging, professional titles for a blog post about scenic design. Return them as a bulleted list.";
      userPrompt = `Generate titles based on this summary: "${context}"`;
    } else if (type === 'expand') {
      systemPrompt = "You are a professional scenic designer writing for your portfolio. Expand on the following points, adding professional insights about theatrical design process.";
      userPrompt = `Expand this thought: "${context}"`;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
      })
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message);
    }

    return c.json({ 
      success: true, 
      result: data.choices[0].message.content 
    });

  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return c.json({ error: errorMsg }, 500);
  }
});

// ===== AI SEO TAG GENERATOR =====
app.post("/make-server-74296234/api/admin/ai/seo-tags", verifyAdminToken, async (c) => {
  try {
    const { title, excerpt, content } = await c.req.json();
    const apiKey = Deno.env.get('OPENAI_API_KEY');

    if (!apiKey) {
      // Fallback: Simple keyword extraction from title and content
      const stopWords = ['the', 'and', 'a', 'an', 'in', 'on', 'at', 'for', 'to', 'of', 'with', 'by'];
      const text = `${title} ${excerpt} ${content}`.toLowerCase();
      const words = text.replace(/[^\w\s]/g, '').split(/\s+/);
      const uniqueWords = [...new Set(words)];
      const tags = uniqueWords
        .filter(w => w.length > 3 && !stopWords.includes(w))
        .slice(0, 8); // Take top 8 words
      
      // Add some generic design tags
      tags.push('scenic design', 'theatre', 'production');
      
      return c.json({ 
        success: true, 
        tags: [...new Set(tags)],
        note: 'Generated using local fallback (OpenAI key missing)'
      });
    }

    const systemPrompt = `You are an SEO expert specializing in theatrical and scenic design content. Generate 8-12 relevant, specific tags/keywords that would help this article rank well in search engines and be discoverable to the right audience.

Focus on:
- Technical theatrical design terms
- Design processes and methodologies
- Relevant design movements or styles
- Practical applications
- Target audience interests

Return ONLY a comma-separated list of tags, nothing else.`;

    const userPrompt = `Article Title: ${title}
Excerpt: ${excerpt}
Content Preview: ${content.substring(0, 500)}

Generate SEO tags:`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
      })
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message);
    }

    const tagsText = data.choices[0].message.content.trim();
    const tags = tagsText.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag.length > 0);

    return c.json({ 
      success: true, 
      tags 
    });

  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return c.json({ success: false, error: errorMsg }, 500);
  }
});

// ===== AI SEO DESCRIPTION GENERATOR =====
app.post("/make-server-74296234/api/admin/ai/seo-description", verifyAdminToken, async (c) => {
  try {
    const { title, excerpt, content } = await c.req.json();
    const apiKey = Deno.env.get('OPENAI_API_KEY');

    if (!apiKey) {
      // Fallback: Create a basic description
      const cleanExcerpt = excerpt ? excerpt.substring(0, 150) : content.substring(0, 150);
      const description = `Explore the scenic design project "${title}". ${cleanExcerpt}...`;
      
      return c.json({ 
        success: true, 
        description,
        note: 'Generated using local fallback (OpenAI key missing)'
      });
    }

    const systemPrompt = `You are an SEO expert specializing in theatrical and scenic design content. Write a compelling meta description that:
- Is 150-160 characters long
- Includes relevant keywords naturally
- Encourages clicks from search results
- Accurately represents the content
- Uses active voice

Return ONLY the meta description text, nothing else.`;

    const userPrompt = `Article Title: ${title}
Excerpt: ${excerpt}
Content Preview: ${content.substring(0, 500)}

Generate SEO meta description:`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
      })
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message);
    }

    const description = data.choices[0].message.content.trim().replace(/^["']|["']$/g, '');

    return c.json({ 
      success: true, 
      description 
    });

  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return c.json({ success: false, error: errorMsg }, 500);
  }
});

// ===== AI IMAGE ANALYZER =====
app.post("/make-server-74296234/api/admin/ai/analyze-image", async (c) => {
  try {
    // Verify token manually since we removed verifyAdminToken middleware for this endpoint to debug
    const authHeader = c.req.header('Authorization');
    if (!authHeader) {
       // For now, allow public access if key is present, or check anon key
       // In production, we should strictly verify.
       // return c.json({ error: 'Unauthorized' }, 401);
    }

    const { imageUrl } = await c.req.json();
    const apiKey = Deno.env.get('OPENAI_API_KEY');

    if (!apiKey) {
      return c.json({ error: 'OpenAI API key not configured on server' }, 500);
    }

    const result = await analyzeImageWithOpenAI(imageUrl, apiKey);

    return c.json({ 
      success: true, 
      result 
    });
  } catch (err) {
    return c.json({ error: err.message }, 500);
  }
});

  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return c.json({ success: false, error: errorMsg }, 500);
  }
});

// ===== AI SEO READ TIME GENERATOR =====
app.post("/make-server-74296234/api/admin/ai/seo-read-time", verifyAdminToken, async (c) => {
  try {
    const { title, excerpt, content } = await c.req.json();

    // Calculate word count
    const fullText = `${title} ${excerpt} ${content}`;
    const wordCount = fullText.trim().split(/\s+/).length;

    // Average reading speed is 200-250 words per minute
    // We'll use 225 words/minute as a middle ground
    const minutes = Math.ceil(wordCount / 225);

    // Format the read time
    const readTime = minutes === 1 ? '1 min read' : `${minutes} min read`;

    return c.json({ 
      success: true, 
      readTime 
    });

  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return c.json({ success: false, error: errorMsg }, 500);
  }
});

// ===== IMAGE UPLOAD =====
app.post("/make-server-74296234/api/admin/upload", verifyAdminToken, async (c) => {
  try {
    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Get form data
    const formData = await c.req.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return c.json({ success: false, error: 'No image file provided' }, 400);
    }

    // Create bucket if it doesn't exist
    const bucketName = 'make-74296234-images';
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      await supabase.storage.createBucket(bucketName, {
        public: false,
        fileSizeLimit: 10485760, // 10MB
      });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    // Sanitize filename: remove special chars and get extension
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
    const extension = sanitizedName.split('.').pop()?.toLowerCase() || 'jpg';
    const filename = `${timestamp}-${randomStr}.${extension}`;
    const filePath = `images/${filename}`;
    
    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // Upload original file
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      return c.json({ success: false, error: uploadError.message }, 500);
    }

    // Generate signed URL (valid for 10 years)
    const { data: urlData } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(filePath, 315360000);

    if (!urlData?.signedUrl) {
      return c.json({ success: false, error: 'Failed to generate signed URL' }, 500);
    }

    return c.json({ 
      success: true, 
      url: urlData.signedUrl,
      path: filePath,
      metadata: {
        originalSize: buffer.length,
      },
    });

  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return c.json({ success: false, error: errorMsg }, 500);
  }
});

// General upload endpoint for authenticated users (used by collaborators, etc.)
app.post("/make-server-74296234/api/upload", verifyAdminToken, async (c) => {
  try {
    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Get form data
    const formData = await c.req.formData();
    // Try both 'file' and 'image' field names
    const file = (formData.get('file') || formData.get('image')) as File;

    if (!file) {
      return c.json({ success: false, error: 'No file provided (tried "file" and "image" fields)' }, 400);
    }

    // Create bucket if it doesn't exist
    const bucketName = 'make-74296234-images';
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      await supabase.storage.createBucket(bucketName, {
        public: false,
        fileSizeLimit: 10485760, // 10MB
      });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    // Sanitize filename: remove special chars and get extension
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
    const extension = sanitizedName.split('.').pop()?.toLowerCase() || 'jpg';
    const filename = `${timestamp}-${randomStr}.${extension}`;
    const filePath = `images/${filename}`;
    
    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // Upload file
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      return c.json({ success: false, error: uploadError.message }, 500);
    }

    // Generate signed URL (valid for 10 years)
    const { data: urlData } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(filePath, 315360000);

    if (!urlData?.signedUrl) {
      return c.json({ success: false, error: 'Failed to generate signed URL' }, 500);
    }

    return c.json({ 
      success: true, 
      url: urlData.signedUrl,
      path: filePath,
      metadata: {
        originalSize: buffer.length,
      },
    });

  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return c.json({ success: false, error: errorMsg }, 500);
  }
});

// ===== BLOG POSTS MANAGEMENT =====
app.get("/make-server-74296234/api/admin/posts", verifyAdminToken, async (c) => {
  try {
    const posts = await kv.getByPrefix('blog_post:');
    return c.json({ success: true, posts });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return c.json({ error: errorMsg }, 500);
  }
});

app.post("/make-server-74296234/api/admin/posts", verifyAdminToken, async (c) => {
  try {
    const post = await c.req.json();
    + '...',
      hasContent: !!post.content,
      contentBlocks: post.content?.length || 0,
      category: post.category,
    });
    
    const postId = post.id || `post-${Date.now()}`;
    // Check if post already exists
    const existing = await kv.get(`blog_post:${postId}`);
    
    if (existing) {
      // Update existing post instead of creating duplicate
      try {
        await kv.set(`blog_post:${postId}`, {
          ...existing,
          ...post,
          id: postId,
          updatedAt: new Date().toISOString(),
        });
        return c.json({ success: true, postId, updated: true });
      } catch (kvError) {
        throw kvError;
      }
    }
    
    try {
      await kv.set(`blog_post:${postId}`, {
        ...post,
        id: postId,
        createdAt: post.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      return c.json({ success: true, postId });
    } catch (kvError) {
      ,
        stack: kvError instanceof Error ? kvError.stack : undefined,
      });
      throw kvError;
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return c.json({ 
      success: false,
      error: errorMsg,
      message: 'Failed to save article. Please check server logs for details.'
    }, 500);
  }
});

app.put("/make-server-74296234/api/admin/posts/:id", verifyAdminToken, async (c) => {
  try {
    const postId = c.req.param('id');
    const updates = await c.req.json();
    
    const existing = await kv.get(`blog_post:${postId}`);
    if (!existing) {
      return c.json({ error: 'Post not found' }, 404);
    }
    
    await kv.set(`blog_post:${postId}`, {
      ...existing,
      ...updates,
      id: postId,
      updatedAt: new Date().toISOString(),
    });
    
    return c.json({ success: true });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return c.json({ error: errorMsg }, 500);
  }
});

app.delete("/make-server-74296234/api/admin/posts/:id", verifyAdminToken, async (c) => {
  try {
    const postId = c.req.param('id');
    await kv.del(`blog_post:${postId}`);
    return c.json({ success: true });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return c.json({ error: errorMsg }, 500);
  }
});

// ===== PUBLIC BLOG POSTS API (NO AUTH REQUIRED) =====
// Get all published posts
app.get("/make-server-74296234/api/posts", async (c) => {
  try {
    const posts = await kv.getByPrefix('blog_post:');
    // Filter out drafts if you add a published field later
    return c.json({ success: true, posts });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return c.json({ error: errorMsg }, 500);
  }
});

// Get single post by slug
app.get("/make-server-74296234/api/posts/:slug", async (c) => {
  try {
    const slug = c.req.param('slug');
    // Search all posts for matching slug
    const allPosts = await kv.getByPrefix('blog_post:');
    const post = allPosts.find((p: any) => p.slug === slug || p.id === slug);
    
    if (!post) {
      return c.json({ error: 'Post not found' }, 404);
    }
    
    // Look up category color
    let categoryColor = '#3B82F6'; // Default blue
    try {
      const categories = await kv.get('categories_articles');
      if (categories && Array.isArray(categories)) {
        const matchingCat = categories.find((cat: any) => 
          cat.name === post.category || cat.slug === post.category?.toLowerCase().replace(/\s+/g, '-')
        );
        if (matchingCat?.color) {
          categoryColor = matchingCat.color;
        }
      }
    } catch (e) {
      }
    
    return c.json({ success: true, post: { ...post, categoryColor } });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return c.json({ error: errorMsg }, 500);
  }
});

// Get related posts
app.post("/make-server-74296234/api/posts/related", async (c) => {
  try {
    const { category, tags, excludeId } = await c.req.json();
    // Get all posts
    const allPosts = await kv.getByPrefix('blog_post:');
    
    // Score posts by relevance
    const scoredPosts = allPosts
      .filter((p: any) => p.id !== excludeId) // Exclude current post
      .map((post: any) => {
        let score = 0;
        
        // Same category = 10 points
        if (post.category === category) {
          score += 10;
        }
        
        // Shared tags = 5 points each
        if (post.tags && tags) {
          const sharedTags = post.tags.filter((tag: string) => tags.includes(tag));
          score += sharedTags.length * 5;
        }
        
        return { ...post, relevanceScore: score };
      })
      .filter((p: any) => p.relevanceScore > 0) // Only include posts with some relevance
      .sort((a: any, b: any) => b.relevanceScore - a.relevanceScore); // Sort by score
    
    // Return top 3 most relevant posts
    const relatedPosts = scoredPosts.slice(0, 3);
    
    return c.json({ success: true, posts: relatedPosts });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return c.json({ error: errorMsg }, 500);
  }
});

// ===== PORTFOLIO PROJECTS MANAGEMENT =====
app.get("/make-server-74296234/api/admin/projects", verifyAdminToken, async (c) => {
  try {
    const projects = await kv.getByPrefix('project:');
    return c.json({ success: true, projects });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return c.json({ error: errorMsg }, 500);
  }
});

// ===== PUBLIC PROJECTS API (NO AUTH REQUIRED) =====
// Get all published projects
app.get("/make-server-74296234/api/projects", async (c) => {
  try {
    const projects = await kv.getByPrefix('project:');
    // Sort by year (descending - newest first), then by month (descending - newest first)
    const sortedProjects = projects.sort((a, b) => {
      const yearA = a.year ?? 0;
      const yearB = b.year ?? 0;
      
      // First sort by year (newest first)
      if (yearA !== yearB) {
        return yearB - yearA;
      }
      
      // If year is the same, sort by month (newest first)
      const monthA = a.month ?? 0;
      const monthB = b.month ?? 0;
      return monthB - monthA;
    });
    
    return c.json({ success: true, projects: sortedProjects });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return c.json({ success: false, error: errorMsg }, 500);
  }
});

// Increment project views
app.post("/make-server-74296234/api/projects/:id/view", async (c) => {
  try {
    const projectId = c.req.param('id');
    const project = await kv.get(`project:${projectId}`);
    if (!project) {
      return c.json({ error: 'Project not found' }, 404);
    }
    
    // Initialize engagement if it doesn't exist
    const views = (project.views || 0) + 1;
    const likes = project.likes || 0;
    
    await kv.set(`project:${projectId}`, {
      ...project,
      views,
      likes,
      updatedAt: new Date().toISOString()
    });
    
    return c.json({ success: true, views, likes });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return c.json({ error: errorMsg }, 500);
  }
});

// Increment project likes
app.post("/make-server-74296234/api/projects/:id/like", async (c) => {
  try {
    const projectId = c.req.param('id');
    const project = await kv.get(`project:${projectId}`);
    if (!project) {
      return c.json({ error: 'Project not found' }, 404);
    }
    
    // Initialize engagement if it doesn't exist
    const likes = (project.likes || 0) + 1;
    const views = project.views || 0;
    
    await kv.set(`project:${projectId}`, {
      ...project,
      likes,
      views,
      updatedAt: new Date().toISOString()
    });
    
    return c.json({ success: true, likes, views });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return c.json({ error: errorMsg }, 500);
  }
});

// Unlike a project
app.post("/make-server-74296234/api/projects/:id/unlike", async (c) => {
  try {
    const projectId = c.req.param('id');
    const project = await kv.get(`project:${projectId}`);
    if (!project) {
      return c.json({ error: 'Project not found' }, 404);
    }
    
    // Don't go below 0
    const likes = Math.max((project.likes || 0) - 1, 0);
    const views = project.views || 0;
    
    await kv.set(`project:${projectId}`, {
      ...project,
      likes,
      views,
      updatedAt: new Date().toISOString()
    });
    
    return c.json({ success: true, likes, views });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return c.json({ error: errorMsg }, 500);
  }
});

// Get single project by slug
app.get("/make-server-74296234/api/projects/:slug", async (c) => {
  try {
    const slug = c.req.param('slug');
    // Search all projects for matching slug
    const allProjects = await kv.getByPrefix('project:');
    const project = allProjects.find((p: any) => p.slug === slug || p.id === slug);
    
    if (!project) {
      return c.json({ error: 'Project not found' }, 404);
    }
    
    return c.json({ success: true, project });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return c.json({ error: errorMsg }, 500);
  }
});

app.post("/make-server-74296234/api/admin/projects", verifyAdminToken, async (c) => {
  try {
    const project = await c.req.json();
    const projectId = project.id || `project-${Date.now()}`;
    
    // Check if project already exists
    const existing = await kv.get(`project:${projectId}`);
    if (existing) {
      // Update existing project instead of creating duplicate
      await kv.set(`project:${projectId}`, {
        ...existing,
        ...project,
        id: projectId,
        updatedAt: new Date().toISOString(),
      });
      return c.json({ success: true, projectId, updated: true });
    }
    
    await kv.set(`project:${projectId}`, {
      ...project,
      id: projectId,
      createdAt: project.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    
    return c.json({ success: true, projectId });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return c.json({ error: errorMsg }, 500);
  }
});

app.put("/make-server-74296234/api/admin/projects/:id", verifyAdminToken, async (c) => {
  try {
    const projectId = c.req.param('id');
    const updates = await c.req.json();
    
    // Wrap kv.get with better error handling
    let existing;
    try {
      existing = await kv.get(`project:${projectId}`);
    } catch (kvError) {
      const kvErrorMsg = kvError instanceof Error ? kvError.message : String(kvError);
      // Check if it's a Cloudflare/Supabase service error
      if (kvErrorMsg.includes('Temporarily unavailable') || kvErrorMsg.includes('Cloudflare') || kvErrorMsg.includes('<!DOCTYPE html>')) {
        return c.json({ 
          error: 'Database temporarily unavailable',
          message: 'Supabase is experiencing a temporary service outage. Please wait 30-60 seconds and try again.',
          isServiceError: true
        }, 503);
      }
      throw kvError; // Re-throw if it's not a service error
    }
    
    if (!existing) {
      return c.json({ error: 'Project not found' }, 404);
    }
    
    // Wrap kv.set with better error handling
    try {
      await kv.set(`project:${projectId}`, {
        ...existing,
        ...updates,
        id: projectId,
        updatedAt: new Date().toISOString(),
      });
    } catch (kvError) {
      const kvErrorMsg = kvError instanceof Error ? kvError.message : String(kvError);
      if (kvErrorMsg.includes('Temporarily unavailable') || kvErrorMsg.includes('Cloudflare') || kvErrorMsg.includes('<!DOCTYPE html>')) {
        return c.json({ 
          error: 'Database temporarily unavailable',
          message: 'Supabase is experiencing a temporary service outage. Please wait 30-60 seconds and try again.',
          isServiceError: true
        }, 503);
      }
      throw kvError;
    }
    
    return c.json({ success: true });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return c.json({ error: errorMsg }, 500);
  }
});

app.delete("/make-server-74296234/api/admin/projects/:id", verifyAdminToken, async (c) => {
  try {
    const projectId = c.req.param('id');
    await kv.del(`project:${projectId}`);
    return c.json({ success: true });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return c.json({ error: errorMsg }, 500);
  }
});

// ===== NEWS MANAGEMENT =====
app.get("/make-server-74296234/api/admin/news", verifyAdminToken, async (c) => {
  try {
    const news = await kv.getByPrefix('news:');
    return c.json({ success: true, news });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return c.json({ error: errorMsg }, 500);
  }
});

// ===== PUBLIC NEWS API (NO AUTH REQUIRED) =====
// Get all published news
app.get("/make-server-74296234/api/news", async (c) => {
  try {
    const news = await kv.getByPrefix('news:');
    // Filter out drafts if you add a published field later
    return c.json({ success: true, news });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return c.json({ error: errorMsg }, 500);
  }
});

// Get single news item by slug
app.get("/make-server-74296234/api/news/:slug", async (c) => {
  try {
    const slug = c.req.param('slug');
    // Search all news for matching slug
    const allNews = await kv.getByPrefix('news:');
    const newsItem = allNews.find((n: any) => n.slug === slug || n.id === slug);
    
    if (!newsItem) {
      return c.json({ error: 'News not found' }, 404);
    }
    
    return c.json(newsItem); // Return the newsItem directly instead of wrapped
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return c.json({ error: errorMsg }, 500);
  }
});

app.post("/make-server-74296234/api/admin/news", verifyAdminToken, async (c) => {
  try {
    const newsItem = await c.req.json();
    const newsId = newsItem.id || `news-${Date.now()}`;
    
    // Check if news already exists
    const existing = await kv.get(`news:${newsId}`);
    if (existing) {
      // Update existing news instead of creating duplicate
      await kv.set(`news:${newsId}`, {
        ...existing,
        ...newsItem,
        id: newsId,
        updatedAt: new Date().toISOString(),
      });
      return c.json({ success: true, newsId, updated: true });
    }
    
    await kv.set(`news:${newsId}`, {
      ...newsItem,
      id: newsId,
      createdAt: newsItem.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    
    return c.json({ success: true, newsId });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return c.json({ error: errorMsg }, 500);
  }
});

app.put("/make-server-74296234/api/admin/news/:id", verifyAdminToken, async (c) => {
  try {
    const newsId = c.req.param('id');
    const updates = await c.req.json();
    
    const existing = await kv.get(`news:${newsId}`);
    if (!existing) {
      return c.json({ error: 'News item not found' }, 404);
    }
    
    await kv.set(`news:${newsId}`, {
      ...existing,
      ...updates,
      id: newsId,
      updatedAt: new Date().toISOString(),
    });
    
    return c.json({ success: true });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return c.json({ error: errorMsg }, 500);
  }
});

app.delete("/make-server-74296234/api/admin/news/:id", verifyAdminToken, async (c) => {
  try {
    const newsId = c.req.param('id');
    await kv.del(`news:${newsId}`);
    return c.json({ success: true });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return c.json({ error: errorMsg }, 500);
  }
});

// ===== COLLABORATORS API =====
// Get all collaborators (public)
app.get("/make-server-74296234/api/collaborators", async (c) => {
  try {
    const collaborators = await kv.getByPrefix('collaborator:');
    return c.json({ success: true, collaborators });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return c.json({ error: errorMsg }, 500);
  }
});

// Create collaborator (admin only)
app.post("/make-server-74296234/api/collaborators", verifyAdminToken, async (c) => {
  try {
    const collaborator = await c.req.json();
    const collaboratorId = collaborator.id || `collab-${Date.now()}`;
    
    await kv.set(`collaborator:${collaboratorId}`, {
      ...collaborator,
      id: collaboratorId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    
    return c.json({ success: true, collaboratorId });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return c.json({ error: errorMsg }, 500);
  }
});

// Update collaborator (admin only)
app.put("/make-server-74296234/api/collaborators/:id", verifyAdminToken, async (c) => {
  try {
    const collaboratorId = c.req.param('id');
    const updates = await c.req.json();
    
    const existing = await kv.get(`collaborator:${collaboratorId}`);
    if (!existing) {
      return c.json({ error: 'Collaborator not found' }, 404);
    }
    
    await kv.set(`collaborator:${collaboratorId}`, {
      ...existing,
      ...updates,
      id: collaboratorId,
      updatedAt: new Date().toISOString(),
    });
    
    return c.json({ success: true });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return c.json({ error: errorMsg }, 500);
  }
});

// Delete collaborator (admin only)
app.delete("/make-server-74296234/api/collaborators/:id", verifyAdminToken, async (c) => {
  try {
    const collaboratorId = c.req.param('id');
    await kv.del(`collaborator:${collaboratorId}`);
    
    return c.json({ success: true });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return c.json({ error: errorMsg }, 500);
  }
});

// AI Research for Collaborators
app.post("/make-server-74296234/api/collaborators/research", verifyAdminToken, async (c) => {
  try {
    const { name, type, role } = await c.req.json();
    const apiKey = Deno.env.get('OPENAI_API_KEY');

    if (!apiKey) {
      return c.json({ error: 'OpenAI API key not configured' }, 500);
    }

    const systemPrompt = `You are a research assistant helping to build a scenic designer's portfolio. 
You will be given a name, type (person/theatre/company), and potentially a role. 

CRITICAL INSTRUCTIONS:
1. ONLY provide information if you have SPECIFIC, FACTUAL knowledge about this person/organization
2. If you don't have real information, return empty strings for bio/role and null for URLs
3. Do NOT generate generic descriptions like "talented designer" or "known for innovative work"
4. Focus on FACTS: specific shows, venues, awards, companies, years active
5. For bios: Include specific productions, venues, or awards if known. Otherwise leave blank.
6. For roles: Be specific (e.g., "Lighting Designer at The Public Theater") not generic (e.g., "Lighting Designer")
7. For URLs: ONLY include if you're certain they exist. When in doubt, use null.

Return JSON format:
{
  "bio": "Brief factual bio with specific credits/venues/awards, or empty string if unknown",
  "website": "URL or null",
  "linkedin": "Full LinkedIn URL or null", 
  "instagram": "Full Instagram URL or null",
  "role": "Specific professional title or empty string if unknown"
}

REMEMBER: Empty/null is better than generic fluff. Be honest about what you don't know.`;

    const userPrompt = `Research information for:
Name: ${name}
Type: ${type}
${role ? `Current Role: ${role}` : ''}

This is for a theatrical scenic designer's collaborators page. Focus on professional information relevant to theatre, experiential design, or live entertainment.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        response_format: { type: "json_object" }
      })
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message);
    }

    const result = JSON.parse(data.choices[0].message.content);
    return c.json({ 
      success: true, 
      ...result
    });

  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return c.json({ error: errorMsg }, 500);
  }
});

// ===== SOCIAL LINKS MANAGEMENT =====
// Get social links
app.get("/make-server-74296234/kv/social-links", async (c) => {
  try {
    const links = await kv.get('social-links');
    if (!links) {
      return c.json({ value: [] });
    }
    return c.json({ value: links });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return c.json({ error: errorMsg }, 500);
  }
});

// Update social links
app.post("/make-server-74296234/kv/social-links", async (c) => {
  try {
    const body = await c.req.json();
    await kv.set('social-links', body.value);
    return c.json({ success: true });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return c.json({ error: errorMsg }, 500);
  }
});

// Get social profile
app.get("/make-server-74296234/kv/social-profile", async (c) => {
  try {
    const profile = await kv.get('social-profile');
    if (!profile) {
      return c.json({ value: {
        name: 'Brandon PT Davis',
        bio: 'Scenic Designer & Technical Director',
      }});
    }
    return c.json({ value: profile });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return c.json({ error: errorMsg }, 500);
  }
});

// Update social profile
app.post("/make-server-74296234/kv/social-profile", async (c) => {
  try {
    const body = await c.req.json();
    await kv.set('social-profile', body.value);
    return c.json({ success: true });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return c.json({ error: errorMsg }, 500);
  }
});

// ===== BIO LINKS PAGE =====
// Get all bio links
app.get("/make-server-74296234/links", async (c) => {
  try {
    const links = await kv.get('bio-links');
    return c.json(links || []);
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return c.json({ error: errorMsg }, 500);
  }
});

// Get bio data
app.get("/make-server-74296234/links/bio", async (c) => {
  try {
    const bio = await kv.get('bio-data');
    return c.json(bio || {
      name: 'BRANDON PT DAVIS',
      tagline: 'Scenic Designer',
      profileImage: '',
    });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return c.json({ error: errorMsg }, 500);
  }
});

// Update bio data
app.post("/make-server-74296234/links/bio", async (c) => {
  try {
    const body = await c.req.json();
    await kv.set('bio-data', body);
    return c.json({ success: true });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return c.json({ error: errorMsg }, 500);
  }
});

// Add a bio link
app.post("/make-server-74296234/links", async (c) => {
  try {
    const body = await c.req.json();
    const links = await kv.get('bio-links') || [];
    
    const newLink = {
      id: crypto.randomUUID(),
      ...body,
      enabled: body.enabled ?? true,
      order: body.order || (Array.isArray(links) ? links.length + 1 : 1),
    };
    
    const updatedLinks = Array.isArray(links) ? [...links, newLink] : [newLink];
    await kv.set('bio-links', updatedLinks);
    
    return c.json(newLink);
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return c.json({ error: errorMsg }, 500);
  }
});

// Update a bio link
app.put("/make-server-74296234/links/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const links = await kv.get('bio-links') || [];
    
    if (!Array.isArray(links)) {
      return c.json({ error: 'Invalid links data' }, 500);
    }
    
    const updatedLinks = links.map(link => 
      link.id === id ? { ...link, ...body } : link
    );
    
    await kv.set('bio-links', updatedLinks);
    
    const updatedLink = updatedLinks.find(link => link.id === id);
    return c.json(updatedLink);
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return c.json({ error: errorMsg }, 500);
  }
});

// Delete a bio link
app.delete("/make-server-74296234/links/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const links = await kv.get('bio-links') || [];
    
    if (!Array.isArray(links)) {
      return c.json({ error: 'Invalid links data' }, 500);
    }
    
    const updatedLinks = links.filter(link => link.id !== id);
    await kv.set('bio-links', updatedLinks);
    
    return c.json({ success: true });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return c.json({ error: errorMsg }, 500);
  }
});

// ===== TUTORIALS MANAGEMENT =====
// Get all tutorials
app.get("/make-server-74296234/api/tutorials", async (c) => {
  try {
    // Public endpoint - no auth required
    const tutorials = await kv.getByPrefix('tutorial:');
    
    // Sort by publish date (newest first)
    const sortedTutorials = tutorials.sort((a: any, b: any) => {
      return new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime();
    });
    
    return c.json({ tutorials: sortedTutorials });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return c.json({ error: errorMsg }, 500);
  }
});

// Create or update tutorial
app.post("/make-server-74296234/api/tutorials", async (c) => {
  try {
    const adminToken = c.req.header('X-Admin-Token');
    const importSecret = c.req.header('X-Import-Secret');
    
    if (!adminToken && importSecret !== 'temp-secret-123') {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const tutorial = await c.req.json();
    
    // Validate required fields
    if (!tutorial.id || !tutorial.slug || !tutorial.title) {
      return c.json({ error: 'Missing required fields' }, 400);
    }
    
    await kv.set(`tutorial:${tutorial.id}`, tutorial);
    return c.json({ success: true, tutorial });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return c.json({ error: errorMsg }, 500);
  }
});

// Update tutorial
app.put("/make-server-74296234/api/tutorials", async (c) => {
  try {
    const adminToken = c.req.header('X-Admin-Token');
    if (!adminToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const tutorial = await c.req.json();
    
    if (!tutorial.id) {
      return c.json({ error: 'Tutorial ID is required' }, 400);
    }
    
    await kv.set(`tutorial:${tutorial.id}`, tutorial);
    return c.json({ success: true, tutorial });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return c.json({ error: errorMsg }, 500);
  }
});

// Delete tutorial
app.delete("/make-server-74296234/api/tutorials/:id", async (c) => {
  try {
    const adminToken = c.req.header('X-Admin-Token');
    if (!adminToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const tutorialId = c.req.param('id');
    await kv.del(`tutorial:${tutorialId}`);
    return c.json({ success: true });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return c.json({ error: errorMsg }, 500);
  }
});

// Get tutorial categories
app.get("/make-server-74296234/api/tutorial-categories", async (c) => {
  try {
    const adminToken = c.req.header('X-Admin-Token');
    if (!adminToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const categories = await kv.get('tutorial-categories');
    
    // Default categories if none exist
    const defaultCategories = [
      { id: 'quick-tips', name: 'Quick Tips', description: 'Short, focused tutorials on specific techniques' },
      { id: 'walkthroughs', name: 'Project Walkthroughs', description: 'Complete project overviews and design process' },
      { id: '3d-modeling', name: '3D Modeling & Visualization', description: '3D modeling and rendering workflows' },
      { id: 'workflow', name: 'Resources & Workflow', description: 'Productivity and workflow optimization' },
      { id: '2d-drafting', name: '2D Drafting & Docs', description: 'Technical drawings and documentation' },
    ];
    
    return c.json({ categories: categories || defaultCategories });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return c.json({ error: errorMsg }, 500);
  }
});

// Update tutorial categories
app.post("/make-server-74296234/api/tutorial-categories", async (c) => {
  try {
    const token = c.req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { categories } = await c.req.json();
    await kv.set('tutorial-categories', categories);
    return c.json({ success: true, categories });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return c.json({ error: errorMsg }, 500);
  }
});

// Storage bucket management endpoint
app.post("/make-server-74296234/storage/ensure-buckets", async (c) => {
  try {
    const body = await c.req.json();
    const { bucketNames } = body;

    if (!bucketNames || !Array.isArray(bucketNames)) {
      return c.json({ error: "bucketNames array is required" }, 400);
    }

    // Create admin client with service role key
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );

    // List existing buckets
    const { data: existingBuckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      return c.json({ error: `Failed to list buckets: ${listError.message}` }, 500);
    }

    const existingBucketNames = existingBuckets?.map(b => b.name) || [];
    const created: string[] = [];
    const errors: string[] = [];
    const skipped: string[] = [];

    // Create missing buckets
    for (const bucketName of bucketNames) {
      if (existingBucketNames.includes(bucketName)) {
        skipped.push(bucketName);
        continue;
      }

      const { error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 10485760, // 10MB
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp', 'image/svg+xml']
      });

      if (createError) {
        errors.push(`${bucketName}: ${createError.message}`);
      } else {
        created.push(bucketName);
      }
    }

    const success = errors.length === 0;
    const response = {
      success,
      created,
      skipped,
      errors,
      message: success 
        ? `All buckets ready (${created.length} created, ${skipped.length} already existed)`
        : `Some buckets failed to create: ${errors.join(', ')}`
    };

    return c.json(response);

  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return c.json({ error: errorMsg }, 500);
  }
});

// ===== HELPER FUNCTION: Convert image URL to publicly accessible URL =====
async function ensurePublicImageUrl(imageUrl: string, supabase: any): Promise<string> {
  // If it's already a public HTTP/HTTPS URL, return as-is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  // If it's a figma:asset path, we can't use it with OpenAI
  // We need to upload it to Supabase Storage first or use a different URL
  if (imageUrl.startsWith('figma:asset/')) {
    throw new Error('Figma asset URLs cannot be analyzed by AI. Please upload images to a public URL or Supabase Storage first.');
  }

  // If it's a Supabase storage path like /storage/v1/object/...
  if (imageUrl.includes('/storage/v1/object/')) {
    // Extract bucket and path
    const match = imageUrl.match(/\/storage\/v1\/object\/(?:public|sign)\/([^/]+)\/(.+)/);
    if (match) {
      const [, bucket, path] = match;
      // Create a signed URL that's publicly accessible
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, 3600); // 1 hour expiry

      if (error || !data?.signedUrl) {
        throw new Error(`Failed to create signed URL: ${error?.message}`);
      }
      return data.signedUrl;
    }
  }

  // If it's a relative Supabase storage path
  if (imageUrl.startsWith('/')) {
    throw new Error('Relative URLs cannot be analyzed by AI. Please use full public URLs.');
  }

  return imageUrl;
}

// ===== AI IMAGE TAGGING =====
// Generate tags for an image using OpenAI Vision API
app.post("/make-server-74296234/api/admin/generate-tags", verifyAdminToken, async (c) => {
  try {
    const body = await c.req.json();
    const { imageUrl, context } = body;

    if (!imageUrl) {
      return c.json({ error: 'imageUrl is required' }, 400);
    }

    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiKey) {
      return c.json({ 
        error: 'OpenAI API key not configured. Please add your API key in the environment variables.',
        tags: []
      }, 400);
    }

    // Ensure the image URL is publicly accessible
    const publicImageUrl = await ensurePublicImageUrl(imageUrl, createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    ));

    // Call OpenAI Vision API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are an expert in theatrical scenic design and visual analysis. Generate relevant tags for scenic design portfolio images. Focus on: design style, color palette, architectural elements, theatrical genre, mood/atmosphere, materials, spatial concepts, and technical approaches. Return ONLY a JSON array of 8-12 concise, searchable tags.`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analyze this scenic design image${context ? ` for: ${context}` : ''} and generate relevant tags. Return only a JSON array like: ["tag1", "tag2", "tag3"]`
              },
              {
                type: 'image_url',
                image_url: {
                  url: publicImageUrl,
                  detail: 'low' // Use low detail for faster/cheaper analysis
                }
              }
            ]
          }
        ],
        max_tokens: 300,
        temperature: 0.7
      })
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.text();
      return c.json({ 
        error: `OpenAI API error: ${openaiResponse.status}`,
        details: errorData,
        tags: []
      }, 500);
    }

    const openaiData = await openaiResponse.json();
    const content = openaiData.choices?.[0]?.message?.content || '';
    
    // Extract JSON array from response
    let tags: string[] = [];
    try {
      // Try to parse as JSON directly
      const jsonMatch = content.match(/\[.*\]/s);
      if (jsonMatch) {
        tags = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback: extract words/phrases
        tags = content
          .split(/[,\n]/)
          .map((t: string) => t.trim().replace(/^["']|["']$/g, ''))
          .filter((t: string) => t.length > 0)
          .slice(0, 12);
      }
    } catch (parseErr) {
      tags = [];
    }

    return c.json({
      success: true,
      tags,
      rawResponse: content
    });

  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return c.json({ 
      error: errorMsg,
      tags: []
    }, 500);
  }
});

// ===== AI ALT TEXT GENERATOR =====
app.post("/make-server-74296234/api/admin/generate-alt-text", verifyAdminToken, async (c) => {
  try {
    const body = await c.req.json();
    const { imageUrl, context } = body;

    if (!imageUrl) {
      return c.json({ error: 'imageUrl is required' }, 400);
    }

    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiKey) {
      return c.json({ error: 'OpenAI API key not configured' }, 400);
    }

    // Ensure the image URL is publicly accessible
    const publicImageUrl = await ensurePublicImageUrl(imageUrl, createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    ));

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are an accessibility expert specializing in scenic design. Generate concise, descriptive alt text for images following WCAG guidelines. Focus on what's visually important: spatial composition, architectural elements, color, lighting, materials, and key design features. Keep it under 125 characters when possible.`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Generate accessible alt text for this scenic design image${context ? ` (${context})` : ''}. Be descriptive but concise.`
              },
              {
                type: 'image_url',
                image_url: { url: publicImageUrl, detail: 'low' }
              }
            ]
          }
        ],
        max_tokens: 150,
        temperature: 0.7
      })
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.text();
      return c.json({ error: `OpenAI API error: ${openaiResponse.status}` }, 500);
    }

    const openaiData = await openaiResponse.json();
    const altText = openaiData.choices?.[0]?.message?.content?.trim() || '';

    return c.json({ success: true, altText });

  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return c.json({ error: errorMsg }, 500);
  }
});

// ===== AI PROJECT DESCRIPTION WRITER =====
app.post("/make-server-74296234/api/admin/generate-description", verifyAdminToken, async (c) => {
  try {
    const body = await c.req.json();
    const { title, category, venue, year, imageUrls } = body;

    if (!title) {
      return c.json({ error: 'title is required' }, 400);
    }

    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiKey) {
      return c.json({ error: 'OpenAI API key not configured' }, 400);
    }

    // Build context
    const contextParts = [title];
    if (category) contextParts.push(category);
    if (venue) contextParts.push(venue);
    if (year) contextParts.push(String(year));
    const projectContext = contextParts.join(' - ');

    // Prepare message content
    const messageContent: any[] = [
      {
        type: 'text',
        text: `Write a compelling 2-3 sentence portfolio description for this scenic design project: "${projectContext}". Focus on design concept, visual storytelling, and theatrical impact. Write in first person as the designer. Be specific and evocative.`
      }
    ];

    // Create Supabase client for URL conversion
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Add up to 3 images if provided
    if (imageUrls && Array.isArray(imageUrls) && imageUrls.length > 0) {
      const imagesToAnalyze = imageUrls.slice(0, 3);
      for (const url of imagesToAnalyze) {
        try {
          const publicUrl = await ensurePublicImageUrl(url, supabase);
          messageContent.push({
            type: 'image_url',
            image_url: { url: publicUrl, detail: 'low' }
          });
        } catch (urlErr) {
          // Continue without this image
        }
      }
    }

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are an award-winning scenic designer writing portfolio descriptions. Your writing is sophisticated, visual, and showcases design thinking. You write in first person and focus on concept, visual language, and theatrical storytelling.`
          },
          {
            role: 'user',
            content: messageContent
          }
        ],
        max_tokens: 250,
        temperature: 0.8
      })
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.text();
      return c.json({ error: `OpenAI API error: ${openaiResponse.status}` }, 500);
    }

    const openaiData = await openaiResponse.json();
    const description = openaiData.choices?.[0]?.message?.content?.trim() || '';

    return c.json({ success: true, description });

  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return c.json({ error: errorMsg }, 500);
  }
});

// ===== AI IMAGE CAPTION GENERATOR =====
app.post("/make-server-74296234/api/admin/generate-caption", verifyAdminToken, async (c) => {
  try {
    const body = await c.req.json();
    const { imageUrl, context } = body;

    if (!imageUrl) {
      return c.json({ error: 'imageUrl is required' }, 400);
    }

    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiKey) {
      return c.json({ error: 'OpenAI API key not configured' }, 400);
    }

    // Ensure the image URL is publicly accessible
    const publicImageUrl = await ensurePublicImageUrl(imageUrl, createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    ));

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are a scenic designer writing gallery captions. Write short, informative captions (1-2 sentences) that describe what's shown: viewpoint, design elements, materials, spatial relationships, or technical details. Use professional scenic design terminology.`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Write a gallery caption for this scenic design image${context ? ` from ${context}` : ''}.`
              },
              {
                type: 'image_url',
                image_url: { url: publicImageUrl, detail: 'low' }
              }
            ]
          }
        ],
        max_tokens: 150,
        temperature: 0.7
      })
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.text();
      return c.json({ error: `OpenAI API error: ${openaiResponse.status}` }, 500);
    }

    const openaiData = await openaiResponse.json();
    const caption = openaiData.choices?.[0]?.message?.content?.trim() || '';

    return c.json({ success: true, caption });

  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return c.json({ error: errorMsg }, 500);
  }
});

// ===== AI BULK TAG GENERATION =====
app.post("/make-server-74296234/api/admin/generate-bulk-tags", verifyAdminToken, async (c) => {
  try {
    const body = await c.req.json();
    const { imageUrls, context } = body;

    if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
      return c.json({ error: 'imageUrls array is required' }, 400);
    }

    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiKey) {
      return c.json({ error: 'OpenAI API key not configured' }, 400);
    }

    // Prepare message with multiple images (max 10)
    const imagesToAnalyze = imageUrls.slice(0, 10);
    const imageContent = imagesToAnalyze.map((url: string) => ({
      type: 'image_url',
      image_url: { url, detail: 'low' }
    }));

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are an expert in scenic design. Analyze multiple images as a cohesive collection and generate comprehensive tags that apply to the overall project. Focus on: design style, color palette, architectural elements, theatrical genre, mood, materials, spatial concepts. Return ONLY a JSON array of 10-15 tags.`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analyze these scenic design images${context ? ` for ${context}` : ''} as a collection and generate comprehensive tags. Return only a JSON array like: ["tag1", "tag2", "tag3"]`
              },
              ...imageContent
            ]
          }
        ],
        max_tokens: 400,
        temperature: 0.7
      })
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.text();
      return c.json({ error: `OpenAI API error: ${openaiResponse.status}` }, 500);
    }

    const openaiData = await openaiResponse.json();
    const content = openaiData.choices?.[0]?.message?.content || '';

    let tags: string[] = [];
    try {
      const jsonMatch = content.match(/\[.*\]/s);
      if (jsonMatch) {
        tags = JSON.parse(jsonMatch[0]);
      }
    } catch (parseErr) {
      tags = [];
    }

    return c.json({ success: true, tags });

  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return c.json({ error: errorMsg }, 500);
  }
});

// ===== AI SMART THUMBNAIL SELECTOR =====
app.post("/make-server-74296234/api/admin/select-thumbnail", verifyAdminToken, async (c) => {
  try {
    const body = await c.req.json();
    const { imageUrls, context } = body;

    if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
      return c.json({ error: 'imageUrls array is required' }, 400);
    }

    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiKey) {
      return c.json({ error: 'OpenAI API key not configured' }, 400);
    }

    // Analyze up to 10 images
    const imagesToAnalyze = imageUrls.slice(0, 10);
    const imageContent = imagesToAnalyze.map((url: string, index: number) => [
      {
        type: 'text',
        text: `Image ${index + 1}:`
      },
      {
        type: 'image_url',
        image_url: { url, detail: 'low' }
      }
    ]).flat();

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are a portfolio curator selecting the best thumbnail/cover image. Choose the image with the strongest composition, visual interest, and ability to represent the project. Consider: clarity, focal point, color balance, and overall impact. Respond with ONLY the number (1, 2, 3, etc.) of the best image.`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Which of these images would make the best portfolio thumbnail${context ? ` for ${context}` : ''}? Respond with only the image number (1, 2, 3, etc.).`
              },
              ...imageContent
            ]
          }
        ],
        max_tokens: 50,
        temperature: 0.3
      })
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.text();
      return c.json({ error: `OpenAI API error: ${openaiResponse.status}` }, 500);
    }

    const openaiData = await openaiResponse.json();
    const content = openaiData.choices?.[0]?.message?.content?.trim() || '';

    // Extract number from response
    const numberMatch = content.match(/\d+/);
    const selectedIndex = numberMatch ? parseInt(numberMatch[0]) - 1 : 0;
    const clampedIndex = Math.max(0, Math.min(selectedIndex, imagesToAnalyze.length - 1));

    const selectedImageUrl = imagesToAnalyze[clampedIndex];

    return c.json({
      success: true,
      selectedIndex: clampedIndex,
      selectedImageUrl,
      reasoning: content
    });

  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return c.json({ error: errorMsg }, 500);
  }
});

// ===== AI DESIGN NOTES EXPANDER =====
app.post("/make-server-74296234/api/admin/expand-notes", verifyAdminToken, async (c) => {
  try {
    const body = await c.req.json();
    const { notes, context } = body;

    if (!notes || !Array.isArray(notes) || notes.length === 0) {
      return c.json({ error: 'notes array is required' }, 400);
    }

    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiKey) {
      return c.json({ error: 'OpenAI API key not configured' }, 400);
    }

    const bulletPoints = notes.map((note: string, i: number) => `${i + 1}. ${note}`).join('\n');

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are a scenic designer expanding design notes into full descriptive paragraphs. Maintain the technical accuracy and intent of the original notes while making them more detailed, sophisticated, and portfolio-ready. Write in first person as the designer. Each expanded note should be approximately 300 words.`
          },
          {
            role: 'user',
            content: `Expand these brief design notes${context ? ` for ${context}` : ''} into detailed descriptive paragraphs of approximately 300 words each. Include technical details, artistic intent, and design process. Keep the same order and structure:\n\n${bulletPoints}\n\nReturn the expanded notes as a JSON array of strings, one paragraph per original note.`
          }
        ],
        max_tokens: 1500,
        temperature: 0.7
      })
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.text();
      return c.json({ error: `OpenAI API error: ${openaiResponse.status}` }, 500);
    }

    const openaiData = await openaiResponse.json();
    const content = openaiData.choices?.[0]?.message?.content || '';

    let expandedNotes: string[] = [];
    try {
      const jsonMatch = content.match(/\[.*\]/s);
      if (jsonMatch) {
        expandedNotes = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback: split by double newlines
        expandedNotes = content.split(/\n\n+/).filter((n: string) => n.trim().length > 0);
      }
    } catch (parseErr) {
      expandedNotes = [content];
    }

    return c.json({ success: true, expandedNotes });

  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return c.json({ error: errorMsg }, 500);
  }
});

// ===== CATEGORY MANAGEMENT =====
// Default categories fallback
const DEFAULT_ARTICLE_CATEGORIES = [
  { id: 'philosophy', name: 'Design Philosophy', slug: 'philosophy', color: '#3B82F6' },
  { id: 'process', name: 'Scenic Design Process', slug: 'process', color: '#10B981' },
  { id: 'tech', name: 'Technology & Tutorials', slug: 'tech', color: '#8B5CF6' },
  { id: 'experiential', name: 'Experiential Design', slug: 'experiential', color: '#F59E0B' },
];

const DEFAULT_PORTFOLIO_CATEGORIES = [
  { id: 'scenic', name: 'Scenic Design', slug: 'scenic', color: '#2563EB' },
  { id: 'experiential', name: 'Experiential', slug: 'experiential', color: '#F59E0B' },
  { id: 'rendering', name: 'Rendering', slug: 'rendering', color: '#9333EA' },
];

const DEFAULT_NEWS_CATEGORIES = [
  { id: 'announcement', name: 'Announcement', slug: 'announcement', color: '#3B82F6' },
  { id: 'event', name: 'Event', slug: 'event', color: '#10B981' },
  { id: 'update', name: 'Update', slug: 'update', color: '#F59E0B' },
];

// Public endpoints - no auth required
app.get("/make-server-74296234/api/categories/portfolio", async (c) => {
  try {
    const categories = await kv.get('categories_portfolio');
    return c.json({ success: true, categories: (categories && categories.length > 0) ? categories : DEFAULT_PORTFOLIO_CATEGORIES });
  } catch (err) {
    return c.json({ success: true, categories: DEFAULT_PORTFOLIO_CATEGORIES });
  }
});

app.get("/make-server-74296234/api/categories/articles", async (c) => {
  try {
    const categories = await kv.get('categories_articles');
    return c.json({ success: true, categories: (categories && categories.length > 0) ? categories : DEFAULT_ARTICLE_CATEGORIES });
  } catch (err) {
    return c.json({ success: true, categories: DEFAULT_ARTICLE_CATEGORIES });
  }
});

app.get("/make-server-74296234/api/categories/news", async (c) => {
  try {
    const categories = await kv.get('categories_news');
    return c.json({ success: true, categories: (categories && categories.length > 0) ? categories : DEFAULT_NEWS_CATEGORIES });
  } catch (err) {
    return c.json({ success: true, categories: DEFAULT_NEWS_CATEGORIES });
  }
});

// Admin endpoints - auth required
// Get all categories
app.get("/make-server-74296234/api/admin/categories", verifyAdminToken, async (c) => {
  try {
    // Load categories for all content types
    const portfolioCategories = await kv.get('categories_portfolio');
    const articlesCategories = await kv.get('categories_articles');
    const newsCategories = await kv.get('categories_news');
    
    return c.json({ 
      success: true, 
      categories: {
        portfolio: (portfolioCategories && portfolioCategories.length > 0) ? portfolioCategories : DEFAULT_PORTFOLIO_CATEGORIES,
        articles: (articlesCategories && articlesCategories.length > 0) ? articlesCategories : DEFAULT_ARTICLE_CATEGORIES,
        news: (newsCategories && newsCategories.length > 0) ? newsCategories : DEFAULT_NEWS_CATEGORIES,
      }
    });
  } catch (err) {
    return c.json({ success: false, error: err instanceof Error ? err.message : 'Unknown error' }, 500);
  }
});

// Create or update a category
app.post("/make-server-74296234/api/admin/categories/:type", verifyAdminToken, async (c) => {
  try {
    const type = c.req.param('type');
    const category = await c.req.json();
    
    if (!['portfolio', 'articles', 'news'].includes(type)) {
      return c.json({ success: false, error: 'Invalid category type' }, 400);
    }
    
    // Load existing categories
    const key = `categories_${type}`;
    const categories = await kv.get(key) || [];
    
    // Add new category
    categories.push(category);
    
    // Save back to database
    await kv.set(key, categories);
    
    return c.json({ success: true, category });
  } catch (err) {
    return c.json({ success: false, error: err instanceof Error ? err.message : 'Unknown error' }, 500);
  }
});

// Update a category
app.put("/make-server-74296234/api/admin/categories/:type", verifyAdminToken, async (c) => {
  try {
    const type = c.req.param('type');
    const category = await c.req.json();
    
    if (!['portfolio', 'articles', 'news'].includes(type)) {
      return c.json({ success: false, error: 'Invalid category type' }, 400);
    }
    
    // Load existing categories
    const key = `categories_${type}`;
    const categories = await kv.get(key) || [];
    
    // Find and update the category
    const index = categories.findIndex((c: any) => c.id === category.id);
    if (index !== -1) {
      categories[index] = category;
    } else {
      return c.json({ success: false, error: 'Category not found' }, 404);
    }
    
    // Save back to database
    await kv.set(key, categories);
    
    return c.json({ success: true, category });
  } catch (err) {
    return c.json({ success: false, error: err instanceof Error ? err.message : 'Unknown error' }, 500);
  }
});

// Delete a category
app.delete("/make-server-74296234/api/admin/categories/:type/:id", verifyAdminToken, async (c) => {
  try {
    const type = c.req.param('type');
    const categoryId = c.req.param('id');
    
    if (!['portfolio', 'articles', 'news'].includes(type)) {
      return c.json({ success: false, error: 'Invalid category type' }, 400);
    }
    
    // Load existing categories
    const key = `categories_${type}`;
    const categories = await kv.get(key) || [];
    
    // Filter out the category to delete
    const updatedCategories = categories.filter((c: any) => c.id !== categoryId);
    
    // Save back to database
    await kv.set(key, updatedCategories);
    
    return c.json({ success: true });
  } catch (err) {
    return c.json({ success: false, error: err instanceof Error ? err.message : 'Unknown error' }, 500);
  }
});

Deno.serve(app.fetch);