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
  interviewType?: string;
  resumeText?: string;
  jobDescription?: string;
  questionIndex?: number;
  answer?: string;
  conversationHistory?: Array<{ role: string; content: string }>;
}

const getSystemPrompt = (role: string, level: string, type: string, resumeText: string, jobDescription: string) => `
You are a professional job interviewer conducting a realistic mock interview.

Your goal is to simulate a real interview experience and help the candidate improve.

You must be honest, specific, and constructive. Do NOT be overly encouraging.

Do NOT give generic praise.

INTERVIEW CONTEXT:
- Target role: ${role}
- Seniority level: ${level}
- Interview type: ${type}
- Resume content: ${resumeText || 'Not provided'}
- Job description: ${jobDescription || 'Not provided'}

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

WHEN THE USER REQUESTS FEEDBACK:
Evaluate the answer using these criteria:
- Clarity
- Structure (STAR or logical flow)
- Relevance to the question
- Depth of reasoning
- Evidence of impact or results
- Conciseness

Provide:
1. A brief verdict (Strong / Average / Weak)
2. Specific, actionable feedback (what's missing or unclear)
3. One improved example answer (concise, interview-ready)
4. A tip for future answers of this type

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
  "feedback": "<specific, actionable feedback about what was good and what's missing>",
  "improvedAnswer": "<a concise, interview-ready example of how to answer better>",
  "tip": "<one actionable tip for similar questions>"
}

Be honest and specific. If the answer is weak, say so. Focus on:
- Clarity and structure (STAR method)
- Relevance to the question
- Depth of reasoning and examples
- Evidence of impact or results
- Conciseness
`;

