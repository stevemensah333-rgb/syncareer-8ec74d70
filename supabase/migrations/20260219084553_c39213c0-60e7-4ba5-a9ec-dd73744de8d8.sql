
CREATE UNIQUE INDEX IF NOT EXISTS idx_skill_evidence_idempotent
ON skill_evidence (user_id, skill_id, source_type, source_id);
