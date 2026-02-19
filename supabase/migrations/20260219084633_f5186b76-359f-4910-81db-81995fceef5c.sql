
-- Drop overly permissive policies
DROP POLICY IF EXISTS "Service role can insert evidence" ON skill_evidence;
DROP POLICY IF EXISTS "Service role can update evidence" ON skill_evidence;
DROP POLICY IF EXISTS "Service role can insert skill map" ON user_skill_map;
DROP POLICY IF EXISTS "Service role can update skill map" ON user_skill_map;

-- Replace with admin-only write policies
CREATE POLICY "Admin can insert evidence"
ON skill_evidence FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can update evidence"
ON skill_evidence FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can insert skill map"
ON user_skill_map FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can update skill map"
ON user_skill_map FOR UPDATE
USING (has_role(auth.uid(), 'admin'));
