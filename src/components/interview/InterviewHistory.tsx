import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Skeleton } from '@/components/ui/skeleton';
import { History, Star, TrendingUp, AlertTriangle } from 'lucide-react';
import type { InterviewHistoryItem, OverallFeedback } from '@/types/interview';

export function InterviewHistory() {
  const [history, setHistory] = useState<InterviewHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('mock_interviews')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      setHistory((data || []).map(item => ({
        ...item,
        feedback: item.feedback as unknown as OverallFeedback | null,
        questions: (item.questions as any[]) || [],
        answers: (item.answers as any[]) || [],
      })));
    } catch (err) {
      console.error('[InterviewHistory] Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getScoreBadge = (score: number | null) => {
    if (score === null) return <Badge variant="secondary">N/A</Badge>;
    if (score >= 75) return <Badge className="bg-green-500/20 text-green-700 border-green-500/30">{score}/100</Badge>;
    if (score >= 50) return <Badge className="bg-yellow-500/20 text-yellow-700 border-yellow-500/30">{score}/100</Badge>;
    return <Badge className="bg-red-500/20 text-red-700 border-red-500/30">{score}/100</Badge>;
  };

  const getStatusBadge = (status: string) => {
    if (status === 'completed') return <Badge variant="default">Completed</Badge>;
    return <Badge variant="secondary">In Progress</Badge>;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <History className="h-5 w-5" aria-hidden="true" />
            Past Interviews
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <History className="h-5 w-5" aria-hidden="true" />
            Past Interviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            No interviews yet. Start your first practice session!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <History className="h-5 w-5" aria-hidden="true" />
          Past Interviews ({history.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="max-h-[500px]">
          <Accordion type="single" collapsible className="space-y-2">
            {history.map((item) => (
              <AccordionItem key={item.id} value={item.id} className="border rounded-lg px-3">
                <AccordionTrigger className="hover:no-underline py-3">
                  <div className="flex items-center gap-3 text-left w-full pr-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.job_role}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(item.created_at).toLocaleDateString()} · {item.difficulty}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {getStatusBadge(item.status)}
                      {getScoreBadge(item.overall_score)}
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 pb-2">
                    {item.feedback && (
                      <div className="space-y-2">
                        <p className="text-sm">{item.feedback.assessment}</p>
                        {item.feedback.strengths?.length > 0 && (
                          <div className="flex items-start gap-2">
                            <Star className="h-4 w-4 text-green-500 mt-0.5 shrink-0" aria-hidden="true" />
                            <p className="text-xs text-muted-foreground">
                              <strong>Strengths:</strong> {item.feedback.strengths.join(', ')}
                            </p>
                          </div>
                        )}
                        {item.feedback.weaknesses?.length > 0 && (
                          <div className="flex items-start gap-2">
                            <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" aria-hidden="true" />
                            <p className="text-xs text-muted-foreground">
                              <strong>Improve:</strong> {item.feedback.weaknesses.join(', ')}
                            </p>
                          </div>
                        )}
                        {item.feedback.priorities?.length > 0 && (
                          <div className="flex items-start gap-2">
                            <TrendingUp className="h-4 w-4 text-primary mt-0.5 shrink-0" aria-hidden="true" />
                            <p className="text-xs text-muted-foreground">
                              <strong>Priorities:</strong> {item.feedback.priorities.join(', ')}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                    {item.answers.length > 0 && (
                      <div className="space-y-2 pt-2 border-t">
                        <p className="text-xs font-medium text-muted-foreground uppercase">Q&A Summary</p>
                        {item.answers.map((a, i) => (
                          <div key={i} className="text-xs space-y-1 p-2 rounded bg-muted/50">
                            <p className="font-medium">Q{i + 1}: {a.question}</p>
                            <p className="text-muted-foreground">A: {a.answer?.slice(0, 150)}{a.answer?.length > 150 ? '...' : ''}</p>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-[10px]">{a.verdict}</Badge>
                              <span className="text-muted-foreground">{a.score}/10</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
