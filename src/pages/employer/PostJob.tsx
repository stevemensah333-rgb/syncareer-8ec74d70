import { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Plus, Eye, Edit, Trash2, MapPin, Briefcase, Clock, DollarSign, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const PostJob = () => {
  const { toast } = useToast();
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');

  // Mock posted jobs
  const postedJobs = [
    {
      id: 1,
      title: 'Senior Frontend Developer',
      location: 'Lagos, Nigeria',
      type: 'Full-time',
      salary: '$60,000 - $80,000',
      applications: 24,
      posted: '2 days ago',
      status: 'active',
    },
    {
      id: 2,
      title: 'Data Analyst',
      location: 'Remote',
      type: 'Contract',
      salary: '$45,000 - $55,000',
      applications: 18,
      posted: '5 days ago',
      status: 'active',
    },
    {
      id: 3,
      title: 'UI/UX Designer',
      location: 'Nairobi, Kenya',
      type: 'Full-time',
      salary: '$50,000 - $65,000',
      applications: 32,
      posted: '1 week ago',
      status: 'closed',
    },
  ];

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const handlePostJob = () => {
    toast({
      title: 'Job Posted Successfully!',
      description: 'Your job posting is now live and visible to job seekers.',
    });
  };

  return (
    <PageLayout title="Post a Job">
      <Tabs defaultValue="create" className="space-y-6">
        <TabsList>
          <TabsTrigger value="create">Create New Post</TabsTrigger>
          <TabsTrigger value="manage">Manage Posts ({postedJobs.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="create">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Job Form */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Job Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Job Title</Label>
                    <Input id="title" placeholder="e.g. Senior Software Engineer" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Input id="department" placeholder="e.g. Engineering" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input id="location" placeholder="e.g. Lagos, Nigeria or Remote" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Employment Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full-time">Full-time</SelectItem>
                        <SelectItem value="part-time">Part-time</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="internship">Internship</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="salary-min">Salary Range (Min)</Label>
                    <Input id="salary-min" placeholder="e.g. 50000" type="number" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salary-max">Salary Range (Max)</Label>
                    <Input id="salary-max" placeholder="e.g. 80000" type="number" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Job Description</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Describe the role, responsibilities, and what makes this opportunity unique..."
                    rows={6}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requirements">Requirements</Label>
                  <Textarea 
                    id="requirements" 
                    placeholder="List the qualifications, experience, and skills required..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Required Skills</Label>
                  <div className="flex gap-2">
                    <Input 
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      placeholder="Add a skill"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    />
                    <Button type="button" onClick={addSkill}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {skills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="cursor-pointer" onClick={() => removeSkill(skill)}>
                          {skill} ×
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-4 pt-4">
                  <Button onClick={handlePostJob} className="flex-1">
                    <FileText className="h-4 w-4 mr-2" />
                    Post Job
                  </Button>
                  <Button variant="outline">Save as Draft</Button>
                </div>
              </CardContent>
            </Card>

            {/* Sidebar Tips */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Posting Tips</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Write a Clear Title</h4>
                    <p className="text-xs text-muted-foreground">
                      Use specific job titles that candidates commonly search for.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Be Transparent About Pay</h4>
                    <p className="text-xs text-muted-foreground">
                      Jobs with salary ranges get 30% more applications.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Highlight Growth</h4>
                    <p className="text-xs text-muted-foreground">
                      Mention career development opportunities and learning paths.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Skills Matter</h4>
                    <p className="text-xs text-muted-foreground">
                      Adding skills helps match your job with qualified candidates.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
                <CardContent className="pt-6 text-center">
                  <p className="text-lg font-semibold mb-2">Reach More Talent</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Boost your job post to reach 5x more qualified candidates
                  </p>
                  <Button variant="outline" className="w-full">
                    Upgrade to Premium
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="manage">
          <Card>
            <CardHeader>
              <CardTitle>Your Job Posts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {postedJobs.map((job) => (
                  <div key={job.id} className="p-4 border rounded-lg hover:border-primary/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{job.title}</h3>
                          <Badge variant={job.status === 'active' ? 'default' : 'secondary'}>
                            {job.status}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {job.location}
                          </span>
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
                      <div className="flex items-center gap-2">
                        <div className="text-center px-4">
                          <div className="flex items-center gap-1 text-primary">
                            <Users className="h-4 w-4" />
                            <span className="font-bold">{job.applications}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">Applications</p>
                        </div>
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
};

export default PostJob;
