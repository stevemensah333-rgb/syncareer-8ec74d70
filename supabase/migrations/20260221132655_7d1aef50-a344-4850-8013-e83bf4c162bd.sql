
-- SECTION 1A: Seed skills_taxonomy from existing career required_skills
-- Idempotent: ON CONFLICT DO NOTHING on canonical_name unique constraint
-- First ensure unique constraint exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'skills_taxonomy_canonical_name_key'
  ) THEN
    ALTER TABLE skills_taxonomy ADD CONSTRAINT skills_taxonomy_canonical_name_key UNIQUE (canonical_name);
  END IF;
END $$;

-- Categorize and insert all distinct skills from careers
INSERT INTO skills_taxonomy (canonical_name, category, description, is_active)
VALUES
  -- Technical / Engineering
  ('programming', 'technical', 'Software development and coding', true),
  ('python', 'technical', 'Python programming language', true),
  ('machine learning', 'technical', 'ML algorithms and model development', true),
  ('data analysis', 'technical', 'Analyzing and interpreting data sets', true),
  ('data visualization', 'technical', 'Visual representation of data', true),
  ('statistics', 'technical', 'Statistical analysis and methods', true),
  ('version control', 'technical', 'Git and source code management', true),
  ('system design', 'technical', 'Designing software and system architecture', true),
  ('agile', 'technical', 'Agile software development methodology', true),
  ('excel', 'technical', 'Microsoft Excel and spreadsheet analysis', true),
  ('erp systems', 'technical', 'Enterprise resource planning systems', true),
  ('crm tools', 'technical', 'Customer relationship management tools', true),
  ('analytics', 'technical', 'Data and business analytics', true),

  -- Cybersecurity
  ('network security', 'technical', 'Securing computer networks', true),
  ('penetration testing', 'technical', 'Security testing and ethical hacking', true),
  ('incident response', 'technical', 'Responding to security incidents', true),
  ('siem tools', 'technical', 'Security information and event management', true),
  ('risk assessment', 'technical', 'Evaluating and mitigating risks', true),

  -- Design
  ('figma', 'design', 'Figma design tool', true),
  ('adobe creative suite', 'design', 'Adobe design software suite', true),
  ('autocad', 'design', 'AutoCAD drafting software', true),
  ('cad software', 'design', 'Computer-aided design software', true),
  ('3d modeling', 'design', '3D modeling and rendering', true),
  ('prototyping', 'design', 'Creating prototypes and mockups', true),
  ('color theory', 'design', 'Understanding color principles', true),
  ('typography', 'design', 'Font selection and text layout', true),
  ('visual design', 'design', 'Visual aesthetics and layout', true),
  ('design thinking', 'design', 'Human-centered design methodology', true),
  ('user research', 'design', 'UX research and user testing', true),
  ('video editing', 'design', 'Video production and editing', true),

  -- Business / Strategy
  ('project management', 'business', 'Planning and executing projects', true),
  ('product strategy', 'business', 'Product vision and roadmap planning', true),
  ('strategic planning', 'business', 'Long-term organizational planning', true),
  ('strategic thinking', 'business', 'High-level strategic analysis', true),
  ('strategy', 'business', 'Business strategy development', true),
  ('financial modeling', 'business', 'Building financial models and forecasts', true),
  ('financial reporting', 'business', 'Preparing financial statements', true),
  ('budgeting', 'business', 'Budget planning and management', true),
  ('auditing', 'business', 'Financial and operational auditing', true),
  ('tax preparation', 'business', 'Tax filing and compliance', true),
  ('logistics planning', 'business', 'Supply chain and logistics management', true),
  ('process optimization', 'business', 'Improving business processes', true),
  ('fundraising', 'business', 'Raising capital and donor management', true),
  ('policy analysis', 'business', 'Analyzing public or organizational policy', true),

  -- Marketing
  ('digital marketing', 'marketing', 'Online marketing strategies', true),
  ('content strategy', 'marketing', 'Content planning and management', true),
  ('brand development', 'marketing', 'Building brand identity', true),
  ('branding', 'marketing', 'Brand strategy and positioning', true),
  ('creative strategy', 'marketing', 'Creative campaign development', true),
  ('storytelling', 'marketing', 'Narrative communication', true),

  -- HR / People
  ('recruitment', 'hr', 'Talent acquisition and hiring', true),
  ('employee relations', 'hr', 'Managing employee relationships', true),
  ('hris', 'hr', 'HR information systems', true),

  -- Soft Skills
  ('communication', 'soft_skills', 'Verbal and written communication', true),
  ('leadership', 'soft_skills', 'Leading teams and initiatives', true),
  ('team leadership', 'soft_skills', 'Managing and directing teams', true),
  ('critical thinking', 'soft_skills', 'Analytical reasoning and evaluation', true),
  ('problem solving', 'soft_skills', 'Identifying and resolving issues', true),
  ('negotiation', 'soft_skills', 'Negotiation and deal-making', true),
  ('conflict resolution', 'soft_skills', 'Resolving interpersonal conflicts', true),
  ('presentations', 'soft_skills', 'Public speaking and presenting', true),
  ('attention to detail', 'soft_skills', 'Precision and thoroughness', true),
  ('empathy', 'soft_skills', 'Understanding others perspectives', true),
  ('patience', 'soft_skills', 'Calm and persistent demeanor', true),
  ('active listening', 'soft_skills', 'Attentive and engaged listening', true),
  ('mentoring', 'soft_skills', 'Guiding and developing others', true),
  ('networking', 'soft_skills', 'Building professional relationships', true),
  ('advocacy', 'soft_skills', 'Championing causes and people', true),

  -- Healthcare / Science
  ('patient care', 'healthcare', 'Direct patient healthcare', true),
  ('clinical assessment', 'healthcare', 'Clinical evaluation of patients', true),
  ('pharmacology', 'healthcare', 'Drug therapy and medication', true),
  ('lab techniques', 'science', 'Laboratory methods and procedures', true),
  ('scientific writing', 'science', 'Academic and research writing', true),
  ('field research', 'science', 'Conducting field studies', true),
  ('mathematics', 'science', 'Mathematical analysis', true),
  ('materials science', 'engineering', 'Study of material properties', true),
  ('structural analysis', 'engineering', 'Analyzing structural integrity', true),
  ('thermodynamics', 'engineering', 'Heat and energy systems', true),
  ('gis', 'technical', 'Geographic information systems', true),

  -- Counseling / Social
  ('counseling', 'social', 'Professional counseling and guidance', true),
  ('therapeutic techniques', 'social', 'Therapy methods and approaches', true),
  ('case management', 'social', 'Managing client cases', true),
  ('assessment', 'social', 'Evaluating client needs', true),
  ('community outreach', 'social', 'Community engagement programs', true),
  ('curriculum design', 'education', 'Designing educational curricula', true)
ON CONFLICT (canonical_name) DO NOTHING;

-- SECTION 1B: Replace migrate_skills_to_relational with improved version
CREATE OR REPLACE FUNCTION public.migrate_skills_to_relational()
 RETURNS TABLE(source_table text, mapped_count bigint, unmapped_count bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
  -- CAREERS
  FOR v_career IN SELECT id, required_skills FROM careers
    WHERE required_skills IS NOT NULL AND array_length(required_skills, 1) > 0
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

  -- JOB POSTINGS
  FOR v_job IN SELECT id, skills FROM job_postings
    WHERE skills IS NOT NULL AND array_length(skills, 1) > 0
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
$function$;
