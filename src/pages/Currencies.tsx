import React, { useState, useEffect, useCallback } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Target, Clock, Star, Flame, CheckCircle, Lock } from 'lucide-react';
import { useUserProfile } from '@/contexts/UserProfileContext';
import { getMajorContent } from '@/utils/majorContent';
import { getSkillForModule, getDifficultyForModule, calculateSkillMastery, getCareerSkills } from '@/utils/careerSkillFramework';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import ModuleQuizDialog, { type QuizQuestion } from '@/components/learn/ModuleQuizDialog';
import MilestoneIndicator, { getMilestoneLevel } from '@/components/learn/MilestoneIndicator';

interface LearningStreak {
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  total_learning_days: number;
}

interface LearningPath {
  id: string;
  path_title: string;
  total_modules: number;
  completed_modules: number;
  milestone_level: string;
  last_module_completed_at: string | null;
}

const COOLDOWN_MINUTES = 5;

const Learn = () => {
  const { studentDetails, loading } = useUserProfile();
  const majorContent = getMajorContent(studentDetails?.major);
  const [streak, setStreak] = useState<LearningStreak | null>(null);
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [streakLoading, setStreakLoading] = useState(true);
  const [hasLoggedToday, setHasLoggedToday] = useState(false);

  // Quiz state
  const [quizOpen, setQuizOpen] = useState(false);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [activePath, setActivePath] = useState<LearningPath | null>(null);
  const [activeSkillName, setActiveSkillName] = useState<string | null>(null);

  // Auto-log activity on page visit (once per day)
  const autoLogActivity = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const today = new Date().toISOString().split('T')[0];
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

      await supabase
        .from('learning_activities')
        .insert({ user_id: session.user.id, activity_type: 'page_visit', duration_minutes: 1 });

      setHasLoggedToday(true);
    } catch (error) {
      console.error('Error auto-logging activity:', error);
    }
  }, []);

  useEffect(() => { autoLogActivity(); }, [autoLogActivity]);
  useEffect(() => { fetchData(); }, [studentDetails, hasLoggedToday]);

  const fetchData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { data: streakData } = await supabase
        .from('learning_streaks')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (streakData) setStreak(streakData);

      const { data: pathsData } = await supabase
        .from('learning_paths')
        .select('*')
        .eq('user_id', session.user.id);

      if (pathsData && pathsData.length > 0) {
        setPaths(pathsData as LearningPath[]);
      } else if (studentDetails?.major) {
        await createDefaultPaths(session.user.id);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setStreakLoading(false);
    }
  };

  const createDefaultPaths = async (userId: string) => {
    const major = studentDetails?.major || 'General';
    const skills = majorContent.skills.slice(0, 1);
    const defaultPaths = [
      { path_title: `${major} Career Path`, total_modules: 24, completed_modules: 0, milestone_level: 'beginner' },
      { path_title: `${skills[0] || 'Core Skills'} Mastery`, total_modules: 18, completed_modules: 0, milestone_level: 'beginner' },
    ];

    try {
      const { data, error } = await supabase
        .from('learning_paths')
        .insert(defaultPaths.map(p => ({ ...p, user_id: userId })))
        .select();

      if (!error && data) setPaths(data as LearningPath[]);
    } catch (error) {
      console.error('Error creating paths:', error);
    }
  };

  const isOnCooldown = (path: LearningPath): boolean => {
    if (!path.last_module_completed_at) return false;
    const lastCompleted = new Date(path.last_module_completed_at).getTime();
    const cooldownMs = COOLDOWN_MINUTES * 60 * 1000;
    return Date.now() - lastCompleted < cooldownMs;
  };

  const getCooldownRemaining = (path: LearningPath): string => {
    if (!path.last_module_completed_at) return '';
    const lastCompleted = new Date(path.last_module_completed_at).getTime();
    const cooldownMs = COOLDOWN_MINUTES * 60 * 1000;
    const remaining = Math.max(0, cooldownMs - (Date.now() - lastCompleted));
    const mins = Math.ceil(remaining / 60000);
    return `${mins} min`;
  };

  const startQuiz = async (path: LearningPath) => {
    if (isOnCooldown(path)) {
      toast.error(`Please wait ${getCooldownRemaining(path)} before completing another module.`);
      return;
    }

    const nextModule = path.completed_modules + 1;
    const major = studentDetails?.major || 'General';
    const skillName = getSkillForModule(major, nextModule);
    const difficulty = getDifficultyForModule(major, nextModule);

    setActivePath(path);
    setActiveSkillName(skillName);
    setQuizOpen(true);
    setQuizLoading(true);
    setQuizQuestions([]);

    try {
      const { data, error } = await supabase.functions.invoke('generate-module-quiz', {
        body: {
          pathTitle: path.path_title,
          moduleNumber: nextModule,
          totalModules: path.total_modules,
          major,
          skillName,
          difficulty,
        },
      });

      if (error) throw error;
      if (data?.questions) {
        setQuizQuestions(data.questions);
      } else {
        throw new Error('No questions returned');
      }
    } catch (error) {
      console.error('Error generating quiz:', error);
      toast.error('Failed to generate quiz. Please try again.');
      setQuizOpen(false);
    } finally {
      setQuizLoading(false);
    }
  };

  const handleQuizPass = async (quizScore: number) => {
    if (!activePath) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const newCompleted = activePath.completed_modules + 1;
      const progress = Math.round((newCompleted / activePath.total_modules) * 100);
      const newMilestone = getMilestoneLevel(progress);
      const major = studentDetails?.major || 'General';

      // Save completion record
      await supabase.from('learning_module_completions').upsert([{
        user_id: session.user.id,
        path_id: activePath.id,
        module_number: newCompleted,
        quiz_questions: quizQuestions as any,
        quiz_answers: [] as any,
        score: quizScore,
        passed: true,
        completed_at: new Date().toISOString(),
      }], { onConflict: 'user_id,path_id,module_number' });

      // Update path progress + cooldown + milestone
      await supabase.from('learning_paths').update({
        completed_modules: newCompleted,
        milestone_level: newMilestone,
        last_module_completed_at: new Date().toISOString(),
      }).eq('id', activePath.id);

      // Record learning activity
      await supabase.from('learning_activities').insert({
        user_id: session.user.id,
        activity_type: 'module_completion',
        duration_minutes: 15,
      });

      // Update skill mastery in user_skills
      if (activeSkillName) {
        const mastery = calculateSkillMastery(major, activeSkillName, newCompleted);
        const proficiency = mastery >= 100 ? 'expert' : mastery >= 75 ? 'advanced' : mastery >= 50 ? 'intermediate' : 'beginner';
        
        // Upsert skill record
        const { data: existingSkill } = await supabase
          .from('user_skills')
          .select('id')
          .eq('user_id', session.user.id)
          .eq('skill_name', activeSkillName)
          .eq('source', 'mastery_path')
          .maybeSingle();

        if (existingSkill) {
          await supabase.from('user_skills').update({
            proficiency,
            updated_at: new Date().toISOString(),
          }).eq('id', existingSkill.id);
        } else {
          await supabase.from('user_skills').insert({
            user_id: session.user.id,
            skill_name: activeSkillName,
            category: major,
            proficiency,
            source: 'mastery_path',
          });
        }
      }

      // Update local state
      setPaths(prev => prev.map(p =>
        p.id === activePath.id
          ? { ...p, completed_modules: newCompleted, milestone_level: newMilestone, last_module_completed_at: new Date().toISOString() }
          : p
      ));

      // Milestone toasts
      if (progress >= 100) toast.success('🎓 Mastery Achieved! Certificate unlocked.');
      else if (progress >= 75 && activePath.completed_modules < activePath.total_modules * 0.75)
        toast.success('⭐ Advanced level reached!');
      else if (progress >= 50 && activePath.completed_modules < activePath.total_modules * 0.50)
        toast.success('📈 Developing level reached!');
      else if (progress >= 25 && activePath.completed_modules < activePath.total_modules * 0.25)
        toast.success('📚 Foundation level reached!');
      else toast.success(`Module completed! ${activeSkillName ? `${activeSkillName} skill updated.` : ''}`);

    } catch (error) {
      console.error('Error saving completion:', error);
      toast.error('Failed to save progress.');
    }
  };

  const handleQuizRetry = () => {
    if (activePath) startQuiz(activePath);
  };

  const recordCourseActivity = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      await supabase.from('learning_activities').insert({
        user_id: session.user.id,
        activity_type: 'course',
        duration_minutes: 15,
      });
    } catch (error) {
      console.error('Error recording activity:', error);
    }
  };

  // Course URL mappings
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

  const getRecommendedCourses = () => {
    const providers = ['Coursera', 'DataCamp', 'Udemy', 'edX', 'LinkedIn Learning', 'WorldQuant'];
    return majorContent.suggestedCourses.map((course, index) => {
      const provider = providers[index % providers.length];
      return {
        title: course,
        provider,
        duration: ['12 hours', '8 weeks', '15 hours', '6 weeks', '10 hours', '4 weeks'][index % 6],
        rating: [4.8, 4.9, 4.7, 4.8, 4.6, 4.9][index % 6],
        url: getCourseUrl(course, provider),
      };
    });
  };

  const recommendedCourses = getRecommendedCourses();

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
                    <p className="text-sm text-muted-foreground">Content tailored to your field of study</p>
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
                <p className="text-muted-foreground text-center py-4">Complete your profile to get personalized learning paths</p>
              ) : (
                paths.map((path) => {
                  const progress = Math.round((path.completed_modules / path.total_modules) * 100);
                  const onCooldown = isOnCooldown(path);
                  const isComplete = path.completed_modules >= path.total_modules;
                  return (
                    <div key={path.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">{path.path_title}</h3>
                          <div className="flex gap-2 flex-wrap items-center">
                            <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full">
                              {path.total_modules} modules
                            </span>
                            <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full">
                              <Clock className="h-3 w-3 inline mr-1" />
                              {Math.ceil((path.total_modules - path.completed_modules) / 2)} weeks left
                            </span>
                            <MilestoneIndicator progress={progress} compact />
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
                            className="bg-primary h-2 rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {path.completed_modules} of {path.total_modules} modules completed
                        </p>
                        <MilestoneIndicator progress={progress} />
                      </div>

                      <Button
                        className="w-full mt-3"
                        onClick={() => startQuiz(path)}
                        disabled={isComplete || onCooldown || quizLoading}
                      >
                        {isComplete ? (
                          '🎓 Mastery Achieved'
                        ) : onCooldown ? (
                          <><Lock className="h-4 w-4 mr-2" />Available in {getCooldownRemaining(path)}</>
                        ) : (
                          'Complete Next Module'
                        )}
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
                    onClick={() => recordCourseActivity()}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">{course.title}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{course.provider}</p>
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
                      <Button variant="outline" size="sm">Start →</Button>
                    </div>
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Flame className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Current Streak</p>
                    <p className="text-2xl font-bold">{streakLoading ? '...' : `${streak?.current_streak || 0} days`}</p>
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
        </div>
      </div>

      {/* Quiz Dialog */}
      <ModuleQuizDialog
        open={quizOpen}
        onOpenChange={setQuizOpen}
        questions={quizQuestions}
        loading={quizLoading}
        pathTitle={activePath?.path_title || ''}
        moduleNumber={(activePath?.completed_modules || 0) + 1}
        skillName={activeSkillName}
        onPass={handleQuizPass}
        onRetry={handleQuizRetry}
      />
    </PageLayout>
  );
};

export default Learn;
