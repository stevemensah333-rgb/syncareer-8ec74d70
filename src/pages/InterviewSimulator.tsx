import { useState, useEffect } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mic, Play, CheckCircle, ArrowRight, RotateCcw, Trophy, Clock, Target, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useUserProfile } from '@/contexts/UserProfileContext';

interface Question {
  question: string;
  type: string;
  expectedPoints: string[];
}

interface Answer {
  answer: string;
  feedback: string;
  score: number;
}

const InterviewSimulator = () => {
  const { studentDetails } = useUserProfile();
  const [step, setStep] = useState<'setup' | 'interview' | 'results'>('setup');
  const [jobRole, setJobRole] = useState('');
  const [industry, setIndustry] = useState('');
  const [difficulty, setDifficulty] = useState('intermediate');
  const [isLoading, setIsLoading] = useState(false);
  
  const [interviewId, setInterviewId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [feedback, setFeedback] = useState<{feedback: string; score: number} | null>(null);
  const [overallResults, setOverallResults] = useState<any>(null);

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
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to start interview');
      }

      const data = await response.json();
      setInterviewId(data.interview.id);
      setQuestions(data.questions);
      setAnswers([]);
      setCurrentQuestionIndex(0);
      setStep('interview');
      toast.success('Interview started! Good luck!');
    } catch (error) {
      console.error('Error starting interview:', error);
      toast.error('Failed to start interview');
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
          questionIndex: currentQuestionIndex,
          answer: currentAnswer,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit answer');
      }

      const data = await response.json();
      setFeedback(data.feedback);
      setAnswers(prev => [...prev, { answer: currentAnswer, ...data.feedback }]);
    } catch (error) {
      console.error('Error submitting answer:', error);
      toast.error('Failed to get feedback');
    } finally {
      setIsLoading(false);
    }
  };

  const nextQuestion = () => {
    setFeedback(null);
    setCurrentAnswer('');
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
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
        throw new Error('Failed to get results');
      }

      const data = await response.json();
      setOverallResults(data.overallFeedback);
      setStep('results');
      toast.success('Interview completed!');
    } catch (error) {
      console.error('Error finishing interview:', error);
      toast.error('Failed to get final results');
    } finally {
      setIsLoading(false);
    }
  };

  const resetInterview = () => {
    setStep('setup');
    setInterviewId(null);
    setQuestions([]);
    setAnswers([]);
    setCurrentQuestionIndex(0);
    setCurrentAnswer('');
    setFeedback(null);
    setOverallResults(null);
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
                    Practice with AI-generated questions and get real-time feedback
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
              <div className="space-y-2">
                <Label htmlFor="jobRole">Target Job Role *</Label>
                <Input
                  id="jobRole"
                  value={jobRole}
                  onChange={(e) => setJobRole(e.target.value)}
                  placeholder="e.g., Software Developer, Marketing Manager"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="e.g., Technology, Finance, Healthcare"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty Level</Label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner (Entry-level)</SelectItem>
                    <SelectItem value="intermediate">Intermediate (2-5 years)</SelectItem>
                    <SelectItem value="advanced">Advanced (Senior level)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                className="w-full mt-4" 
                size="lg" 
                onClick={startInterview}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>Preparing Questions...</>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Start Mock Interview
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tips for Success</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  Use the STAR method (Situation, Task, Action, Result)
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  Include specific numbers and achievements
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  Keep answers concise but comprehensive
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  Practice out loud before typing your answer
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      )}

      {step === 'interview' && questions.length > 0 && (
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Progress */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
                <Badge variant="outline">{difficulty}</Badge>
              </div>
              <Progress value={((currentQuestionIndex + 1) / questions.length) * 100} />
            </CardContent>
          </Card>

          {/* Current Question */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Badge>{questions[currentQuestionIndex]?.type || 'General'}</Badge>
              </div>
              <CardTitle className="text-xl mt-2">
                {questions[currentQuestionIndex]?.question}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!feedback ? (
                <>
                  <Textarea
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    placeholder="Type your answer here... Be specific and use examples."
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
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Your Answer:</h4>
                    <p className="text-sm text-muted-foreground">{currentAnswer}</p>
                  </div>
                  
                  <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        AI Feedback
                      </h4>
                      <Badge variant={feedback.score >= 7 ? 'default' : 'secondary'}>
                        Score: {feedback.score}/10
                      </Badge>
                    </div>
                    <p className="text-sm">{feedback.feedback}</p>
                  </div>

                  <Button onClick={nextQuestion} className="w-full">
                    {currentQuestionIndex < questions.length - 1 ? (
                      <>
                        Next Question
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    ) : (
                      <>
                        Finish Interview
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
                Great job practicing for your {jobRole} interview
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
                <div className="text-3xl font-bold">{questions.length}</div>
                <p className="text-sm text-muted-foreground">Questions Answered</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <Clock className="h-8 w-8 mx-auto text-primary mb-2" />
                <div className="text-3xl font-bold">{difficulty}</div>
                <p className="text-sm text-muted-foreground">Difficulty Level</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Detailed Feedback</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-green-600 mb-2">Strengths</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  {overallResults.strengths?.map((s: string, i: number) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-orange-600 mb-2">Areas to Improve</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  {overallResults.improvements?.map((s: string, i: number) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-blue-600 mb-2">Pro Tips</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  {overallResults.tips?.map((s: string, i: number) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button variant="outline" onClick={resetInterview} className="flex-1">
              <RotateCcw className="h-4 w-4 mr-2" />
              Practice Again
            </Button>
            <Button className="flex-1" onClick={() => window.location.href = '/learn'}>
              Continue Learning
            </Button>
          </div>
        </div>
      )}
    </PageLayout>
  );
};

export default InterviewSimulator;
