import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const { query } = await request.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;

    // Hardcoded fallbacks from src/utils/supabase/info.tsx
    const FALLBACK_PROJECT_ID = "zuycsuajiuqsvopiioer";
    const FALLBACK_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1eWNzdWFqaXVxc3ZvcGlpb2VyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4Mzk1ODUsImV4cCI6MjA3NzQxNTU4NX0.y7C3gkxAXQvOLRdaebj_3MRww2QjaN9fA2sCUzsdhEM";

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || `https://${process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID || FALLBACK_PROJECT_ID}.supabase.co`;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || FALLBACK_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Supabase environment variables missing' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // --- MODE A: SEMANTIC SEARCH (Requires OpenAI Key) ---
    if (apiKey) {
      try {
        const openai = new OpenAI({ apiKey });

        const embeddingResponse = await openai.embeddings.create({
          model: 'text-embedding-3-small',
          input: query,
        });

        const [{ embedding }] = embeddingResponse.data;

        // 2. Search all tables using vector similarity
        const [projects, tutorials, articles, news] = await Promise.all([
          supabase.rpc('match_projects', { query_embedding: embedding, match_threshold: 0.1, match_count: 5 }),
          supabase.rpc('match_tutorials', { query_embedding: embedding, match_threshold: 0.1, match_count: 5 }),
          supabase.rpc('match_articles', { query_embedding: embedding, match_threshold: 0.1, match_count: 5 }),
          supabase.rpc('match_news', { query_embedding: embedding, match_threshold: 0.1, match_count: 5 }),
        ]);

        return NextResponse.json({
          projects: projects.data || [],
          tutorials: tutorials.data || [],
          articles: articles.data || [],
          news: news.data || [],
          mode: 'semantic'
        });
      } catch (err: any) {
        console.error('Semantic search failed, falling back to keyword:', err.message);
        // Fall through to keyword search
      }
    }

    // --- MODE B: KEYWORD SEARCH (Standard SQL) ---
    console.log('Using Keyword Search Path');
    const searchPattern = `%${query}%`;

    const [pRes, tRes, aRes, nRes] = await Promise.all([
      supabase.from('portfolio_projects').select('id, title, slug').ilike('title', searchPattern).limit(5),
      supabase.from('tutorials').select('id, title, slug').ilike('title', searchPattern).limit(5),
      supabase.from('articles').select('id, title, slug').ilike('title', searchPattern).limit(5),
      supabase.from('news').select('id, title, slug').ilike('title', searchPattern).limit(5),
    ]);

    return NextResponse.json({
      projects: pRes.data || [],
      tutorials: tRes.data || [],
      articles: aRes.data || [],
      news: nRes.data || [],
      mode: 'keyword'
    });
  } catch (error: any) {
    console.error('Search API error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
