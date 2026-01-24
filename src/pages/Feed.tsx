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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, TrendingUp, Users, Award, Target, Zap, MessageCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';

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

  useEffect(() => {
    // Check authentication
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate('/auth');
      } else {
        setUser(session.user);
        fetchPosts();
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate('/auth');
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, fetchPosts]);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(prev => !prev);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
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
                value="1,847"
                icon={<Trophy className="h-4 w-4" />}
                trend={12}
                description="Keep learning!"
              />
              <StatsCard
                title="Skills Verified"
                value="23"
                icon={<Award className="h-4 w-4" />}
                trend={3}
                description="This month"
              />
              <StatsCard
                title="Network"
                value="342"
                icon={<Users className="h-4 w-4" />}
                description="Connections"
              />
              <StatsCard
                title="Endorsements"
                value="67"
                icon={<TrendingUp className="h-4 w-4" />}
                trend={8}
                description="This week"
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
                    <Card key={post.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {getInitials(post.author_name || 'A')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-semibold">{post.author_name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm whitespace-pre-wrap">{post.content}</p>
                        {post.skill_tags && post.skill_tags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {post.skill_tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                #{tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center gap-4 pt-2 border-t">
                          <button className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                            <MessageCircle className="h-4 w-4" />
                            <span className="text-sm">Comment</span>
                          </button>
                        </div>
                      </CardContent>
                    </Card>
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
