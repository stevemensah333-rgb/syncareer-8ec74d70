import React, { useState, useEffect, useCallback } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Target, Clock, Star, Flame, CheckCircle } from 'lucide-react';
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

interface LearningGoal {
  id: string;
  goal_type: string;
  target_count: number;
  current_count: number;
}

interface LearningPath {
  id: string;
  path_title: string;
  total_modules: number;
  completed_modules: number;
}

const Learn = () => {
  const { studentDetails, loading } = useUserProfile();
  const majorContent = getMajorContent(studentDetails?.major);
  const [streak, setStreak] = useState<LearningStreak | null>(null);
  const [goals, setGoals] = useState<LearningGoal[]>([]);
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [streakLoading, setStreakLoading] = useState(true);
  const [recordingActivity, setRecordingActivity] = useState(false);
  const [hasLoggedToday, setHasLoggedToday] = useState(false);

  // Auto-log activity on page visit (once per day)
  const autoLogActivity = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const today = new Date().toISOString().split('T')[0];
      
      // Check if already logged today
      const { data: existingActivity } = await supabase
        .from('learning_activities')
        .select('id')
        .eq('user_id', session.user.id)
        .eq('activity_date', today)
        .limit(1);

      if (existingActivity && existingActivity.length > 0) {
        setHasLoggedToday(true);
        return;
      }

      // Auto-log visit activity
      await supabase
        .from('learning_activities')
        .insert({
          user_id: session.user.id,
          activity_type: 'page_visit',
          duration_minutes: 1,
        });

      setHasLoggedToday(true);
    } catch (error) {
      console.error('Error auto-logging activity:', error);
    }
  }, []);

  useEffect(() => {
    autoLogActivity();
  }, [autoLogActivity]);

  useEffect(() => {
    fetchData();
  }, [studentDetails, hasLoggedToday]);

  const fetchData = async () => {
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

      // Fetch weekly goals
      const weekStart = getWeekStart();
      const { data: goalsData } = await supabase
        .from('learning_goals')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('week_start', weekStart);

      if (goalsData && goalsData.length > 0) {
        setGoals(goalsData);
      } else {
        // Create default goals for this week
        await createDefaultGoals(session.user.id, weekStart);
      }

      // Fetch or create learning paths
      const { data: pathsData } = await supabase
        .from('learning_paths')
        .select('*')
        .eq('user_id', session.user.id);

      if (pathsData && pathsData.length > 0) {
        setPaths(pathsData);
      } else if (studentDetails?.major) {
        // Create default paths based on major
        await createDefaultPaths(session.user.id);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setStreakLoading(false);
    }
  };

  const getWeekStart = () => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(now.setDate(diff)).toISOString().split('T')[0];
  };

  const createDefaultGoals = async (userId: string, weekStart: string) => {
    const defaultGoals = [
      { goal_type: 'lessons', target_count: 5, current_count: 0 },
      { goal_type: 'practice', target_count: 7, current_count: 0 },
      { goal_type: 'projects', target_count: 1, current_count: 0 },
    ];

    try {
      const { data, error } = await supabase
        .from('learning_goals')
        .insert(defaultGoals.map(g => ({ ...g, user_id: userId, week_start: weekStart })))
        .select();

      if (!error && data) {
        setGoals(data);
      }
    } catch (error) {
      console.error('Error creating goals:', error);
    }
  };

  const createDefaultPaths = async (userId: string) => {
    const major = studentDetails?.major || 'General';
    const skills = majorContent.skills.slice(0, 1);
    
    const defaultPaths = [
      { path_title: `${major} Career Path`, total_modules: 24, completed_modules: 0 },
      { path_title: `${skills[0] || 'Core Skills'} Mastery`, total_modules: 18, completed_modules: 0 },
    ];

    try {
      const { data, error } = await supabase
        .from('learning_paths')
        .insert(defaultPaths.map(p => ({ ...p, user_id: userId })))
        .select();

      if (!error && data) {
        setPaths(data);
      }
    } catch (error) {
      console.error('Error creating paths:', error);
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
          duration_minutes: 15,
        });

      if (error) throw error;

      // Update relevant goal
      const goalType = activityType === 'video' || activityType === 'lesson' ? 'lessons' 
        : activityType === 'quiz' ? 'practice' : 'projects';
      
      const weekStart = getWeekStart();
      const { data: goalData } = await supabase
        .from('learning_goals')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('goal_type', goalType)
        .eq('week_start', weekStart)
        .single();

      if (goalData) {
        await supabase
          .from('learning_goals')
          .update({ current_count: goalData.current_count + 1 })
          .eq('id', goalData.id);
      }

      toast.success('Activity recorded! Keep learning! 🔥');
      fetchData();
    } catch (error: any) {
      console.error('Error recording activity:', error);
      toast.error('Failed to record activity');
    } finally {
      setRecordingActivity(false);
    }
  };

  const updatePathProgress = async (pathId: string) => {
    try {
      const path = paths.find(p => p.id === pathId);
      if (!path || path.completed_modules >= path.total_modules) return;

      const { error } = await supabase
        .from('learning_paths')
        .update({ completed_modules: path.completed_modules + 1 })
        .eq('id', pathId);

      if (error) throw error;

      setPaths(paths.map(p => 
        p.id === pathId 
          ? { ...p, completed_modules: p.completed_modules + 1 }
          : p
      ));

      await recordActivity('lesson');
    } catch (error) {
      console.error('Error updating path:', error);
      toast.error('Failed to update progress');
    }
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

  const recommendedCourses = getRecommendedCourses();

  // Get goal display info
  const getGoalDisplay = (goalType: string) => {
    switch (goalType) {
      case 'lessons': return { label: 'Complete lessons' };
      case 'practice': return { label: 'Practice sessions' };
      case 'projects': return { label: 'Upload projects' };
      default: return { label: goalType };
    }
  };


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

          {/* Learning Paths */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Your Learning Paths
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {paths.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Complete your profile to get personalized learning paths
                </p>
              ) : (
                paths.map((path) => {
                  const progress = Math.round((path.completed_modules / path.total_modules) * 100);
                  return (
                    <div key={path.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">{path.path_title}</h3>
                          <div className="flex gap-2 flex-wrap">
                            <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full">
                              {path.total_modules} modules
                            </span>
                            <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full">
                              <Clock className="h-3 w-3 inline mr-1" />
                              {Math.ceil((path.total_modules - path.completed_modules) / 2)} weeks left
                            </span>
                          </div>
                        </div>
                        <Target className="h-8 w-8 text-primary" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">{progress}% complete</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {path.completed_modules} of {path.total_modules} modules completed
                        </p>
                      </div>
                      <Button 
                        className="w-full mt-3"
                        onClick={() => updatePathProgress(path.id)}
                        disabled={recordingActivity || path.completed_modules >= path.total_modules}
                      >
                        {path.completed_modules >= path.total_modules ? 'Completed! 🎉' : 'Complete Next Module'}
                      </Button>
                    </div>
                  );
                })
              )}
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
                          <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full">
                            {course.duration}
                          </span>
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
          {/* Learning Streak - Compact */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Flame className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Current Streak</p>
                    <p className="text-2xl font-bold">
                      {streakLoading ? '...' : `${streak?.current_streak || 0} days`}
                    </p>
                  </div>
                </div>
                {hasLoggedToday && (
                  <div className="flex items-center gap-1 text-primary text-sm">
                    <CheckCircle className="h-4 w-4" />
                    <span>Today</span>
                  </div>
                )}
              </div>
              {streak?.longest_streak && streak.longest_streak > 0 && (
                <div className="mt-3 pt-3 border-t flex justify-between text-sm">
                  <span className="text-muted-foreground">Best streak</span>
                  <span className="font-medium">{streak.longest_streak} days</span>
                </div>
              )}
              {streak?.total_learning_days && streak.total_learning_days > 0 && (
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-muted-foreground">Total learning days</span>
                  <span className="font-medium">{streak.total_learning_days}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Weekly Goals */}
          <Card>
            <CardHeader>
              <CardTitle>Weekly Goals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {goals.length === 0 ? (
                <p className="text-muted-foreground text-sm">Loading goals...</p>
              ) : (
                goals.map((goal) => {
                  const { label } = getGoalDisplay(goal.goal_type);
                  const isComplete = goal.current_count >= goal.target_count;
                  return (
                    <div key={goal.id} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{label}</span>
                        <span className={`text-sm font-medium ${isComplete ? 'text-primary' : 'text-muted-foreground'}`}>
                          {goal.current_count}/{goal.target_count}
                          {isComplete && ' ✓'}
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full transition-all ${isComplete ? 'bg-primary' : 'bg-primary/60'}`}
                          style={{ width: `${Math.min((goal.current_count / goal.target_count) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </PageLayout>
  );
};

export default Learn;