import React, { useState, useCallback, useEffect } from 'react';
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
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, RadarChart, PolarGrid,
  PolarAngleAxis, Radar,
} from 'recharts';
import {
  ClipboardCheck, ArrowRight, ArrowLeft, RotateCcw, Calendar,
  Trophy, Brain, User, Zap, Compass, Clock,
} from 'lucide-react';
import { useAssessment } from '@/hooks/useAssessment';
import { useFeedbackModal } from '@/hooks/useFeedbackModal';
import { FeedbackModal } from '@/components/feedback/FeedbackModal';
import { useCareerRecommendations } from '@/hooks/useCareerRecommendations';
import { ASSESSMENT_QUESTIONS, LIKERT_OPTIONS, RIASEC_LABELS, RIASEC_DESCRIPTIONS } from '@/data/assessmentQuestions';
import CareerRecommendations from '@/components/assessment/CareerRecommendations';
import { format, differenceInDays } from 'date-fns';

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

// Section intro definitions
const SECTION_INTROS = [
  {
    key: 'personality',
    title: 'Personality Traits',
    description: 'These 15 questions explore how you think, work, and relate to others. There are no right or wrong answers — respond based on how you genuinely behave.',
    icon: User,
    color: 'text-primary',
    bg: 'bg-primary/10',
    questionRange: '1–15',
  },
  {
    key: 'skills',
    title: 'Skills Preference',
    description: 'These 15 questions identify the types of tasks and activities you enjoy and feel confident doing. Rate each statement based on your actual experience.',
    icon: Zap,
    color: 'text-accent',
    bg: 'bg-accent/10',
    questionRange: '16–30',
  },
  {
    key: 'work_interest',
    title: 'Work Interest (RIASEC)',
    description: 'These 15 questions map your interests to the 6 RIASEC career categories — Realistic, Investigative, Artistic, Social, Enterprising, and Conventional.',
    icon: Compass,
    color: 'text-secondary-foreground',
    bg: 'bg-secondary/30',
    questionRange: '31–45',
  },
];

// Which page indices start a new section
const SECTION_START_PAGES: Record<number, string> = {
  0: 'personality',
  3: 'skills',
  6: 'work_interest',
};

