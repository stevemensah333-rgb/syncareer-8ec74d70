import { useState, useEffect } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Mic, CheckCircle, Phone, Clock, Zap, Target } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useUserProfile } from '@/contexts/UserProfileContext';
import { InterviewErrorBoundary } from '@/components/interview/InterviewErrorBoundary';
import { VoiceInterviewMode } from '@/components/interview/VoiceInterviewMode';

import type { InterviewSetupConfig } from '@/types/interview';

type SessionLength = 'quick' | 'standard' | 'extended';

const SESSION_OPTIONS: Array<{ value: SessionLength; label: string; description: string; questions: number; icon: typeof Zap }> = [
  { value: 'quick', label: 'Quick', description: '~15 min · 8 questions', questions: 8, icon: Zap },
  { value: 'standard', label: 'Standard', description: '~30 min · 15 questions', questions: 15, icon: Target },
  { value: 'extended', label: 'Deep Dive', description: '~45 min · 20 questions', questions: 20, icon: Clock },
];

const MAJOR_ROLE_MAP: Record<string, { role: string; industry: string }> = {
  'Computer Science': { role: 'Software Developer', industry: 'Technology' },
  'Data Science': { role: 'Data Analyst', industry: 'Technology' },
  'Business Administration': { role: 'Business Analyst', industry: 'Consulting' },
  'Finance': { role: 'Financial Analyst', industry: 'Finance' },
  'Marketing': { role: 'Marketing Coordinator', industry: 'Marketing' },
  'Law': { role: 'Legal Associate', industry: 'Legal' },
  'Medicine': { role: 'Medical Intern', industry: 'Healthcare' },
  'Electrical Engineering': { role: 'Electrical Engineer', industry: 'Engineering' },
  'Mechanical Engineering': { role: 'Mechanical Engineer', industry: 'Engineering' },
  'Civil Engineering': { role: 'Site Engineer', industry: 'Construction' },
  'Chemical Engineering': { role: 'Process Engineer', industry: 'Manufacturing' },
  'Information Technology': { role: 'IT Support Specialist', industry: 'Technology' },
  'Accounting': { role: 'Junior Accountant', industry: 'Finance' },
  'Human Resources': { role: 'HR Coordinator', industry: 'Human Resources' },
  'Economics': { role: 'Economic Analyst', industry: 'Research' },
  'Psychology': { role: 'HR Specialist', industry: 'Human Resources' },
  'Nursing': { role: 'Registered Nurse', industry: 'Healthcare' },
  'Pharmacy': { role: 'Pharmacist', industry: 'Healthcare' },
  'Architecture': { role: 'Junior Architect', industry: 'Architecture' },
  'Graphic Design': { role: 'Graphic Designer', industry: 'Creative' },
  'Communications': { role: 'Communications Specialist', industry: 'Media' },
  'Education': { role: 'Teacher', industry: 'Education' },
  'Environmental Science': { role: 'Environmental Consultant', industry: 'Environment' },
  'Agriculture': { role: 'Agricultural Scientist', industry: 'Agriculture' },
};

