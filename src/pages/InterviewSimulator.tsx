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
import { VoiceInterviewMode } from '@/components/interview/VoiceInterviewMode';

const InterviewSimulator = () => {
  const { studentDetails } = useUserProfile();
  const [step, setStep] = useState<'setup' | 'interview'>('setup');
  const [jobRole, setJobRole] = useState('');
  const [industry, setIndustry] = useState('');
  const [difficulty, setDifficulty] = useState('intermediate');
  const [interviewType, setInterviewType] = useState('mixed');
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');

  // Pre-populate based on student major
  useEffect(() => {
    if (studentDetails?.major) {
      const majorRoleMap: Record<string, {role: string; industry: string}> = {
        'Computer Science': { role: 'Software Developer', industry: 'Technology' },
        'Data Science': { role: 'Data Analyst', industry: 'Technology' },
        'Business Administration': { role: 'Business Analyst', industry: 'Consulting' },
        'Finance': { role: 'Financial Analyst', industry: 'Finance' },
        'Marketing': { role: 'Marketing Coordinator', industry: 'Marketing' },
        'Law': { role: 'Legal Associate', industry: 'Legal' },
        'Medicine': { role: 'Medical Intern', industry: 'Healthcare' },
        'Electrical Engineering': { role: 'Electrical Engineer', industry: 'Engineering' },
        'Mechanical Engineering': { role: 'Mechanical Engineer', industry: 'Engineering' },
      };
      const mapping = majorRoleMap[studentDetails.major];
      if (mapping) {
        setJobRole(mapping.role);
        setIndustry(mapping.industry);
      }
    }
  }, [studentDetails]);

  const startInterview = () => {
    if (!jobRole.trim()) {
      toast.error('Please enter a job role');
      return;
    }
    setStep('interview');
  };

  return (
    <PageLayout title="Interview Simulator">
      {step === 'setup' && (
        <div className="max-w-2xl mx-auto space-y-6">
          <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
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
                    value={jobRole}
                    onChange={(e) => setJobRole(e.target.value)}
                    placeholder="e.g., Software Developer"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Input
                    id="industry"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    placeholder="e.g., Technology"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Seniority Level</Label>
                  <Select value={difficulty} onValueChange={setDifficulty}>
                    <SelectTrigger>
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
                  <Select value={interviewType} onValueChange={setInterviewType}>
                    <SelectTrigger>
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
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste your resume text or key experiences here for more personalized questions..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="jobDescription">Job Description (Optional)</Label>
                <Textarea
                  id="jobDescription"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the job description for role-specific questions..."
                  rows={3}
                />
              </div>

              <Button 
                className="w-full" 
                size="lg" 
                onClick={startInterview}
              >
                <Phone className="h-4 w-4 mr-2" />
                Start Voice Interview
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">How It Works</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  AI interviewer speaks realistic, role-specific questions
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  Respond naturally using your voice
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  Get real-time feedback and follow-up questions
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  Practice speaking under interview pressure
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      )}

      {step === 'interview' && (
        <div className="max-w-3xl mx-auto">
          <VoiceInterviewMode
            jobRole={jobRole}
            resumeText={resumeText}
            onEnd={() => setStep('setup')}
          />
        </div>
      )}
    </PageLayout>
  );
};

export default InterviewSimulator;
