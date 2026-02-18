import React, { useState, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { useUserProfile } from '@/contexts/UserProfileContext';
import { getHomeRouteForRole } from '@/components/auth/RoleRoute';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ClipboardCheck, ArrowRight, ArrowLeft, RotateCcw, Calendar, Trophy, Brain } from 'lucide-react';
import { useAssessment } from '@/hooks/useAssessment';
import { useFeedbackModal } from '@/hooks/useFeedbackModal';
import { FeedbackModal } from '@/components/feedback/FeedbackModal';
import { useCareerRecommendations } from '@/hooks/useCareerRecommendations';
import { ASSESSMENT_QUESTIONS, LIKERT_OPTIONS, RIASEC_LABELS, RIASEC_DESCRIPTIONS } from '@/data/assessmentQuestions';
import CareerRecommendations from '@/components/assessment/CareerRecommendations';
import { format } from 'date-fns';

const QUESTIONS_PER_PAGE = 5;
const TOTAL_QUESTIONS = 45;

const SECTION_COLORS: Record<string, string> = {
  Realistic: 'hsl(var(--primary))',
  Investigative: 'hsl(var(--accent))',
  Artistic: 'hsl(var(--secondary))',
  Social: 'hsl(168, 81%, 44%)',
  Enterprising: 'hsl(38, 92%, 50%)',
  Conventional: 'hsl(220, 14%, 46%)',
};

