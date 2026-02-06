import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CommunityPost } from '@/types/community';
import { toast } from 'sonner';

type SortOption = 'trending' | 'new' | 'hot';

export function useCommunityPosts(communityId?: string, sortBy: SortOption = 'trending') {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const pageRef = useRef(0);
  const PAGE_SIZE = 25;
  const isFetchingRef = useRef(false);

  const fetchPosts = useCallback(async (reset = true) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    try {
      if (reset) {
        setLoading(true);
        pageRef.current = 0;
      }

      const { data: { user } } = await supabase.auth.getUser();
      const offset = pageRef.current * PAGE_SIZE;

      let query = supabase.from('community_posts').select('*');

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

      const { data: postsData, error } = await query
        .range(offset, offset + PAGE_SIZE - 1);

      if (error) throw error;

      if (!postsData || postsData.length === 0) {
        if (reset) setPosts([]);
        setHasMore(false);
        return;
      }

      setHasMore(postsData.length === PAGE_SIZE);

      // Batch fetch related data
      const communityIds = [...new Set(postsData.map(p => p.community_id))];
      const authorIds = [...new Set(postsData.map(p => p.author_id))];
      const postIds = postsData.map(p => p.id);

      const [communitiesRes, authorsRes, votesRes, membershipsRes] = await Promise.all([
        supabase.from('communities').select('id, name, slug, icon_url').in('id', communityIds),
        supabase.from('profiles').select('id, username, full_name, avatar_url').in('id', authorIds),
        user
          ? supabase.from('community_post_votes').select('post_id, vote_type').in('post_id', postIds).eq('user_id', user.id)
          : Promise.resolve({ data: [] }),
        user
          ? supabase.from('community_members').select('community_id, role').in('community_id', communityIds).eq('user_id', user.id)
          : Promise.resolve({ data: [] }),
      ]);

      const communitiesMap = new Map((communitiesRes.data || []).map(c => [c.id, c]));
      const authorsMap = new Map((authorsRes.data || []).map(a => [a.id, { username: a.username, full_name: a.full_name, avatar_url: a.avatar_url }]));
      const votesMap = new Map((votesRes.data || []).map(v => [v.post_id, v.vote_type]));
      const membershipsMap = new Map((membershipsRes.data || []).map(m => [m.community_id, m.role]));

      const enrichedPosts = postsData.map(post => ({
        ...post,
        community: communitiesMap.get(post.community_id) || null,
        author: authorsMap.get(post.author_id) || null,
        user_vote: votesMap.get(post.id) || null,
        user_role: membershipsMap.get(post.community_id) || null,
      } as CommunityPost));

      if (reset) {
        setPosts(enrichedPosts);
      } else {
        setPosts(prev => [...prev, ...enrichedPosts]);
      }
      pageRef.current++;
    } catch (error) {
      console.error('[useCommunityPosts] Fetch error:', error);
      toast.error('Failed to load posts. Please try again.');
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [communityId, sortBy]);

  const loadMore = useCallback(() => {
    if (!isFetchingRef.current && hasMore) {
      fetchPosts(false);
    }
  }, [fetchPosts, hasMore]);

  const createPost = async (post: { title: string; content: string; community_id: string; cover_image_url?: string; tags?: string[] }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to create a post');
        return null;
      }

      // Check profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('username, full_name, onboarding_completed')
        .eq('id', user.id)
        .single();

      if (!profile || (!profile.username && !profile.full_name)) {
        toast.error('Please complete your profile before posting.');
        return null;
      }

      if (!profile.onboarding_completed) {
        toast.error('Please finish setting up your profile before posting.');
        return null;
      }

      const { data, error } = await supabase
        .from('community_posts')
        .insert({ ...post, author_id: user.id })
        .select()
        .single();

      if (error) throw error;

      // Send notifications to community members (fire-and-forget)
      const notifyMembers = async () => {
        try {
          const { data: community } = await supabase
            .from('communities')
            .select('name, slug')
            .eq('id', post.community_id)
            .single();

          const { data: members } = await supabase
            .from('community_members')
            .select('user_id')
            .eq('community_id', post.community_id)
            .neq('user_id', user.id);

          if (members?.length && community) {
            const notifications = members.map(m => ({
              user_id: m.user_id,
              type: 'community_post',
              title: `New post in ${community.name}`,
              message: post.title.substring(0, 100),
              link: `/communities/post/${data.id}`,
            }));
            await supabase.from('notifications').insert(notifications);
          }
        } catch (e) {
          console.warn('[useCommunityPosts] Notification error:', e);
        }
      };
      notifyMembers();

      toast.success('Post created successfully!');
      await fetchPosts(true);
      return data;
    } catch (error: any) {
      console.error('[useCommunityPosts] Create error:', error);
      toast.error(error.message || 'Failed to create post');
      return null;
    }
  };

  // Optimistic voting with rollback
  const votePost = async (postId: string, voteType: 'up' | 'down') => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('Please sign in to vote');
      return;
    }

    // Save previous state for rollback
    const previousPosts = [...posts];
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    // Calculate optimistic update
    const currentVote = post.user_vote;
    let newUpvotes = post.upvotes;
    let newDownvotes = post.downvotes;
    let newUserVote: 'up' | 'down' | null = voteType;

    if (currentVote === voteType) {
      // Toggle off
      newUserVote = null;
      if (voteType === 'up') newUpvotes--;
      else newDownvotes--;
    } else if (currentVote) {
      // Switch vote
      if (voteType === 'up') { newUpvotes++; newDownvotes--; }
      else { newUpvotes--; newDownvotes++; }
    } else {
      // New vote
      if (voteType === 'up') newUpvotes++;
      else newDownvotes++;
    }

    // Optimistic update
    setPosts(prev => prev.map(p =>
      p.id === postId
        ? { ...p, upvotes: newUpvotes, downvotes: newDownvotes, user_vote: newUserVote }
        : p
    ));

    try {
      // Check existing vote
      const { data: existingVote } = await supabase
        .from('community_post_votes')
        .select('id, vote_type')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingVote) {
        if (existingVote.vote_type === voteType) {
          await supabase.from('community_post_votes').delete().eq('id', existingVote.id);
        } else {
          await supabase.from('community_post_votes').update({ vote_type: voteType }).eq('id', existingVote.id);
        }
      } else {
        await supabase.from('community_post_votes').insert({
          post_id: postId,
          user_id: user.id,
          vote_type: voteType,
        });
      }

      // Update post counts in DB
      await supabase
        .from('community_posts')
        .update({ upvotes: newUpvotes, downvotes: newDownvotes })
        .eq('id', postId);
    } catch (error) {
      console.error('[useCommunityPosts] Vote error:', error);
      // Rollback on failure
      setPosts(previousPosts);
      toast.error('Vote failed. Please try again.');
    }
  };

  const deletePost = async (postId: string) => {
    const previousPosts = [...posts];

    // Optimistic removal
    setPosts(prev => prev.filter(p => p.id !== postId));

    try {
      const { error } = await supabase
        .from('community_posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;
      toast.success('Post deleted');
    } catch (error: any) {
      console.error('[useCommunityPosts] Delete error:', error);
      setPosts(previousPosts);
      toast.error(error.message || 'Failed to delete post');
    }
  };

  useEffect(() => {
    fetchPosts(true);
  }, [communityId, sortBy]);

  return {
    posts,
    loading,
    hasMore,
    createPost,
    votePost,
    deletePost,
    loadMore,
    refetch: () => fetchPosts(true),
  };
}
