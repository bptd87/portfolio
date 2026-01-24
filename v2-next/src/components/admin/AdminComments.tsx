import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase/client';
import { Loader2, CheckCircle, XCircle, Trash2, MessageCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Comment {
  id: string;
  article_id: string;
  content: string;
  author_name: string;
  created_at: string;
  status: 'pending' | 'approved' | 'rejected';
  articles?: {
    title: string;
  };
}

export function AdminComments() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  const fetchComments = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('comments')
        .select(`
          *,
          articles (
            title
          )
        `)
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setComments(data || []);
    } catch (err) {
      console.error('Error fetching comments:', err);
      toast.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [filter]);

  const updateStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('comments')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      setComments(comments.map(c => c.id === id ? { ...c, status } : c));
      toast.success(`Comment ${status}`);
    } catch (err) {
      console.error('Error updating comment:', err);
      toast.error('Failed to update status');
    }
  };

  const deleteComment = async (id: string) => {
    if (!confirm('Are you sure you want to delete this comment? This cannot be undone.')) return;

    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setComments(comments.filter(c => c.id !== id));
      toast.success('Comment deleted');
    } catch (err) {
      console.error('Error deleting comment:', err);
      toast.error('Failed to delete comment');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Comments Manager</h2>
          <p className="text-zinc-400">Moderate and manage article discussion</p>
        </div>
        
        <div className="flex gap-2">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === f 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
        </div>
      ) : comments.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
          <MessageCircle className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No comments found</h3>
          <p className="text-zinc-500">There are no comments matching the current filter.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {comments.map((comment) => (
            <div 
              key={comment.id}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center font-display italic text-lg text-zinc-400">
                    {comment.author_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-medium text-white">{comment.author_name}</h4>
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <span>{new Date(comment.created_at).toLocaleDateString()}</span>
                      <span>•</span>
                      <span className="text-blue-400 max-w-[200px] truncate">
                         {comment.articles?.title || 'Unknown Article'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                  comment.status === 'approved' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                  comment.status === 'rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                  'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                }`}>
                  {comment.status.toUpperCase()}
                </div>
              </div>

              <p className="text-zinc-300 text-sm leading-relaxed pl-[52px] mb-4">
                {comment.content}
              </p>

              <div className="flex items-center justify-end gap-2 pl-[52px] pt-4 border-t border-zinc-800">
                {comment.status !== 'approved' && (
                  <button
                    onClick={() => updateStatus(comment.id, 'approved')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-green-900/30 text-zinc-400 hover:text-green-400 transition-colors text-xs font-medium"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    Approve
                  </button>
                )}
                
                {comment.status !== 'rejected' && (
                  <button
                    onClick={() => updateStatus(comment.id, 'rejected')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-red-900/30 text-zinc-400 hover:text-red-400 transition-colors text-xs font-medium"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Reject
                  </button>
                )}

                <div className="w-px h-4 bg-zinc-800 mx-1" />

                <button
                  onClick={() => deleteComment(comment.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-red-900/50 text-zinc-400 hover:text-red-400 transition-colors text-xs font-medium"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
