import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SOURCE_WEIGHTS: Record<string, number> = {
  interview: 0.85,
  assessment: 0.80,
  portfolio: 0.70,
  cv: 0.60,
  endorsement: 0.40,
};

const VALID_SOURCE_TYPES = Object.keys(SOURCE_WEIGHTS);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Service-role only guard
  const authHeader = req.headers.get("Authorization") ?? "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

  const token = authHeader.replace("Bearer ", "");
  if (token !== serviceRoleKey) {
    return new Response(
      JSON.stringify({ error: "forbidden", detail: "service_role required" }),
      { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  try {
    const body = await req.json();
    const { user_id, detected_skills, source_type, source_id, signal_strength } = body;

    // ---- Validate ----
    if (!user_id || !detected_skills || !source_type || !source_id || signal_strength == null) {
      return new Response(
        JSON.stringify({ error: "bad_request", detail: "missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!Array.isArray(detected_skills) || detected_skills.length === 0) {
      return new Response(
        JSON.stringify({ error: "bad_request", detail: "detected_skills must be non-empty array" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!VALID_SOURCE_TYPES.includes(source_type)) {
      return new Response(
        JSON.stringify({ error: "bad_request", detail: `source_type must be one of: ${VALID_SOURCE_TYPES.join(", ")}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const strength = Number(signal_strength);
    if (isNaN(strength) || strength < 0 || strength > 1) {
      return new Response(
        JSON.stringify({ error: "bad_request", detail: "signal_strength must be 0..1" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(JSON.stringify({ event: "skill_graph_update_start", user_id, skill_count: detected_skills.length, source_type }));

    let mapped = 0;
    let skipped = 0;

    for (const raw of detected_skills) {
      const normalized = (raw as string).toLowerCase().trim();
      if (!normalized) {
        skipped++;
        continue;
      }

      // Resolve against taxonomy
      const { data: skillRow } = await supabase
        .from("skills_taxonomy")
        .select("id")
        .eq("canonical_name", normalized)
        .eq("is_active", true)
        .limit(1)
        .maybeSingle();

      if (!skillRow) {
        console.log(JSON.stringify({ event: "skill_not_in_taxonomy", raw: normalized, user_id }));
        skipped++;
        continue;
      }

      const skill_id = skillRow.id;

      // Upsert evidence (idempotent via unique index)
      const { error: evidenceErr } = await supabase
        .from("skill_evidence")
        .upsert(
          {
            user_id,
            skill_id,
            source_type,
            source_id,
            signal_strength: strength,
          },
          { onConflict: "user_id,skill_id,source_type,source_id" }
        );

      if (evidenceErr) {
        console.error(JSON.stringify({ event: "evidence_upsert_failed", user_id, skill_id, error: evidenceErr.message }));
        continue;
      }

      // Recompute confidence: weighted sum clamped to [0, 1]
      const { data: evidenceRows } = await supabase
        .from("skill_evidence")
        .select("signal_strength, source_type")
        .eq("user_id", user_id)
        .eq("skill_id", skill_id);

      let confidence = 0;
      if (evidenceRows) {
        for (const row of evidenceRows) {
          const weight = SOURCE_WEIGHTS[row.source_type] ?? 0.5;
          confidence += row.signal_strength * weight;
        }
      }
      confidence = Math.max(0, Math.min(1, confidence));

      // Upsert user_skill_map
      const { error: mapErr } = await supabase
        .from("user_skill_map")
        .upsert(
          {
            user_id,
            skill_id,
            confidence_score: confidence,
            last_updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id,skill_id" }
        );

      if (mapErr) {
        console.error(JSON.stringify({ event: "skill_map_upsert_failed", user_id, skill_id, error: mapErr.message }));
        continue;
      }

      console.log(JSON.stringify({ event: "confidence_recomputed", user_id, skill_id, confidence }));
      mapped++;
    }

    console.log(JSON.stringify({ event: "skill_graph_update_complete", user_id, mapped, skipped }));

    return new Response(
      JSON.stringify({ success: true, mapped, skipped, user_id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error(JSON.stringify({ event: "skill_graph_update_failed", error: String(err) }));
    return new Response(
      JSON.stringify({ error: "internal_error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
