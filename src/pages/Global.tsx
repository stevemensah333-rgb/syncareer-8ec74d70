import React from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Globe, Trophy, TrendingUp, Star, Award } from 'lucide-react';

const Global = () => {
  // Global leaderboard
  const globalLeaders = [
    {
      rank: 1,
      name: 'Sarah Johnson',
      country: 'United States',
      skillScore: 2850,
      avatar: 'SJ',
      badge: '🏆',
      specialty: 'Full-Stack Dev',
    },
    {
      rank: 2,
      name: 'Mike Chen',
      country: 'China',
      skillScore: 2720,
      avatar: 'MC',
      badge: '🥈',
      specialty: 'AI/ML Engineer',
    },
    {
      rank: 3,
      name: 'Emma Wilson',
      country: 'United Kingdom',
      skillScore: 2680,
      avatar: 'EW',
      badge: '🥉',
      specialty: 'UI/UX Designer',
    },
    {
      rank: 4,
      name: 'Carlos Rodriguez',
      country: 'Spain',
      skillScore: 2640,
      avatar: 'CR',
      badge: '4️⃣',
      specialty: 'DevOps Engineer',
    },
    {
      rank: 5,
      name: 'Priya Patel',
      country: 'India',
      skillScore: 2590,
      avatar: 'PP',
      badge: '5️⃣',
      specialty: 'Data Scientist',
    },
  ];

  // Top portfolios globally
  const topPortfolios = [
    {
      user: 'Jordan Lee',
      project: 'AI-Powered Job Matcher',
      views: 15420,
      rating: 4.9,
      country: 'Canada',
    },
    {
      user: 'Alex Kumar',
      project: 'Real-Time Collaboration Tool',
      views: 12380,
      rating: 4.8,
      country: 'India',
    },
    {
      user: 'Maria Chen',
      project: 'Sustainable E-Commerce Platform',
      views: 11250,
      rating: 4.9,
      country: 'Brazil',
    },
  ];

  // Regional stats
  const regionalStats = [
    { region: 'North America', users: '45.2K', avgScore: 1820, growth: '+12%' },
    { region: 'Europe', users: '38.7K', avgScore: 1765, growth: '+15%' },
    { region: 'Asia-Pacific', users: '62.3K', avgScore: 1790, growth: '+22%' },
    { region: 'Latin America', users: '18.5K', avgScore: 1650, growth: '+18%' },
    { region: 'Africa', users: '12.1K', avgScore: 1580, growth: '+25%' },
  ];

  // Trending skills globally
  const trendingSkills = [
    { skill: 'AI/ML', users: '125K', growth: '+45%' },
    { skill: 'Cloud Computing', users: '98K', growth: '+38%' },
    { skill: 'Cybersecurity', users: '87K', growth: '+32%' },
    { skill: 'React/Next.js', users: '156K', growth: '+28%' },
  ];

  return (
    <PageLayout title="Global">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Global Overview Banner */}
        <div className="lg:col-span-3">
          <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Globe className="h-12 w-12 text-primary" />
                <div>
                  <h3 className="text-xl font-bold">Global Syncareer Network</h3>
                  <p className="text-muted-foreground">
                    <span className="font-bold">176,800</span> learners worldwide •{' '}
                    <span className="font-bold">420+</span> countries •{' '}
                    <span className="font-bold">1.2M+</span> projects completed
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Global Leaderboard */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                Global Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {globalLeaders.map((leader) => (
                <div
                  key={leader.rank}
                  className="flex items-center gap-3 p-3 border rounded-lg hover:border-primary/50 transition-colors"
                >
                  <div className="text-2xl">{leader.badge}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{leader.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {leader.country}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {leader.specialty}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-primary">
                      {leader.skillScore.toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">SkillScore</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Regional Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Regional Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {regionalStats.map((stat) => (
              <div key={stat.region} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{stat.region}</span>
                  <Badge variant="secondary" className="text-xs">
                    {stat.growth}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{stat.users} users</span>
                  <span>Avg: {stat.avgScore}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Top Portfolios */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-primary" />
                Featured Global Portfolios
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {topPortfolios.map((portfolio) => (
                <div
                  key={portfolio.project}
                  className="p-4 border rounded-lg hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold">{portfolio.project}</h4>
                      <p className="text-sm text-muted-foreground">
                        by {portfolio.user}
                      </p>
                    </div>
                    <Badge variant="outline">{portfolio.country}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4" />
                      {portfolio.views.toLocaleString()} views
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                      {portfolio.rating}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Trending Skills */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Trending Skills
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {trendingSkills.map((skill) => (
              <div
                key={skill.skill}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div>
                  <p className="font-medium">{skill.skill}</p>
                  <p className="text-xs text-muted-foreground">
                    {skill.users} learning
                  </p>
                </div>
                <Badge className="bg-primary text-primary-foreground">
                  {skill.growth}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Your Global Rank */}
        <Card className="bg-primary text-primary-foreground">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Your Global Rank
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">#1,247</div>
              <p className="opacity-90 mb-4">
                You're in the top 1% globally!
              </p>
              <p className="text-sm opacity-80">
                Keep learning to climb higher 🚀
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default Global;
