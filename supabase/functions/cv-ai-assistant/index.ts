import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, cvData, section } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a professional CV/resume writing assistant. Your job is to help students create compelling, professional CVs that follow best practices.

Current section being edited: ${section}

Guidelines:
- Use strong action verbs (e.g., Developed, Led, Implemented, Increased, Designed)
- Quantify achievements with numbers when possible
- Keep bullet points concise but impactful
- Focus on results and impact, not just responsibilities
- Tailor content to be relevant for job applications
- Use professional language appropriate for academic/professional settings

The CV is for a student applying to jobs/internships. Keep suggestions practical and achievable.`;

    const userMessage = `
Here is the current CV data:
${JSON.stringify(cvData, null, 2)}

User request: ${prompt}

Please provide 3-5 specific, actionable suggestions. Format each suggestion as a complete sentence or bullet point that the user can directly use in their CV.`;

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
          { role: "user", content: userMessage },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Parse suggestions from the response
    const suggestions = content
      .split('\n')
      .filter((line: string) => line.trim().length > 0)
      .filter((line: string) => !line.startsWith('#') && !line.startsWith('##'))
      .map((line: string) => line.replace(/^[-•*]\s*/, '').trim())
      .filter((line: string) => line.length > 10)
      .slice(0, 5);

    return new Response(
      JSON.stringify({ suggestions, rawContent: content }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("CV AI assistant error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
