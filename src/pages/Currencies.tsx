import React from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Video, FileText, Mic, Target, Clock, Star } from 'lucide-react';

const Learn = () => {
  // AI-generated learning paths
  const learningPaths = [
    {
      title: 'Full-Stack Developer Path',
      description: 'Complete roadmap to become a full-stack developer',
      duration: '6 months',
      level: 'Intermediate',
      progress: 45,
      modules: 24,
      icon: Target,
    },
    {
      title: 'UI/UX Design Mastery',
      description: 'Master modern design principles and tools',
      duration: '4 months',
      level: 'Beginner',
      progress: 20,
      modules: 18,
      icon: Target,
    },
  ];

  // Recommended courses
  const recommendedCourses = [
    {
      title: 'Advanced React Patterns',
      provider: 'FreeCodeCamp',
      duration: '12 hours',
      rating: 4.8,
      type: 'Video',
    },
    {
      title: 'System Design Fundamentals',
      provider: 'Coursera',
      duration: '8 weeks',
      rating: 4.9,
      type: 'Course',
    },
    {
      title: 'TypeScript Deep Dive',
      provider: 'Udemy',
      duration: '15 hours',
      rating: 4.7,
      type: 'Video',
    },
  ];

  // Interview prep materials
  const interviewPrep = [
    { topic: 'Algorithms & Data Structures', completed: 15, total: 30 },
    { topic: 'System Design', completed: 5, total: 15 },
    { topic: 'Behavioral Questions', completed: 8, total: 20 },
    { topic: 'Mock Interviews', completed: 3, total: 10 },
  ];

  return (
    <PageLayout title="Learn">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
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
                    <Button className="w-full mt-3">Continue Learning</Button>
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
                Recommended Courses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recommendedCourses.map((course) => (
                  <div
                    key={course.title}
                    className="p-4 border rounded-lg hover:border-primary/50 transition-colors"
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
                      <Button variant="outline" size="sm">
                        Start
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Interview Prep Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="h-5 w-5 text-primary" />
                Interview Preparation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {interviewPrep.map((item) => (
                  <div key={item.topic}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium">{item.topic}</span>
                      <span className="text-muted-foreground">
                        {item.completed}/{item.total} completed
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-accent h-2 rounded-full transition-all"
                        style={{ width: `${(item.completed / item.total) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 mt-4">
                <Button variant="default" className="flex-1">
                  <Mic className="h-4 w-4 mr-2" />
                  Start Mock Interview
                </Button>
                <Button variant="outline" className="flex-1">
                  Practice Questions
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Learning Streak */}
          <Card>
            <CardHeader>
              <CardTitle>Learning Streak</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-5xl font-bold text-primary mb-2">🔥</div>
                <div className="text-3xl font-bold mb-1">24 Days</div>
                <p className="text-sm text-muted-foreground">Keep it going!</p>
              </div>
              <div className="grid grid-cols-7 gap-1 mt-4">
                {Array.from({ length: 28 }, (_, i) => (
                  <div
                    key={i}
                    className={`aspect-square rounded ${
                      i < 24
                        ? 'bg-primary'
                        : 'bg-muted'
                    }`}
                  />
                ))}
              </div>
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
              <Button variant="outline" className="w-full justify-start">
                <Video className="h-4 w-4 mr-2" />
                Watch Daily Lesson
              </Button>
              <Button variant="outline" className="w-full justify-start">
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
