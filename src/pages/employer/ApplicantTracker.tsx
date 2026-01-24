import { useState, useEffect } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { 
  Users, Briefcase, Search, Filter, Calendar, Clock, 
  Mail, Phone, FileText, Star, ChevronRight, Video,
  CheckCircle, XCircle, MessageSquare, ArrowRight
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Application {
  id: string;
  job_id: string;
  applicant_id: string;
  status: string;
  cover_letter: string | null;
  resume_url: string | null;
  notes: string | null;
  created_at: string;
  job?: {
    title: string;
    location: string;
    department: string | null;
  };
}

interface Interview {
  id: string;
  application_id: string;
  scheduled_at: string;
  duration_minutes: number;
  interview_type: string;
  meeting_link: string | null;
  status: string;
  notes: string | null;
}

const PIPELINE_STAGES = [
  { id: 'pending', label: 'Applied', color: 'bg-slate-100 text-slate-700' },
  { id: 'reviewing', label: 'Reviewing', color: 'bg-blue-100 text-blue-700' },
  { id: 'interviewing', label: 'Interview', color: 'bg-purple-100 text-purple-700' },
  { id: 'offered', label: 'Offered', color: 'bg-green-100 text-green-700' },
  { id: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-700' },
];

const ApplicantTracker = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJob, setSelectedJob] = useState<string>('all');
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [interviewDate, setInterviewDate] = useState<Date>();
  const [interviewTime, setInterviewTime] = useState('10:00');
  const [interviewType, setInterviewType] = useState('video');
  const [meetingLink, setMeetingLink] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      // Fetch jobs first
      const { data: jobs } = await supabase
        .from('job_postings')
        .select('id, title, location, department')
        .eq('employer_id', session.user.id);

      if (jobs && jobs.length > 0) {
        const jobIds = jobs.map(j => j.id);
        
        // Fetch applications for these jobs
        const { data: apps } = await supabase
          .from('job_applications')
          .select('*')
          .in('job_id', jobIds)
          .order('created_at', { ascending: false });

        if (apps) {
          // Map job details to applications
          const appsWithJobs = apps.map(app => ({
            ...app,
            job: jobs.find(j => j.id === app.job_id)
          }));
          setApplications(appsWithJobs);

          // Fetch interviews
          const appIds = apps.map(a => a.id);
          if (appIds.length > 0) {
            const { data: ints } = await supabase
              .from('interview_sessions')
              .select('*')
              .in('application_id', appIds);
            
            if (ints) setInterviews(ints);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (appId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('job_applications')
        .update({ status: newStatus })
        .eq('id', appId);

      if (error) throw error;

      setApplications(prev => prev.map(app => 
        app.id === appId ? { ...app, status: newStatus } : app
      ));

      toast.success(`Application moved to ${newStatus}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update status');
    }
  };

  const scheduleInterview = async () => {
    if (!selectedApplication || !interviewDate) return;

    try {
      const scheduledAt = new Date(interviewDate);
      const [hours, minutes] = interviewTime.split(':');
      scheduledAt.setHours(parseInt(hours), parseInt(minutes));

      const { error } = await supabase
        .from('interview_sessions')
        .insert({
          application_id: selectedApplication.id,
          scheduled_at: scheduledAt.toISOString(),
          interview_type: interviewType,
          meeting_link: meetingLink || null,
          duration_minutes: 60,
        });

      if (error) throw error;

      // Update application status to interviewing
      await updateApplicationStatus(selectedApplication.id, 'interviewing');

      toast.success('Interview scheduled successfully!');
      setScheduleDialogOpen(false);
      setSelectedApplication(null);
      setInterviewDate(undefined);
      setMeetingLink('');
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to schedule interview');
    }
  };

  const getStageCount = (stage: string) => {
    return applications.filter(a => a.status === stage).length;
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = searchQuery === '' || 
      app.applicant_id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesJob = selectedJob === 'all' || app.job_id === selectedJob;
    return matchesSearch && matchesJob;
  });

  const uniqueJobs = Array.from(new Set(applications.map(a => a.job?.title)))
    .filter(Boolean) as string[];

  if (loading) {
    return (
      <PageLayout title="Applicant Tracker">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Applicant Tracker">
      <div className="space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {PIPELINE_STAGES.map((stage) => (
            <Card key={stage.id} className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">{stage.label}</span>
                <Badge className={stage.color}>{getStageCount(stage.id)}</Badge>
              </div>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search applicants..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={selectedJob} onValueChange={setSelectedJob}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by job" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Jobs</SelectItem>
                {uniqueJobs.map((job) => (
                  <SelectItem key={job} value={job}>{job}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Pipeline View */}
        <Tabs defaultValue="pipeline" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pipeline">Pipeline View</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
            <TabsTrigger value="interviews">Interviews</TabsTrigger>
          </TabsList>

          <TabsContent value="pipeline">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {PIPELINE_STAGES.map((stage) => (
                <Card key={stage.id} className="min-h-[400px]">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center justify-between">
                      <span>{stage.label}</span>
                      <Badge variant="outline">{getStageCount(stage.id)}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {filteredApplications
                      .filter(app => app.status === stage.id)
                      .map((app) => (
                        <div
                          key={app.id}
                          className="p-3 bg-muted/50 rounded-lg space-y-2 hover:bg-muted transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                {app.applicant_id.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                Applicant
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {app.job?.title}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            {stage.id !== 'rejected' && stage.id !== 'offered' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 text-xs flex-1"
                                  onClick={() => {
                                    const nextStage = PIPELINE_STAGES[
                                      PIPELINE_STAGES.findIndex(s => s.id === stage.id) + 1
                                    ];
                                    if (nextStage) {
                                      updateApplicationStatus(app.id, nextStage.id);
                                    }
                                  }}
                                >
                                  <ArrowRight className="h-3 w-3" />
                                </Button>
                                {stage.id === 'reviewing' && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 text-xs"
                                    onClick={() => {
                                      setSelectedApplication(app);
                                      setScheduleDialogOpen(true);
                                    }}
                                  >
                                    <Calendar className="h-3 w-3" />
                                  </Button>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="list">
            <Card>
              <CardContent className="pt-6">
                {filteredApplications.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No applications yet</p>
                    <p className="text-sm">Applications to your job posts will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredApplications.map((app) => (
                      <div key={app.id} className="p-4 border rounded-lg hover:border-primary/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {app.applicant_id.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">Applicant</p>
                              <p className="text-sm text-muted-foreground">
                                Applied for: {app.job?.title}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge className={
                              PIPELINE_STAGES.find(s => s.id === app.status)?.color
                            }>
                              {PIPELINE_STAGES.find(s => s.id === app.status)?.label}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {new Date(app.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="interviews">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Scheduled Interviews
                </CardTitle>
              </CardHeader>
              <CardContent>
                {interviews.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No interviews scheduled</p>
                    <p className="text-sm">Schedule interviews from the pipeline view</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {interviews.map((interview) => (
                      <div key={interview.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Video className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">
                                {format(new Date(interview.scheduled_at), 'PPp')}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {interview.interview_type} interview • {interview.duration_minutes} min
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={interview.status === 'scheduled' ? 'default' : 'secondary'}>
                              {interview.status}
                            </Badge>
                            {interview.meeting_link && (
                              <Button size="sm" variant="outline" asChild>
                                <a href={interview.meeting_link} target="_blank" rel="noopener noreferrer">
                                  <Video className="h-4 w-4 mr-1" />
                                  Join
                                </a>
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Schedule Interview Dialog */}
        <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Schedule Interview</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !interviewDate && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {interviewDate ? format(interviewDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={interviewDate}
                      onSelect={setInterviewDate}
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Time</Label>
                <Input
                  type="time"
                  value={interviewTime}
                  onChange={(e) => setInterviewTime(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Interview Type</Label>
                <Select value={interviewType} onValueChange={setInterviewType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">Video Call</SelectItem>
                    <SelectItem value="phone">Phone Call</SelectItem>
                    <SelectItem value="in-person">In Person</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Meeting Link (optional)</Label>
                <Input
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  placeholder="https://zoom.us/j/... or Google Meet link"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setScheduleDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={scheduleInterview} disabled={!interviewDate}>
                Schedule Interview
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageLayout>
  );
};

export default ApplicantTracker;
