import React, { useState } from 'react';
import { RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { blogPosts } from '../../data/blog-posts';
import { projects } from '../../data/projects';
import { newsItems } from '../../data/news';
import { DatabaseDebug } from './DatabaseDebug';

// Simple content converter for blog posts
function createPlaceholderContent(post: any) {
  return [
    {
      id: `block-intro-${Date.now()}`,
      type: 'paragraph',
      content: post.excerpt || 'Add your article content here...',
    },
    {
      id: `block-heading-${Date.now()}`,
      type: 'heading',
      content: 'Main Section',
      metadata: { level: 2 },
    },
    {
      id: `block-para-${Date.now()}`,
      type: 'paragraph',
      content: 'Continue your article content here. Use the block editor to add more paragraphs, headings, images, quotes, and more.',
    },
  ];
}

export function DataSync() {
  const [syncing, setSyncing] = useState(false);
  const [resyncingContent, setResyncingContent] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showWarning, setShowWarning] = useState(false);

  const syncData = async () => {
    // Show warning before syncing
    if (!showWarning) {
      setShowWarning(true);
      return;
    }

    setSyncing(true);
    setResult(null);
    setShowWarning(false);

    try {
      const token = sessionStorage.getItem('admin_token');
      
      // Check if token exists
      if (!token) {
        setResult({
          success: false,
          message: 'Not authenticated. Please refresh the page and log in again.',
        });
        setSyncing(false);
        return;
      }
      
      let postsSuccess = 0;
      let projectsSuccess = 0;
      let newsSuccess = 0;
      
      // First, fetch existing projects to preserve manually edited data
      const existingProjectsResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/admin/projects`,
        {
          headers: { 
            'Authorization': `Bearer ${publicAnonKey}`,
            // Token in Authorization header 
          },
        }
      );
      const existingData = await existingProjectsResponse.json();
      const existingProjects = existingData.success ? existingData.projects || [] : [];
      
      // Create a map for quick lookup
      const existingProjectsMap = new Map(
        existingProjects.map((p: any) => [p.slug || p.id, p])
      );
      
      // Sync blog posts
      for (const post of blogPosts) {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/admin/posts`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${publicAnonKey}`, // Required by Supabase
              // Token in Authorization header // Our custom auth
            },
            body: JSON.stringify({
              ...post,
              slug: post.id, // Use ID as slug
              content: createPlaceholderContent(post), // Add placeholder content
            }),
          }
        );
        const result = await response.json();
        if (result.success) {
          postsSuccess++;
        }
      }

      // Sync projects - PRESERVE manually edited fields
      for (const project of projects) {
        // Convert old credits format to new format
        const creditsArray = [];
        if (project.credits) {
          if (project.credits.director) creditsArray.push({ role: 'Director', name: project.credits.director });
          if (project.credits.scenicDesigner) creditsArray.push({ role: 'Scenic Designer', name: project.credits.scenicDesigner });
          if (project.credits.coDesigner) creditsArray.push({ role: 'Co-Scenic Designer', name: project.credits.coDesigner });
          if (project.credits.costumeDesigner) creditsArray.push({ role: 'Costume Designer', name: project.credits.costumeDesigner });
          if (project.credits.lightingDesigner) creditsArray.push({ role: 'Lighting Designer', name: project.credits.lightingDesigner });
          if (project.credits.soundDesigner) creditsArray.push({ role: 'Sound Designer', name: project.credits.soundDesigner });
          if (project.credits.projectionDesigner) creditsArray.push({ role: 'Projection Designer', name: project.credits.projectionDesigner });
          if (project.credits.choreographer) creditsArray.push({ role: 'Choreographer', name: project.credits.choreographer });
          if (project.credits.musicalDirector) creditsArray.push({ role: 'Musical Director', name: project.credits.musicalDirector });
        }
        
        // Check if project exists and has manually edited data
        const existing = existingProjectsMap.get(project.id);
        const hasManualGalleries = existing?.galleries && (
          (existing.galleries.hero && existing.galleries.hero.length > 0) ||
          (existing.galleries.process && existing.galleries.process.length > 0)
        );
        const hasManualTags = existing?.tags && existing.tags.length > 0;
        const hasManualNotes = existing?.designNotes && existing.designNotes.length > 0;
        const hasManualVideos = existing?.youtubeVideos && existing.youtubeVideos.length > 0;
        
        // Build the project data - preserve manual edits
        const projectData = {
          ...project,
          slug: project.id, // Use ID as slug
          credits: creditsArray, // Use converted credits
          // Preserve manually edited fields if they exist
          galleries: hasManualGalleries ? existing.galleries : { hero: [], heroCaptions: [], process: [], processCaptions: [], details: [], detailsCaptions: [] },
          tags: hasManualTags ? existing.tags : [],
          designNotes: hasManualNotes ? existing.designNotes : [],
          youtubeVideos: hasManualVideos ? existing.youtubeVideos : [],
          // Keep engagement metrics
          likes: existing?.likes || 0,
          views: existing?.views || 0,
        };
        
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/admin/projects`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${publicAnonKey}`, // Required by Supabase
              // Token in Authorization header // Our custom auth
            },
            body: JSON.stringify(projectData),
          }
        );
        const result = await response.json();
        if (result.success) {
          projectsSuccess++;
        }
      }

      // Sync news items
      for (const newsItem of newsItems) {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/admin/news`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${publicAnonKey}`, // Required by Supabase
              // Token in Authorization header // Our custom auth
            },
            body: JSON.stringify({
              ...newsItem,
              slug: newsItem.id, // Use ID as slug
            }),
          }
        );
        const result = await response.json();
        if (result.success) {
          newsSuccess++;
          } else {
          }
      }

      setResult({
        success: true,
        message: `Successfully synced ${postsSuccess} articles, ${projectsSuccess} projects, and ${newsSuccess} news items!`,
      });
    } catch (err) {
      setResult({
        success: false,
        message: 'Failed to sync data. Check console for details.',
      });
    } finally {
      setSyncing(false);
    }
  };

  const addContentToExisting = async () => {
    setResyncingContent(true);
    setResult(null);

    try {
      const token = sessionStorage.getItem('admin_token');
      
      if (!token) {
        setResult({
          success: false,
          message: 'Not authenticated. Please refresh and log in.',
        });
        setResyncingContent(false);
        return;
      }
      
      // First, fetch all existing articles
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/admin/posts`,
        {
          headers: { 
            'Authorization': `Bearer ${publicAnonKey}`,
            // Token in Authorization header 
          },
        }
      );
      const data = await response.json();
      
      if (!data.success) {
        throw new Error('Failed to fetch existing articles');
      }
      
      const existingArticles = data.posts || [];
      let updated = 0;
      
      // Update each article that has no content or empty content
      for (const article of existingArticles) {
        if (!article.content || article.content.length === 0) {
          // Find matching blog post from data files
          const matchingPost = blogPosts.find(p => p.id === article.slug);
          
          const updateResponse = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/admin/posts/${article.id}`,
            {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${publicAnonKey}`,
                // Token in Authorization header
              },
              body: JSON.stringify({
                ...article,
                content: createPlaceholderContent(matchingPost || article),
              }),
            }
          );
          
          if (updateResponse.ok) {
            updated++;
            }
        }
      }
      
      setResult({
        success: true,
        message: `Added placeholder content to ${updated} articles!`,
      });
      
    } catch (err) {
      setResult({
        success: false,
        message: 'Failed to add content. Check console for details.',
      });
    } finally {
      setResyncingContent(false);
    }
  };

  return (
    <div className="border border-gray-200 p-6 bg-white">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="tracking-tight mb-2 text-gray-900">Sync Existing Data</h3>
          <p className="text-sm text-gray-600">
            Import all content from your data files into the admin system. This will load:
          </p>
          <ul className="text-sm text-gray-600 mt-2 space-y-1 list-disc list-inside">
            <li>{blogPosts.length} blog articles from /data/blog-posts.ts</li>
            <li>{projects.length} portfolio projects from /data/projects.ts</li>
            <li>{newsItems.length} news items from /data/news.ts</li>
          </ul>
        </div>
      </div>

      {result && (
        <div
          className={`mb-4 px-4 py-3 border flex items-center gap-3 ${
            result.success
              ? 'bg-green-50 border-green-200 text-green-700'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}
        >
          {result.success ? (
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <span className="text-sm">{result.message}</span>
        </div>
      )}

      {/* Warning message before sync */}
      {showWarning && (
        <div className="mb-4 px-4 py-3 border bg-red-50 border-red-200 text-red-800">
          <div className="flex items-start gap-3 mb-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold mb-2 text-gray-900">🚨 DANGER: This will OVERWRITE your manual edits!</p>
              <p className="text-sm mb-2 font-bold text-red-900">
                ⚠️ DO NOT USE THIS if you've already edited projects/articles in the admin panel!
              </p>
              <p className="text-sm mb-2">
                The sync will REPLACE database content with hardcoded data from:
              </p>
              <ul className="text-sm list-disc list-inside space-y-1 mb-3 font-mono text-xs">
                <li>/data/projects.ts (will overwrite project titles, descriptions, etc.)</li>
                <li>/data/blog-posts.ts (will overwrite article data)</li>
                <li>/data/news.ts (will overwrite news data)</li>
              </ul>
              <p className="text-sm font-bold text-red-900 bg-red-100 p-2 rounded">
                This button is ONLY for initial data import. Once you've edited content in the admin panel, DO NOT use this sync button or you'll lose your changes!
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={syncData}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white hover:bg-red-700 transition-colors"
            >
              <span className="text-xs tracking-wider uppercase font-bold">
                ⚠️ I Understand - Overwrite Database
              </span>
            </button>
            <button
              onClick={() => setShowWarning(false)}
              className="px-4 py-2 border-2 border-green-600 bg-green-50 text-green-900 hover:bg-green-100 transition-colors font-bold"
            >
              <span className="text-xs tracking-wider uppercase">✅ Cancel (Recommended)</span>
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          onClick={syncData}
          disabled={syncing || resyncingContent}
          className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white hover:bg-gray-800 transition-opacity disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
          <span className="text-xs tracking-wider uppercase">
            {syncing ? 'Syncing...' : 'Sync All Data'}
          </span>
        </button>

        <button
          onClick={addContentToExisting}
          disabled={syncing || resyncingContent}
          className="flex items-center gap-2 px-6 py-3 border border-gray-300 hover:border-blue-500 text-gray-900 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${resyncingContent ? 'animate-spin' : ''}`} />
          <span className="text-xs tracking-wider uppercase">
            {resyncingContent ? 'Adding Content...' : 'Add Content to Existing'}
          </span>
        </button>
      </div>

      {!result && (
        <div className="text-xs text-gray-500 mt-3 space-y-2">
          <p><strong className="text-gray-900">Sync All Data:</strong> Create new entries in the database (won't duplicate)</p>
          <p><strong className="text-gray-900">Add Content to Existing:</strong> Add placeholder content to articles that have none</p>
        </div>
      )}
      
      {/* Database Debug Tool */}
      <div className="mt-8">
        <DatabaseDebug />
      </div>
    </div>
  );
}