const getOverallFeedbackPrompt = (role: string, level: string, answers: any[]) => `
The mock interview for ${role} (${level} level) has concluded.

Here is a summary of the candidate's performance:
${answers.map((a, i) => `
Question ${i + 1}: ${a.question}
Answer: ${a.answer}
Score: ${a.score}/10
Verdict: ${a.verdict}
`).join('\n')}

Please provide an end-of-interview summary as JSON:
{
  "overallScore": <number 0-100>,
  "overallVerdict": "Low" | "Medium" | "High",
  "assessment": "<2-3 sentence overall performance assessment>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "weaknesses": ["<weakness 1>", "<weakness 2>"],
  "priorities": ["<priority 1>", "<priority 2>", "<priority 3>"],
  "readiness": "Low" | "Medium" | "High"
}

Be honest and specific. This should help the candidate understand their real-world interview readiness.
`;

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

    // ACTION: START - Initialize interview with first question
    if (body.action === 'start') {
      const role = body.jobRole || 'General';
      const level = body.difficulty === 'beginner' ? 'entry-level/internship' : 
                    body.difficulty === 'intermediate' ? 'mid-level (2-5 years)' : 'senior level';
      const type = body.interviewType || 'mixed';
      const resumeText = body.resumeText || '';
      const jobDescription = body.jobDescription || '';

      const systemPrompt = getSystemPrompt(role, level, type, resumeText, jobDescription);
      
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
            { role: "user", content: `Begin the interview. Introduce yourself briefly as the interviewer, then ask your first question. Remember: ONE question only, relevant to the ${role} role at ${level} level.` }
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
      const firstQuestion = data.choices[0].message.content;

      // Create interview record
      const { data: interview, error: insertError } = await supabase
        .from('mock_interviews')
        .insert({
          user_id: userId,
          job_role: body.jobRole,
          industry: body.industry,
          difficulty: body.difficulty || 'intermediate',
          questions: [{ question: firstQuestion, type: type }],
          answers: [],
          status: 'in_progress'
        })
        .select()
        .single();

      if (insertError) throw insertError;

      return new Response(
        JSON.stringify({ 
          interview, 
          currentQuestion: firstQuestion,
          questionNumber: 1
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ACTION: ANSWER - Process answer and get feedback + next question
    if (body.action === 'answer') {
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
      const currentQuestion = questions[questions.length - 1]?.question || '';
      const role = interview.job_role;
      const level = interview.difficulty === 'beginner' ? 'entry-level/internship' : 
                    interview.difficulty === 'intermediate' ? 'mid-level (2-5 years)' : 'senior level';
      const type = body.interviewType || 'mixed';

      // Get feedback for this answer
      const feedbackResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: "You are an expert interview coach evaluating candidate responses. Be honest and specific." },
            { role: "user", content: getFeedbackPrompt(currentQuestion, body.answer || '') }
          ],
        }),
      });

      let feedback = { verdict: "Average", score: 5, feedback: "Good attempt.", improvedAnswer: "", tip: "" };
      if (feedbackResponse.ok) {
        const feedbackData = await feedbackResponse.json();
        try {
          const content = feedbackData.choices[0].message.content;
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
      answers.push({
        question: currentQuestion,
        answer: body.answer,
        feedback: feedback.feedback,
        score: feedback.score,
        verdict: feedback.verdict,
        improvedAnswer: feedback.improvedAnswer,
        tip: feedback.tip
      });

      const questionCount = questions.length;
      const isLastQuestion = questionCount >= 5;

      if (!isLastQuestion) {
        // Generate next question based on conversation
        const conversationHistory = body.conversationHistory || [];
        const systemPrompt = getSystemPrompt(role, level, type, '', '');
        
        const nextQuestionResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              { role: "system", content: systemPrompt },
              ...conversationHistory,
              { role: "user", content: body.answer },
              { role: "user", content: `Based on the candidate's previous answer, ask your next interview question. This is question ${questionCount + 1} of 5. Make it progressively more challenging. Remember: ONE question only.` }
            ],
          }),
        });

        let nextQuestion = "Tell me about a challenging project you worked on.";
        if (nextQuestionResponse.ok) {
          const nextData = await nextQuestionResponse.json();
          nextQuestion = nextData.choices[0].message.content;
        }

        // Add next question to questions array
        questions.push({ question: nextQuestion, type: type });

        await supabase
          .from('mock_interviews')
          .update({ questions, answers })
          .eq('id', body.interviewId);

        return new Response(
          JSON.stringify({ 
            feedback, 
            nextQuestion,
            questionNumber: questionCount + 1,
            isComplete: false
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        // Last question - mark as ready for final feedback
        await supabase
          .from('mock_interviews')
          .update({ answers })
          .eq('id', body.interviewId);

        return new Response(
          JSON.stringify({ 
            feedback,
            isComplete: true,
            questionNumber: questionCount
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // ACTION: FEEDBACK - Get overall interview feedback
    if (body.action === 'feedback') {
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
      const role = interview.job_role;
      const level = interview.difficulty === 'beginner' ? 'entry-level/internship' : 
                    interview.difficulty === 'intermediate' ? 'mid-level (2-5 years)' : 'senior level';

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: "You are an expert interview coach providing final assessment. Be honest and constructive." },
            { role: "user", content: getOverallFeedbackPrompt(role, level, answers) }
          ],
        }),
      });

      let overallFeedback = {
        overallScore: 50,
        overallVerdict: "Medium",
        assessment: "You showed good potential but need more practice.",
        strengths: ["Clear communication", "Good examples"],
        weaknesses: ["Needs more specifics", "Could use STAR method more"],
        priorities: ["Practice STAR method", "Research the company", "Prepare questions to ask"],
        readiness: "Medium"
      };

      if (response.ok) {
        const data = await response.json();
        try {
          const content = data.choices[0].message.content;
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            overallFeedback = JSON.parse(jsonMatch[0]);
          }
        } catch (e) {
          console.error("Failed to parse overall feedback:", e);
        }
      }

      await supabase
        .from('mock_interviews')
        .update({
          status: 'completed',
          overall_score: overallFeedback.overallScore,
          feedback: overallFeedback,
          completed_at: new Date().toISOString()
        })
        .eq('id', body.interviewId);

      return new Response(
        JSON.stringify({ overallFeedback, answers }),
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
