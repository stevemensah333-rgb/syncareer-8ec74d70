import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { 
  ArrowBigUp, 
  ArrowBigDown, 
  MessageSquare, 
  Share2, 
  ArrowLeft,
  Send,
  MoreHorizontal,
  Trash2
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CommunitySidebar } from '@/components/communities/CommunitySidebar';
import { TrendingCommunitiesSidebar } from '@/components/communities/TrendingCommunitiesSidebar';
import { UserProfileLink } from '@/components/communities/UserProfileLink';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { CommunityPost } from '@/types/community';

interface Comment {
  id: string;
  content: string;
  author_id: string;
  created_at: string;
  upvotes: number;
  parent_id: string | null;
  author?: {
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
  };
}

export default function PostDetail() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<CommunityPost | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!postId) return;

      const { data: { session } } = await supabase.auth.getSession();
      setCurrentUserId(session?.user?.id || null);

      // Fetch post
      const { data: postData, error: postError } = await supabase
        .from('community_posts')
        .select('*')
        .eq('id', postId)
        .single();

      if (postError || !postData) {
        toast.error('Post not found');
        navigate('/communities');
        return;
      }

      // Fetch community
      const { data: community } = await supabase
        .from('communities')
        .select('id, name, slug, icon_url')
        .eq('id', postData.community_id)
        .single();

      // Fetch author
      const { data: author } = await supabase
        .from('profiles')
        .select('username, full_name, avatar_url')
        .eq('id', postData.author_id)
        .maybeSingle();

      // Fetch user vote
      let userVote = null;
      if (session?.user) {
        const { data: vote } = await supabase
          .from('community_post_votes')
          .select('vote_type')
          .eq('post_id', postId)
          .eq('user_id', session.user.id)
          .single();
        userVote = vote?.vote_type || null;

      }

      setPost({
        ...postData,
        community: community || undefined,
        author: author || undefined,
        user_vote: userVote,
      });

      // Fetch comments
      const { data: commentsData } = await supabase
        .from('community_post_comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (commentsData) {
        // Fetch authors for comments
        const authorIds = [...new Set(commentsData.map(c => c.author_id))];
        const { data: authors } = await supabase
          .from('profiles')
          .select('id, username, full_name, avatar_url')
          .in('id', authorIds);

        const authorsMap = new Map(authors?.map(a => [a.id, a]) || []);
        const enrichedComments = commentsData.map(c => ({
          ...c,
          author: authorsMap.get(c.author_id),
        }));
        setComments(enrichedComments);
      }

      setLoading(false);
    };

    fetchData();
  }, [postId, navigate]);

  const handleVote = async (voteType: 'up' | 'down') => {
    if (!post || !currentUserId) {
      toast.error('Please sign in to vote');
      return;
    }

    const { data: existingVote } = await supabase
      .from('community_post_votes')
      .select('id, vote_type')
      .eq('post_id', post.id)
      .eq('user_id', currentUserId)
      .single();

    if (existingVote) {
      if (existingVote.vote_type === voteType) {
        // Remove vote
        await supabase.from('community_post_votes').delete().eq('id', existingVote.id);
        const updates = voteType === 'up' 
          ? { upvotes: post.upvotes - 1 }
          : { downvotes: post.downvotes - 1 };
        await supabase.from('community_posts').update(updates).eq('id', post.id);
        setPost({ ...post, ...updates, user_vote: null });
      } else {
        // Change vote
        await supabase.from('community_post_votes').update({ vote_type: voteType }).eq('id', existingVote.id);
        const updates = voteType === 'up'
          ? { upvotes: post.upvotes + 1, downvotes: post.downvotes - 1 }
          : { upvotes: post.upvotes - 1, downvotes: post.downvotes + 1 };
        await supabase.from('community_posts').update(updates).eq('id', post.id);
        setPost({ ...post, ...updates, user_vote: voteType });
      }
    } else {
      // New vote
      await supabase.from('community_post_votes').insert({
        post_id: post.id,
        user_id: currentUserId,
        vote_type: voteType,
      });
      const updates = voteType === 'up'
        ? { upvotes: post.upvotes + 1 }
        : { downvotes: post.downvotes + 1 };
      await supabase.from('community_posts').update(updates).eq('id', post.id);
      setPost({ ...post, ...updates, user_vote: voteType });
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !currentUserId || !post) {
      if (!currentUserId) toast.error('Please sign in to comment');
      return;
    }

    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('community_post_comments')
        .insert({
          post_id: post.id,
          author_id: currentUserId,
          content: newComment.trim(),
        })
        .select()
        .single();

      if (error) throw error;

      // Update comment count
      await supabase
        .from('community_posts')
        .update({ comment_count: post.comment_count + 1 })
        .eq('id', post.id);

      // Notify post author about the comment (if not commenting on own post)
      if (post.author_id !== currentUserId) {
        const { data: commenter } = await supabase
          .from('profiles')
          .select('username, full_name')
          .eq('id', currentUserId)
          .single();
        
        const commenterName = commenter?.username || commenter?.full_name || 'Someone';
        
        await supabase.from('notifications').insert({
          user_id: post.author_id,
          title: 'New Comment',
          message: `${commenterName} commented on your post "${post.title.substring(0, 30)}${post.title.length > 30 ? '...' : ''}"`,
          type: 'comment',
          link: `/communities/post/${post.id}`,
        });
      }

      // Fetch author for new comment
      const { data: author } = await supabase
        .from('profiles')
        .select('username, full_name, avatar_url')
        .eq('id', currentUserId)
        .single();

      setComments([...comments, { ...data, author }]);
      setPost({ ...post, comment_count: post.comment_count + 1 });
      setNewComment('');
      toast.success('Comment posted!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await supabase.from('community_post_comments').delete().eq('id', commentId);
      setComments(comments.filter(c => c.id !== commentId));
      if (post) {
        setPost({ ...post, comment_count: post.comment_count - 1 });
        await supabase
          .from('community_posts')
          .update({ comment_count: post.comment_count - 1 })
          .eq('id', post.id);
      }
      toast.success('Comment deleted');
    } catch {
      toast.error('Failed to delete comment');
    }
  };

  const handleEndorseTag = async (tag: string) => {
    if (!currentUserId) {
      toast.error('Please sign in to endorse');
      return;
    }
    if (!post?.author_id) return;

    try {
      // Check if already endorsed
      const { data: existing } = await supabase
        .from('skill_endorsements')
        .select('id')
        .eq('user_id', post.author_id)
        .eq('endorser_id', currentUserId)
        .eq('skill_name', tag)
        .single();

      if (existing) {
        toast.info(`You've already endorsed ${tag}`);
        return;
      }

      await supabase.from('skill_endorsements').insert({
        user_id: post.author_id,
        endorser_id: currentUserId,
        skill_name: tag,
      });

      toast.success(`Endorsed ${tag}!`);
    } catch (error: any) {
      if (error.code === '23505') {
        toast.info(`You've already endorsed ${tag}`);
      } else {
        toast.error('Failed to endorse');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[280px_1fr_280px] gap-0">
          <aside className="hidden lg:block border-r min-h-screen">
            <CommunitySidebar />
          </aside>
          <main className="min-h-screen border-r p-6">
            <Skeleton className="h-8 w-48 mb-4" />
            <Skeleton className="h-6 w-full mb-2" />
            <Skeleton className="h-32 w-full mb-4" />
            <Skeleton className="h-24 w-full" />
          </main>
          <aside className="hidden lg:block min-h-screen">
            <TrendingCommunitiesSidebar />
          </aside>
        </div>
      </div>
    );
  }

  if (!post) return null;

  const score = post.upvotes - post.downvotes;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[280px_1fr_280px] gap-0">
        <aside className="hidden lg:block border-r min-h-screen sticky top-0">
          <CommunitySidebar />
        </aside>

        <main className="min-h-screen border-r">
          <div className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 p-4 border-b">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate(-1)}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </div>

          <div className="p-6">
            {/* Post Header */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <Avatar className="h-8 w-8">
                <AvatarImage src={post.author?.avatar_url || undefined} />
                <AvatarFallback>
                  {post.author?.username?.substring(0, 2).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <UserProfileLink 
                userId={post.author_id}
                displayName={post.author?.username || post.author?.full_name || 'Anonymous'}
                className="font-medium text-foreground hover:underline"
              />
              <span>in</span>
              <Link 
                to={`/communities/${post.community?.slug}`}
                className="text-primary hover:underline"
              >
                {post.community?.name}
              </Link>
              <span>•</span>
              <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
            </div>

            {/* Post Content */}
            <h1 className="text-2xl font-bold mb-4">{post.title}</h1>
            
            {post.cover_image_url && (
              <img 
                src={post.cover_image_url} 
                alt=""
                className="w-full max-h-96 object-cover rounded-lg mb-4"
              />
            )}

            <div className="prose prose-sm dark:prose-invert max-w-none mb-4">
              <p className="whitespace-pre-wrap">{post.content}</p>
            </div>

            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map((tag) => (
                  <Badge 
                    key={tag} 
                    variant="secondary" 
                    className="text-sm cursor-pointer hover:bg-primary/20 transition-colors"
                    onClick={() => handleEndorseTag(tag)}
                    title={`Click to endorse ${post.author?.username || 'author'} for ${tag}`}
                  >
                    #{tag}
                    <span className="ml-1 text-xs text-muted-foreground">+1</span>
                  </Badge>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2 py-4 border-y">
              <div className="flex items-center bg-muted rounded-full">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn("rounded-l-full px-3", post.user_vote === 'up' && "text-primary")}
                  onClick={() => handleVote('up')}
                >
                  <ArrowBigUp className={cn("h-5 w-5", post.user_vote === 'up' && "fill-current")} />
                </Button>
                <span className="font-medium text-sm min-w-[2rem] text-center">{score}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn("rounded-r-full px-3", post.user_vote === 'down' && "text-destructive")}
                  onClick={() => handleVote('down')}
                >
                  <ArrowBigDown className={cn("h-5 w-5", post.user_vote === 'down' && "fill-current")} />
                </Button>
              </div>

              <Button variant="ghost" size="sm" className="gap-1">
                <MessageSquare className="h-4 w-4" />
                <span>{post.comment_count}</span>
              </Button>

              <Button variant="ghost" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Comments Section */}
            <div className="mt-6">
              <h2 className="font-semibold text-lg mb-4">Comments ({comments.length})</h2>

              {/* New Comment */}
              <div className="mb-6">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  rows={3}
                  className="mb-2"
                />
                <Button 
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim() || submitting}
                  size="sm"
                  className="gap-2"
                >
                  <Send className="h-4 w-4" />
                  {submitting ? 'Posting...' : 'Post Comment'}
                </Button>
              </div>

              {/* Comments List */}
              <div className="space-y-4">
                {comments.map((comment) => (
                  <Card key={comment.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={comment.author?.avatar_url || undefined} />
                          <AvatarFallback className="text-xs">
                            {comment.author?.username?.substring(0, 2).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <UserProfileLink 
                          userId={comment.author_id}
                          displayName={comment.author?.username || comment.author?.full_name || 'Anonymous'}
                          className="font-medium text-sm hover:underline"
                        />
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                        </span>
                        
                        {currentUserId === comment.author_id && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="ml-auto h-6 w-6 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => handleDeleteComment(comment.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                    </CardContent>
                  </Card>
                ))}

                {comments.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No comments yet. Be the first to comment!
                  </p>
                )}
              </div>
            </div>
          </div>
        </main>

        <aside className="hidden lg:block min-h-screen sticky top-0">
          <TrendingCommunitiesSidebar />
        </aside>
      </div>
    </div>
  );
}
