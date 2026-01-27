import { useState, useEffect } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { GraduationCap, Users, Plus, Mail, BookOpen, Trophy, Clock, CheckCircle, TrendingUp, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TrainingStats {
  totalEmployees: number;
  activePrograms: number;
  coursesCompleted: number;
  avgCompletion: number;
}

const TrainEmployees = () => {
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitedEmails, setInvitedEmails] = useState<string[]>([]);
  const [stats, setStats] = useState<TrainingStats>({
    totalEmployees: 0,
    activePrograms: 0,
    coursesCompleted: 0,
    avgCompletion: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Available courses from platform
  const availableCourses = [
    { id: 1, name: 'Project Management Fundamentals', duration: '2 weeks', level: 'Beginner', description: 'Learn the basics of project management methodologies.' },
    { id: 2, name: 'Advanced Data Analysis', duration: '4 weeks', level: 'Advanced', description: 'Master data analysis techniques using modern tools.' },
    { id: 3, name: 'Effective Communication', duration: '1 week', level: 'Beginner', description: 'Improve workplace communication skills.' },
    { id: 4, name: 'Python for Business', duration: '6 weeks', level: 'Intermediate', description: 'Learn Python programming for business applications.' },
    { id: 5, name: 'Digital Marketing Mastery', duration: '3 weeks', level: 'Intermediate', description: 'Comprehensive digital marketing strategies.' },
    { id: 6, name: 'Leadership Development', duration: '4 weeks', level: 'Advanced', description: 'Develop essential leadership and management skills.' },
  ];

  useEffect(() => {
    fetchTrainingData();
    loadInvitedEmails();
  }, []);

  const loadInvitedEmails = () => {
    const saved = localStorage.getItem('invited_employees');
    if (saved) {
      setInvitedEmails(JSON.parse(saved));
    }
  };

  const fetchTrainingData = async () => {
    try {
      // For now, stats are based on invited employees
      // In a full implementation, this would fetch from a company_employees table
      setStats({
        totalEmployees: invitedEmails.length,
        activePrograms: 0,
        coursesCompleted: 0,
        avgCompletion: 0,
      });
    } catch (error) {
      console.error('Error fetching training data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInviteEmployee = async () => {
    if (!inviteEmail) {
      toast.error('Please enter an email address');
      return;
    }

    if (!inviteEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (invitedEmails.includes(inviteEmail)) {
      toast.error('This email has already been invited');
      return;
    }

    // Get employer details for the invitation email
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData?.session?.user;
    let companyName = 'Your Company';
    let inviterName = 'Your employer';
    
    if (user) {
      const { data: employer } = await supabase
        .from('employer_details')
        .select('company_name')
        .eq('user_id', user.id)
        .single();
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();
      
      if (employer?.company_name) companyName = employer.company_name;
      if (profile?.full_name) inviterName = profile.full_name;
    }

    // Send invitation email via edge function
    try {
      const { error } = await supabase.functions.invoke('send-employee-invite', {
        body: { 
          email: inviteEmail,
          companyName,
          inviterName
        }
      });
      
      if (error) {
        console.error('Email invitation error:', error);
        // Still add to list even if email fails
      }
    } catch (e) {
      console.error('Failed to send invitation email:', e);
    }

    const updatedEmails = [...invitedEmails, inviteEmail];
    setInvitedEmails(updatedEmails);
    localStorage.setItem('invited_employees', JSON.stringify(updatedEmails));
    
    setStats(prev => ({
      ...prev,
      totalEmployees: updatedEmails.length
    }));

    toast.success(`Invitation sent to ${inviteEmail}`);
    setInviteEmail('');
  };

  const handleRemoveEmployee = (email: string) => {
    const updatedEmails = invitedEmails.filter(e => e !== email);
    setInvitedEmails(updatedEmails);
    localStorage.setItem('invited_employees', JSON.stringify(updatedEmails));
    
    setStats(prev => ({
      ...prev,
      totalEmployees: updatedEmails.length
    }));

    toast.success(`Removed ${email} from invitations`);
  };

  const handleEnrollCourse = (courseName: string) => {
    if (invitedEmails.length === 0) {
      toast.error('Please invite employees first before enrolling in courses');
      return;
    }

    toast.success(`Enrolled ${invitedEmails.length} employee(s) in ${courseName}`);
    setStats(prev => ({
      ...prev,
      activePrograms: prev.activePrograms + 1
    }));
  };

  return (
    <PageLayout title="Train Employees">
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="courses">Browse Courses</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Employees</p>
                    <p className="text-2xl font-bold">{stats.totalEmployees}</p>
                  </div>
                  <Users className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Programs</p>
                    <p className="text-2xl font-bold">{stats.activePrograms}</p>
                  </div>
                  <BookOpen className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Courses Completed</p>
                    <p className="text-2xl font-bold">{stats.coursesCompleted}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg. Completion</p>
                    <p className="text-2xl font-bold">{stats.avgCompletion}%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Invite Section */}
          <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Invite Employees
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Invite employees to join your company training programs. They'll receive access to all enrolled courses and learning paths.
              </p>
              <div className="flex gap-2">
                <Input 
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="Enter employee email"
                  type="email"
                  className="flex-1"
                  onKeyDown={(e) => e.key === 'Enter' && handleInviteEmployee()}
                />
                <Button onClick={handleInviteEmployee}>
                  <Plus className="h-4 w-4 mr-2" />
                  Invite
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Start Guide */}
          {stats.totalEmployees === 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-primary" />
                  Getting Started
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">1</div>
                    <div>
                      <p className="font-medium">Invite your team</p>
                      <p className="text-sm text-muted-foreground">Add employee emails to start building your training group.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">2</div>
                    <div>
                      <p className="font-medium">Browse courses</p>
                      <p className="text-sm text-muted-foreground">Explore available courses and enroll your team.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">3</div>
                    <div>
                      <p className="font-medium">Track progress</p>
                      <p className="text-sm text-muted-foreground">Monitor completion rates and employee development.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="employees">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Invited Employees ({invitedEmails.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {invitedEmails.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No employees invited yet</p>
                  <p className="text-sm mt-2">Use the invitation form in the Overview tab to add employees.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {invitedEmails.map((email, idx) => (
                    <div key={email} className="p-4 border rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="font-bold text-primary">
                            {email.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{email}</p>
                          <p className="text-sm text-muted-foreground">Invitation pending</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant="outline">Pending</Badge>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-destructive"
                          onClick={() => handleRemoveEmployee(email)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses">
          <Card>
            <CardHeader>
              <CardTitle>Available Courses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableCourses.map((course) => (
                  <div key={course.id} className="p-4 border rounded-lg hover:border-primary transition-colors">
                    <h3 className="font-semibold mb-2">{course.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{course.description}</p>
                    <div className="flex items-center gap-2 mb-4">
                      <Badge variant="outline">{course.level}</Badge>
                      <Badge variant="secondary">
                        <Clock className="h-3 w-3 mr-1" />
                        {course.duration}
                      </Badge>
                    </div>
                    <Button 
                      className="w-full"
                      onClick={() => handleEnrollCourse(course.name)}
                    >
                      Enroll Employees
                    </Button>
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

export default TrainEmployees;