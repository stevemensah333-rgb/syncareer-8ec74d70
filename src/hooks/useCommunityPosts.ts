import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CommunityPost } from '@/types/community';
import { useToast } from '@/hooks/use-toast';

type SortOption = 'trending' | 'new' | 'hot';

export function useCommunityPosts(communityId?: string, sortBy: SortOption = 'trending') {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      let query = supabase
        .from('community_posts')
        .select('*');

      if (communityId) {
        query = query.eq('community_id', communityId);
      }

      // Apply sorting
      if (sortBy === 'new') {
        query = query.order('created_at', { ascending: false });
      } else if (sortBy === 'hot') {
        query = query.order('comment_count', { ascending: false });
      } else {
        // trending = upvotes - downvotes, but we'll use upvotes for now
        query = query.order('upvotes', { ascending: false });
      }

      const { data: postsData, error } = await query.limit(50);
      if (error) throw error;

      // Fetch additional data for each post
      const enrichedPosts = await Promise.all(
        (postsData || []).map(async (post) => {
          // Get community info
          const { data: community } = await supabase
            .from('communities')
            .select('id, name, slug, icon_url')
            .eq('id', post.community_id)
            .single();

          // Get author info
          const { data: author } = await supabase
            .from('profiles')
            .select('username, full_name, avatar_url')
            .eq('id', post.author_id)
            .single();

          // Get user's vote if logged in
          let user_vote = null;
          let user_role = null;
          if (user) {
            const { data: vote } = await supabase
              .from('community_post_votes')
              .select('vote_type')
              .eq('post_id', post.id)
              .eq('user_id', user.id)
              .single();
            user_vote = vote?.vote_type || null;

            const { data: membership } = await supabase
              .from('community_members')
              .select('role')
              .eq('community_id', post.community_id)
              .eq('user_id', user.id)
              .single();
            user_role = membership?.role || null;
          }

          return {
            ...post,
            community,
            author,
            user_vote,
            user_role,
          } as CommunityPost;
        })
      );

      setPosts(enrichedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPost = async (post: { title: string; content: string; community_id: string; cover_image_url?: string; tags?: string[] }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: 'Please sign in to create a post', variant: 'destructive' });
        return null;
      }

      const { data, error } = await supabase
        .from('community_posts')
        .insert({
          ...post,
          author_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      toast({ title: 'Post created successfully!' });
      await fetchPosts();
      return data;
    } catch (error: any) {
      console.error('Error creating post:', error);
      toast({ title: 'Failed to create post', description: error.message, variant: 'destructive' });
      return null;
    }
  };

  const votePost = async (postId: string, voteType: 'up' | 'down') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: 'Please sign in to vote', variant: 'destructive' });
        return;
      }

      // Check existing vote
      const { data: existingVote } = await supabase
        .from('community_post_votes')
        .select('*')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single();

      const post = posts.find(p => p.id === postId);
      if (!post) return;

      if (existingVote) {
        if (existingVote.vote_type === voteType) {
          // Remove vote
          await supabase
            .from('community_post_votes')
            .delete()
            .eq('id', existingVote.id);

          // Update post counts
          await supabase
            .from('community_posts')
            .update({
              upvotes: voteType === 'up' ? post.upvotes - 1 : post.upvotes,
              downvotes: voteType === 'down' ? post.downvotes - 1 : post.downvotes,
            })
            .eq('id', postId);
        } else {
          // Change vote
          await supabase
            .from('community_post_votes')
            .update({ vote_type: voteType })
            .eq('id', existingVote.id);

          // Update post counts
          await supabase
            .from('community_posts')
            .update({
              upvotes: voteType === 'up' ? post.upvotes + 1 : post.upvotes - 1,
              downvotes: voteType === 'down' ? post.downvotes + 1 : post.downvotes - 1,
            })
            .eq('id', postId);
        }
      } else {
        // New vote
        await supabase
          .from('community_post_votes')
          .insert({ post_id: postId, user_id: user.id, vote_type: voteType });

        // Update post counts
        await supabase
          .from('community_posts')
          .update({
            upvotes: voteType === 'up' ? post.upvotes + 1 : post.upvotes,
            downvotes: voteType === 'down' ? post.downvotes + 1 : post.downvotes,
          })
          .eq('id', postId);
      }

      await fetchPosts();
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const deletePost = async (postId: string) => {
    try {
      const { error } = await supabase
        .from('community_posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      toast({ title: 'Post deleted' });
      await fetchPosts();
    } catch (error: any) {
      console.error('Error deleting post:', error);
      toast({ title: 'Failed to delete post', description: error.message, variant: 'destructive' });
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [communityId, sortBy]);

  return {
    posts,
    loading,
    createPost,
    votePost,
    deletePost,
    refetch: fetchPosts,
  };
}
