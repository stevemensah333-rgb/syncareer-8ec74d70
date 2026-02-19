
-- Allow service_role to insert/update skill_evidence
CREATE POLICY "Service role can insert evidence"
ON skill_evidence FOR INSERT
WITH CHECK (true);

CREATE POLICY "Service role can update evidence"
ON skill_evidence FOR UPDATE
USING (true);

-- Allow service_role to insert/update user_skill_map
CREATE POLICY "Service role can insert skill map"
ON user_skill_map FOR INSERT
WITH CHECK (true);

CREATE POLICY "Service role can update skill map"
ON user_skill_map FOR UPDATE
USING (true);
