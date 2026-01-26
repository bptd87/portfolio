import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    // Hardcoded fallbacks from src/utils/supabase/info.tsx
    const FALLBACK_PROJECT_ID = "zuycsuajiuqsvopiioer";
    const FALLBACK_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1eWNzdWFqaXVxc3ZvcGlpb2VyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4Mzk1ODUsImV4cCI6MjA3NzQxNTU4NX0.y7C3gkxAXQvOLRdaebj_3MRww2QjaN9fA2sCUzsdhEM";

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || `https://${process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID || FALLBACK_PROJECT_ID}.supabase.co`;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || FALLBACK_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Supabase environment variables missing' }, { status: 500 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ 
        error: 'OpenAI API Key not configured',
        suggestion: 'Please add OPENAI_API_KEY to your .env.local file and restart your dev server.' 
      }, { status: 400 });
    }

    const openai = new OpenAI({ apiKey });
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Fetch all projects
    const { data: projects, error: projectsError } = await supabase
      .from('portfolio_projects')
      .select('id, title, project_overview, design_notes');

    if (projectsError) throw projectsError;

    console.log(`Re-indexing ${projects?.length || 0} projects...`);

    // 2. Process projects
    for (const project of (projects || [])) {
      // Combine text for embedding
      const overview = project.project_overview || '';
      const notes = Array.isArray(project.design_notes) ? project.design_notes.join(' ') : (project.design_notes || '');
      const content = `Title: ${project.title}\n\nOverview: ${overview}\n\nNotes: ${notes}`;

      const embeddingResponse = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: content,
      });

      const [{ embedding }] = embeddingResponse.data;

      await supabase
        .from('portfolio_projects')
        .update({ embedding })
        .eq('id', project.id);
    }

    // 3. Fetch all tutorials
    const { data: tutorials, error: tutorialsError } = await supabase
      .from('tutorials')
      .select('id, title, description, content');

    if (tutorialsError) throw tutorialsError;

    console.log(`Re-indexing ${tutorials?.length || 0} tutorials...`);

    // 4. Process tutorials
    for (const tutorial of (tutorials || [])) {
      // Combine text for embedding
      const desc = tutorial.description || '';
      // Tutorial content is complex (blocks), for now we just use description and title
      // We could flatten blocks later if needed
      const content = `Title: ${tutorial.title}\n\nDescription: ${desc}`;

      const embeddingResponse = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: content,
      });

      const [{ embedding }] = embeddingResponse.data;

      await supabase
        .from('tutorials')
        .update({ embedding })
        .eq('id', tutorial.id);
    }

    // 5. Fetch all articles
    const { data: articles, error: articlesError } = await supabase
      .from('articles')
      .select('id, title, excerpt, content');

    if (articlesError) throw articlesError;

    console.log(`Re-indexing ${articles?.length || 0} articles...`);

    // 6. Process articles
    for (const article of (articles || [])) {
      const excerpt = article.excerpt || '';
      // Articles also use block content
      const contentText = Array.isArray(article.content) 
        ? article.content.map((b: any) => (b && typeof b.content === 'string') ? b.content : '').join(' ') 
        : (typeof article.content === 'string' ? article.content : '');
      const content = `Title: ${article.title}\n\nExcerpt: ${excerpt}\n\nContent: ${contentText}`;

      const embeddingResponse = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: content.substring(0, 8000), // Safety truncation
      });

      const [{ embedding }] = embeddingResponse.data;

      await supabase
        .from('articles')
        .update({ embedding })
        .eq('id', article.id);
    }

    // 7. Fetch all news
    const { data: news, error: newsError } = await supabase
      .from('news')
      .select('id, title, excerpt, content');

    if (newsError) throw newsError;

    console.log(`Re-indexing ${news?.length || 0} news items...`);

    // 8. Process news
    for (const item of (news || [])) {
      const excerpt = item.excerpt || '';
      const contentText = Array.isArray(item.content) 
        ? item.content.map((b: any) => (b && typeof b.content === 'string') ? b.content : '').join(' ') 
        : (typeof item.content === 'string' ? item.content : '');
      const content = `Title: ${item.title}\n\nExcerpt: ${excerpt}\n\nContent: ${contentText}`;

      const embeddingResponse = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: content.substring(0, 8000), // Safety truncation
      });

      const [{ embedding }] = embeddingResponse.data;

      await supabase
        .from('news')
        .update({ embedding })
        .eq('id', item.id);
    }

    return NextResponse.json({
      success: true,
      indexed: {
        projects: projects?.length || 0,
        tutorials: tutorials?.length || 0,
        articles: articles?.length || 0,
        news: news?.length || 0,
      }
    });
  } catch (error: any) {
    console.error('Re-index API error:', error);
    return NextResponse.json({ 
      error: error.message || 'Internal server error',
      details: error.details || 'Check server logs for more info',
      suggestion: !process.env.OPENAI_API_KEY ? 'OpenAI API Key is missing from environment variables' : 'Check if your Supabase key has UPDATE permissions'
    }, { status: 500 });
  }
}
