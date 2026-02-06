import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// ─── Type Definitions ──────────────────────────────────────────────

interface InterviewRequest {
  action: 'start' | 'answer' | 'feedback';
  interviewId?: string;
  jobRole?: string;
  industry?: string;
  difficulty?: string;
  interviewType?: string;
  resumeText?: string;
  jobDescription?: string;
  questionIndex?: number;
  answer?: string;
  conversationHistory?: Array<{ role: string; content: string }>;
}

interface AIResponse {
  choices: Array<{ message: { content: string } }>;
}

// ─── Prompts ───────────────────────────────────────────────────────

const getSystemPrompt = (role: string, level: string, type: string, resumeText: string, jobDescription: string) => `
You are a professional job interviewer conducting a realistic mock interview.

Your goal is to simulate a real interview experience and help the candidate improve.
You must be honest, specific, and constructive. Do NOT be overly encouraging or give generic praise.

INTERVIEW CONTEXT:
- Target role: ${role}
- Seniority level: ${level}
- Interview type: ${type}
${resumeText ? `- Resume content: ${resumeText}` : ''}
${jobDescription ? `- Job description: ${jobDescription}` : ''}

INTERVIEW RULES:
1. Ask ONE question at a time.
2. Questions must be relevant to the role and based on the resume and/or job description.
3. Ask natural follow-up questions when answers are vague, weak, or incomplete.
4. Do not give feedback until the user finishes answering a question, unless explicitly asked.
5. Keep the interview realistic in tone and difficulty.
6. Do not reveal evaluation criteria unless feedback is requested.

QUESTION GUIDELINES:
- Prefer questions tied directly to the candidate's projects, skills, or experience.
- If the candidate claims a skill, test understanding of that skill.
- Behavioral questions should encourage STAR-style answers.
- Avoid trivia; focus on reasoning, decision-making, and impact.

Maintain professionalism throughout. Act like a real interviewer, not a coach, unless feedback is requested.
`;

const getFeedbackPrompt = (question: string, answer: string) => `
The candidate just answered the following interview question:

Question: "${question}"
Candidate's Answer: "${answer}"

Please evaluate this answer. Return your response as JSON with this exact structure:
{
  "verdict": "Strong" | "Average" | "Weak",
  "score": <number 1-10>,
  "feedback": "<specific, actionable feedback>",
  "improvedAnswer": "<concise, interview-ready example>",
  "tip": "<one actionable tip>"
}

Be honest and specific. Focus on: Clarity, Structure (STAR method), Relevance, Depth, Evidence of impact, Conciseness.
`;

const getOverallFeedbackPrompt = (role: string, level: string, answers: any[]) => `
The mock interview for ${role} (${level} level) has concluded.

Performance summary:
${answers.map((a, i) => `
Q${i + 1}: ${a.question}
A: ${a.answer}
Score: ${a.score}/10 | Verdict: ${a.verdict}
`).join('\n')}

Provide an end-of-interview summary as JSON:
{
  "overallScore": <number 0-100>,
  "overallVerdict": "Low" | "Medium" | "High",
  "assessment": "<2-3 sentence overall performance assessment>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "weaknesses": ["<weakness 1>", "<weakness 2>"],
  "priorities": ["<priority 1>", "<priority 2>", "<priority 3>"],
  "readiness": "Low" | "Medium" | "High"
}

Be honest and specific to help the candidate understand their real-world interview readiness.
`;

// ─── Utility Functions ─────────────────────────────────────────────

function safeJsonParse(content: string, fallback: any): any {
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error("[mock-interview] JSON parse error:", e);
  }
  return fallback;
}

async function callAI(messages: Array<{ role: string; content: string }>, apiKey: string): Promise<string> {
  const startTime = Date.now();
  console.log(`[mock-interview] Calling AI with ${messages.length} messages`);

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages,
    }),
  });

  const elapsed = Date.now() - startTime;
  console.log(`[mock-interview] AI response: ${response.status} in ${elapsed}ms`);

  if (!response.ok) {
    const status = response.status;
    if (status === 429) {
      throw { status: 429, message: "Rate limit exceeded. Please wait before trying again." };
    }
    if (status === 402) {
      throw { status: 402, message: "Service quota exceeded." };
    }
    const errText = await response.text().catch(() => 'Unknown error');
    console.error(`[mock-interview] AI error: ${status} - ${errText}`);
    throw { status: 500, message: "AI service temporarily unavailable." };
  }

  const data: AIResponse = await response.json();
  return data.choices[0]?.message?.content || '';
}

