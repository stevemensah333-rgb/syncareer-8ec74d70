import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useUserProfile } from '@/contexts/UserProfileContext';
import { getMajorContent } from '@/utils/majorContent';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { ChallengeCard } from '@/components/skillbridge/ChallengeCard';
import { StatsCard } from '@/components/ui/StatsCard';
import { CreatePostDialog } from '@/components/feed/CreatePostDialog';
import { PostCard } from '@/components/feed/PostCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, TrendingUp, Users, Award, Target, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Post {
  id: string;
  user_id: string;
  content: string;
  skill_tags: string[];
  created_at: string;
  author_name?: string;
  author_avatar?: string;
}

export function Feed() {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [userStats, setUserStats] = useState({
    skillScore: 0,
    skillsVerified: 0,
    networkCount: 0,
    endorsements: 0,
  });
  const { profile, studentDetails, loading: profileLoading } = useUserProfile();

  // Get personalized content based on major
  const majorContent = getMajorContent(studentDetails?.major);

  const fetchPosts = useCallback(async () => {
    setLoadingPosts(true);
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Fetch author profiles for posts
      if (data && data.length > 0) {
        const userIds = [...new Set(data.map(post => post.user_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', userIds);

        const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

        const postsWithAuthors = data.map(post => {
          const authorProfile = profileMap.get(post.user_id);
          return {
            ...post,
            author_name: authorProfile?.full_name || 'Anonymous',
            author_avatar: authorProfile?.avatar_url,
          };
        });

        setPosts(postsWithAuthors);
      } else {
        setPosts([]);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoadingPosts(false);
    }
  }, []);

  const fetchUserStats = useCallback(async (userId: string) => {
    try {
      // Fetch or create user stats
      let { data: stats, error } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code === 'PGRST116') {
        // No stats exist, create them
        const { data: newStats, error: insertError } = await supabase
          .from('user_stats')
          .insert({ user_id: userId, skill_score: 100 })
          .select()
          .single();

        if (!insertError) {
          stats = newStats;
        }
      }

      // Fetch network count (accepted connections)
      const { count: networkCount } = await supabase
        .from('user_connections')
        .select('*', { count: 'exact', head: true })
        .or(`user_id.eq.${userId},connected_user_id.eq.${userId}`)
        .eq('status', 'accepted');

      // Fetch endorsements received
      const { count: endorsementsCount } = await supabase
        .from('skill_endorsements')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      setUserStats({
        skillScore: stats?.skill_score || 100,
        skillsVerified: stats?.skills_verified || 0,
        networkCount: networkCount || 0,
        endorsements: endorsementsCount || 0,
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  }, []);

  useEffect(() => {
    // Check authentication
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate('/auth');
      } else {
        setUser(session.user);
        fetchPosts();
        fetchUserStats(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate('/auth');
      } else {
        setUser(session.user);
        fetchUserStats(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, fetchPosts, fetchUserStats]);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(prev => !prev);
  };


  // Mock data for challenges - personalized
  const challenges = [
    {
      title: `${majorContent.skills[0]} Challenge`,
      description: `Demonstrate your ${majorContent.skills[0]} abilities in this week's challenge.`,
      deadline: '5 days left',
      participants: 127,
      reward: 'Top 10 Featured',
      difficulty: 'Intermediate' as const,
    },
    {
      title: `${majorContent.skills[1]} Project`,
      description: `Build a real-world project using ${majorContent.skills[1]}.`,
      deadline: '3 days left',
      participants: 89,
      reward: 'SkillScore +50',
      difficulty: 'Advanced' as const,
    },
  ];

  // Trending skills from major content
  const trendingSkills = majorContent.skills.slice(0, 3).map((skill, idx) => ({
    name: skill,
    growth: ['+25%', '+18%', '+22%'][idx],
    icon: [Zap, Target, TrendingUp][idx],
  }));

  // Mock leaderboard
  const leaderboard = [
    { name: 'Sarah Johnson', score: 2850, badge: '🏆' },
    { name: 'Mike Chen', score: 2720, badge: '🥈' },
    { name: 'Emma Wilson', score: 2680, badge: '🥉' },
  ];

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-1 flex">
        <Sidebar isCollapsed={isSidebarCollapsed} onToggle={toggleSidebar} />
        
        <main className="flex-1 transition-all duration-300">
          <div className="container max-w-full p-4 lg:p-6 animate-fade-in">
            <h1 className="text-3xl font-bold mb-6">Networking</h1>
            <p className="text-muted-foreground mb-6">Connect with peers, mentors, and alumni</p>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <StatsCard
                title="Your SkillScore"
                value={userStats.skillScore.toLocaleString()}
                icon={<Trophy className="h-4 w-4" />}
                description="Keep learning!"
              />
              <StatsCard
                title="Skills Verified"
                value={userStats.skillsVerified.toString()}
                icon={<Award className="h-4 w-4" />}
                description="Verified skills"
              />
              <StatsCard
                title="Network"
                value={userStats.networkCount.toString()}
                icon={<Users className="h-4 w-4" />}
                description="Connections"
              />
              <StatsCard
                title="Endorsements"
                value={userStats.endorsements.toString()}
                icon={<TrendingUp className="h-4 w-4" />}
                description="From peers"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Feed */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Recent Activity
                  </h2>
                  <CreatePostDialog onPostCreated={fetchPosts} />
                </div>
                {loadingPosts ? (
                  <Card className="p-8 text-center">
                    <p className="text-muted-foreground">Loading posts...</p>
                  </Card>
                ) : posts.length === 0 ? (
                  <Card className="p-8 text-center">
                    <p className="text-muted-foreground">No posts yet. Be the first to share something!</p>
                  </Card>
                ) : (
                  posts.map((post) => (
                    <PostCard
                      key={post.id}
                      id={post.id}
                      content={post.content}
                      skill_tags={post.skill_tags || []}
                      created_at={post.created_at}
                      author_name={post.author_name || 'Anonymous'}
                      user_id={post.user_id}
                      currentUserId={user?.id}
                    />
                  ))
                )}
              </div>

              {/* Sidebar Content */}
              <div className="space-y-6">
                {/* Weekly Challenges */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-primary" />
                    Weekly Challenges
                  </h2>
                  {challenges.map((challenge, idx) => (
                    <ChallengeCard key={idx} {...challenge} />
                  ))}
                </div>

                {/* Trending Skills */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Trending Skills</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {trendingSkills.map((skill, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <skill.icon className="h-4 w-4 text-primary" />
                          <span className="font-medium">{skill.name}</span>
                        </div>
                        <Badge variant="secondary" className="text-success">
                          {skill.growth}
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Leaderboard */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Top Learners</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {leaderboard.map((user, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{user.badge}</span>
                          <span className="font-medium">{user.name}</span>
                        </div>
                        <span className="text-sm font-semibold text-primary">
                          {user.score}
                        </span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Feed;