const InterviewSimulator = () => {
  const { studentDetails } = useUserProfile();
  const [step, setStep] = useState<'setup' | 'interview'>('setup');
  const [sessionLength, setSessionLength] = useState<SessionLength>('standard');
  const [config, setConfig] = useState<InterviewSetupConfig>({
    jobRole: '',
    industry: '',
    difficulty: 'intermediate',
    interviewType: 'mixed',
    resumeText: '',
    jobDescription: '',
  });

  useEffect(() => {
    if (studentDetails?.major) {
      const mapping = MAJOR_ROLE_MAP[studentDetails.major];
      if (mapping) {
        setConfig(prev => ({ ...prev, jobRole: mapping.role, industry: mapping.industry }));
      }
    }
  }, [studentDetails]);

  const updateConfig = (field: keyof InterviewSetupConfig, value: string) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const startInterview = () => {
    if (!config.jobRole.trim()) {
      toast.error('Please enter a job role');
      return;
    }
    setStep('interview');
  };

  return (
    <PageLayout title="Interview Simulator">
      {step === 'setup' && (
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center" aria-hidden="true">
                  <Mic className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">AI Voice Interview</h2>
                  <p className="text-muted-foreground">
                    Practice with a realistic AI interviewer using voice conversation
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="max-w-2xl mx-auto space-y-6">
            {/* Setup Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Set Up Your Interview</CardTitle>
                  <CardDescription>
                    Customize your practice session based on your target role
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="jobRole">Target Job Role *</Label>
                      <Input
                        id="jobRole"
                        value={config.jobRole}
                        onChange={(e) => updateConfig('jobRole', e.target.value)}
                        placeholder="e.g., Software Developer"
                        aria-required="true"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="industry">Industry</Label>
                      <Input
                        id="industry"
                        value={config.industry}
                        onChange={(e) => updateConfig('industry', e.target.value)}
                        placeholder="e.g., Technology"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="difficulty">Seniority Level</Label>
                      <Select value={config.difficulty} onValueChange={(v) => updateConfig('difficulty', v)}>
                        <SelectTrigger id="difficulty">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Entry-level / Internship</SelectItem>
                          <SelectItem value="intermediate">Mid-level (2-5 years)</SelectItem>
                          <SelectItem value="advanced">Senior level</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="interviewType">Interview Type</Label>
                      <Select value={config.interviewType} onValueChange={(v) => updateConfig('interviewType', v)}>
                        <SelectTrigger id="interviewType">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="behavioral">Behavioral</SelectItem>
                          <SelectItem value="technical">Technical</SelectItem>
                          <SelectItem value="mixed">Mixed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Session Length Selector */}
                  <div className="space-y-2">
                    <Label>Session Length</Label>
                    <div className="grid grid-cols-3 gap-3">
                      {SESSION_OPTIONS.map((opt) => {
                        const Icon = opt.icon;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setSessionLength(opt.value)}
                            className={cn(
                              "relative flex flex-col items-center gap-1.5 rounded-lg border-2 p-3 text-center transition-all hover:border-primary/50",
                              sessionLength === opt.value
                                ? "border-primary bg-primary/5"
                                : "border-border"
                            )}
                          >
                            <Icon className={cn("h-5 w-5", sessionLength === opt.value ? "text-primary" : "text-muted-foreground")} />
                            <span className="text-sm font-medium">{opt.label}</span>
                            <span className="text-xs text-muted-foreground">{opt.description}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="resumeText">Resume / Experience Summary (Optional)</Label>
                    <Textarea
                      id="resumeText"
                      value={config.resumeText}
                      onChange={(e) => updateConfig('resumeText', e.target.value)}
                      placeholder="Paste your resume text or key experiences here for more personalized questions..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="jobDescription">Job Description (Optional)</Label>
                    <Textarea
                      id="jobDescription"
                      value={config.jobDescription}
                      onChange={(e) => updateConfig('jobDescription', e.target.value)}
                      placeholder="Paste the job description for role-specific questions..."
                      rows={3}
                    />
                  </div>

                  <Button
                    className="w-full"
                    size="lg"
                    onClick={startInterview}
                    aria-label="Start voice interview session"
                  >
                    <Phone className="h-4 w-4 mr-2" aria-hidden="true" />
                    Start Voice Interview
                  </Button>
                </CardContent>
              </Card>

              {/* How it works */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">How It Works</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground" aria-label="Interview process steps">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" aria-hidden="true" />
                      Multi-round interview: Intro → Technical → Behavioral → Scenario → Closing
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" aria-hidden="true" />
                      Adaptive difficulty — questions get harder as you perform well
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" aria-hidden="true" />
                      Follow-up probes on weak answers to test depth of understanding
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" aria-hidden="true" />
                      Detailed per-question feedback with improved answer examples
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" aria-hidden="true" />
                      Comprehensive final report with category scores and next steps
                    </li>
                  </ul>
                </CardContent>
              </Card>
          </div>
        </div>
      )}

      {step === 'interview' && (
        <div className="max-w-3xl mx-auto">
          <InterviewErrorBoundary
            onReset={() => setStep('setup')}
            fallbackTitle="Interview session crashed"
          >
            <VoiceInterviewMode
              jobRole={config.jobRole}
              industry={config.industry}
              difficulty={config.difficulty}
              interviewType={config.interviewType}
              resumeText={config.resumeText}
              jobDescription={config.jobDescription}
              sessionLength={sessionLength}
              onEnd={() => setStep('setup')}
            />
          </InterviewErrorBoundary>
        </div>
      )}
    </PageLayout>
  );
};

export default InterviewSimulator;