const Assessment = () => {
  const { profile } = useUserProfile();
  const { latestResult, allResults, loading, submitting, canRetake, submitAssessment } = useAssessment();
  const { recommendations, clusterInsight, loading: careersLoading } = useCareerRecommendations(latestResult);
  const feedbackModal = useFeedbackModal('assessment');
  const [takingAssessment, setTakingAssessment] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showIntro, setShowIntro] = useState<string | null>(null); // section key

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

  // Auto-advance when all current questions answered
  useEffect(() => {
    if (!takingAssessment || showIntro) return;
    const allAnswered = currentQuestions.every(q => answers[q.id] !== undefined);
    if (!allAnswered) return;
    if (currentPage >= totalPages - 1) return;

    const nextPage = currentPage + 1;
    const nextSectionKey = SECTION_START_PAGES[nextPage];

    // Small delay for smooth UX
    const timer = setTimeout(() => {
      if (nextSectionKey) {
        setShowIntro(nextSectionKey);
      } else {
        setCurrentPage(nextPage);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [answers, currentPage, currentQuestions, takingAssessment, showIntro, totalPages]);

  const handleNext = () => {
    if (currentPage < totalPages - 1) {
      const nextPage = currentPage + 1;
      const nextSectionKey = SECTION_START_PAGES[nextPage];
      if (nextSectionKey) {
        setShowIntro(nextSectionKey);
      } else {
        setCurrentPage(nextPage);
      }
    }
  };

  const handlePrev = () => {
    if (currentPage > 0) setCurrentPage(p => p - 1);
  };

  const handleIntroNext = () => {
    const intro = SECTION_INTROS.find(s => s.key === showIntro);
    if (!intro) return;
    const startPage = Object.entries(SECTION_START_PAGES).find(([, k]) => k === showIntro)?.[0];
    if (startPage !== undefined) setCurrentPage(parseInt(startPage));
    setShowIntro(null);
  };

  const handleStartAssessment = () => {
    setTakingAssessment(true);
    setShowIntro('personality');
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

  // Days remaining until retake
  const daysUntilRetake = latestResult
    ? Math.max(0, 30 - differenceInDays(new Date(), new Date(latestResult.completed_at)))
    : 0;

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

  // ── Section Intro Screen ──────────────────────────────────────────────────
  if (takingAssessment && showIntro) {
    const intro = SECTION_INTROS.find(s => s.key === showIntro)!;
    const Icon = intro.icon;
    const introIndex = SECTION_INTROS.indexOf(intro);
    return (
      <PageLayout title="Assessment">
        <div className="max-w-xl mx-auto">
          {/* Overall progress */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2 text-sm text-muted-foreground">
              <span>{answeredCount} of {TOTAL_QUESTIONS} answered</span>
              <span>Section {introIndex + 1} of 3</span>
            </div>
            <Progress value={progressPercent} className="h-1.5" />
          </div>

          <Card>
            <CardContent className="pt-10 pb-10 flex flex-col items-center text-center space-y-5">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${intro.bg}`}>
                <Icon className={`h-8 w-8 ${intro.color}`} />
              </div>
              <div className="space-y-1">
                <Badge variant="secondary" className="text-xs mb-2">
                  Questions {intro.questionRange}
                </Badge>
                <h2 className="text-xl font-semibold">{intro.title}</h2>
              </div>
              <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
                {intro.description}
              </p>
              <Button size="lg" onClick={handleIntroNext} className="mt-2">
                Begin Section <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    );
  }

  // ── Taking Assessment ─────────────────────────────────────────────────────
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
              <Card key={q.id} className={`border-l-4 transition-colors ${answers[q.id] !== undefined ? 'border-l-primary' : 'border-l-primary/20'}`}>
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
                      <div
                        key={opt.value}
                        className={`flex items-center space-x-3 p-2 rounded-lg transition-colors cursor-pointer ${
                          answers[q.id] === opt.value ? 'bg-primary/10 border border-primary/30' : 'hover:bg-muted/50'
                        }`}
                        onClick={() => handleAnswer(q.id, opt.value)}
                      >
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

          {/* Auto-advance hint */}
          {allCurrentAnswered && !isLastPage && (
            <p className="text-center text-xs text-muted-foreground animate-pulse">
              All answered — advancing automatically...
            </p>
          )}

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

  // ── No Result Yet ─────────────────────────────────────────────────────────
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
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                {SECTION_INTROS.map(s => {
                  const Icon = s.icon;
                  return (
                    <div key={s.key} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center ${s.bg}`}>
                        <Icon className={`h-4 w-4 ${s.color}`} />
                      </div>
                      {s.title}
                    </div>
                  );
                })}
              </div>
              <Button size="lg" onClick={handleStartAssessment}>
                Start Assessment <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    );
  }

  // ── Results View ──────────────────────────────────────────────────────────
  const riasecChartData = Object.entries(latestResult.work_interest_score_json)
    .map(([key, value]) => ({
      name: RIASEC_LABELS[key] || key,
      score: value as number,
    }))
    .sort((a, b) => b.score - a.score);

  // Personality radar data (q1–q15, keys like "q1" → values 1–5, normalized to 0–100)
  const personalityKeys = [
    { label: 'Leadership', qIds: [1, 7, 14] },
    { label: 'Independence', qIds: [2, 8] },
    { label: 'Adaptability', qIds: [3, 13] },
    { label: 'Social', qIds: [4, 9, 11, 15] },
    { label: 'Detail', qIds: [5, 12] },
    { label: 'Drive', qIds: [10, 6] },
  ];

  const personalityRadar = personalityKeys.map(({ label, qIds }) => {
    const vals = qIds.map(id => (latestResult.personality_score_json as Record<string, number>)[`q${id}`] || 0);
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
    return { axis: label, value: Math.round((avg / 5) * 100) };
  });

  // Skills bar data (q16–q30)
  const skillsMap: { label: string; qIds: number[] }[] = [
    { label: 'Writing', qIds: [16] },
    { label: 'Data', qIds: [17, 24] },
    { label: 'Tech', qIds: [18, 28] },
    { label: 'Presenting', qIds: [19] },
    { label: 'Planning', qIds: [20, 27] },
    { label: 'Problem Solving', qIds: [21, 26] },
    { label: 'Design', qIds: [22] },
    { label: 'Negotiation', qIds: [23] },
    { label: 'Relationships', qIds: [25, 29, 30] },
  ];

  const skillsChartData = skillsMap.map(({ label, qIds }) => {
    const vals = qIds.map(id => (latestResult.skills_score_json as Record<string, number>)[`q${id}`] || 0);
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
    return { name: label, score: Math.round((avg / 5) * 100) };
  }).sort((a, b) => b.score - a.score);

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
          <div className="flex items-center gap-3">
            {!canRetake() && daysUntilRetake > 0 && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground bg-muted/50 rounded-lg px-3 py-1.5">
                <Clock className="h-3.5 w-3.5" />
                <span>{daysUntilRetake} day{daysUntilRetake !== 1 ? 's' : ''} until retake</span>
              </div>
            )}
            <Button
              variant="outline"
              onClick={handleStartAssessment}
              disabled={!canRetake()}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Retake Assessment
            </Button>
          </div>
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

        {/* Work Interest (RIASEC) Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Compass className="h-5 w-5 text-primary" />
              Work Interest — RIASEC Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={riasecChartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip
                    formatter={(value: number) => [`${value}%`, 'Score']}
                    contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                  />
                  <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                    {riasecChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={SECTION_COLORS[entry.name] || 'hsl(var(--primary))'}
                        opacity={index < 3 ? 1 : 0.45}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Personality Radar + Skills Bar — side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personality Radar */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="h-4 w-4 text-primary" />
                Personality Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={personalityRadar} cx="50%" cy="50%" outerRadius="70%">
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis
                      dataKey="axis"
                      tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <Radar
                      name="Personality"
                      dataKey="value"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.15}
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-muted-foreground text-center mt-1">
                Scores aggregated from personality questions (1–15)
              </p>
            </CardContent>
          </Card>

          {/* Skills Bar Chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Zap className="h-4 w-4 text-accent" />
                Skills Preference
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={skillsChartData}
                    layout="vertical"
                    margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                    <XAxis
                      type="number"
                      domain={[0, 100]}
                      tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={90}
                      tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <Tooltip
                      formatter={(value: number) => [`${value}%`, 'Score']}
                      contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                    />
                    <Bar dataKey="score" radius={[0, 4, 4, 0]} fill="hsl(var(--accent))" fillOpacity={0.85} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-muted-foreground text-center mt-1">
                Scores aggregated from skills questions (16–30)
              </p>
            </CardContent>
          </Card>
        </div>

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
      <FeedbackModal
        isOpen={feedbackModal.isOpen}
        onSubmit={feedbackModal.submitFeedback}
        onDismiss={feedbackModal.dismiss}
      />
    </PageLayout>
  );
};

export default Assessment;
