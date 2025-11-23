import React from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Briefcase, Users, Zap, MapPin, Clock, DollarSign, TrendingUp } from 'lucide-react';

const Opportunities = () => {
  // Job matches
  const jobMatches = [
    {
      title: 'Frontend Developer',
      company: 'TechStart Inc.',
      location: 'Remote',
      type: 'Full-time',
      match: 94,
      salary: '$60k - $80k',
      posted: '2 days ago',
      skills: ['React', 'TypeScript', 'CSS'],
    },
    {
      title: 'Junior UI/UX Designer',
      company: 'Creative Studio',
      location: 'New York, NY',
      type: 'Full-time',
      match: 87,
      salary: '$50k - $65k',
      posted: '1 week ago',
      skills: ['Figma', 'UI Design', 'Prototyping'],
    },
    {
      title: 'React Developer Intern',
      company: 'StartupXYZ',
      location: 'Hybrid',
      type: 'Internship',
      match: 91,
      salary: '$20/hr',
      posted: '3 days ago',
      skills: ['React', 'JavaScript', 'Git'],
    },
  ];

  // Micro-internships
  const microInternships = [
    {
      title: 'Build Landing Page',
      duration: '3 days',
      pay: '$150',
      company: 'Local Bakery',
      difficulty: 'Easy',
    },
    {
      title: 'Design Social Media Kit',
      duration: '5 days',
      pay: '$200',
      company: 'Fashion Boutique',
      difficulty: 'Medium',
    },
    {
      title: 'API Integration Task',
      duration: '2 days',
      pay: '$180',
      company: 'SaaS Startup',
      difficulty: 'Medium',
    },
  ];

  // Local businesses
  const localBusinesses = [
    {
      name: 'Green Coffee Shop',
      needs: ['Website Redesign', 'Social Media Management'],
      budget: '$500-$1000',
      type: 'Part-time',
    },
    {
      name: 'Tech Repair Store',
      needs: ['Inventory System', 'Mobile App'],
      budget: '$1000-$2000',
      type: 'Project',
    },
  ];

  return (
    <PageLayout title="Opportunities">
      <Tabs defaultValue="jobs" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="jobs">Job Matches</TabsTrigger>
          <TabsTrigger value="micro">Micro-Tasks</TabsTrigger>
          <TabsTrigger value="local">Local Businesses</TabsTrigger>
        </TabsList>

        <TabsContent value="jobs" className="space-y-4">
          <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <TrendingUp className="h-12 w-12 text-primary" />
                <div>
                  <h3 className="text-xl font-bold">Your Match Score</h3>
                  <p className="text-muted-foreground">
                    Based on your skills, we've found <span className="font-bold text-primary">12 perfect matches</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4">
            {jobMatches.map((job) => (
              <Card key={job.title} className="hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1">{job.title}</CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="font-medium">{job.company}</span>
                        <span>•</span>
                        <MapPin className="h-3 w-3" />
                        <span>{job.location}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-primary text-primary-foreground">
                        {job.match}% Match
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {job.skills.map((skill) => (
                        <Badge key={skill} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4 text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Briefcase className="h-4 w-4" />
                          {job.type}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          {job.salary}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {job.posted}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button className="flex-1">Quick Apply</Button>
                      <Button variant="outline">Learn More</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="micro" className="space-y-4">
          <Card className="bg-gradient-to-br from-accent/10 to-secondary/10">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Zap className="h-12 w-12 text-accent" />
                <div>
                  <h3 className="text-xl font-bold">Quick Gigs</h3>
                  <p className="text-muted-foreground">
                    Build your portfolio while earning. Complete tasks in 1-5 days.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-4">
            {microInternships.map((task) => (
              <Card key={task.title}>
                <CardHeader>
                  <CardTitle className="text-base">{task.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{task.company}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Badge variant="outline">{task.difficulty}</Badge>
                    <span className="text-lg font-bold text-primary">{task.pay}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{task.duration}</span>
                  </div>
                  <Button className="w-full">Apply Now</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="local" className="space-y-4">
          <Card className="bg-gradient-to-br from-secondary/10 to-primary/10">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Users className="h-12 w-12 text-secondary" />
                <div>
                  <h3 className="text-xl font-bold">Support Local Businesses</h3>
                  <p className="text-muted-foreground">
                    Help businesses in your community while building real-world experience.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4">
            {localBusinesses.map((business) => (
              <Card key={business.name}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{business.name}</CardTitle>
                      <Badge variant="secondary" className="mt-2">{business.type}</Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Budget</p>
                      <p className="font-bold">{business.budget}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-2">What they need:</p>
                    <div className="flex flex-wrap gap-2">
                      {business.needs.map((need) => (
                        <Badge key={need} variant="outline">
                          {need}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button className="w-full">Express Interest</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
};

export default Opportunities;
