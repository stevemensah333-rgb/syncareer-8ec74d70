
-- ========================================
-- SECTION 1: SKILL GRAPH TABLES
-- ========================================

-- 1) skills_taxonomy
CREATE TABLE public.skills_taxonomy (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  canonical_name TEXT NOT NULL,
  category TEXT,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT skills_taxonomy_canonical_name_unique UNIQUE (canonical_name),
  CONSTRAINT skills_taxonomy_canonical_name_lower CHECK (canonical_name = lower(canonical_name))
);

CREATE INDEX idx_skills_taxonomy_category ON public.skills_taxonomy (category);
CREATE INDEX idx_skills_taxonomy_active ON public.skills_taxonomy (is_active) WHERE is_active = true;

ALTER TABLE public.skills_taxonomy ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read active skills"
  ON public.skills_taxonomy FOR SELECT
  USING (auth.role() = 'authenticated' AND is_active = true);

-- No INSERT/UPDATE/DELETE policies = service_role only writes

-- 2) user_skill_map (normalized user<->taxonomy link)
CREATE TABLE public.user_skill_map (
  user_id UUID NOT NULL,
  skill_id UUID NOT NULL REFERENCES public.skills_taxonomy(id) ON DELETE CASCADE,
  confidence_score FLOAT DEFAULT 0,
  last_updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, skill_id)
);

CREATE INDEX idx_user_skill_map_skill ON public.user_skill_map (skill_id);

ALTER TABLE public.user_skill_map ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own skill map"
  ON public.user_skill_map FOR SELECT
  USING (auth.uid() = user_id);

-- No INSERT/UPDATE/DELETE policies = service_role only writes

-- 3) skill_evidence
CREATE TABLE public.skill_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  skill_id UUID NOT NULL REFERENCES public.skills_taxonomy(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL,
  source_id UUID,
  signal_strength FLOAT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_skill_evidence_user ON public.skill_evidence (user_id);
CREATE INDEX idx_skill_evidence_skill ON public.skill_evidence (skill_id);
CREATE INDEX idx_skill_evidence_user_skill ON public.skill_evidence (user_id, skill_id);

ALTER TABLE public.skill_evidence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own evidence"
  ON public.skill_evidence FOR SELECT
  USING (auth.uid() = user_id);

-- No INSERT/UPDATE/DELETE policies = service_role only writes

-- ========================================
-- SECTION 2: CAREER / JOB RELATIONAL TABLES
-- ========================================

-- career_skills
CREATE TABLE public.career_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  career_id UUID NOT NULL REFERENCES public.careers(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES public.skills_taxonomy(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT career_skills_unique UNIQUE (career_id, skill_id)
);

CREATE INDEX idx_career_skills_skill ON public.career_skills (skill_id);
CREATE INDEX idx_career_skills_career ON public.career_skills (career_id);

ALTER TABLE public.career_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read career skills"
  ON public.career_skills FOR SELECT
  USING (auth.role() = 'authenticated');

-- No INSERT/UPDATE/DELETE policies = service_role / admin only

-- job_posting_skills
CREATE TABLE public.job_posting_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_posting_id UUID NOT NULL REFERENCES public.job_postings(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES public.skills_taxonomy(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT job_posting_skills_unique UNIQUE (job_posting_id, skill_id)
);

CREATE INDEX idx_job_posting_skills_skill ON public.job_posting_skills (skill_id);
CREATE INDEX idx_job_posting_skills_job ON public.job_posting_skills (job_posting_id);

ALTER TABLE public.job_posting_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read job posting skills"
  ON public.job_posting_skills FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Employers can manage skills for own postings"
  ON public.job_posting_skills FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.job_postings
      WHERE job_postings.id = job_posting_skills.job_posting_id
        AND job_postings.employer_id = auth.uid()
    )
  );

-- unmapped_skills_log
CREATE TABLE public.unmapped_skills_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_table TEXT NOT NULL,
  source_id UUID NOT NULL,
  raw_skill_text TEXT NOT NULL,
  resolved BOOLEAN NOT NULL DEFAULT false,
  resolved_skill_id UUID REFERENCES public.skills_taxonomy(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

CREATE INDEX idx_unmapped_skills_unresolved ON public.unmapped_skills_log (resolved) WHERE resolved = false;
CREATE INDEX idx_unmapped_skills_source ON public.unmapped_skills_log (source_table, source_id);

ALTER TABLE public.unmapped_skills_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read unmapped skills"
  ON public.unmapped_skills_log FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- No public INSERT/UPDATE/DELETE policies = service_role only
