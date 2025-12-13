import React from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, TrendingDown, AlertCircle, Sparkles, GraduationCap } from 'lucide-react';
import { useUserProfile } from '@/contexts/UserProfileContext';
import { getMajorContent } from '@/utils/majorContent';

const Analysis = () => {
  const { studentDetails, loading } = useUserProfile();
  const majorContent = getMajorContent(studentDetails?.major);
  const userMajor = studentDetails?.major || 'your field';

  // Labour market predictions - personalized based on major
  const skillDemandTrends = majorContent.skills.slice(0, 8).map((skill, idx) => ({
    skill,
    demand: 95 - idx * 3,
    growth: majorContent.jobTrends[Math.min(idx, majorContent.jobTrends.length - 1)]?.growth || '+15%',
    trend: idx < 6 ? 'up' : 'stable',
  }));

  // Predicted demand over next 12 months
  const demandForecast = Array.from({ length: 12 }, (_, i) => ({
    month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
    primary: 70 + i * 2 + Math.random() * 5,
    secondary: 65 + i * 1.5 + Math.random() * 5,
    tertiary: 60 + i * 1.8 + Math.random() * 5,
  }));

  // Job market insights - personalized
  const marketInsights = [
    {
      title: `${majorContent.jobTrends[0]?.title || 'Professionals'} in High Demand`,
      description: `Demand expected to grow ${majorContent.jobTrends[0]?.growth || '+20%'} in the next 6 months`,
      category: 'Hot',
      icon: TrendingUp,
    },
    {
      title: `${majorContent.skills[0]} Skills Critical`,
      description: `${majorContent.skills[0]} expertise seeing strong growth`,
      category: 'Growing',
      icon: TrendingUp,
    },
    {
      title: 'Remote Work Increasing',
      description: '67% of new job postings offer remote options',
      category: 'Trend',
      icon: Sparkles,
    },
    {
      title: 'Skills Gap Widening',
      description: `Entry-level ${userMajor} positions require more diverse skills`,
      category: 'Alert',
      icon: AlertCircle,
    },
  ];

  // Salary trends by skill - personalized
  const salaryData = majorContent.skills.slice(0, 5).map((skill, idx) => ({
    skill: skill.length > 12 ? skill.substring(0, 10) + '...' : skill,
    avgSalary: 95 - idx * 8,
  }));

  if (loading) {
    return (
      <PageLayout title="Market Analysis">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading personalized market analysis...</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Market Analysis">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Predictions Banner */}
        <div className="lg:col-span-3">
          <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Sparkles className="h-12 w-12 text-primary" />
                <div>
                  <h3 className="text-xl font-bold">AI-Powered Labour Market Predictions</h3>
                  <p className="text-muted-foreground">
                    Real-time analysis of job market trends, skill demands, and career opportunities
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Skills in Demand */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Skills in High Demand (Next 12 Months)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {skillDemandTrends.map((item) => (
                <div key={item.skill} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{item.skill}</span>
                      {item.trend === 'up' ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <Badge
                      variant={item.demand > 85 ? 'default' : 'secondary'}
                      className={item.demand > 85 ? 'bg-primary' : ''}
                    >
                      {item.growth}
                    </Badge>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        item.demand > 85 ? 'bg-primary' : 'bg-accent'
                      }`}
                      style={{ width: `${item.demand}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Market Insights */}
        <Card>
          <CardHeader>
            <CardTitle>Market Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {marketInsights.map((insight) => {
              const Icon = insight.icon;
              return (
                <div key={insight.title} className="p-3 border rounded-lg">
                  <div className="flex items-start gap-2 mb-2">
                    <Icon className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-sm">{insight.title}</h4>
                        <Badge variant="outline" className="text-xs">
                          {insight.category}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {insight.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Demand Forecast Chart */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Skill Demand Forecast (Next 12 Months)
                {studentDetails?.major && (
                  <Badge variant="outline" className="ml-2">
                    <GraduationCap className="h-3 w-3 mr-1" />
                    {studentDetails.major}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={demandForecast}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="primary"
                      name={majorContent.skills[0] || 'Primary Skill'}
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="secondary"
                      name={majorContent.skills[1] || 'Secondary Skill'}
                      stroke="hsl(var(--accent))"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="tertiary"
                      name={majorContent.skills[2] || 'Tertiary Skill'}
                      stroke="hsl(var(--secondary))"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Salary Trends */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Average Salary by Skill (Entry Level, $K)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salaryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="skill" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="avgSalary" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Career Recommendations - Personalized */}
        <Card>
          <CardHeader>
            <CardTitle>Recommended Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {majorContent.suggestedCourses.slice(0, 3).map((course, idx) => (
              <div key={idx} className={`p-3 rounded-lg ${idx === 0 ? 'bg-primary/10' : idx === 1 ? 'bg-accent/10' : 'bg-secondary/10'}`}>
                <p className="text-sm font-medium mb-1">
                  {idx === 0 ? '📚' : idx === 1 ? '☁️' : '🔒'} {course}
                </p>
                <p className="text-xs text-muted-foreground">
                  {majorContent.jobTrends[idx]?.growth || '+15%'} growth in demand
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default Analysis;
