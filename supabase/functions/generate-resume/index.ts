import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ResumeRequest {
  action: 'generate' | 'improve' | 'save';
  resumeId?: string;
  personalInfo?: {
    fullName: string;
    phone: string;
    email: string;
    linkedin?: string;
    nationality?: string;
  };
  education?: Array<{
    school: string;
    degree: string;
    major: string;
    graduationDate: string;
    gpa?: string;
  }>;
  experience?: Array<{
    company: string;
    title: string;
    location: string;
    startDate: string;
    endDate?: string;
    bullets: string[];
  }>;
  skills?: string[];
  projects?: Array<{
    name: string;
    role: string;
    duration: string;
    bullets: string[];
  }>;
  achievements?: Array<{
    title: string;
    organization: string;
    date: string;
  }>;
  activities?: Array<{
    organization: string;
    role: string;
    duration: string;
    bullets: string[];
  }>;
  targetRole?: string;
  sectionToImprove?: string;
  contentToImprove?: string;
}

// CV Template structure based on the uploaded sample
const CV_TEMPLATE = `
# [FULL NAME]
[PHONE] / [NATIONALITY]
[EMAIL] / [SECONDARY_EMAIL]
[LINKEDIN]

# EDUCATION
[SCHOOL], [LOCATION]
[DEGREE] - [MAJOR]
Expected Date of Graduation: [GRADUATION_DATE]
Cumulative GPA: [GPA]

# ACHIEVEMENTS/AWARDS
[ACHIEVEMENT_TITLE], [ORGANIZATION], [DATE]

# WORK EXPERIENCE
[COMPANY] – [LOCATION], [DATE]
[JOB_TITLE]
• [BULLET_POINT_1]
• [BULLET_POINT_2]
• [BULLET_POINT_3]

# PROJECT AND RESEARCH
[PROJECT_NAME], [DURATION]
[ROLE]
• [BULLET_POINT_1]
• [BULLET_POINT_2]

# CO-CURRICULAR ACTIVITIES
[ORGANIZATION], [ACTIVITY_NAME], [DURATION]
[ROLE]
• [BULLET_POINT_1]
• [BULLET_POINT_2]

# SKILLS
• [SKILL_CATEGORY_1]
• [SKILL_CATEGORY_2]

# REFERENCES
Available upon request
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
    const body: ResumeRequest = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (body.action === 'improve') {
      // AI-powered content improvement
      const systemPrompt = `You are an expert CV/resume writer. Your task is to improve resume content to be more impactful, using action verbs and quantifiable achievements where possible.

Guidelines:
- Start bullet points with strong action verbs
- Include metrics and numbers when possible (e.g., "increased by 5%", "managed team of 10")
- Keep content concise but impactful
- Use industry-appropriate language
- Focus on achievements, not just responsibilities

Return improved content in the same format as received.`;

      const userPrompt = `Improve this ${body.sectionToImprove || 'resume'} content for a ${body.targetRole || 'professional'} position:

${body.contentToImprove}

Return only the improved content, nothing else.`;

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
            { role: "user", content: userPrompt }
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
      const improvedContent = data.choices[0].message.content;

      return new Response(
        JSON.stringify({ improvedContent }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (body.action === 'generate') {
      // Generate bullet points for experience/projects based on role
      const systemPrompt = `You are an expert CV writer. Generate professional, impactful bullet points for a resume.

Guidelines:
- Start with strong action verbs (Developed, Led, Implemented, Designed, etc.)
- Include quantifiable results where appropriate
- Keep each bullet to 1-2 lines
- Focus on achievements and impact
- Use industry-appropriate terminology

Return a JSON array of 3 bullet points.`;

      const userPrompt = `Generate 3 professional bullet points for this role:
Role: ${body.targetRole || 'Professional'}
Context: ${body.contentToImprove || 'General work experience'}

Return JSON array: ["bullet 1", "bullet 2", "bullet 3"]`;

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
            { role: "user", content: userPrompt }
          ],
        }),
      });

      if (!response.ok) {
        throw new Error("AI gateway error");
      }

      const data = await response.json();
      let bullets = [];
      try {
        const content = data.choices[0].message.content;
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          bullets = JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        bullets = [
          "Contributed to key projects and initiatives",
          "Collaborated with cross-functional teams to achieve goals",
          "Demonstrated strong problem-solving and communication skills"
        ];
      }

      return new Response(
        JSON.stringify({ bullets }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (body.action === 'save') {
      // Save resume to database
      const resumeData = {
        user_id: userId,
        title: `Resume - ${body.personalInfo?.fullName || 'Untitled'}`,
        template: 'classic',
        personal_info: body.personalInfo || {},
        education: body.education || [],
        experience: body.experience || [],
        skills: body.skills || [],
        projects: body.projects || [],
        achievements: body.achievements || [],
      };

      let result;
      if (body.resumeId) {
        const { data, error } = await supabase
          .from('resumes')
          .update(resumeData)
          .eq('id', body.resumeId)
          .eq('user_id', userId)
          .select()
          .single();
        if (error) throw error;
        result = data;
      } else {
        const { data, error } = await supabase
          .from('resumes')
          .insert(resumeData)
          .select()
          .single();
        if (error) throw error;
        result = data;
      }

      return new Response(
        JSON.stringify({ resume: result }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Resume generation error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
