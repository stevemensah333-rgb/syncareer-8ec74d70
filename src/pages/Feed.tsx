import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useUserProfile } from '@/contexts/UserProfileContext';
import { getMajorContent } from '@/utils/majorContent';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { SkillPost } from '@/components/skillbridge/SkillPost';
import { ChallengeCard } from '@/components/skillbridge/ChallengeCard';
import { StatsCard } from '@/components/ui/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, TrendingUp, Users, Award, Target, Zap, BookOpen, Briefcase } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function Feed() {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { profile, studentDetails, loading: profileLoading } = useUserProfile();

  // Get personalized content based on major
  const majorContent = getMajorContent(studentDetails?.major);

  useEffect(() => {
    // Check authentication
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate('/auth');
      } else {
        setUser(session.user);
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
  }, [navigate]);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(prev => !prev);
  };

  // Mock data for skill posts - can be personalized based on major
  const skillPosts = [
    {
      user: 'Maria Chen',
      avatar: 'MC',
      skill: majorContent.skills[0] || 'Modern UI Design System',
      tags: majorContent.skills.slice(0, 3).map(s => s.replace(/\s+/g, '_')),
      rating: 4.8,
      description: `Demonstrated expertise in ${majorContent.skills[0]} with practical applications.`,
      endorsements: 24,
      comments: 8,
    },
    {
      user: 'Alex Kumar',
      avatar: 'AK',
      skill: majorContent.skills[1] || 'Python Data Analysis',
      tags: majorContent.skills.slice(1, 4).map(s => s.replace(/\s+/g, '_')),
      rating: 4.6,
      description: `Built an impressive project showcasing ${majorContent.skills[1]} skills.`,
      endorsements: 18,
      comments: 5,
    },
    {
      user: 'Jordan Lee',
      avatar: 'JL',
      skill: majorContent.skills[2] || 'React Component Library',
      tags: majorContent.skills.slice(2, 5).map(s => s.replace(/\s+/g, '_')),
      rating: 4.9,
      description: `Advanced ${majorContent.skills[2]} implementation with best practices.`,
      endorsements: 31,
      comments: 12,
    },
  ];

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
            <h1 className="text-3xl font-bold mb-6">Social Skill Network</h1>
            
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
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Recent Activity
                </h2>
                {skillPosts.map((post, idx) => (
                  <SkillPost key={idx} {...post} />
                ))}
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
