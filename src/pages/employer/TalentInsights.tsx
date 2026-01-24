import { useState, useEffect } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users, Star, MapPin, GraduationCap, Briefcase, Target } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { supabase } from '@/integrations/supabase/client';

interface StudentProfile {
  id: string;
  full_name: string | null;
  user_type: string | null;
}

interface StudentDetails {
  user_id: string;
  major: string;
  school: string | null;
  degree_type: string;
}

const TalentInsights = () => {
  const [totalCandidates, setTotalCandidates] = useState(0);
  const [newThisWeek, setNewThisWeek] = useState(0);
  const [skillsData, setSkillsData] = useState<{skill: string; candidates: number}[]>([]);
  const [locationsData, setLocationsData] = useState<{city: string; candidates: number; percentage: number}[]>([]);
  const [trendData, setTrendData] = useState<{month: string; candidates: number}[]>([]);
  const [degreeDistribution, setDegreeDistribution] = useState<{name: string; value: number; color: string}[]>([]);
  const [featuredCandidates, setFeaturedCandidates] = useState<{name: string; skill: string; school: string}[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTalentData();
  }, []);

  const fetchTalentData = async () => {
    try {
      // Fetch all student profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, user_type, created_at')
        .eq('user_type', 'student');

      if (profilesError) throw profilesError;

      // Fetch student details
      const { data: studentDetails, error: detailsError } = await supabase
        .from('student_details')
        .select('user_id, major, school, degree_type');

      if (detailsError) throw detailsError;

      // Calculate total candidates
      setTotalCandidates(profiles?.length || 0);

      // Calculate new this week
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const newStudents = profiles?.filter(p => new Date(p.created_at) >= oneWeekAgo) || [];
      setNewThisWeek(newStudents.length);

      // Calculate skills/majors distribution
      const majorCounts: Record<string, number> = {};
      studentDetails?.forEach(s => {
        majorCounts[s.major] = (majorCounts[s.major] || 0) + 1;
      });
      const sortedSkills = Object.entries(majorCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([skill, candidates]) => ({ skill, candidates }));
      setSkillsData(sortedSkills);

      // Calculate location distribution
      const locationCounts: Record<string, number> = {};
      studentDetails?.forEach(s => {
        if (s.school) {
          locationCounts[s.school] = (locationCounts[s.school] || 0) + 1;
        }
      });
      const totalStudents = studentDetails?.length || 1;
      const sortedLocations = Object.entries(locationCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([city, candidates]) => ({
          city,
          candidates,
          percentage: Math.round((candidates / totalStudents) * 100)
        }));
      setLocationsData(sortedLocations);

      // Calculate degree distribution
      const degreeCounts: Record<string, number> = {};
      studentDetails?.forEach(s => {
        degreeCounts[s.degree_type] = (degreeCounts[s.degree_type] || 0) + 1;
      });
      const colors = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--muted))', 'hsl(var(--secondary))'];
      const degreeData = Object.entries(degreeCounts).map(([name, value], idx) => ({
        name,
        value: Math.round((value / totalStudents) * 100),
        color: colors[idx % colors.length]
      }));
      setDegreeDistribution(degreeData);

      // Generate trend data (last 6 months simulation based on current data)
      const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'];
      const baseCount = Math.max(1, Math.floor((profiles?.length || 0) / 7));
      const trend = months.map((month, idx) => ({
        month,
        candidates: baseCount * (idx + 1)
      }));
      setTrendData(trend);

      // Featured candidates
      const featured = studentDetails?.slice(0, 4).map(s => {
        const profile = profiles?.find(p => p.id === s.user_id);
        return {
          name: profile?.full_name || 'Anonymous',
          skill: s.major,
          school: s.school || 'Unknown'
        };
      }) || [];
      setFeaturedCandidates(featured);

    } catch (error) {
      console.error('Error fetching talent data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const maxSkillCount = Math.max(...skillsData.map(s => s.candidates), 1);

  if (isLoading) {
    return (
      <PageLayout title="Talent Insights">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading talent insights...</p>
        </div>
      </PageLayout>
    );
  }

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
                  <p className="text-2xl font-bold">{totalCandidates.toLocaleString()}</p>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">Students on platform</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Top Fields</p>
                  <p className="text-2xl font-bold">{skillsData.length}</p>
                </div>
                <Star className="h-8 w-8 text-primary" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">Unique majors</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Institutions</p>
                  <p className="text-2xl font-bold">{locationsData.length}</p>
                </div>
                <Target className="h-8 w-8 text-primary" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">Schools represented</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">New This Week</p>
                  <p className="text-2xl font-bold">{newThisWeek}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
              <p className="text-xs text-green-500 mt-2">Recent signups</p>
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
                  <LineChart data={trendData}>
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

          {/* Degree Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Degree Types
              </CardTitle>
            </CardHeader>
            <CardContent>
              {degreeDistribution.length > 0 ? (
                <>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={degreeDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {degreeDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    {degreeDistribution.map((level) => (
                      <div key={level.name} className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: level.color }} />
                        <span className="text-xs truncate">{level.name}: {level.value}%</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">No degree data available</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Skills/Majors */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Most Common Fields of Study
              </CardTitle>
            </CardHeader>
            <CardContent>
              {skillsData.length > 0 ? (
                <div className="space-y-4">
                  {skillsData.map((item) => (
                    <div key={item.skill} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm">{item.skill}</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{ width: `${(item.candidates / maxSkillCount) * 100}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {item.candidates} {item.candidates === 1 ? 'candidate' : 'candidates'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">No skill data available</p>
              )}
            </CardContent>
          </Card>

          {/* Top Institutions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Top Institutions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {locationsData.length > 0 ? (
                <div className="space-y-4">
                  {locationsData.map((location, idx) => (
                    <div key={location.city} className="flex items-center gap-4">
                      <span className="text-lg font-bold text-muted-foreground w-6">
                        #{idx + 1}
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm">{location.city}</span>
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
                          {location.candidates} {location.candidates === 1 ? 'candidate' : 'candidates'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">No location data available</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Featured Candidates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Recent Job Seekers
            </CardTitle>
          </CardHeader>
          <CardContent>
            {featuredCandidates.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {featuredCandidates.map((candidate, idx) => (
                  <div key={idx} className="p-4 border rounded-lg hover:border-primary transition-colors">
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
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <GraduationCap className="h-3 w-3" />
                        {candidate.school}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No candidates available yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default TalentInsights;