const Assessment = () => {
  const { profile } = useUserProfile();
  const { latestResult, allResults, loading, submitting, canRetake, submitAssessment } = useAssessment();
  const { recommendations, clusterInsight, loading: careersLoading } = useCareerRecommendations(latestResult);
  const feedbackModal = useFeedbackModal('assessment');
  const [takingAssessment, setTakingAssessment] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});

  const totalPages = Math.ceil(TOTAL_QUESTIONS / QUESTIONS_PER_PAGE);
  const currentQuestions = ASSESSMENT_QUESTIONS.slice(
    currentPage * QUESTIONS_PER_PAGE,
    (currentPage + 1) * QUESTIONS_PER_PAGE
  );

  const answeredCount = Object.keys(answers).length;
  const progressPercent = (answeredCount / TOTAL_QUESTIONS) * 100;

  const currentSection = currentQuestions[0]?.category;
  const sectionLabel = currentSection === 'personality' ? 'Personality' : currentSection === 'skills' ? 'Skills Preference' : 'Work Interest';

  const handleAnswer = useCallback((questionId: number, value: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  }, []);

  const handleNext = () => {
    if (currentPage < totalPages - 1) setCurrentPage(p => p + 1);
  };

  const handlePrev = () => {
    if (currentPage > 0) setCurrentPage(p => p - 1);
  };

  const handleSubmit = async () => {
    const success = await submitAssessment(answers);
    if (success) {
      setTakingAssessment(false);
      setAnswers({});
      setCurrentPage(0);
      feedbackModal.triggerFeedback();
    }
  };

  const allCurrentAnswered = currentQuestions.every(q => answers[q.id] !== undefined);
  const isLastPage = currentPage === totalPages - 1;

  // Only students can access assessment - RoleRoute handles this now
  if (profile && profile.user_type !== 'student') {
    return <Navigate to={getHomeRouteForRole(profile.user_type)} replace />;
  }

  if (loading) {
    return (
      <PageLayout title="Assessment">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading assessment data...</p>
        </div>
      </PageLayout>
    );
  }

  // Taking assessment view
  if (takingAssessment) {
    return (
      <PageLayout title="Assessment">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Progress */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="secondary">{sectionLabel}</Badge>
                <span className="text-sm text-muted-foreground">
                  Question {currentPage * QUESTIONS_PER_PAGE + 1}–{Math.min((currentPage + 1) * QUESTIONS_PER_PAGE, TOTAL_QUESTIONS)} of {TOTAL_QUESTIONS}
                </span>
              </div>
              <Progress value={progressPercent} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">{answeredCount} of {TOTAL_QUESTIONS} answered</p>
            </CardContent>
          </Card>

          {/* Questions */}
          <div className="space-y-4">
            {currentQuestions.map((q, idx) => (
              <Card key={q.id} className="border-l-4 border-l-primary/30">
                <CardContent className="pt-6">
                  <p className="font-medium mb-4">
                    <span className="text-muted-foreground mr-2">{currentPage * QUESTIONS_PER_PAGE + idx + 1}.</span>
                    {q.text}
                  </p>
                  <RadioGroup
                    value={answers[q.id]?.toString() || ''}
                    onValueChange={(val) => handleAnswer(q.id, parseInt(val))}
                    className="space-y-2"
                  >
                    {LIKERT_OPTIONS.map(opt => (
                      <div key={opt.value} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                        <RadioGroupItem value={opt.value.toString()} id={`q${q.id}-${opt.value}`} />
                        <Label htmlFor={`q${q.id}-${opt.value}`} className="cursor-pointer flex-1 text-sm">
                          {opt.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={handlePrev} disabled={currentPage === 0}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Previous
            </Button>
            {isLastPage ? (
              <Button
                onClick={handleSubmit}
                disabled={answeredCount < TOTAL_QUESTIONS || submitting}
              >
                {submitting ? 'Submitting...' : 'Submit Assessment'}
                <ClipboardCheck className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleNext} disabled={!allCurrentAnswered}>
                Next <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </PageLayout>
    );
  }

  // Results view (or prompt)
  if (!latestResult) {
    return (
      <PageLayout title="Assessment">
        <div className="max-w-xl mx-auto">
          <Card className="text-center">
            <CardContent className="pt-8 pb-8 space-y-4">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Brain className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-xl font-semibold">Complete your Assessment to personalize your experience</h2>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                Answer 45 questions across Personality, Skills Preference, and Work Interest to discover your RIASEC career profile and unlock personalized recommendations.
              </p>
              <Button size="lg" onClick={() => setTakingAssessment(true)}>
                Start Assessment <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    );
  }

  // Display results
  const chartData = Object.entries(latestResult.work_interest_score_json)
    .map(([key, value]) => ({
      name: RIASEC_LABELS[key] || key,
      score: value,
    }))
    .sort((a, b) => b.score - a.score);

  const top3 = chartData.slice(0, 3);

  return (
    <PageLayout title="Assessment">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Last taken on {format(new Date(latestResult.completed_at), 'MMMM d, yyyy')}
            </span>
          </div>
          <Button
            variant="outline"
            onClick={() => setTakingAssessment(true)}
            disabled={!canRetake()}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            {canRetake() ? 'Retake Assessment' : 'Retake available in 30 days'}
          </Button>
        </div>

        {/* Top 3 Interests */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              Your Top Interest Areas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[latestResult.primary_interest, latestResult.secondary_interest, latestResult.tertiary_interest].map((interest, i) => {
                if (!interest) return null;
                const key = Object.entries(RIASEC_LABELS).find(([, v]) => v === interest)?.[0] || '';
                return (
                  <div key={i} className="p-4 rounded-lg border bg-card">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={i === 0 ? 'default' : 'secondary'}>#{i + 1}</Badge>
                      <span className="font-semibold">{interest}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {RIASEC_DESCRIPTIONS[key] || ''}
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* RIASEC Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Work Interest Assessment Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value: number) => [`${value}%`, 'Score']} />
                  <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={SECTION_COLORS[entry.name] || 'hsl(var(--primary))'}
                        opacity={index < 3 ? 1 : 0.5}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Career Recommendations */}
        <CareerRecommendations
          recommendations={recommendations}
          clusterInsight={clusterInsight}
          primaryInterest={latestResult.primary_interest}
          secondaryInterest={latestResult.secondary_interest}
          tertiaryInterest={latestResult.tertiary_interest}
          loading={careersLoading}
        />

        {/* History */}
        {allResults.length > 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Assessment History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {allResults.map((r, i) => (
                  <div key={r.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(r.completed_at), 'MMM d, yyyy')}
                      </span>
                      {i === 0 && <Badge>Latest</Badge>}
                    </div>
                    <div className="flex gap-2">
                      {[r.primary_interest, r.secondary_interest, r.tertiary_interest].filter(Boolean).map((interest, j) => (
                        <Badge key={j} variant="outline" className="text-xs">{interest}</Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={feedbackModal.isOpen}
        onSubmit={feedbackModal.submitFeedback}
        onDismiss={feedbackModal.dismiss}
      />
    </PageLayout>
  );
};

export default Assessment;
