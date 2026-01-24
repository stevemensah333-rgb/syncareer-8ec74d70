import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users, Star, MapPin, GraduationCap, Briefcase, Target } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const TalentInsights = () => {
  // Mock data for talent insights
  const topSkillsData = [
    { skill: 'React', candidates: 2450, growth: '+18%' },
    { skill: 'Python', candidates: 2120, growth: '+22%' },
    { skill: 'Data Analysis', candidates: 1890, growth: '+25%' },
    { skill: 'JavaScript', candidates: 1750, growth: '+12%' },
    { skill: 'Machine Learning', candidates: 1420, growth: '+35%' },
    { skill: 'UI/UX Design', candidates: 1280, growth: '+15%' },
  ];

  const talentTrendData = [
    { month: 'Jul', candidates: 1200 },
    { month: 'Aug', candidates: 1350 },
    { month: 'Sep', candidates: 1480 },
    { month: 'Oct', candidates: 1620 },
    { month: 'Nov', candidates: 1890 },
    { month: 'Dec', candidates: 2100 },
    { month: 'Jan', candidates: 2450 },
  ];

  const experienceLevelData = [
    { name: 'Entry Level', value: 35, color: 'hsl(var(--primary))' },
    { name: 'Mid Level', value: 40, color: 'hsl(var(--accent))' },
    { name: 'Senior', value: 20, color: 'hsl(var(--muted))' },
    { name: 'Executive', value: 5, color: 'hsl(var(--secondary))' },
  ];

  const topLocations = [
    { city: 'Lagos', candidates: 4500, percentage: 35 },
    { city: 'Nairobi', candidates: 2800, percentage: 22 },
    { city: 'Accra', candidates: 2100, percentage: 16 },
    { city: 'Johannesburg', candidates: 1900, percentage: 15 },
    { city: 'Cairo', candidates: 1500, percentage: 12 },
  ];

  const featuredCandidates = [
    { name: 'Sarah K.', skill: 'Full Stack Developer', match: 95, school: 'University of Lagos' },
    { name: 'James M.', skill: 'Data Scientist', match: 92, school: 'Kenyatta University' },
    { name: 'Amina O.', skill: 'UI/UX Designer', match: 90, school: 'University of Ghana' },
    { name: 'David T.', skill: 'Machine Learning', match: 88, school: 'UCT' },
  ];

  return (
    <PageLayout title="Talent Insights">
      <div className="space-y-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Candidates</p>
                  <p className="text-2xl font-bold">12,847</p>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
              <p className="text-xs text-green-500 mt-2">+15% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg. Match Rate</p>
                  <p className="text-2xl font-bold">78.5%</p>
                </div>
                <Star className="h-8 w-8 text-primary" />
              </div>
              <p className="text-xs text-green-500 mt-2">+3.2% improvement</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Job Seekers</p>
                  <p className="text-2xl font-bold">8,432</p>
                </div>
                <Target className="h-8 w-8 text-primary" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">Looking for opportunities</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">New This Week</p>
                  <p className="text-2xl font-bold">847</p>
                </div>
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
              <p className="text-xs text-green-500 mt-2">+28% from last week</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Talent Growth Trend */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Talent Pool Growth
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={talentTrendData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="candidates" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Experience Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Experience Levels
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={experienceLevelData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {experienceLevelData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {experienceLevelData.map((level) => (
                  <div key={level.name} className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: level.color }} />
                    <span className="text-xs">{level.name}: {level.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Skills in Demand */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Most Featured Skills
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topSkillsData.map((item) => (
                  <div key={item.skill} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{item.skill}</span>
                        <Badge variant="secondary" className="text-green-600">
                          {item.growth}
                        </Badge>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${(item.candidates / 2500) * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {item.candidates.toLocaleString()} candidates
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Locations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Top Talent Locations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topLocations.map((location, idx) => (
                  <div key={location.city} className="flex items-center gap-4">
                    <span className="text-lg font-bold text-muted-foreground w-6">
                      #{idx + 1}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{location.city}</span>
                        <span className="text-sm text-muted-foreground">
                          {location.percentage}%
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${location.percentage}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {location.candidates.toLocaleString()} candidates
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Featured Candidates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Top Rated Job Seekers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {featuredCandidates.map((candidate) => (
                <div key={candidate.name} className="p-4 border rounded-lg hover:border-primary transition-colors">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="font-bold text-primary">
                        {candidate.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{candidate.name}</p>
                      <p className="text-xs text-muted-foreground">{candidate.skill}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Match</span>
                      <Badge variant="secondary">{candidate.match}%</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <GraduationCap className="h-3 w-3" />
                      {candidate.school}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default TalentInsights;
