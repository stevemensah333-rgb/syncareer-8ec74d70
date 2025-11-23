import React from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, TrendingDown, AlertCircle, Sparkles } from 'lucide-react';

const Analysis = () => {
  // Labour market predictions
  const skillDemandTrends = [
    { skill: 'AI/ML', demand: 95, growth: '+45%', trend: 'up' },
    { skill: 'Cloud (AWS/Azure)', demand: 92, growth: '+38%', trend: 'up' },
    { skill: 'Cybersecurity', demand: 88, growth: '+32%', trend: 'up' },
    { skill: 'React/Vue', demand: 85, growth: '+28%', trend: 'up' },
    { skill: 'Data Science', demand: 82, growth: '+25%', trend: 'up' },
    { skill: 'DevOps', demand: 78, growth: '+22%', trend: 'up' },
    { skill: 'UI/UX Design', demand: 75, growth: '+18%', trend: 'stable' },
    { skill: 'Mobile Dev', demand: 70, growth: '+15%', trend: 'stable' },
  ];

  // Predicted demand over next 12 months
  const demandForecast = Array.from({ length: 12 }, (_, i) => ({
    month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
    aiml: 70 + i * 2 + Math.random() * 5,
    cloud: 65 + i * 1.5 + Math.random() * 5,
    cyber: 60 + i * 1.8 + Math.random() * 5,
  }));

  // Job market insights
  const marketInsights = [
    {
      title: 'AI/ML Engineers in High Demand',
      description: 'Demand expected to grow 45% in the next 6 months',
      category: 'Hot',
      icon: TrendingUp,
    },
    {
      title: 'Cloud Skills Critical',
      description: 'AWS and Azure certifications seeing 38% growth',
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
      description: 'Entry-level positions require more diverse skills',
      category: 'Alert',
      icon: AlertCircle,
    },
  ];

  // Salary trends by skill
  const salaryData = [
    { skill: 'AI/ML', avgSalary: 95 },
    { skill: 'Cloud', avgSalary: 88 },
    { skill: 'Full-Stack', avgSalary: 75 },
    { skill: 'Frontend', avgSalary: 68 },
    { skill: 'UI/UX', avgSalary: 65 },
  ];

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
              <CardTitle>Skill Demand Forecast (Next 12 Months)</CardTitle>
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
                      dataKey="aiml"
                      name="AI/ML"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="cloud"
                      name="Cloud"
                      stroke="hsl(var(--accent))"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="cyber"
                      name="Cybersecurity"
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

        {/* Career Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle>Recommended Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <p className="text-sm font-medium mb-1">📚 Learn AI/ML Basics</p>
              <p className="text-xs text-muted-foreground">
                High demand with 45% growth predicted
              </p>
            </div>
            <div className="p-3 bg-accent/10 rounded-lg">
              <p className="text-sm font-medium mb-1">☁️ Get Cloud Certified</p>
              <p className="text-xs text-muted-foreground">
                AWS certification opens 300+ opportunities
              </p>
            </div>
            <div className="p-3 bg-secondary/10 rounded-lg">
              <p className="text-sm font-medium mb-1">🔒 Add Security Skills</p>
              <p className="text-xs text-muted-foreground">
                Cybersecurity seeing 32% growth
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default Analysis;
