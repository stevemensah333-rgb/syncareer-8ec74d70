import { useState, useEffect } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mic, CheckCircle, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { useUserProfile } from '@/contexts/UserProfileContext';
import { InterviewErrorBoundary } from '@/components/interview/InterviewErrorBoundary';
import { VoiceInterviewMode } from '@/components/interview/VoiceInterviewMode';
import { InterviewHistory } from '@/components/interview/InterviewHistory';
import type { InterviewSetupConfig } from '@/types/interview';

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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Setup Form */}
            <div className="lg:col-span-2 space-y-6">
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
                      AI interviewer speaks realistic, role-specific questions
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" aria-hidden="true" />
                      Respond naturally using your voice (Chrome/Edge recommended)
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" aria-hidden="true" />
                      Get real-time feedback and follow-up questions
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" aria-hidden="true" />
                      Review detailed scoring and improvement tips after completion
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* History Sidebar */}
            <div className="lg:col-span-1">
              <InterviewHistory />
            </div>
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
              onEnd={() => setStep('setup')}
            />
          </InterviewErrorBoundary>
        </div>
      )}
    </PageLayout>
  );
};

export default InterviewSimulator;
