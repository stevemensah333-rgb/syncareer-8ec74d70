import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

    const { email, companyName, inviterName }: InviteRequest = await req.json();

    // Validate inputs
    if (!email || !companyName) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Send invitation email via Resend
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "Syncareer <noreply@syncareer.lovable.app>",
        to: [email],
        subject: `You've been invited to join ${companyName} on Syncareer`,
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
                ${inviterName || 'Your employer'} has invited you to join <strong>${companyName}</strong> on Syncareer, a career development platform.
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
              
              <a href="https://syncareer.lovable.app/auth" 
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
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
