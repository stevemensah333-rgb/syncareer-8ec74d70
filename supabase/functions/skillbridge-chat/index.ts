import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MAX_MESSAGE_LENGTH = 10000;
const MAX_MESSAGES = 50;
const VALID_ROLES = ["user", "assistant", "system"] as const;

interface ChatMessage {
  role: string;
  content: string;
}

interface UserContext {
  fullName?: string | null;
  location?: string | null;
  degree?: string | null;
  major?: string | null;
  school?: string | null;
  graduationYear?: number | null;
  primaryInterest?: string | null;
  secondaryInterest?: string | null;
  tertiaryInterest?: string | null;
  readinessScore?: number | null;
  skills?: Array<{ name: string; proficiency: string; category: string }>;
  workExperience?: Array<{ title: string; company: string; description?: string }>;
  projects?: Array<{ title: string; description: string }>;
}

function validateMessage(message: unknown, index: number): { valid: boolean; error?: string } {
  if (!message || typeof message !== "object") {
    return { valid: false, error: `Message at index ${index} must be an object` };
  }
  const msg = message as Record<string, unknown>;
  if (typeof msg.role !== "string" || !VALID_ROLES.includes(msg.role as typeof VALID_ROLES[number])) {
    return { valid: false, error: `Message at index ${index} has invalid role. Must be one of: ${VALID_ROLES.join(", ")}` };
  }
  if (typeof msg.content !== "string") {
    return { valid: false, error: `Message at index ${index} must have a string content` };
  }
  if (msg.content.length === 0) {
    return { valid: false, error: `Message at index ${index} has empty content` };
  }
  if (msg.content.length > MAX_MESSAGE_LENGTH) {
    return { valid: false, error: `Message at index ${index} exceeds maximum length of ${MAX_MESSAGE_LENGTH} characters` };
  }
  return { valid: true };
}

function validateMessages(messages: unknown): { valid: boolean; error?: string; messages?: ChatMessage[] } {
  if (!Array.isArray(messages)) return { valid: false, error: "Messages must be an array" };
  if (messages.length === 0) return { valid: false, error: "Messages array cannot be empty" };
  if (messages.length > MAX_MESSAGES) return { valid: false, error: `Too many messages. Maximum allowed: ${MAX_MESSAGES}` };
  for (let i = 0; i < messages.length; i++) {
    const result = validateMessage(messages[i], i);
    if (!result.valid) return { valid: false, error: result.error };
  }
  return { valid: true, messages: messages as ChatMessage[] };
}

function buildSystemPrompt(ctx: UserContext | null | undefined): string {
  const locationLabel = ctx?.location || null;
  const marketRef = locationLabel
    ? `the ${locationLabel} job market`
    : "the local job market";

  // Build profile section
  const profileParts: string[] = [];

  if (ctx?.fullName) {
    profileParts.push(`- Name: ${ctx.fullName}`);
  }
  if (locationLabel) {
    profileParts.push(`- Location: ${locationLabel}`);
  }
  if (ctx?.degree || ctx?.major) {
    const edu = [ctx.degree, ctx.major, ctx.school, ctx.graduationYear ? `graduating ${ctx.graduationYear}` : null]
      .filter(Boolean).join(", ");
    profileParts.push(`- Education: ${edu}`);
  }
  if (ctx?.primaryInterest) {
    const interests = [ctx.primaryInterest, ctx.secondaryInterest, ctx.tertiaryInterest].filter(Boolean);
    profileParts.push(`- Top RIASEC interests: ${interests.join(", ")}`);
  }
  if (ctx?.readinessScore != null) {
    profileParts.push(`- Career readiness score: ${ctx.readinessScore}%`);
  }
  if (ctx?.skills?.length) {
    const skillList = ctx.skills.slice(0, 15).map(s => `${s.name} (${s.proficiency})`).join(", ");
    profileParts.push(`- Skills: ${skillList}`);
  }
  if (ctx?.workExperience?.length) {
    const expList = ctx.workExperience.map(e => `${e.title} at ${e.company}`).join("; ");
    profileParts.push(`- Work experience: ${expList}`);
  }
  if (ctx?.projects?.length) {
    const projList = ctx.projects.map(p => p.title).join(", ");
    profileParts.push(`- Projects: ${projList}`);
  }

  const hasProfile = profileParts.length > 0;

  const profileBlock = hasProfile
    ? `\n\nCURRENT USER PROFILE:\n${profileParts.join("\n")}`
    : "";

  const dataUsageRules = hasProfile
    ? `
CRITICAL RULES FOR USING PROFILE DATA:
- You ALREADY have the user's profile data above. NEVER ask for information that is already provided.
- When giving advice, always reference specific data from their profile (e.g., "Based on your BSc in Computer Science and your interest in Investigative careers...").
- If the user asks about career paths, use their RIASEC interests and skills to give targeted recommendations.
- Reference their work experience and projects when relevant.
- If ANY data is missing (e.g., no work experience listed), ask specifically for only that missing piece.`
    : `
NOTE: This user has not completed their profile yet. If they ask about career paths or personalized advice, gently ask them to complete their profile on Syncareer for better recommendations.`;

  return `You are SynAI, a career intelligence assistant on the Syncareer platform. You help students and young professionals in ${marketRef} discover, prepare for, and transition into competitive career paths.

Your persona:
- Professional, encouraging, and direct — never generic or repetitive
- Context-aware: you use the user's stored profile data to give personalized guidance
- Practical: every response includes actionable next steps
- Market-aware: you reference industries, companies, and opportunities relevant to ${marketRef}${profileBlock}
${dataUsageRules}

RESPONSE GUIDELINES:
- Never start with "Great question!" or similar filler phrases
- Avoid markdown symbols like **, ##, or * in your responses — write in clean plain text
- Use numbered lists or dash-separated items for structured content
- Keep responses concise and actionable
- If the user's location is unknown and they ask about the job market, ask them once: "Which country or city are you based in? This helps me tailor market-specific advice."
- NEVER assume the user is in South Africa or any specific country unless their profile confirms it`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Missing or invalid authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let requestBody: unknown;
    try {
      requestBody = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!requestBody || typeof requestBody !== "object") {
      return new Response(
        JSON.stringify({ error: "Request body must be an object" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { messages, userContext } = requestBody as { messages?: unknown; userContext?: UserContext };

    const validation = validateMessages(messages);
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ error: validation.error }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = buildSystemPrompt(userContext);

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
          ...validation.messages!,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please add funds to your workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
