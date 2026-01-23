import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation constants
const MAX_MESSAGE_LENGTH = 10000; // 10KB per message
const MAX_MESSAGES = 50; // Maximum number of messages in conversation
const VALID_ROLES = ["user", "assistant", "system"] as const;

interface ChatMessage {
  role: string;
  content: string;
}

// Validate a single message
function validateMessage(message: unknown, index: number): { valid: boolean; error?: string } {
  if (!message || typeof message !== "object") {
    return { valid: false, error: `Message at index ${index} must be an object` };
  }

  const msg = message as Record<string, unknown>;

  // Validate role
  if (typeof msg.role !== "string" || !VALID_ROLES.includes(msg.role as typeof VALID_ROLES[number])) {
    return { valid: false, error: `Message at index ${index} has invalid role. Must be one of: ${VALID_ROLES.join(", ")}` };
  }

  // Validate content
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

// Validate the entire messages array
function validateMessages(messages: unknown): { valid: boolean; error?: string; messages?: ChatMessage[] } {
  if (!Array.isArray(messages)) {
    return { valid: false, error: "Messages must be an array" };
  }

  if (messages.length === 0) {
    return { valid: false, error: "Messages array cannot be empty" };
  }

  if (messages.length > MAX_MESSAGES) {
    return { valid: false, error: `Too many messages. Maximum allowed: ${MAX_MESSAGES}` };
  }

  // Validate each message
  for (let i = 0; i < messages.length; i++) {
    const result = validateMessage(messages[i], i);
    if (!result.valid) {
      return { valid: false, error: result.error };
    }
  }

  return { valid: true, messages: messages as ChatMessage[] };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Verify JWT authentication
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
      console.error("JWT verification failed:", claimsError);
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub;
    console.log("Authenticated user:", userId);

    // Parse and validate request body
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

    const { messages } = requestBody as { messages?: unknown };

    // Validate messages
    const validation = validateMessages(messages);
    if (!validation.valid) {
      console.warn("Input validation failed:", validation.error);
      return new Response(
        JSON.stringify({ error: validation.error }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { 
            role: "system", 
            content: "You are SkillBridge AI, a career counsellor and advisor for young professionals and students in South Africa. Your role is to provide guidance on career paths, skill development, job market trends, CV improvement, interview preparation, and connecting skills to opportunities. Be encouraging, practical, and focused on actionable advice. Reference the user's portfolio, skills, and peer ratings when available." 
          },
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
