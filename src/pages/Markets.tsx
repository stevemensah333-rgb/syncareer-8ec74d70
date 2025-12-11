import React from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Briefcase, Users, Zap, MapPin, Clock, DollarSign, TrendingUp } from 'lucide-react';
import { useUserProfile } from '@/contexts/UserProfileContext';
import { getMajorContent } from '@/utils/majorContent';

const Opportunities = () => {
  const { studentDetails, loading } = useUserProfile();
  const majorContent = getMajorContent(studentDetails?.major);

  // Generate job matches based on major
  const getJobMatches = () => {
    const jobTrends = majorContent.jobTrends;
    const skills = majorContent.skills;

    return jobTrends.map((trend, index) => ({
      title: trend.title,
      company: ['TechStart Inc.', 'Innovation Labs', 'Global Solutions', 'NextGen Corp'][index % 4],
      location: ['Remote', 'Johannesburg', 'Cape Town', 'Hybrid'][index % 4],
      type: index === 2 ? 'Internship' : 'Full-time',
      match: [94, 87, 91, 85][index % 4],
      salary: trend.demand === 'Very High' ? 'R45k - R65k' : trend.demand === 'High' ? 'R35k - R50k' : 'R25k - R40k',
      posted: ['2 days ago', '1 week ago', '3 days ago', '5 days ago'][index % 4],
      skills: skills.slice(index, index + 3),
    }));
  };

  // Generate micro-tasks based on major
  const getMicroTasks = () => {
    const major = studentDetails?.major;

    if (major === 'Computer Science' || major === 'Data Science' || major === 'Information Technology') {
      return [
        { title: 'Build Landing Page', duration: '3 days', pay: 'R2,500', company: 'Local Startup', difficulty: 'Easy' },
        { title: 'API Integration', duration: '5 days', pay: 'R4,000', company: 'E-commerce Store', difficulty: 'Medium' },
        { title: 'Database Optimization', duration: '2 days', pay: 'R3,000', company: 'SaaS Company', difficulty: 'Medium' },
      ];
    } else if (major === 'Business Administration' || major === 'Finance' || major === 'Marketing') {
      return [
        { title: 'Market Research Report', duration: '4 days', pay: 'R2,000', company: 'Consulting Firm', difficulty: 'Easy' },
        { title: 'Financial Analysis', duration: '3 days', pay: 'R3,500', company: 'Investment Firm', difficulty: 'Medium' },
        { title: 'Business Plan Review', duration: '5 days', pay: 'R4,000', company: 'Startup Incubator', difficulty: 'Medium' },
      ];
    } else if (major === 'Law') {
      return [
        { title: 'Contract Review', duration: '2 days', pay: 'R3,000', company: 'Law Firm', difficulty: 'Medium' },
        { title: 'Legal Research', duration: '4 days', pay: 'R2,500', company: 'Corporate Office', difficulty: 'Easy' },
        { title: 'Compliance Audit Support', duration: '5 days', pay: 'R4,500', company: 'Financial Services', difficulty: 'Medium' },
      ];
    } else if (major === 'Graphic Design' || major === 'Communications') {
      return [
        { title: 'Logo Design', duration: '3 days', pay: 'R2,000', company: 'New Restaurant', difficulty: 'Easy' },
        { title: 'Social Media Campaign', duration: '5 days', pay: 'R3,500', company: 'Fashion Brand', difficulty: 'Medium' },
        { title: 'Brand Identity Package', duration: '7 days', pay: 'R5,000', company: 'Tech Startup', difficulty: 'Medium' },
      ];
    } else if (major === 'Electrical Engineering' || major === 'Mechanical Engineering') {
      return [
        { title: 'CAD Drawing Review', duration: '2 days', pay: 'R2,500', company: 'Manufacturing Co', difficulty: 'Easy' },
        { title: 'Technical Documentation', duration: '4 days', pay: 'R3,500', company: 'Engineering Firm', difficulty: 'Medium' },
        { title: 'Quality Control Analysis', duration: '3 days', pay: 'R3,000', company: 'Auto Parts Supplier', difficulty: 'Medium' },
      ];
    }

    return [
      { title: 'Research Project', duration: '4 days', pay: 'R2,000', company: 'Research Institute', difficulty: 'Easy' },
      { title: 'Data Entry & Analysis', duration: '3 days', pay: 'R1,500', company: 'Local Business', difficulty: 'Easy' },
      { title: 'Report Writing', duration: '5 days', pay: 'R2,500', company: 'Consulting Firm', difficulty: 'Medium' },
    ];
  };

  // Generate local business opportunities based on major
  const getLocalBusinesses = () => {
    const major = studentDetails?.major;

    if (major === 'Computer Science' || major === 'Data Science' || major === 'Information Technology') {
      return [
        { name: 'Green Coffee Shop', needs: ['Website Redesign', 'POS Integration'], budget: 'R8,000-R15,000', type: 'Project' },
        { name: 'Local Gym', needs: ['Member App', 'Booking System'], budget: 'R15,000-R25,000', type: 'Project' },
      ];
    } else if (major === 'Business Administration' || major === 'Finance') {
      return [
        { name: 'Family Restaurant', needs: ['Business Plan', 'Financial Forecasting'], budget: 'R5,000-R10,000', type: 'Consulting' },
        { name: 'Retail Store', needs: ['Inventory Management', 'Growth Strategy'], budget: 'R8,000-R15,000', type: 'Part-time' },
      ];
    } else if (major === 'Marketing' || major === 'Communications') {
      return [
        { name: 'Boutique Hotel', needs: ['Digital Marketing', 'Brand Strategy'], budget: 'R10,000-R20,000', type: 'Project' },
        { name: 'Local Bakery', needs: ['Social Media Management', 'Content Creation'], budget: 'R5,000-R8,000', type: 'Part-time' },
      ];
    } else if (major === 'Law') {
      return [
        { name: 'Small Business Alliance', needs: ['Contract Templates', 'Legal Consultation'], budget: 'R8,000-R12,000', type: 'Consulting' },
        { name: 'Property Management Co', needs: ['Lease Review', 'Compliance Check'], budget: 'R6,000-R10,000', type: 'Project' },
      ];
    }

    return [
      { name: 'Community Center', needs: ['Admin Support', 'Project Coordination'], budget: 'R4,000-R8,000', type: 'Part-time' },
      { name: 'Local NGO', needs: ['Research', 'Report Writing'], budget: 'R5,000-R10,000', type: 'Project' },
    ];
  };

  const jobMatches = getJobMatches();
  const microTasks = getMicroTasks();
  const localBusinesses = getLocalBusinesses();

  if (loading) {
    return (
      <PageLayout title="Opportunities">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading opportunities...</p>
        </div>
      </PageLayout>
    );
  }

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
                  <h3 className="text-xl font-bold">
                    {studentDetails?.major ? `${studentDetails.major} Opportunities` : 'Your Match Score'}
                  </h3>
                  <p className="text-muted-foreground">
                    Based on your skills, we've found <span className="font-bold text-primary">{jobMatches.length} perfect matches</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4">
            {jobMatches.map((job, index) => (
              <Card key={`${job.title}-${index}`} className="hover:border-primary/50 transition-colors">
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
                  <h3 className="text-xl font-bold">Quick Gigs for {studentDetails?.major || 'Your Field'}</h3>
                  <p className="text-muted-foreground">
                    Build your portfolio while earning. Complete tasks in 1-7 days.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-4">
            {microTasks.map((task) => (
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
                    Help businesses in your community while building real-world experience in {studentDetails?.major || 'your field'}.
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
