import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ContentReport {
  id: string;
  reporter_id: string;
  content_id: string;
  content_type: string;
  reason: string;
  description: string | null;
  status: string;
  resolution_note: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  reporter?: { username: string | null; full_name: string | null };
  post?: { title: string; author_id: string };
}

export interface CommunityBan {
  id: string;
  community_id: string;
  user_id: string;
  banned_by: string;
  reason: string | null;
  created_at: string;
  expires_at: string | null;
  user_profile?: { username: string | null; full_name: string | null; avatar_url: string | null };
}

export interface CommunityMemberWithProfile {
  id: string;
  community_id: string;
  user_id: string;
  role: string;
  joined_at: string;
  profile?: { username: string | null; full_name: string | null; avatar_url: string | null };
}

export function useCommunityModeration(communityId: string | undefined) {
  const [reports, setReports] = useState<ContentReport[]>([]);
  const [bans, setBans] = useState<CommunityBan[]>([]);
  const [members, setMembers] = useState<CommunityMemberWithProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = useCallback(async () => {
    if (!communityId) return;

    try {
      // Get all post IDs in this community first
      const { data: communityPosts } = await supabase
        .from('community_posts')
        .select('id')
        .eq('community_id', communityId);

      if (!communityPosts?.length) {
        setReports([]);
        return;
      }

      const postIds = communityPosts.map(p => p.id);

      const { data, error } = await supabase
        .from('content_reports')
        .select('*')
        .eq('content_type', 'post')
        .in('content_id', postIds)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch reporter profiles and post titles in parallel
      const reporterIds = [...new Set((data || []).map(r => r.reporter_id))];
      const contentIds = [...new Set((data || []).map(r => r.content_id))];

      const [reporterResult, postResult] = await Promise.all([
        reporterIds.length > 0
          ? supabase.from('profiles').select('id, username, full_name').in('id', reporterIds)
          : { data: [] },
        contentIds.length > 0
          ? supabase.from('community_posts').select('id, title, author_id').in('id', contentIds)
          : { data: [] },
      ]);

      const reporterMap = new Map((reporterResult.data || []).map(p => [p.id, p]));
      const postMap = new Map((postResult.data || []).map(p => [p.id, p]));

      setReports(
        (data || []).map(r => ({
          ...r,
          reporter: reporterMap.get(r.reporter_id) || undefined,
          post: postMap.get(r.content_id) || undefined,
        }))
      );
    } catch (error) {
      console.error('[Moderation] Error fetching reports:', error);
    }
  }, [communityId]);

  const fetchBans = useCallback(async () => {
    if (!communityId) return;

    try {
      const { data, error } = await supabase
        .from('community_bans')
        .select('*')
        .eq('community_id', communityId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const userIds = [...new Set((data || []).map(b => b.user_id))];
      const { data: profiles } = userIds.length > 0
        ? await supabase.from('profiles').select('id, username, full_name, avatar_url').in('id', userIds)
        : { data: [] };

      const profileMap = new Map((profiles || []).map(p => [p.id, p]));

      setBans(
        (data || []).map(b => ({
          ...b,
          user_profile: profileMap.get(b.user_id) || undefined,
        }))
      );
    } catch (error) {
      console.error('[Moderation] Error fetching bans:', error);
    }
  }, [communityId]);

  const fetchMembers = useCallback(async () => {
    if (!communityId) return;

    try {
      const { data, error } = await supabase
        .from('community_members')
        .select('*')
        .eq('community_id', communityId)
        .order('joined_at', { ascending: true });

      if (error) throw error;

      const userIds = [...new Set((data || []).map(m => m.user_id))];
      const { data: profiles } = userIds.length > 0
        ? await supabase.from('profiles').select('id, username, full_name, avatar_url').in('id', userIds)
        : { data: [] };

      const profileMap = new Map((profiles || []).map(p => [p.id, p]));

      setMembers(
        (data || []).map(m => ({
          ...m,
          profile: profileMap.get(m.user_id) || undefined,
        }))
      );
    } catch (error) {
      console.error('[Moderation] Error fetching members:', error);
    }
  }, [communityId]);

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([fetchReports(), fetchBans(), fetchMembers()]);
      setLoading(false);
    };
    loadAll();
  }, [fetchReports, fetchBans, fetchMembers]);

  const resolveReport = async (reportId: string, status: 'resolved' | 'dismissed', note: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('content_reports')
        .update({
          status,
          resolution_note: note,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', reportId);

      if (error) throw error;

      setReports(prev =>
        prev.map(r => r.id === reportId ? { ...r, status, resolution_note: note } : r)
      );
      toast.success(`Report ${status}`);
    } catch (error: any) {
      console.error('[Moderation] Resolve error:', error);
      toast.error(error.message || 'Failed to resolve report');
    }
  };

  const banUser = async (userId: string, reason: string) => {
    if (!communityId) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('community_bans')
        .insert({
          community_id: communityId,
          user_id: userId,
          banned_by: user.id,
          reason,
        })
        .select()
        .single();

      if (error) throw error;

      // Also remove from community members
      await supabase
        .from('community_members')
        .delete()
        .eq('community_id', communityId)
        .eq('user_id', userId);

      // Refresh both lists
      await Promise.all([fetchBans(), fetchMembers()]);
      toast.success('User banned from community');
    } catch (error: any) {
      console.error('[Moderation] Ban error:', error);
      toast.error(error.message || 'Failed to ban user');
    }
  };

  const unbanUser = async (banId: string) => {
    try {
      const { error } = await supabase
        .from('community_bans')
        .delete()
        .eq('id', banId);

      if (error) throw error;

      setBans(prev => prev.filter(b => b.id !== banId));
      toast.success('User unbanned');
    } catch (error: any) {
      console.error('[Moderation] Unban error:', error);
      toast.error(error.message || 'Failed to unban user');
    }
  };

  const updateMemberRole = async (memberId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('community_members')
        .update({ role: newRole })
        .eq('id', memberId);

      if (error) throw error;

      setMembers(prev =>
        prev.map(m => m.id === memberId ? { ...m, role: newRole } : m)
      );
      toast.success(`Role updated to ${newRole}`);
    } catch (error: any) {
      console.error('[Moderation] Role update error:', error);
      toast.error(error.message || 'Failed to update role');
    }
  };

  const removePost = async (postId: string) => {
    try {
      const { error } = await supabase
        .from('community_posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;
      toast.success('Post removed');
      await fetchReports(); // Refresh reports
    } catch (error: any) {
      console.error('[Moderation] Remove post error:', error);
      toast.error(error.message || 'Failed to remove post');
    }
  };

  const updateCommunity = async (updates: { description?: string; rules?: string }) => {
    if (!communityId) return;

    try {
      const { error } = await supabase
        .from('communities')
        .update(updates)
        .eq('id', communityId);

      if (error) throw error;
      toast.success('Community settings updated');
    } catch (error: any) {
      console.error('[Moderation] Update community error:', error);
      toast.error(error.message || 'Failed to update community');
    }
  };

  return {
    reports,
    bans,
    members,
    loading,
    resolveReport,
    banUser,
    unbanUser,
    updateMemberRole,
    removePost,
    updateCommunity,
    refresh: () => Promise.all([fetchReports(), fetchBans(), fetchMembers()]),
  };
}
