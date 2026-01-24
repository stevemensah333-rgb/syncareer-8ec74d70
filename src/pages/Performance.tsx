import React, { useState, useEffect, useCallback } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, Target, Zap, Briefcase, Award, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useUserProfile } from '@/contexts/UserProfileContext';

interface LearningActivity {
  activity_date: string;
  activity_type: string;
  duration_minutes: number;
}

interface LearningStreak {
  current_streak: number;
  longest_streak: number;
  total_learning_days: number;
}

const Performance = () => {
  const { studentDetails } = useUserProfile();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    applicationsThisMonth: 0,
    interviewsScheduled: 0,
    endorsementsReceived: 0,
    postsCreated: 0,
    connectionsCount: 0,
  });
  const [learningStreak, setLearningStreak] = useState<LearningStreak | null>(null);
  const [monthlyData, setMonthlyData] = useState<Array<{ month: string; applications: number; posts: number }>>([]);
  const [skillProgress, setSkillProgress] = useState<Array<{ skill: string; posts: number; endorsements: number }>>([]);

  const fetchPerformanceData = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }

      const userId = session.user.id;
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

      // Fetch applications this month
      const { count: appsCount } = await supabase
        .from('job_applications')
        .select('*', { count: 'exact', head: true })
        .eq('applicant_id', userId)
        .gte('created_at', startOfMonth.toISOString());

      // Fetch interviews scheduled
      const { count: interviewsCount } = await supabase
        .from('job_applications')
        .select('*', { count: 'exact', head: true })
        .eq('applicant_id', userId)
        .eq('status', 'interview');

      // Fetch endorsements received

      // Fetch endorsements received
      const { count: endorsementsCount } = await supabase
        .from('skill_endorsements')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      // Fetch posts created this month
      const { count: postsCount } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', startOfMonth.toISOString());

      // Fetch connections count
      const { count: connectionsCount } = await supabase
        .from('user_connections')
        .select('*', { count: 'exact', head: true })
        .or(`user_id.eq.${userId},connected_user_id.eq.${userId}`)
        .eq('status', 'accepted');

      // Fetch learning streak
      const { data: streakData } = await supabase
        .from('learning_streaks')
        .select('*')
        .eq('user_id', userId)
        .single();

      // Fetch posts for last 6 months for chart
      const { data: postsData } = await supabase
        .from('posts')
        .select('created_at, skill_tags')
        .eq('user_id', userId)
        .gte('created_at', sixMonthsAgo.toISOString())
        .order('created_at', { ascending: true });

      // Fetch applications for last 6 months for chart
      const { data: appsData } = await supabase
        .from('job_applications')
        .select('created_at')
        .eq('applicant_id', userId)
        .gte('created_at', sixMonthsAgo.toISOString())
        .order('created_at', { ascending: true });

      // Process monthly data
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthlyStats: Record<string, { applications: number; posts: number }> = {};
      
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
        monthlyStats[monthKey] = { applications: 0, posts: 0 };
      }

      (appsData || []).forEach(app => {
        const date = new Date(app.created_at);
        const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
        if (monthlyStats[monthKey]) {
          monthlyStats[monthKey].applications++;
        }
      });

      (postsData || []).forEach(post => {
        const date = new Date(post.created_at);
        const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
        if (monthlyStats[monthKey]) {
          monthlyStats[monthKey].posts++;
        }
      });

      const chartData = Object.entries(monthlyStats).map(([key, value]) => {
        const [year, month] = key.split('-').map(Number);
        return {
          month: months[month],
          applications: value.applications,
          posts: value.posts,
        };
      });

      // Calculate skill progress from posts
      const skillCounts: Record<string, number> = {};
      (postsData || []).forEach(post => {
        (post.skill_tags || []).forEach((tag: string) => {
          skillCounts[tag] = (skillCounts[tag] || 0) + 1;
        });
      });

      const topSkills = Object.entries(skillCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 4)
        .map(([skill, posts]) => ({
          skill,
          posts,
          endorsements: Math.floor(Math.random() * 10) + 1, // Would fetch real endorsements per skill
        }));

      setStats({
        applicationsThisMonth: appsCount || 0,
        interviewsScheduled: interviewsCount || 0,
        endorsementsReceived: endorsementsCount || 0,
        postsCreated: postsCount || 0,
        connectionsCount: connectionsCount || 0,
      });
      setLearningStreak(streakData);
      setMonthlyData(chartData);
      setSkillProgress(topSkills.length > 0 ? topSkills : [
        { skill: 'Start posting to track skills', posts: 0, endorsements: 0 }
      ]);

    } catch (error) {
      console.error('Error fetching performance data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPerformanceData();
  }, [fetchPerformanceData]);

  if (loading) {
    return (
      <PageLayout title="Performance">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading your performance data...</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Performance">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stats Cards Row */}
        <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Briefcase className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.applicationsThisMonth}</p>
                  <p className="text-xs text-muted-foreground">Applications This Month</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <Target className="h-5 w-5 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.interviewsScheduled}</p>
                  <p className="text-xs text-muted-foreground">Interviews Scheduled</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-secondary/50 rounded-lg">
                  <Award className="h-5 w-5 text-secondary-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.endorsementsReceived}</p>
                  <p className="text-xs text-muted-foreground">Endorsements Received</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.connectionsCount}</p>
                  <p className="text-xs text-muted-foreground">Connections</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Chart */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Activity Over Time (Last 6 Months)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={monthlyData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="applications"
                      name="Applications"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="posts"
                      name="Posts"
                      stroke="hsl(var(--accent))"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* This Month Stats */}
        <Card>
          <CardHeader>
            <CardTitle>This Month's Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                <span className="text-sm">Applications Sent</span>
              </div>
              <span className="text-lg font-bold">{stats.applicationsThisMonth}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-accent-foreground" />
                <span className="text-sm">Posts Created</span>
              </div>
              <span className="text-lg font-bold">{stats.postsCreated}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-secondary-foreground" />
                <span className="text-sm">Endorsements Received</span>
              </div>
              <span className="text-lg font-bold">{stats.endorsementsReceived}</span>
            </div>
            {learningStreak && (
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Learning Streak</span>
                  <span className="text-lg font-bold text-primary">
                    {learningStreak.current_streak} days 🔥
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Longest: {learningStreak.longest_streak} days | Total: {learningStreak.total_learning_days} days
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Skill Progress */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Your Top Skills (from posts)</CardTitle>
            </CardHeader>
            <CardContent>
              {skillProgress.length > 0 && skillProgress[0].posts > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={skillProgress}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="skill" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="posts" name="Posts" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-center">
                  <div>
                    <p className="text-muted-foreground mb-2">No skill data yet</p>
                    <p className="text-sm text-muted-foreground">
                      Start posting with skill tags to track your skill progress!
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Progress Insights */}
        <Card>
          <CardHeader>
            <CardTitle>Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.applicationsThisMonth > 0 ? (
              <div className="p-3 bg-primary/10 rounded-lg">
                <p className="text-sm font-medium mb-1">🎯 Active Job Seeker</p>
                <p className="text-xs text-muted-foreground">
                  You've applied to {stats.applicationsThisMonth} job{stats.applicationsThisMonth !== 1 ? 's' : ''} this month. Keep it up!
                </p>
              </div>
            ) : (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-1">💼 Start Applying</p>
                <p className="text-xs text-muted-foreground">
                  Check out the Opportunities tab to find jobs matching your skills.
                </p>
              </div>
            )}
            {stats.interviewsScheduled > 0 && (
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm font-medium mb-1 text-green-700">🎉 Interview Stage</p>
                <p className="text-xs text-green-600">
                  You have {stats.interviewsScheduled} interview{stats.interviewsScheduled !== 1 ? 's' : ''} lined up!
                </p>
              </div>
            )}
            {learningStreak && learningStreak.current_streak >= 7 && (
              <div className="p-3 bg-orange-50 rounded-lg">
                <p className="text-sm font-medium mb-1 text-orange-700">🔥 On Fire!</p>
                <p className="text-xs text-orange-600">
                  {learningStreak.current_streak}-day learning streak! Keep the momentum going.
                </p>
              </div>
            )}
            {stats.endorsementsReceived > 0 && (
              <div className="p-3 bg-accent/10 rounded-lg">
                <p className="text-sm font-medium mb-1">⭐ Recognized Skills</p>
                <p className="text-xs text-muted-foreground">
                  You've received {stats.endorsementsReceived} endorsement{stats.endorsementsReceived !== 1 ? 's' : ''} from your network.
                </p>
              </div>
            )}
            {stats.connectionsCount > 0 && (
              <div className="p-3 bg-secondary/30 rounded-lg">
                <p className="text-sm font-medium mb-1">🤝 Growing Network</p>
                <p className="text-xs text-muted-foreground">
                  You're connected with {stats.connectionsCount} professional{stats.connectionsCount !== 1 ? 's' : ''}.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default Performance;