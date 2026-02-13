import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation constants
const MAX_EMAIL_LENGTH = 255;
const MAX_NAME_LENGTH = 200;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface InviteRequest {
  email: string;
  companyName: string;
  inviterName: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication check - verify JWT token
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      console.error("Missing or invalid authorization header");
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
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
      console.error("Invalid token:", claimsError?.message);
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const userId = claimsData.claims.sub;
    console.log("Authenticated user:", userId);

    // Verify user is an employer by checking employer_details
    const { data: employerData, error: employerError } = await supabase
      .from("employer_details")
      .select("id, company_name")
      .eq("user_id", userId)
      .single();

    if (employerError || !employerData) {
      console.error("User is not an employer or employer details not found");
      return new Response(
        JSON.stringify({ error: "Only employers can send employee invitations" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    if (!resendApiKey) {
      console.log("RESEND_API_KEY not configured - invitation emails disabled");
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Invitation recorded (email not sent - RESEND_API_KEY not configured)" 
        }),
        { 
          status: 200, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }

    let requestBody: unknown;
    try {
      requestBody = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!requestBody || typeof requestBody !== "object") {
      return new Response(
        JSON.stringify({ error: "Request body must be an object" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { email, companyName, inviterName } = requestBody as InviteRequest;

    // Validate email
    if (!email || typeof email !== "string") {
      return new Response(
        JSON.stringify({ error: "Valid email is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const trimmedEmail = email.trim();
    if (trimmedEmail.length === 0 || trimmedEmail.length > MAX_EMAIL_LENGTH) {
      return new Response(
        JSON.stringify({ error: `Email must be between 1 and ${MAX_EMAIL_LENGTH} characters` }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate company name
    if (!companyName || typeof companyName !== "string") {
      return new Response(
        JSON.stringify({ error: "Valid company name is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const trimmedCompanyName = companyName.trim();
    if (trimmedCompanyName.length === 0 || trimmedCompanyName.length > MAX_NAME_LENGTH) {
      return new Response(
        JSON.stringify({ error: `Company name must be between 1 and ${MAX_NAME_LENGTH} characters` }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate inviter name (optional but if provided, must be valid)
    let sanitizedInviterName = "";
    if (inviterName) {
      if (typeof inviterName !== "string") {
        return new Response(
          JSON.stringify({ error: "Inviter name must be a string" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
      sanitizedInviterName = inviterName.trim();
      if (sanitizedInviterName.length > MAX_NAME_LENGTH) {
        return new Response(
          JSON.stringify({ error: `Inviter name must be less than ${MAX_NAME_LENGTH} characters` }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    }

    console.log("Sending employee invite to:", trimmedEmail, "for company:", trimmedCompanyName, "by user:", userId);

    // Send invitation email via Resend
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "Syncareer <no-reply@syncareer.me>",
        to: [trimmedEmail],
        subject: `You've been invited to join ${trimmedCompanyName} on Syncareer`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px; background-color: #f5f5f5;">
            <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <h1 style="color: #1a1a1a; margin-bottom: 16px;">You're Invited! 🎉</h1>
              
              <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6;">
                ${sanitizedInviterName || 'Your employer'} has invited you to join <strong>${trimmedCompanyName}</strong> on Syncareer, a career development platform.
              </p>
              
              <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6;">
                As part of the team, you'll have access to:
              </p>
              
              <ul style="color: #4a4a4a; font-size: 16px; line-height: 1.8;">
                <li>Professional training courses</li>
                <li>AI-powered interview preparation</li>
                <li>Career development resources</li>
                <li>Community networking</li>
              </ul>
              
              <a href="https://syncareer.lovable.app/" 
                 style="display: inline-block; background: #6366f1; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 24px 0;">
                Join Syncareer
              </a>
              
              <p style="color: #888; font-size: 14px; margin-top: 32px;">
                If you didn't expect this invitation, you can safely ignore this email.
              </p>
            </div>
          </body>
          </html>
        `,
      }),
    });

    if (!res.ok) {
      const errorData = await res.text();
      console.error("Resend API error:", errorData);
      throw new Error(`Failed to send email: ${errorData}`);
    }

    const data = await res.json();
    console.log("Email sent successfully:", data);

    return new Response(
      JSON.stringify({ success: true, message: "Invitation email sent successfully" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-employee-invite:", error);
    return new Response(
      JSON.stringify({ error: "Failed to send invitation" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
