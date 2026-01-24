import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Community, CommunityMember } from '@/types/community';
import { useToast } from '@/hooks/use-toast';

export function useCommunities() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [userCommunities, setUserCommunities] = useState<(Community & { is_pinned: boolean; role: string })[]>([]);
  const [trendingCommunities, setTrendingCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchCommunities = async () => {
    try {
      const { data, error } = await supabase
        .from('communities')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCommunities(data || []);
    } catch (error) {
      console.error('Error fetching communities:', error);
    }
  };

  const fetchUserCommunities = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setUserCommunities([]);
        return;
      }

      const { data: memberships, error: memberError } = await supabase
        .from('community_members')
        .select('community_id, is_pinned, role')
        .eq('user_id', user.id);

      if (memberError) throw memberError;

      if (memberships && memberships.length > 0) {
        const communityIds = memberships.map(m => m.community_id);
        const { data: communitiesData, error: commError } = await supabase
          .from('communities')
          .select('*')
          .in('id', communityIds);

        if (commError) throw commError;

        const userComms = (communitiesData || []).map(c => {
          const membership = memberships.find(m => m.community_id === c.id);
          return {
            ...c,
            is_pinned: membership?.is_pinned || false,
            role: membership?.role || 'member',
          };
        }).sort((a, b) => {
          if (a.is_pinned && !b.is_pinned) return -1;
          if (!a.is_pinned && b.is_pinned) return 1;
          return 0;
        });

        setUserCommunities(userComms);
      } else {
        setUserCommunities([]);
      }
    } catch (error) {
      console.error('Error fetching user communities:', error);
    }
  };

  const fetchTrendingCommunities = async () => {
    try {
      // Get communities with member counts
      const { data: communitiesData, error } = await supabase
        .from('communities')
        .select('*')
        .eq('is_public', true)
        .limit(10);

      if (error) throw error;

      // Get member counts for each community
      const withCounts = await Promise.all(
        (communitiesData || []).map(async (c) => {
          const { count } = await supabase
            .from('community_members')
            .select('*', { count: 'exact', head: true })
            .eq('community_id', c.id);
          return { ...c, member_count: count || 0 };
        })
      );

      // Sort by member count
      withCounts.sort((a, b) => (b.member_count || 0) - (a.member_count || 0));
      setTrendingCommunities(withCounts);
    } catch (error) {
      console.error('Error fetching trending communities:', error);
    }
  };

  const joinCommunity = async (communityId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: 'Please sign in to join communities', variant: 'destructive' });
        return false;
      }

      const { error } = await supabase
        .from('community_members')
        .insert({ community_id: communityId, user_id: user.id, role: 'member' });

      if (error) throw error;

      toast({ title: 'Successfully joined community!' });
      await fetchUserCommunities();
      return true;
    } catch (error: any) {
      console.error('Error joining community:', error);
      toast({ title: 'Failed to join community', description: error.message, variant: 'destructive' });
      return false;
    }
  };

  const leaveCommunity = async (communityId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('community_members')
        .delete()
        .eq('community_id', communityId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({ title: 'Left community' });
      await fetchUserCommunities();
      return true;
    } catch (error: any) {
      console.error('Error leaving community:', error);
      toast({ title: 'Failed to leave community', description: error.message, variant: 'destructive' });
      return false;
    }
  };

  const togglePinCommunity = async (communityId: string, isPinned: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('community_members')
        .update({ is_pinned: !isPinned })
        .eq('community_id', communityId)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchUserCommunities();
      return true;
    } catch (error) {
      console.error('Error toggling pin:', error);
      return false;
    }
  };

  const createCommunity = async (community: Partial<Community>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: 'Please sign in to create a community', variant: 'destructive' });
        return null;
      }

      const slug = community.name?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || '';
      
      const { data, error } = await supabase
        .from('communities')
        .insert({
          name: community.name!,
          slug,
          description: community.description,
          category: community.category || 'General',
          rules: community.rules,
          icon_url: community.icon_url,
          banner_url: community.banner_url,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Auto-join as admin
      await supabase
        .from('community_members')
        .insert({ community_id: data.id, user_id: user.id, role: 'admin' });

      toast({ title: 'Community created successfully!' });
      await fetchCommunities();
      await fetchUserCommunities();
      return data;
    } catch (error: any) {
      console.error('Error creating community:', error);
      toast({ title: 'Failed to create community', description: error.message, variant: 'destructive' });
      return null;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchCommunities(), fetchUserCommunities(), fetchTrendingCommunities()]);
      setLoading(false);
    };
    loadData();
  }, []);

  return {
    communities,
    userCommunities,
    trendingCommunities,
    loading,
    joinCommunity,
    leaveCommunity,
    togglePinCommunity,
    createCommunity,
    refetch: () => Promise.all([fetchCommunities(), fetchUserCommunities(), fetchTrendingCommunities()]),
  };
}
