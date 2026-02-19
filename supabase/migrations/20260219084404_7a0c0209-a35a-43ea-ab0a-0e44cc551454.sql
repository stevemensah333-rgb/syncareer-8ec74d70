
-- ========================================
-- SECTION 1 — MIGRATION FUNCTION
-- ========================================

CREATE OR REPLACE FUNCTION public.migrate_skills_to_relational()
RETURNS TABLE (
  source_table TEXT,
  mapped_count BIGINT,
  unmapped_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_career_mapped BIGINT := 0;
  v_career_unmapped BIGINT := 0;
  v_job_mapped BIGINT := 0;
  v_job_unmapped BIGINT := 0;
  v_career RECORD;
  v_job RECORD;
  v_skill TEXT;
  v_normalized TEXT;
  v_skill_id UUID;
BEGIN
  -- ---- CAREERS ----
  FOR v_career IN SELECT id, required_skills FROM careers WHERE required_skills IS NOT NULL AND array_length(required_skills, 1) > 0
  LOOP
    FOREACH v_skill IN ARRAY v_career.required_skills
    LOOP
      v_normalized := lower(trim(v_skill));

      SELECT st.id INTO v_skill_id
      FROM skills_taxonomy st
      WHERE st.canonical_name = v_normalized AND st.is_active = true
      LIMIT 1;

      IF v_skill_id IS NOT NULL THEN
        INSERT INTO career_skills (career_id, skill_id)
        VALUES (v_career.id, v_skill_id)
        ON CONFLICT DO NOTHING;
        v_career_mapped := v_career_mapped + 1;
      ELSE
        INSERT INTO unmapped_skills_log (raw_skill_text, source_table, source_id)
        VALUES (v_normalized, 'careers', v_career.id)
        ON CONFLICT DO NOTHING;
        v_career_unmapped := v_career_unmapped + 1;
      END IF;
    END LOOP;
  END LOOP;

  -- ---- JOB POSTINGS ----
  FOR v_job IN SELECT id, skills FROM job_postings WHERE skills IS NOT NULL AND array_length(skills, 1) > 0
  LOOP
    FOREACH v_skill IN ARRAY v_job.skills
    LOOP
      v_normalized := lower(trim(v_skill));

      SELECT st.id INTO v_skill_id
      FROM skills_taxonomy st
      WHERE st.canonical_name = v_normalized AND st.is_active = true
      LIMIT 1;

      IF v_skill_id IS NOT NULL THEN
        INSERT INTO job_posting_skills (job_posting_id, skill_id)
        VALUES (v_job.id, v_skill_id)
        ON CONFLICT DO NOTHING;
        v_job_mapped := v_job_mapped + 1;
      ELSE
        INSERT INTO unmapped_skills_log (raw_skill_text, source_table, source_id)
        VALUES (v_normalized, 'job_postings', v_job.id)
        ON CONFLICT DO NOTHING;
        v_job_unmapped := v_job_unmapped + 1;
      END IF;
    END LOOP;
  END LOOP;

  RETURN QUERY
    SELECT 'careers'::TEXT, v_career_mapped, v_career_unmapped
    UNION ALL
    SELECT 'job_postings'::TEXT, v_job_mapped, v_job_unmapped;
END;
$$;

-- Add unique constraint on unmapped_skills_log to support ON CONFLICT DO NOTHING
CREATE UNIQUE INDEX IF NOT EXISTS idx_unmapped_skills_unique
ON unmapped_skills_log (raw_skill_text, source_table, source_id);
