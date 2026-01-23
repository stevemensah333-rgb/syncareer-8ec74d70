import { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { GraduationCap, Users, Plus, Mail, BookOpen, Trophy, Clock, CheckCircle, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const TrainEmployees = () => {
  const { toast } = useToast();
  const [inviteEmail, setInviteEmail] = useState('');

  // Mock training programs
  const trainingPrograms = [
    {
      id: 1,
      name: 'Leadership Development',
      enrolled: 12,
      completed: 5,
      duration: '4 weeks',
      modules: 8,
    },
    {
      id: 2,
      name: 'Technical Skills Bootcamp',
      enrolled: 25,
      completed: 18,
      duration: '6 weeks',
      modules: 12,
    },
    {
      id: 3,
      name: 'Sales Excellence',
      enrolled: 8,
      completed: 3,
      duration: '3 weeks',
      modules: 6,
    },
  ];

  // Mock employees
  const employees = [
    { id: 1, name: 'John Doe', email: 'john@company.com', department: 'Engineering', coursesCompleted: 5, inProgress: 2 },
    { id: 2, name: 'Jane Smith', email: 'jane@company.com', department: 'Marketing', coursesCompleted: 3, inProgress: 1 },
    { id: 3, name: 'Mike Johnson', email: 'mike@company.com', department: 'Sales', coursesCompleted: 7, inProgress: 3 },
    { id: 4, name: 'Sarah Wilson', email: 'sarah@company.com', department: 'HR', coursesCompleted: 4, inProgress: 2 },
  ];

  // Mock available courses
  const availableCourses = [
    { id: 1, name: 'Project Management Fundamentals', duration: '2 weeks', level: 'Beginner', enrolled: 156 },
    { id: 2, name: 'Advanced Data Analysis', duration: '4 weeks', level: 'Advanced', enrolled: 89 },
    { id: 3, name: 'Effective Communication', duration: '1 week', level: 'Beginner', enrolled: 234 },
    { id: 4, name: 'Python for Business', duration: '6 weeks', level: 'Intermediate', enrolled: 178 },
    { id: 5, name: 'Digital Marketing Mastery', duration: '3 weeks', level: 'Intermediate', enrolled: 145 },
  ];

  const handleInviteEmployee = () => {
    if (inviteEmail) {
      toast({
        title: 'Invitation Sent!',
        description: `An invitation has been sent to ${inviteEmail}`,
      });
      setInviteEmail('');
    }
  };

  const handleEnrollProgram = (programName: string) => {
    toast({
      title: 'Enrolled Successfully',
      description: `Employees have been enrolled in ${programName}`,
    });
  };

  return (
    <PageLayout title="Train Employees">
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="programs">Training Programs</TabsTrigger>
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
                    <p className="text-2xl font-bold">{employees.length}</p>
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
                    <p className="text-2xl font-bold">{trainingPrograms.length}</p>
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
                    <p className="text-2xl font-bold">26</p>
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
                    <p className="text-2xl font-bold">78%</p>
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
                />
                <Button onClick={handleInviteEmployee}>
                  <Plus className="h-4 w-4 mr-2" />
                  Invite
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Active Programs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Active Training Programs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trainingPrograms.map((program) => (
                  <div key={program.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">{program.name}</h3>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          <Clock className="h-3 w-3 mr-1" />
                          {program.duration}
                        </Badge>
                        <Badge variant="secondary">
                          {program.modules} modules
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {program.enrolled} enrolled
                      </span>
                      <span className="flex items-center gap-1">
                        <Trophy className="h-4 w-4" />
                        {program.completed} completed
                      </span>
                    </div>
                    <Progress value={(program.completed / program.enrolled) * 100} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="employees">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Registered Employees</CardTitle>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Employee
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {employees.map((employee) => (
                  <div key={employee.id} className="p-4 border rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="font-bold text-primary">
                          {employee.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{employee.name}</p>
                        <p className="text-sm text-muted-foreground">{employee.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <Badge variant="outline">{employee.department}</Badge>
                      <div className="text-center">
                        <p className="text-lg font-bold text-green-600">{employee.coursesCompleted}</p>
                        <p className="text-xs text-muted-foreground">Completed</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-primary">{employee.inProgress}</p>
                        <p className="text-xs text-muted-foreground">In Progress</p>
                      </div>
                      <Button variant="outline" size="sm">View Progress</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="programs">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Training Programs</CardTitle>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Program
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {trainingPrograms.map((program) => (
                  <div key={program.id} className="p-6 border rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">{program.name}</h3>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Duration</span>
                        <span>{program.duration}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Modules</span>
                        <span>{program.modules}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Enrolled</span>
                        <span>{program.enrolled} employees</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Completed</span>
                        <span>{program.completed} employees</span>
                      </div>
                    </div>
                    <Progress value={(program.completed / program.enrolled) * 100} className="h-2 mb-4" />
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1">Edit</Button>
                      <Button className="flex-1">Manage</Button>
                    </div>
                  </div>
                ))}
              </div>
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
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline">{course.level}</Badge>
                      <Badge variant="secondary">
                        <Clock className="h-3 w-3 mr-1" />
                        {course.duration}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      {course.enrolled} learners enrolled
                    </p>
                    <Button 
                      className="w-full"
                      onClick={() => handleEnrollProgram(course.name)}
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
