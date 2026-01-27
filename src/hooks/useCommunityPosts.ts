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
        query = query.order('upvotes', { ascending: false });
      }

      const { data: postsData, error } = await query.limit(50);
      if (error) throw error;

      if (!postsData || postsData.length === 0) {
        setPosts([]);
        return;
      }

      // Batch fetch: Get unique IDs
      const communityIds = [...new Set(postsData.map(p => p.community_id))];
      const authorIds = [...new Set(postsData.map(p => p.author_id))];
      const postIds = postsData.map(p => p.id);

      // Parallel batch queries instead of N+1
      const [communitiesRes, authorsRes, votesRes, membershipsRes] = await Promise.all([
        supabase.from('communities').select('id, name, slug, icon_url').in('id', communityIds),
        supabase.from('profiles').select('id, username, full_name, avatar_url').in('id', authorIds),
        user ? supabase.from('community_post_votes').select('post_id, vote_type').in('post_id', postIds).eq('user_id', user.id) : Promise.resolve({ data: [] }),
        user ? supabase.from('community_members').select('community_id, role').in('community_id', communityIds).eq('user_id', user.id) : Promise.resolve({ data: [] }),
      ]);

      // Create lookup maps for O(1) access
      const communitiesMap = new Map((communitiesRes.data || []).map(c => [c.id, c]));
      const authorsMap = new Map((authorsRes.data || []).map(a => [a.id, { username: a.username, full_name: a.full_name, avatar_url: a.avatar_url }]));
      const votesMap = new Map((votesRes.data || []).map(v => [v.post_id, v.vote_type]));
      const membershipsMap = new Map((membershipsRes.data || []).map(m => [m.community_id, m.role]));

      // Enrich posts using maps (no additional queries)
      const enrichedPosts = postsData.map(post => ({
        ...post,
        community: communitiesMap.get(post.community_id) || null,
        author: authorsMap.get(post.author_id) || null,
        user_vote: votesMap.get(post.id) || null,
        user_role: membershipsMap.get(post.community_id) || null,
      } as CommunityPost));

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

      // Check if user has a profile with username/full_name
      const { data: profile } = await supabase
        .from('profiles')
        .select('username, full_name, onboarding_completed')
        .eq('id', user.id)
        .single();

      if (!profile || (!profile.username && !profile.full_name)) {
        toast({ 
          title: 'Profile incomplete', 
          description: 'Please complete your profile before posting to avoid appearing as anonymous.',
          variant: 'destructive' 
        });
        return null;
      }

      if (!profile.onboarding_completed) {
        toast({ 
          title: 'Complete onboarding first', 
          description: 'Please finish setting up your profile before posting.',
          variant: 'destructive' 
        });
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
