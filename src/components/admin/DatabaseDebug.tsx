import React, { useState } from 'react';
import { Database, RefreshCw } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

export function DatabaseDebug() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const checkDatabase = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('admin_token');
      
      // Fetch all data
      const [postsRes, projectsRes, newsRes] = await Promise.all([
        fetch(`https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/admin/posts`, {
          headers: { 
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-Admin-Token': token,
          },
        }),
        fetch(`https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/admin/projects`, {
          headers: { 
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-Admin-Token': token,
          },
        }),
        fetch(`https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/admin/news`, {
          headers: { 
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-Admin-Token': token,
          },
        }),
      ]);

      const posts = await postsRes.json();
      const projects = await projectsRes.json();
      const news = await newsRes.json();

      setData({
        posts: posts.posts || [],
        projects: projects.projects || [],
        news: news.news || [],
      });

      } catch (err) {
      } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border border-gray-200 p-6 bg-white">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="tracking-tight mb-2 text-gray-900">Database Debug</h3>
          <p className="text-sm text-gray-600">
            Check what's currently in your database
          </p>
        </div>
      </div>

      <button
        onClick={checkDatabase}
        disabled={loading}
        className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white hover:bg-gray-800 transition-opacity disabled:opacity-50 mb-6"
      >
        <Database className={`w-4 h-4 ${loading ? 'animate-pulse' : ''}`} />
        <span className="text-xs tracking-wider uppercase">
          {loading ? 'Checking...' : 'Check Database'}
        </span>
      </button>
      
      {/* Quick diagnosis */}
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 text-blue-900 text-xs">
        <p className="font-semibold mb-1">🔍 DIAGNOSTIC INFO:</p>
        <p>Click "Check Database" above to see what's currently stored. If you see your edits here but not on the site, it's likely a browser cache issue.</p>
      </div>

      {data && (
        <div className="space-y-4">
          <div className="border border-gray-200 p-4 bg-gray-50">
            <h4 className="text-sm font-medium mb-2 text-gray-900">Articles: {data.posts.length}</h4>
            {data.posts.length > 0 ? (
              <div className="text-xs text-gray-600 space-y-1">
                {data.posts.slice(0, 3).map((post: any) => (
                  <div key={post.id}>• {post.title}</div>
                ))}
                {data.posts.length > 3 && <div>... and {data.posts.length - 3} more</div>}
              </div>
            ) : (
              <p className="text-xs text-gray-400">No articles found - click "Sync Data" above</p>
            )}
          </div>

          <div className="border border-gray-200 p-4 bg-gray-50">
            <h4 className="text-sm font-medium mb-2 text-gray-900">Projects: {data.projects.length}</h4>
            {data.projects.length > 0 ? (
              <div className="text-xs text-gray-600 space-y-1">
                {data.projects.slice(0, 3).map((project: any) => (
                  <div key={project.id}>
                    • {project.title} 
                    <span className="text-gray-400 ml-2">
                      (likes: {project.likes || 0}, views: {project.views || 0})
                    </span>
                  </div>
                ))}
                {data.projects.length > 3 && <div>... and {data.projects.length - 3} more</div>}
              </div>
            ) : (
              <p className="text-xs text-gray-400">No projects found - click "Sync Data" above</p>
            )}
          </div>

          <div className="border border-gray-200 p-4 bg-gray-50">
            <h4 className="text-sm font-medium mb-2 text-gray-900">News: {data.news.length}</h4>
            {data.news.length > 0 ? (
              <div className="text-xs text-gray-600 space-y-1">
                {data.news.slice(0, 3).map((item: any) => (
                  <div key={item.id}>• {item.title}</div>
                ))}
                {data.news.length > 3 && <div>... and {data.news.length - 3} more</div>}
              </div>
            ) : (
              <p className="text-xs text-gray-400">No news items found - click "Sync Data" above</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}