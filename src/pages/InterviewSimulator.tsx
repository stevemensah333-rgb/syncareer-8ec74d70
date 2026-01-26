import { useState, useEffect } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mic, Play, CheckCircle, ArrowRight, RotateCcw, Trophy, Clock, Target, MessageSquare, Lightbulb, AlertCircle, ThumbsUp, Phone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useUserProfile } from '@/contexts/UserProfileContext';
import { VoiceInterviewMode } from '@/components/interview/VoiceInterviewMode';

interface Feedback {
  verdict: string;
  score: number;
  feedback: string;
  improvedAnswer: string;
  tip: string;
}

interface AnswerRecord {
  question: string;
  answer: string;
  feedback: string;
  score: number;
  verdict: string;
  improvedAnswer?: string;
  tip?: string;
}

interface OverallResults {
  overallScore: number;
  overallVerdict: string;
  assessment: string;
  strengths: string[];
  weaknesses: string[];
  priorities: string[];
  readiness: string;
}

const InterviewSimulator = () => {
  const { studentDetails } = useUserProfile();
  const [step, setStep] = useState<'setup' | 'interview' | 'voice' | 'results'>('setup');
  const [interviewMode, setInterviewMode] = useState<'text' | 'voice'>('text');
  const [jobRole, setJobRole] = useState('');
  const [industry, setIndustry] = useState('');
  const [difficulty, setDifficulty] = useState('intermediate');
  const [interviewType, setInterviewType] = useState('mixed');
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [interviewId, setInterviewId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [questionNumber, setQuestionNumber] = useState(1);
  const [conversationHistory, setConversationHistory] = useState<Array<{ role: string; content: string }>>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [overallResults, setOverallResults] = useState<OverallResults | null>(null);
  const [isComplete, setIsComplete] = useState(false);

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

  const startInterview = async () => {
    if (!jobRole.trim()) {
      toast.error('Please enter a job role');
      return;
    }

    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please sign in to continue');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mock-interview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          action: 'start',
          jobRole,
          industry,
          difficulty,
          interviewType,
          resumeText,
          jobDescription,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to start interview');
      }

      const data = await response.json();
      setInterviewId(data.interview.id);
      setCurrentQuestion(data.currentQuestion);
      setQuestionNumber(1);
      setConversationHistory([
        { role: 'assistant', content: data.currentQuestion }
      ]);
      setAnswers([]);
      setStep('interview');
      toast.success('Interview started! Good luck!');
    } catch (error) {
      console.error('Error starting interview:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to start interview');
    } finally {
      setIsLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!currentAnswer.trim()) {
      toast.error('Please provide an answer');
      return;
    }

    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mock-interview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          action: 'answer',
          interviewId,
          answer: currentAnswer,
          interviewType,
          conversationHistory,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit answer');
      }

      const data = await response.json();
      setFeedback(data.feedback);
      setIsComplete(data.isComplete);
      
      // Update conversation history
      setConversationHistory(prev => [
        ...prev,
        { role: 'user', content: currentAnswer },
        ...(data.nextQuestion ? [{ role: 'assistant', content: data.nextQuestion }] : [])
      ]);

      if (data.nextQuestion) {
        setCurrentQuestion(data.nextQuestion);
        setQuestionNumber(data.questionNumber);
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to get feedback');
    } finally {
      setIsLoading(false);
    }
  };

  const nextQuestion = () => {
    setFeedback(null);
    setCurrentAnswer('');
    
    if (isComplete) {
      finishInterview();
    }
  };

  const finishInterview = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mock-interview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          action: 'feedback',
          interviewId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get results');
      }

      const data = await response.json();
      setOverallResults(data.overallFeedback);
      setAnswers(data.answers || []);
      setStep('results');
      toast.success('Interview completed!');
    } catch (error) {
      console.error('Error finishing interview:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to get final results');
    } finally {
      setIsLoading(false);
    }
  };

  const resetInterview = () => {
    setStep('setup');
    setInterviewId(null);
    setCurrentQuestion('');
    setQuestionNumber(1);
    setConversationHistory([]);
    setCurrentAnswer('');
    setFeedback(null);
    setAnswers([]);
    setOverallResults(null);
    setIsComplete(false);
  };

  const getVerdictColor = (verdict: string) => {
    switch (verdict.toLowerCase()) {
      case 'strong': return 'text-green-600 bg-green-100';
      case 'average': return 'text-yellow-600 bg-yellow-100';
      case 'weak': return 'text-red-600 bg-red-100';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const getReadinessColor = (readiness: string) => {
    switch (readiness.toLowerCase()) {
      case 'high': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-red-600';
      default: return 'text-muted-foreground';
    }
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
                  <h2 className="text-2xl font-bold">AI Mock Interview</h2>
                  <p className="text-muted-foreground">
                    Practice with a realistic AI interviewer and get honest, actionable feedback
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

              <div className="flex gap-3 mt-4">
                <Button 
                  className="flex-1" 
                  size="lg" 
                  onClick={startInterview}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>Preparing Interview...</>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Text Interview
                    </>
                  )}
                </Button>
                <Button 
                  className="flex-1" 
                  size="lg" 
                  variant="secondary"
                  onClick={() => {
                    if (!jobRole.trim()) {
                      toast.error('Please enter a job role');
                      return;
                    }
                    setStep('voice');
                  }}
                  disabled={isLoading}
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Voice Interview
                </Button>
              </div>
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
                  AI asks realistic, role-specific questions one at a time
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  Get honest feedback: Strong, Average, or Weak verdict
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  See improved example answers and actionable tips
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  Receive overall readiness assessment at the end
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      )}

      {step === 'voice' && (
        <div className="max-w-3xl mx-auto">
          <VoiceInterviewMode
            jobRole={jobRole}
            resumeText={resumeText}
            onEnd={() => setStep('setup')}
          />
        </div>
      )}

      {step === 'interview' && (
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Progress */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">
                  Question {questionNumber} of 5
                </span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  interviewType === 'behavioral' ? 'bg-blue-100 text-blue-700' :
                  interviewType === 'technical' ? 'bg-purple-100 text-purple-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {interviewType.charAt(0).toUpperCase() + interviewType.slice(1)}
                </span>
              </div>
              <Progress value={(questionNumber / 5) * 100} />
            </CardContent>
          </Card>

          {/* Current Question */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Interviewer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted rounded-lg whitespace-pre-wrap">
                {currentQuestion}
              </div>

              {!feedback ? (
                <>
                  <Textarea
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    placeholder="Type your answer here... Be specific and use the STAR method when applicable."
                    rows={6}
                    disabled={isLoading}
                  />
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-muted-foreground">
                      Tip: Use specific examples and quantify your achievements
                    </p>
                    <Button onClick={submitAnswer} disabled={isLoading || !currentAnswer.trim()}>
                      {isLoading ? 'Analyzing...' : 'Submit Answer'}
                    </Button>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-medium mb-2 text-sm text-muted-foreground">Your Answer:</h4>
                    <p className="text-sm">{currentAnswer}</p>
                  </div>
                  
                  {/* Verdict and Score */}
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getVerdictColor(feedback.verdict)}`}>
                      {feedback.verdict}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Score: <strong>{feedback.score}/10</strong>
                    </span>
                  </div>

                  {/* Feedback */}
                  <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                    <h4 className="font-medium flex items-center gap-2 mb-2">
                      <AlertCircle className="h-4 w-4 text-primary" />
                      Feedback
                    </h4>
                    <p className="text-sm">{feedback.feedback}</p>
                  </div>

                  {/* Improved Answer */}
                  {feedback.improvedAnswer && (
                    <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                      <h4 className="font-medium flex items-center gap-2 mb-2 text-green-700">
                        <ThumbsUp className="h-4 w-4" />
                        Better Answer Example
                      </h4>
                      <p className="text-sm text-green-800">{feedback.improvedAnswer}</p>
                    </div>
                  )}

                  {/* Tip */}
                  {feedback.tip && (
                    <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                      <p className="text-sm text-yellow-800 flex items-start gap-2">
                        <Lightbulb className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span><strong>Tip:</strong> {feedback.tip}</span>
                      </p>
                    </div>
                  )}

                  <Button onClick={nextQuestion} className="w-full">
                    {!isComplete ? (
                      <>
                        Next Question
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    ) : (
                      <>
                        View Final Results
                        <Trophy className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {step === 'results' && overallResults && (
        <div className="max-w-3xl mx-auto space-y-6">
          <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
            <CardContent className="pt-6 text-center">
              <Trophy className="h-16 w-16 mx-auto text-primary mb-4" />
              <h2 className="text-3xl font-bold mb-2">Interview Complete!</h2>
              <p className="text-muted-foreground">
                Here's your performance assessment for the {jobRole} role
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6 text-center">
                <Target className="h-8 w-8 mx-auto text-primary mb-2" />
                <div className="text-3xl font-bold">{overallResults.overallScore}%</div>
                <p className="text-sm text-muted-foreground">Overall Score</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <MessageSquare className="h-8 w-8 mx-auto text-primary mb-2" />
                <div className="text-3xl font-bold">{answers.length}</div>
                <p className="text-sm text-muted-foreground">Questions Answered</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <Clock className="h-8 w-8 mx-auto text-primary mb-2" />
                <div className={`text-3xl font-bold ${getReadinessColor(overallResults.readiness)}`}>
                  {overallResults.readiness}
                </div>
                <p className="text-sm text-muted-foreground">Interview Readiness</p>
              </CardContent>
            </Card>
          </div>

          {/* Assessment */}
          <Card>
            <CardHeader>
              <CardTitle>Overall Assessment</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{overallResults.assessment}</p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Strengths */}
            <Card>
              <CardHeader>
                <CardTitle className="text-green-600 flex items-center gap-2">
                  <ThumbsUp className="h-5 w-5" />
                  Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {overallResults.strengths?.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Weaknesses */}
            <Card>
              <CardHeader>
                <CardTitle className="text-orange-600 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Areas to Improve
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {overallResults.weaknesses?.map((w, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                      {w}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Top Priorities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-primary" />
                Top 3 Improvement Priorities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3">
                {overallResults.priorities?.map((p, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium flex-shrink-0">
                      {i + 1}
                    </span>
                    <span className="text-sm">{p}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button onClick={resetInterview} variant="outline" className="flex-1">
              <RotateCcw className="h-4 w-4 mr-2" />
              Practice Again
            </Button>
            <Button onClick={() => window.location.href = '/resume-builder'} className="flex-1">
              Improve Resume
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      )}
    </PageLayout>
  );
};

export default InterviewSimulator;
