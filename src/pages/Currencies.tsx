import React, { useState, useEffect } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Video, FileText, Target, Clock, Star, Flame, CheckCircle } from 'lucide-react';
import { useUserProfile } from '@/contexts/UserProfileContext';
import { getMajorContent } from '@/utils/majorContent';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface LearningStreak {
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  total_learning_days: number;
}

interface LearningActivity {
  activity_date: string;
}

const Learn = () => {
  const { studentDetails, loading } = useUserProfile();
  const majorContent = getMajorContent(studentDetails?.major);
  const [streak, setStreak] = useState<LearningStreak | null>(null);
  const [recentActivities, setRecentActivities] = useState<LearningActivity[]>([]);
  const [streakLoading, setStreakLoading] = useState(true);
  const [recordingActivity, setRecordingActivity] = useState(false);

  useEffect(() => {
    fetchStreakData();
  }, []);

  const fetchStreakData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      // Fetch streak data
      const { data: streakData } = await supabase
        .from('learning_streaks')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (streakData) {
        setStreak(streakData);
      }

      // Fetch last 28 days of activities for the grid
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 28);

      const { data: activities } = await supabase
        .from('learning_activities')
        .select('activity_date')
        .eq('user_id', session.user.id)
        .gte('activity_date', thirtyDaysAgo.toISOString().split('T')[0])
        .order('activity_date', { ascending: false });

      if (activities) {
        setRecentActivities(activities);
      }
    } catch (error) {
      console.error('Error fetching streak:', error);
    } finally {
      setStreakLoading(false);
    }
  };

  const recordActivity = async (activityType: string) => {
    setRecordingActivity(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        toast.error('Please sign in to track your learning');
        return;
      }

      const { error } = await supabase
        .from('learning_activities')
        .insert({
          user_id: session.user.id,
          activity_type: activityType,
          duration_minutes: 15, // Default duration
        });

      if (error) throw error;

      toast.success('Activity recorded! Keep learning! 🔥');
      fetchStreakData(); // Refresh streak data
    } catch (error: any) {
      console.error('Error recording activity:', error);
      toast.error('Failed to record activity');
    } finally {
      setRecordingActivity(false);
    }
  };

  // Generate learning paths based on major
  const getLearningPaths = () => {
    const major = studentDetails?.major || 'General';
    const skills = majorContent.skills.slice(0, 3);
    
    return [
      {
        title: `${major} Career Path`,
        description: `Complete roadmap to excel in ${major.toLowerCase()}`,
        duration: '6 months',
        level: 'Intermediate',
        progress: 45,
        modules: 24,
        icon: Target,
      },
      {
        title: `${skills[0] || 'Core Skills'} Mastery`,
        description: `Master ${skills[0]?.toLowerCase() || 'essential skills'} and related technologies`,
        duration: '4 months',
        level: 'Beginner',
        progress: 20,
        modules: 18,
        icon: Target,
      },
    ];
  };

  // Course URL mappings for each provider
  const getCourseUrl = (course: string, provider: string): string => {
    const searchQuery = encodeURIComponent(course);
    const providerUrls: Record<string, string> = {
      'Coursera': `https://www.coursera.org/search?query=${searchQuery}`,
      'Udemy': `https://www.udemy.com/courses/search/?q=${searchQuery}`,
      'edX': `https://www.edx.org/search?q=${searchQuery}`,
      'FreeCodeCamp': `https://www.freecodecamp.org/news/search/?query=${searchQuery}`,
      'DataCamp': `https://www.datacamp.com/search?q=${searchQuery}`,
      'WorldQuant': `https://www.wqu.edu/programs`,
      'LinkedIn Learning': `https://www.linkedin.com/learning/search?keywords=${searchQuery}`,
    };
    return providerUrls[provider] || `https://www.google.com/search?q=${searchQuery}+online+course`;
  };

  // Generate recommended courses based on major
  const getRecommendedCourses = () => {
    const providers = ['Coursera', 'DataCamp', 'Udemy', 'edX', 'LinkedIn Learning', 'WorldQuant'];
    return majorContent.suggestedCourses.map((course, index) => {
      const provider = providers[index % providers.length];
      return {
        title: course,
        provider,
        duration: ['12 hours', '8 weeks', '15 hours', '6 weeks', '10 hours', '4 weeks'][index % 6],
        rating: [4.8, 4.9, 4.7, 4.8, 4.6, 4.9][index % 6],
        type: ['Video', 'Course', 'Video', 'Course', 'Course', 'Program'][index % 6],
        url: getCourseUrl(course, provider),
      };
    });
  };

  const learningPaths = getLearningPaths();
  const recommendedCourses = getRecommendedCourses();

  // Generate streak grid for last 28 days
  const getStreakGrid = () => {
    const grid = [];
    const today = new Date();
    const activityDates = new Set(recentActivities.map(a => a.activity_date));

    for (let i = 27; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      grid.push({
        date: dateStr,
        hasActivity: activityDates.has(dateStr),
      });
    }
    return grid;
  };

  const streakGrid = getStreakGrid();
  const todayHasActivity = recentActivities.some(
    a => a.activity_date === new Date().toISOString().split('T')[0]
  );

  if (loading) {
    return (
      <PageLayout title="Learn">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading your personalized content...</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Learn">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Major indicator */}
          {studentDetails?.major && (
            <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <Target className="h-10 w-10 text-primary" />
                  <div>
                    <h3 className="text-lg font-semibold">Personalized for {studentDetails.major}</h3>
                    <p className="text-sm text-muted-foreground">
                      Content tailored to your field of study
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* AI Learning Paths */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Your AI-Generated Learning Paths
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {learningPaths.map((path) => {
                const Icon = path.icon;
                return (
                  <div key={path.title} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{path.title}</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {path.description}
                        </p>
                        <div className="flex gap-2 flex-wrap">
                          <Badge variant="secondary">{path.level}</Badge>
                          <Badge variant="outline">
                            <Clock className="h-3 w-3 mr-1" />
                            {path.duration}
                          </Badge>
                          <Badge variant="outline">{path.modules} modules</Badge>
                        </div>
                      </div>
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{path.progress}% complete</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${path.progress}%` }}
                        />
                      </div>
                    </div>
                    <Button 
                      className="w-full mt-3"
                      onClick={() => recordActivity('lesson')}
                      disabled={recordingActivity}
                    >
                      Continue Learning
                    </Button>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Recommended Courses */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Recommended Courses for {studentDetails?.major || 'You'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recommendedCourses.map((course) => (
                  <a
                    key={course.title}
                    href={course.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-4 border rounded-lg hover:border-primary/50 hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => recordActivity('course')}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">{course.title}</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          {course.provider}
                        </p>
                        <div className="flex gap-2 items-center">
                          <Badge variant="outline">{course.duration}</Badge>
                          <div className="flex items-center gap-1 text-sm">
                            <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                            <span className="font-medium">{course.rating}</span>
                          </div>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        disabled={recordingActivity}
                      >
                        Start →
                      </Button>
                    </div>
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Learning Streak */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-orange-500" />
                Learning Streak
              </CardTitle>
            </CardHeader>
            <CardContent>
              {streakLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                </div>
              ) : (
                <>
                  <div className="text-center mb-4">
                    <div className="text-5xl mb-2">🔥</div>
                    <div className="text-3xl font-bold text-primary mb-1">
                      {streak?.current_streak || 0} Days
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {streak?.current_streak 
                        ? "Keep it going!" 
                        : "Start your streak today!"}
                    </p>
                    {streak?.longest_streak ? (
                      <p className="text-xs text-muted-foreground mt-1">
                        Best: {streak.longest_streak} days
                      </p>
                    ) : null}
                  </div>

                  {/* Activity Grid */}
                  <div className="grid grid-cols-7 gap-1 mb-4">
                    {streakGrid.map((day, i) => (
                      <div
                        key={i}
                        className={`aspect-square rounded transition-colors ${
                          day.hasActivity
                            ? 'bg-primary'
                            : 'bg-muted'
                        }`}
                        title={day.date}
                      />
                    ))}
                  </div>

                  {/* Today's status */}
                  {todayHasActivity ? (
                    <div className="flex items-center justify-center gap-2 text-sm text-primary">
                      <CheckCircle className="h-4 w-4" />
                      <span>You've learned today!</span>
                    </div>
                  ) : (
                    <Button 
                      className="w-full" 
                      size="sm"
                      onClick={() => recordActivity('lesson')}
                      disabled={recordingActivity}
                    >
                      {recordingActivity ? 'Recording...' : 'Log Today\'s Learning'}
                    </Button>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Weekly Goals */}
          <Card>
            <CardHeader>
              <CardTitle>Weekly Goals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Complete 5 lessons</span>
                <span className="text-sm font-medium text-primary">3/5</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Practice 1 hour daily</span>
                <span className="text-sm font-medium text-primary">5/7</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Upload 1 project</span>
                <span className="text-sm font-medium text-muted-foreground">0/1</span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => recordActivity('video')}
                disabled={recordingActivity}
              >
                <Video className="h-4 w-4 mr-2" />
                Watch Daily Lesson
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => recordActivity('quiz')}
                disabled={recordingActivity}
              >
                <FileText className="h-4 w-4 mr-2" />
                Take Quiz
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <BookOpen className="h-4 w-4 mr-2" />
                Browse Library
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
};

export default Learn;
