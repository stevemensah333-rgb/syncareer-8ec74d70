import React from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, Award, Target, Zap } from 'lucide-react';

const Performance = () => {
  // Skill growth over time
  const skillGrowthData = Array.from({ length: 6 }, (_, i) => ({
    month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][i],
    skillScore: 1200 + i * 100 + Math.random() * 50,
    projectsCompleted: 2 + i * 1,
  }));

  // Skill category breakdown
  const categoryData = [
    { category: 'Frontend', score: 85 },
    { category: 'Backend', score: 65 },
    { category: 'Design', score: 72 },
    { category: 'DevOps', score: 45 },
  ];

  // Monthly achievements
  const achievements = [
    { month: 'Jan', badges: 2, endorsements: 12, projects: 3 },
    { month: 'Feb', badges: 3, endorsements: 18, projects: 4 },
    { month: 'Mar', badges: 1, endorsements: 15, projects: 2 },
    { month: 'Apr', badges: 4, endorsements: 22, projects: 5 },
    { month: 'May', badges: 2, endorsements: 19, projects: 3 },
    { month: 'Jun', badges: 3, endorsements: 25, projects: 4 },
  ];

  return (
    <PageLayout title="Performance">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Charts */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                SkillScore Growth (Last 6 Months)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={skillGrowthData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="skillScore"
                      name="SkillScore"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ r: 6 }}
                      activeDot={{ r: 8 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="projectsCompleted"
                      name="Projects"
                      stroke="hsl(var(--accent))"
                      strokeWidth={2}
                      dot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Summary */}
        <Card>
          <CardHeader>
            <CardTitle>This Month</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                <span className="text-sm">SkillScore Gain</span>
              </div>
              <span className="text-lg font-bold text-primary">+124</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-accent" />
                <span className="text-sm">Projects Completed</span>
              </div>
              <span className="text-lg font-bold">4</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-secondary" />
                <span className="text-sm">New Skills</span>
              </div>
              <span className="text-lg font-bold">3</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <span className="text-sm">Rank Improvement</span>
              </div>
              <span className="text-lg font-bold text-green-500">↑ 15%</span>
            </div>
          </CardContent>
        </Card>

        {/* Skill Category Breakdown */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Skill Proficiency by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="score" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Achievements */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={achievements}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="endorsements"
                      name="Endorsements"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="projects"
                      name="Projects"
                      stroke="hsl(var(--accent))"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="badges"
                      name="Badges"
                      stroke="hsl(var(--secondary))"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Insights */}
        <Card>
          <CardHeader>
            <CardTitle>Progress Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <p className="text-sm font-medium mb-1">🎯 You're on track!</p>
              <p className="text-xs text-muted-foreground">
                You've completed 67% of your monthly learning goals.
              </p>
            </div>
            <div className="p-3 bg-accent/10 rounded-lg">
              <p className="text-sm font-medium mb-1">⚡ Rising Fast</p>
              <p className="text-xs text-muted-foreground">
                Your SkillScore is growing 20% faster than average.
              </p>
            </div>
            <div className="p-3 bg-secondary/10 rounded-lg">
              <p className="text-sm font-medium mb-1">🏆 Top Performer</p>
              <p className="text-xs text-muted-foreground">
                You're in the top 15% of users in your network.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Skill Level Progress */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Skill Level Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { skill: 'React', current: 'Advanced', next: 'Expert', progress: 75 },
                { skill: 'TypeScript', current: 'Advanced', next: 'Expert', progress: 60 },
                { skill: 'UI/UX', current: 'Intermediate', next: 'Advanced', progress: 45 },
                { skill: 'Node.js', current: 'Intermediate', next: 'Advanced', progress: 30 },
              ].map((item) => (
                <div key={item.skill}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium">{item.skill}</span>
                    <span className="text-muted-foreground">
                      {item.current} → {item.next}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-right mt-1 text-muted-foreground">
                    {item.progress}% to next level
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
};

export default Performance;
