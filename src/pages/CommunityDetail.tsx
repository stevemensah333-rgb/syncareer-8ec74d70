import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Users, Settings, Shield, PenSquare, Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { CommunityPostCard } from '@/components/communities/CommunityPostCard';
import { CreatePostDialog } from '@/components/communities/CreatePostDialog';
import { TrendingCommunitiesSidebar } from '@/components/communities/TrendingCommunitiesSidebar';
import { CommunityErrorBoundary } from '@/components/communities/CommunityErrorBoundary';
import { useCommunityPosts } from '@/hooks/useCommunityPosts';
import { supabase } from '@/integrations/supabase/client';
import { Community, CommunityMember } from '@/types/community';
import { toast } from 'sonner';

type SortOption = 'trending' | 'new' | 'hot';

export default function CommunityDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  
  const [community, setCommunity] = useState<Community | null>(null);
  const [membership, setMembership] = useState<CommunityMember | null>(null);
  const [memberCount, setMemberCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('trending');

  const { posts, loading: postsLoading, hasMore, createPost, votePost, deletePost, loadMore } = 
    useCommunityPosts(community?.id, sortBy);

  useEffect(() => {
    const fetchCommunity = async () => {
      if (!slug) return;

      try {
        setLoading(true);
        
        const { data: communityData, error: commError } = await supabase
          .from('communities')
          .select('*')
          .eq('slug', slug)
          .single();

        if (commError) throw commError;
        setCommunity(communityData);

        const { count } = await supabase
          .from('community_members')
          .select('*', { count: 'exact', head: true })
          .eq('community_id', communityData.id);
        setMemberCount(count || 0);

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: memberData } = await supabase
            .from('community_members')
            .select('*')
            .eq('community_id', communityData.id)
            .eq('user_id', user.id)
            .maybeSingle();
          setMembership(memberData as CommunityMember | null);
        }
      } catch (error) {
        console.error('[CommunityDetail] Fetch error:', error);
        toast.error('Community not found');
        navigate('/communities');
      } finally {
        setLoading(false);
      }
    };

    fetchCommunity();
  }, [slug, navigate]);

  const handleJoinLeave = async () => {
    if (!community) return;
    
    setJoining(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in');
        return;
      }

      if (membership) {
        await supabase
          .from('community_members')
          .delete()
          .eq('community_id', community.id)
          .eq('user_id', user.id);
        setMembership(null);
        setMemberCount(c => c - 1);
        toast.success('Left community');
      } else {
        const { data, error } = await supabase
          .from('community_members')
          .insert({ community_id: community.id, user_id: user.id, role: 'member' })
          .select()
          .single();
        if (error) throw error;
        setMembership(data as CommunityMember);
        setMemberCount(c => c + 1);
        toast.success('Joined community!');
      }
    } catch (error: any) {
      console.error('[CommunityDetail] Join/Leave error:', error);
      toast.error(error.message || 'Operation failed');
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background" aria-busy="true">
        <Skeleton className="h-48 w-full" />
        <div className="max-w-5xl mx-auto px-6 -mt-16">
          <div className="flex items-end gap-4">
            <Skeleton className="h-24 w-24 rounded-full" />
            <div className="space-y-2 pb-4">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!community) return null;

  const isAdmin = membership?.role === 'admin';
  const isMod = membership?.role === 'moderator' || isAdmin;

  return (
    <div className="min-h-screen bg-background">
      {/* Banner */}
      <div 
        className="h-48 bg-gradient-to-r from-primary/30 to-primary/10 relative"
        style={community.banner_url ? { 
          backgroundImage: `url(${community.banner_url})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        } : undefined}
        role="img"
        aria-label={`${community.name} banner`}
      >
        <Button 
          variant="ghost" 
          size="sm" 
          className="absolute top-4 left-4 bg-background/50 backdrop-blur"
          onClick={() => navigate('/communities')}
          aria-label="Back to communities"
        >
          <ArrowLeft className="h-4 w-4 mr-2" aria-hidden="true" />
          Back
        </Button>
      </div>

      {/* Community Header */}
      <div className="max-w-7xl mx-auto px-6 -mt-16 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end gap-4">
          <Avatar className="h-24 w-24 border-4 border-background">
            <AvatarImage src={community.icon_url || undefined} alt={`${community.name} icon`} />
            <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
              {community.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 pb-4">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold">{community.name}</h1>
              <Badge variant="secondary">{community.category}</Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" aria-hidden="true" />
                {memberCount} members
              </span>
            </div>
          </div>

          <div className="flex gap-2 pb-4">
            {isAdmin && (
              <Button variant="outline" size="sm" aria-label="Community settings">
                <Settings className="h-4 w-4 mr-2" aria-hidden="true" />
                Settings
              </Button>
            )}
            <Button
              variant={membership ? "secondary" : "default"}
              onClick={handleJoinLeave}
              disabled={joining}
              aria-label={membership ? 'Leave community' : 'Join community'}
            >
              {membership ? (
                <>
                  <Check className="h-4 w-4 mr-2" aria-hidden="true" />
                  Joined
                </>
              ) : (
                'Join Community'
              )}
            </Button>
          </div>
        </div>

        {community.description && (
          <p className="text-muted-foreground mt-4 max-w-2xl">
            {community.description}
          </p>
        )}
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto mt-6 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6 px-6 pb-12">
        <div>
          <Tabs defaultValue="posts" className="w-full">
            <div className="flex items-center justify-between mb-4">
              <TabsList>
                <TabsTrigger value="posts">Posts</TabsTrigger>
                <TabsTrigger value="about">About</TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-2">
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                  <SelectTrigger className="w-32" aria-label="Sort posts">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="trending">Trending</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="hot">Hot</SelectItem>
                  </SelectContent>
                </Select>

                {membership && (
                  <CreatePostDialog
                    trigger={
                      <Button size="sm" className="gap-2">
                        <PenSquare className="h-4 w-4" aria-hidden="true" />
                        Post
                      </Button>
                    }
                    defaultCommunityId={community.id}
                    onSubmit={createPost}
                  />
                )}
              </div>
            </div>

            <TabsContent value="posts">
              <CommunityErrorBoundary fallbackTitle="Posts failed to load">
                <div className="space-y-4" role="feed" aria-label="Community posts">
                  {postsLoading ? (
                    [...Array(3)].map((_, i) => (
                      <div key={i} className="space-y-3 p-4 border rounded-lg" aria-hidden="true">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-16 w-full" />
                      </div>
                    ))
                  ) : posts.length === 0 ? (
                    <div className="text-center py-12 border rounded-lg">
                      <p className="text-muted-foreground mb-4">
                        No posts yet in this community.
                      </p>
                      {membership && (
                        <CreatePostDialog
                          trigger={<Button>Create the first post</Button>}
                          defaultCommunityId={community.id}
                          onSubmit={createPost}
                        />
                      )}
                    </div>
                  ) : (
                    <>
                      {posts.map((post) => (
                        <CommunityPostCard
                          key={post.id}
                          post={post}
                          onVote={votePost}
                          onDelete={isMod ? deletePost : undefined}
                          showCommunity={false}
                        />
                      ))}
                      {hasMore && (
                        <div className="flex justify-center pt-4">
                          <Button variant="outline" onClick={loadMore}>
                            Load More
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </CommunityErrorBoundary>
            </TabsContent>

            <TabsContent value="about">
              <div className="border rounded-lg p-6 space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">About</h3>
                  <p className="text-muted-foreground">
                    {community.description || 'No description available.'}
                  </p>
                </div>

                {community.rules && (
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Shield className="h-4 w-4" aria-hidden="true" />
                      Community Rules
                    </h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {community.rules}
                    </p>
                  </div>
                )}

                <div>
                  <h3 className="font-semibold mb-2">Stats</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Members</p>
                      <p className="font-medium">{memberCount}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Created</p>
                      <p className="font-medium">
                        {new Date(community.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Sidebar */}
        <aside className="hidden lg:block" aria-label="Trending communities">
          <CommunityErrorBoundary fallbackTitle="Trending error">
            <TrendingCommunitiesSidebar />
          </CommunityErrorBoundary>
        </aside>
      </div>
    </div>
  );
}
