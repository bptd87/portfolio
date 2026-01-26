import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase/client';
import { User, MessageCircle, Send, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface Comment {
  id: string;
  article_id: string;
  content: string;
  author_name: string;
  created_at: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface CommentsSectionProps {
  articleId: string;
}

interface CommentForm {
  author_name: string;
  content: string;
  website_honeypot: string; // Honeypot field
  human_verification: boolean; // Human verification checkbox
}

export function CommentsSection({ articleId }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false); // Renamed from 'submitting'
  const [isExpanded, setIsExpanded] = useState(true); // Changed to true - open by default
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CommentForm>();

  useEffect(() => {
    if (!articleId) return;

    const channel = supabase
      .channel('public:comments')
      .on(
        'postgres_changes',
        {
          event: 'INSERT', // Only listen for INSERT events
          schema: 'public',
          table: 'comments',
          filter: `article_id=eq.${articleId}`,
        },
        (payload) => {
          const newComment = payload.new as Comment;
          if (newComment.status === 'approved') { // Only add if approved
            setComments((current) => [...current, newComment]); // Add to end for chronological order
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [articleId]);

  useEffect(() => {
    const fetchComments = async () => {
      if (!articleId) return;

      setLoading(true); // Set loading when fetching
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('article_id', articleId)
        .eq('status', 'approved')
        .order('created_at', { ascending: true }); // Order ascending for chronological display

      if (!error && data) {
        setComments(data as Comment[]);
      } else {
        console.error('Error fetching comments:', error);
      }
      setLoading(false); // Unset loading after fetch
    };

    if (isExpanded) { // Only fetch comments when the section is expanded
      fetchComments();
    }
  }, [articleId, isExpanded]); // Re-fetch when articleId or expanded state changes

  const onSubmit = async (data: CommentForm) => { // Using CommentForm interface
    // Honeypot check
    if (data.website_honeypot) {
      // Silently fail for bots
      toast.success('Comment submitted!'); // Changed success message for bots
      reset();
      return;
    }

    try {
      setIsSubmitting(true);

      const { error } = await supabase
        .from('comments')
        .insert({
          article_id: articleId,
          author_name: data.author_name || 'Guest', // Default to Guest if name is empty
          content: data.content,
          status: 'approved' // Default to approved for now, can be 'pending' if moderation needed
        });

      if (error) throw error;

      toast.success('Comment posted successfully!'); // Changed success message
      reset();
      // No need to call fetchComments() here, subscription handles new comments
    } catch (err) {
      toast.error('Failed to post comment. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!articleId) return null; // Return null if no articleId

  return (
    <div className="w-full max-w-3xl mx-auto px-6"> {/* Updated wrapper styling - removed margins */}
      {!isExpanded ? (
        <button
          onClick={() => setIsExpanded(true)}
          className="w-full py-8 border-y border-border/10 flex items-center justify-between group hover:bg-foreground/[0.02] transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-foreground/5 text-foreground/60 group-hover:text-accent-brand group-hover:bg-accent-brand/10 transition-colors">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div className="text-left">
              <h3 className="font-display text-2xl italic leading-none mb-1">Join the Conversation</h3>
              <p className="font-sans text-sm opacity-60">{comments.length} Comments</p>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full border border-foreground/10 flex items-center justify-center opacity-40 group-hover:opacity-100 transition-opacity">
            <span className="text-xl leading-none mb-1">+</span>
          </div>
        </button>
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-display text-3xl italic">Discussion</h3>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-xs uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity"
            >
              Close
            </button>
          </div>

          {/* Comments List */}
          <div className="space-y-8 mb-12">
            {loading ? ( // Show loader when comments are being fetched
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin opacity-40" />
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-foreground/10 rounded-xl opacity-60">
                <p>No comments yet. Be the first to share your thoughts.</p>
              </div>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-foreground/10 to-foreground/5 flex items-center justify-center flex-shrink-0 font-display italic text-lg opacity-60">
                    {comment.author_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm tracking-wide">{comment.author_name}</span>
                      <span className="text-xs opacity-40">
                        {new Date(comment.created_at).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: 'numeric'
                        })}
                      </span>
                    </div>
                    <p className="text-foreground/80 leading-relaxed text-sm">{comment.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Comment Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-foreground/[0.02] p-6 rounded-2xl border border-foreground/5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest opacity-60 ml-1">Name</label>
                <input
                  {...register('author_name')} // Removed required, as it's optional
                  placeholder="Your Name"
                  className="w-full bg-background border border-foreground/10 rounded-lg px-4 py-3 focus:outline-none focus:border-accent-brand focus:ring-1 focus:ring-accent-brand transition-all placeholder:opacity-30"
                />
              </div>
              {/* Honeypot field (hidden) */}
              <div className="hidden">
                <input {...register('website_honeypot')} tabIndex={-1} autoComplete="off" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest opacity-60 ml-1">Message</label>
              <textarea
                {...register('content', { required: true })}
                placeholder="Share your thoughts..."
                rows={4}
                className="w-full bg-background border border-foreground/10 rounded-lg px-4 py-3 focus:outline-none focus:border-accent-brand focus:ring-1 focus:ring-accent-brand transition-all resize-none placeholder:opacity-30"
              />
              {errors.content && <span className="text-red-500 text-xs mt-1">Comment cannot be empty</span>} {/* Added error message for content */}
            </div>

            {/* Human Verification Checkbox */}
            <div className="flex items-start gap-3 p-4 bg-foreground/[0.02] rounded-lg border border-foreground/5">
              <input
                type="checkbox"
                {...register('human_verification', { required: true })}
                className="mt-1 w-4 h-4 rounded border-foreground/20 text-accent-brand focus:ring-accent-brand focus:ring-offset-0"
                id="human-check"
              />
              <label htmlFor="human-check" className="flex-1 text-sm leading-relaxed cursor-pointer">
                <span className="font-medium">I am human</span>
                <span className="opacity-60 ml-1">— Help us prevent spam</span>
              </label>
            </div>
            {errors.human_verification && <span className="text-red-500 text-xs">Please confirm you are human</span>}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-3 bg-foreground text-background rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-sm"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Posting...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Post Comment</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
