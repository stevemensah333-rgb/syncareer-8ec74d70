import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InterviewRequest {
  action: 'start' | 'answer' | 'feedback';
  interviewId?: string;
  jobRole?: string;
  industry?: string;
  difficulty?: string;
  questionIndex?: number;
  answer?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = claimsData.claims.sub;
    const body: InterviewRequest = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (body.action === 'start') {
      // Generate interview questions
      const systemPrompt = `You are an expert interviewer. Generate 5 interview questions for a ${body.difficulty || 'intermediate'} level ${body.jobRole} position in the ${body.industry || 'general'} industry.
      
Return a JSON array of questions with this structure:
[
  {
    "question": "The interview question",
    "type": "behavioral|technical|situational",
    "expectedPoints": ["key point 1", "key point 2"]
  }
]

Make questions realistic and challenging but appropriate for the difficulty level.`;

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Generate 5 interview questions for: ${body.jobRole}` }
          ],
        }),
      });

      if (!response.ok) {
        const status = response.status;
        if (status === 429) {
          return new Response(JSON.stringify({ error: "Rate limit exceeded" }), { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
        if (status === 402) {
          return new Response(JSON.stringify({ error: "Payment required" }), { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
        throw new Error("AI gateway error");
      }

      const data = await response.json();
      let questions = [];
      try {
        const content = data.choices[0].message.content;
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          questions = JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        console.error("Failed to parse questions:", e);
        questions = [
          { question: "Tell me about yourself and your experience.", type: "behavioral", expectedPoints: ["Background", "Relevant experience", "Career goals"] },
          { question: "What are your greatest strengths?", type: "behavioral", expectedPoints: ["Specific strengths", "Examples", "Relevance to role"] },
          { question: "Describe a challenging project you worked on.", type: "situational", expectedPoints: ["Context", "Actions taken", "Results achieved"] },
          { question: "Where do you see yourself in 5 years?", type: "behavioral", expectedPoints: ["Career vision", "Growth mindset", "Alignment with role"] },
          { question: "Why are you interested in this position?", type: "behavioral", expectedPoints: ["Company research", "Role fit", "Enthusiasm"] }
        ];
      }

      // Create interview record
      const { data: interview, error: insertError } = await supabase
        .from('mock_interviews')
        .insert({
          user_id: userId,
          job_role: body.jobRole,
          industry: body.industry,
          difficulty: body.difficulty || 'intermediate',
          questions: questions,
          status: 'in_progress'
        })
        .select()
        .single();

      if (insertError) throw insertError;

      return new Response(
        JSON.stringify({ interview, questions }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (body.action === 'answer') {
      // Save answer and get feedback for single question
      const { data: interview } = await supabase
        .from('mock_interviews')
        .select('*')
        .eq('id', body.interviewId)
        .eq('user_id', userId)
        .single();

      if (!interview) {
        return new Response(
          JSON.stringify({ error: 'Interview not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const questions = interview.questions as any[];
      const currentQuestion = questions[body.questionIndex || 0];
      
      // Get AI feedback for this answer
      const feedbackPrompt = `You are an interview coach. Evaluate this answer to an interview question.

Question: ${currentQuestion.question}
Expected points: ${currentQuestion.expectedPoints?.join(', ')}
Candidate's answer: ${body.answer}

Provide brief, constructive feedback (2-3 sentences) and a score from 1-10.
Return JSON: {"feedback": "your feedback", "score": 8}`;

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: "You are an interview coach. Provide brief, actionable feedback." },
            { role: "user", content: feedbackPrompt }
          ],
        }),
      });

      let feedback = { feedback: "Good answer!", score: 7 };
      if (response.ok) {
        const data = await response.json();
        try {
          const content = data.choices[0].message.content;
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            feedback = JSON.parse(jsonMatch[0]);
          }
        } catch (e) {
          console.error("Failed to parse feedback:", e);
        }
      }

      // Update answers array
      const answers = interview.answers as any[] || [];
      answers[body.questionIndex || 0] = {
        answer: body.answer,
        feedback: feedback.feedback,
        score: feedback.score
      };

      await supabase
        .from('mock_interviews')
        .update({ answers })
        .eq('id', body.interviewId);

      return new Response(
        JSON.stringify({ feedback }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (body.action === 'feedback') {
      // Complete interview and get overall feedback
      const { data: interview } = await supabase
        .from('mock_interviews')
        .select('*')
        .eq('id', body.interviewId)
        .eq('user_id', userId)
        .single();

      if (!interview) {
        return new Response(
          JSON.stringify({ error: 'Interview not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const answers = interview.answers as any[] || [];
      const avgScore = answers.length > 0 
        ? Math.round(answers.reduce((sum, a) => sum + (a?.score || 0), 0) / answers.length * 10)
        : 50;

      const overallFeedback = {
        overallScore: avgScore,
        strengths: ["Clear communication", "Good examples"],
        improvements: ["Add more specifics", "Practice STAR method"],
        tips: ["Research the company more", "Prepare questions to ask"]
      };

      await supabase
        .from('mock_interviews')
        .update({
          status: 'completed',
          overall_score: avgScore,
          feedback: overallFeedback,
          completed_at: new Date().toISOString()
        })
        .eq('id', body.interviewId);

      return new Response(
        JSON.stringify({ overallFeedback }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Mock interview error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
