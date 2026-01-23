import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation constants
const MAX_CV_CONTENT_LENGTH = 50000; // 50KB for CV content
const MAX_PORTFOLIO_CONTENT_LENGTH = 50000; // 50KB for portfolio content
const MAX_FILENAME_LENGTH = 255; // Standard filename length limit

// Validate portfolio analysis request
interface PortfolioRequest {
  cvContent?: string;
  portfolioContent?: string;
  fileName: string;
}

function validatePortfolioRequest(body: unknown): { valid: boolean; error?: string; data?: PortfolioRequest } {
  if (!body || typeof body !== "object") {
    return { valid: false, error: "Request body must be an object" };
  }

  const request = body as Record<string, unknown>;

  // Validate fileName (required)
  if (typeof request.fileName !== "string") {
    return { valid: false, error: "fileName is required and must be a string" };
  }

  if (request.fileName.length === 0) {
    return { valid: false, error: "fileName cannot be empty" };
  }

  if (request.fileName.length > MAX_FILENAME_LENGTH) {
    return { valid: false, error: `fileName exceeds maximum length of ${MAX_FILENAME_LENGTH} characters` };
  }

  // Validate cvContent (optional)
  if (request.cvContent !== undefined) {
    if (typeof request.cvContent !== "string") {
      return { valid: false, error: "cvContent must be a string" };
    }

    if (request.cvContent.length > MAX_CV_CONTENT_LENGTH) {
      return { valid: false, error: `cvContent exceeds maximum length of ${MAX_CV_CONTENT_LENGTH} characters (${Math.round(MAX_CV_CONTENT_LENGTH / 1000)}KB)` };
    }
  }

  // Validate portfolioContent (optional)
  if (request.portfolioContent !== undefined) {
    if (typeof request.portfolioContent !== "string") {
      return { valid: false, error: "portfolioContent must be a string" };
    }

    if (request.portfolioContent.length > MAX_PORTFOLIO_CONTENT_LENGTH) {
      return { valid: false, error: `portfolioContent exceeds maximum length of ${MAX_PORTFOLIO_CONTENT_LENGTH} characters (${Math.round(MAX_PORTFOLIO_CONTENT_LENGTH / 1000)}KB)` };
    }
  }

  // Ensure at least one content type is provided
  if (!request.cvContent && !request.portfolioContent) {
    return { valid: false, error: "At least one of cvContent or portfolioContent must be provided" };
  }

  return {
    valid: true,
    data: {
      cvContent: request.cvContent as string | undefined,
      portfolioContent: request.portfolioContent as string | undefined,
      fileName: request.fileName as string,
    },
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify JWT authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid authorization header' }),
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
      console.error('JWT verification failed:', claimsError);
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = claimsData.claims.sub;
    console.log('Authenticated user:', userId);

    // Parse and validate request body
    let requestBody: unknown;
    try {
      requestBody = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate portfolio request
    const validation = validatePortfolioRequest(requestBody);
    if (!validation.valid) {
      console.warn('Input validation failed:', validation.error);
      return new Response(
        JSON.stringify({ error: validation.error }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { cvContent, portfolioContent, fileName } = validation.data!;
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert career advisor and portfolio reviewer for South Africa. Analyze the provided CV and portfolio content thoroughly and provide:

1. **Strengths**: Key strengths and standout skills
2. **Areas for Improvement**: Specific areas that need work
3. **Skills Gap Analysis**: Missing skills that are in demand
4. **Project Quality**: Assessment of portfolio projects
5. **Market Fit**: How well the profile fits current SA job market
6. **Actionable Recommendations**: Specific steps to improve

Be constructive, specific, and practical in your advice. Focus on the South African job market context.`;

    const userPrompt = `Please analyze this career profile:

${cvContent ? `**CV/Resume:**\n${cvContent}\n\n` : ''}
${portfolioContent ? `**Portfolio/Projects:**\n${portfolioContent}` : ''}

File: ${fileName}`;

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
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required, please add funds to your Lovable AI workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI gateway error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const analysis = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ analysis }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in analyze-portfolio function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