function errorResponse(message: string, status: number) {
  return new Response(
    JSON.stringify({ error: message }),
    { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

function successResponse(data: any) {
  return new Response(
    JSON.stringify(data),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// ─── Main Handler ──────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const requestId = crypto.randomUUID().slice(0, 8);
  const startTime = Date.now();
  console.log(`[mock-interview][${requestId}] Request received`);

  try {
    // ── Auth ──
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      console.warn(`[mock-interview][${requestId}] Missing auth header`);
      return errorResponse('Missing authorization header', 401);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      console.warn(`[mock-interview][${requestId}] Invalid token`);
      return errorResponse('Invalid token', 401);
    }

    const userId = claimsData.claims.sub;
    console.log(`[mock-interview][${requestId}] User: ${userId}`);

    // ── Parse Body ──
    let body: InterviewRequest;
    try {
      body = await req.json();
    } catch {
      return errorResponse('Invalid request body', 400);
    }

    if (!body.action || !['start', 'answer', 'feedback'].includes(body.action)) {
      return errorResponse('Invalid action. Must be: start, answer, or feedback', 400);
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error(`[mock-interview][${requestId}] LOVABLE_API_KEY not configured`);
      return errorResponse('AI service not configured', 500);
    }

    // ══════════════════════════════════════════════════════════════
    // ACTION: START
    // ══════════════════════════════════════════════════════════════
    if (body.action === 'start') {
      if (!body.jobRole?.trim()) {
        return errorResponse('jobRole is required', 400);
      }

      const role = body.jobRole;
      const level = body.difficulty === 'beginner' ? 'entry-level/internship' :
                    body.difficulty === 'advanced' ? 'senior level' : 'mid-level (2-5 years)';
      const type = body.interviewType || 'mixed';
      const resumeText = (body.resumeText || '').slice(0, 3000);
      const jobDescription = (body.jobDescription || '').slice(0, 3000);

      console.log(`[mock-interview][${requestId}] Starting interview: role=${role}, level=${level}, type=${type}`);

      const systemPrompt = getSystemPrompt(role, level, type, resumeText, jobDescription);

      const firstQuestion = await callAI([
        { role: "system", content: systemPrompt },
        { role: "user", content: `Begin the interview. Introduce yourself briefly as the interviewer, then ask your first question. Remember: ONE question only, relevant to the ${role} role at ${level} level.` }
      ], LOVABLE_API_KEY);

      if (!firstQuestion) {
        return errorResponse('Failed to generate interview question', 500);
      }

      const { data: interview, error: insertError } = await supabase
        .from('mock_interviews')
        .insert({
          user_id: userId,
          job_role: body.jobRole,
          industry: body.industry || null,
          difficulty: body.difficulty || 'intermediate',
          questions: [{ question: firstQuestion, type }],
          answers: [],
          status: 'in_progress'
        })
        .select()
        .single();

      if (insertError) {
        console.error(`[mock-interview][${requestId}] Insert error:`, insertError);
        return errorResponse('Failed to create interview record', 500);
      }

      console.log(`[mock-interview][${requestId}] Interview created: ${interview.id} in ${Date.now() - startTime}ms`);

      return successResponse({
        interview,
        currentQuestion: firstQuestion,
        questionNumber: 1
      });
    }

    // ══════════════════════════════════════════════════════════════
    // ACTION: ANSWER
    // ══════════════════════════════════════════════════════════════
    if (body.action === 'answer') {
      if (!body.interviewId) {
        return errorResponse('interviewId is required', 400);
      }
      if (!body.answer?.trim()) {
        return errorResponse('answer is required', 400);
      }

      const { data: interview, error: fetchErr } = await supabase
        .from('mock_interviews')
        .select('*')
        .eq('id', body.interviewId)
        .eq('user_id', userId)
        .single();

      if (fetchErr || !interview) {
        console.warn(`[mock-interview][${requestId}] Interview not found: ${body.interviewId}`);
        return errorResponse('Interview not found', 404);
      }

      const questions = (interview.questions as any[]) || [];
      const currentQuestion = questions[questions.length - 1]?.question || '';
      const role = interview.job_role;
      const level = interview.difficulty === 'beginner' ? 'entry-level/internship' :
                    interview.difficulty === 'advanced' ? 'senior level' : 'mid-level (2-5 years)';
      const type = body.interviewType || 'mixed';

      console.log(`[mock-interview][${requestId}] Processing answer for Q${questions.length}`);

      // Get feedback
      let feedback = { verdict: "Average", score: 5, feedback: "Good attempt.", improvedAnswer: "", tip: "" };
      try {
        const feedbackContent = await callAI([
          { role: "system", content: "You are an expert interview coach evaluating candidate responses. Be honest and specific." },
          { role: "user", content: getFeedbackPrompt(currentQuestion, body.answer) }
        ], LOVABLE_API_KEY);

        feedback = safeJsonParse(feedbackContent, feedback);
      } catch (e) {
        console.warn(`[mock-interview][${requestId}] Feedback generation failed, using defaults:`, e);
      }

      // Update answers
      const answers = (interview.answers as any[]) || [];
      answers.push({
        question: currentQuestion,
        answer: body.answer,
        feedback: feedback.feedback,
        score: feedback.score,
        verdict: feedback.verdict,
        improvedAnswer: feedback.improvedAnswer,
        tip: feedback.tip
      });

      const isLastQuestion = questions.length >= 5;

      if (!isLastQuestion) {
        // Generate next question
        let nextQuestion = "Tell me about a challenging project you worked on.";
        try {
          const conversationHistory = (body.conversationHistory || []).slice(-10); // Limit context
          const systemPrompt = getSystemPrompt(role, level, type, '', '');

          const nextContent = await callAI([
            { role: "system", content: systemPrompt },
            ...conversationHistory.map(h => ({ role: h.role === 'assistant' ? 'assistant' : 'user', content: h.content })),
            { role: "user", content: body.answer },
            { role: "user", content: `Based on the candidate's previous answer, ask your next interview question. This is question ${questions.length + 1} of 5. Make it progressively more challenging. ONE question only.` }
          ], LOVABLE_API_KEY);

          if (nextContent) nextQuestion = nextContent;
        } catch (e) {
          console.warn(`[mock-interview][${requestId}] Next question generation failed, using fallback:`, e);
        }

        questions.push({ question: nextQuestion, type });

        const { error: updateErr } = await supabase
          .from('mock_interviews')
          .update({ questions, answers })
          .eq('id', body.interviewId);

        if (updateErr) {
          console.error(`[mock-interview][${requestId}] Update error:`, updateErr);
        }

        console.log(`[mock-interview][${requestId}] Answer processed, next Q${questions.length} in ${Date.now() - startTime}ms`);

        return successResponse({
          feedback,
          nextQuestion,
          questionNumber: questions.length,
          isComplete: false
        });
      } else {
        // Last question
        const { error: updateErr } = await supabase
          .from('mock_interviews')
          .update({ answers })
          .eq('id', body.interviewId);

        if (updateErr) {
          console.error(`[mock-interview][${requestId}] Update error:`, updateErr);
        }

        console.log(`[mock-interview][${requestId}] Final answer processed in ${Date.now() - startTime}ms`);

        return successResponse({
          feedback,
          isComplete: true,
          questionNumber: questions.length
        });
      }
    }

    // ══════════════════════════════════════════════════════════════
    // ACTION: FEEDBACK
    // ══════════════════════════════════════════════════════════════
    if (body.action === 'feedback') {
      if (!body.interviewId) {
        return errorResponse('interviewId is required', 400);
      }

      const { data: interview, error: fetchErr } = await supabase
        .from('mock_interviews')
        .select('*')
        .eq('id', body.interviewId)
        .eq('user_id', userId)
        .single();

      if (fetchErr || !interview) {
        return errorResponse('Interview not found', 404);
      }

      const answers = (interview.answers as any[]) || [];
      const role = interview.job_role;
      const level = interview.difficulty === 'beginner' ? 'entry-level/internship' :
                    interview.difficulty === 'advanced' ? 'senior level' : 'mid-level (2-5 years)';

      console.log(`[mock-interview][${requestId}] Generating overall feedback for ${answers.length} answers`);

      let overallFeedback = {
        overallScore: 50,
        overallVerdict: "Medium",
        assessment: "You showed good potential but need more practice.",
        strengths: ["Clear communication"],
        weaknesses: ["Could provide more specific examples"],
        priorities: ["Practice STAR method", "Research the company", "Prepare questions to ask"],
        readiness: "Medium"
      };

      try {
        const content = await callAI([
          { role: "system", content: "You are an expert interview coach providing final assessment. Be honest and constructive." },
          { role: "user", content: getOverallFeedbackPrompt(role, level, answers) }
        ], LOVABLE_API_KEY);

        overallFeedback = safeJsonParse(content, overallFeedback);
      } catch (e) {
        console.warn(`[mock-interview][${requestId}] Overall feedback generation failed, using defaults:`, e);
      }

      // Ensure arrays are valid
      overallFeedback.strengths = Array.isArray(overallFeedback.strengths) ? overallFeedback.strengths : [];
      overallFeedback.weaknesses = Array.isArray(overallFeedback.weaknesses) ? overallFeedback.weaknesses : [];
      overallFeedback.priorities = Array.isArray(overallFeedback.priorities) ? overallFeedback.priorities : [];

      const { error: updateErr } = await supabase
        .from('mock_interviews')
        .update({
          status: 'completed',
          overall_score: overallFeedback.overallScore,
          feedback: overallFeedback,
          completed_at: new Date().toISOString()
        })
        .eq('id', body.interviewId);

      if (updateErr) {
        console.error(`[mock-interview][${requestId}] Final update error:`, updateErr);
      }

      console.log(`[mock-interview][${requestId}] Feedback complete: score=${overallFeedback.overallScore} in ${Date.now() - startTime}ms`);

      return successResponse({ overallFeedback, answers });
    }

    return errorResponse('Invalid action', 400);

  } catch (error: any) {
    const elapsed = Date.now() - startTime;
    console.error(`[mock-interview][${requestId}] Error after ${elapsed}ms:`, error);

    // Forward specific status codes
    if (error.status && error.message) {
      return errorResponse(error.message, error.status);
    }

    return errorResponse(
      error instanceof Error ? error.message : 'An unexpected error occurred',
      500
    );
  }
});
