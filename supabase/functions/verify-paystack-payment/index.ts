import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const paystackSecret = Deno.env.get("PAYSTACK_SECRET_KEY")!;

    // Verify user auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseClient = createClient(supabaseUrl, serviceRoleKey);
    const anonClient = createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_ANON_KEY")!
    );

    const {
      data: { user },
      error: authError,
    } = await anonClient.auth.getUser(authHeader.replace("Bearer ", ""));

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { reference, plan } = await req.json();

    if (!reference) {
      return new Response(JSON.stringify({ error: "Missing reference" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check for duplicate reference
    const { data: existingPayment } = await supabaseClient
      .from("payments")
      .select("id, status")
      .eq("paystack_reference", reference)
      .single();

    if (existingPayment?.status === "success") {
      return new Response(
        JSON.stringify({ status: "success", message: "Payment already verified" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify with Paystack API
    const verifyRes = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: {
          Authorization: `Bearer ${paystackSecret}`,
        },
      }
    );

    if (!verifyRes.ok) {
      console.error("Paystack verify failed:", verifyRes.status);
      return new Response(
        JSON.stringify({ error: "Paystack verification failed" }),
        {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const verifyData = await verifyRes.json();
    const txData = verifyData.data;

    if (!txData || txData.status !== "success") {
      // Record failed payment
      await supabaseClient.from("payments").upsert(
        {
          user_id: user.id,
          email: user.email || "",
          amount: txData?.amount || 0,
          currency: txData?.currency || "GHS",
          status: "failed",
          paystack_reference: reference,
          payment_method: txData?.channel || "unknown",
          metadata: txData || {},
        },
        { onConflict: "paystack_reference" }
      );

      return new Response(
        JSON.stringify({ status: "failed", message: "Payment was not successful" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Insert successful payment
    const { data: payment, error: paymentError } = await supabaseClient
      .from("payments")
      .upsert(
        {
          user_id: user.id,
          email: txData.customer?.email || user.email || "",
          amount: txData.amount,
          currency: txData.currency || "GHS",
          status: "success",
          paystack_reference: reference,
          payment_method: txData.channel || "card",
          metadata: {
            paystack_id: txData.id,
            paid_at: txData.paid_at,
            plan: plan || "premium",
            authorization: txData.authorization
              ? {
                  channel: txData.authorization.channel,
                  card_type: txData.authorization.card_type,
                  bank: txData.authorization.bank,
                  brand: txData.authorization.brand,
                }
              : null,
          },
        },
        { onConflict: "paystack_reference" }
      )
      .select()
      .single();

    if (paymentError) {
      console.error("Payment insert error:", paymentError);
      return new Response(
        JSON.stringify({ error: "Failed to record payment" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Calculate period end based on plan
    const now = new Date();
    const periodEnd = new Date(now);
    if (plan === "yearly") {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    } else {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    }

    // Upsert subscription
    const { error: subError } = await supabaseClient
      .from("subscriptions")
      .upsert(
        {
          user_id: user.id,
          tier: "premium",
          status: "active",
          payment_id: payment.id,
          current_period_start: now.toISOString(),
          current_period_end: periodEnd.toISOString(),
        },
        { onConflict: "user_id" }
      );

    if (subError) {
      console.error("Subscription upsert error:", subError);
    }

    return new Response(
      JSON.stringify({
        status: "success",
        message: "Payment verified and subscription activated",
        subscription: {
          tier: "premium",
          period_end: periodEnd.toISOString(),
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Verify payment error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
