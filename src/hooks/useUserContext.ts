import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface UserContext {
  // Identity
  fullName: string | null;
  location: string | null;

  // Academic
  degree: string | null;
  major: string | null;
  school: string | null;
  graduationYear: number | null;

  // Assessment
  primaryInterest: string | null;
  secondaryInterest: string | null;
  tertiaryInterest: string | null;
  readinessScore: number | null;

  // Skills
  skills: Array<{ name: string; proficiency: string; category: string }>;

  // CV / Resume experience
  workExperience: Array<{ title: string; company: string; description?: string }>;
  projects: Array<{ title: string; description: string }>;
}

export function useUserContext() {
  const [context, setContext] = useState<UserContext | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchContext() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          setLoading(false);
          return;
        }
        const userId = session.user.id;

        const [
          profileRes,
          studentRes,
          assessmentRes,
          skillsRes,
          resumeRes,
        ] = await Promise.all([
          supabase.from('profiles').select('full_name, bio').eq('id', userId).single(),
          supabase.from('student_details').select('major, school, degree_type, expected_completion').eq('user_id', userId).single(),
          supabase.from('assessments').select('primary_interest, secondary_interest, tertiary_interest').eq('user_id', userId).order('created_at', { ascending: false }).limit(1).single(),
          supabase.from('user_skills').select('skill_name, proficiency, category').eq('user_id', userId).limit(30),
          supabase.from('resumes').select('personal_info, experience, projects').eq('user_id', userId).eq('is_primary', true).single(),
        ]);

        // Extract location from bio or personal_info
        let location: string | null = null;
        if (resumeRes.data?.personal_info) {
          const pi = resumeRes.data.personal_info as Record<string, string>;
          location = pi.location || pi.country || null;
        }
        if (!location && profileRes.data?.bio) {
          // Try to extract location from bio (e.g. "Based in Accra, Ghana")
          const match = profileRes.data.bio.match(/(?:based in|from|located in)\s+([^,.]+)/i);
          if (match) location = match[1].trim();
        }

        // Parse work experience from resume
        let workExperience: UserContext['workExperience'] = [];
        if (resumeRes.data?.experience) {
          const exp = resumeRes.data.experience as Array<{ title?: string; company?: string; description?: string }>;
          if (Array.isArray(exp)) {
            workExperience = exp.slice(0, 5).map(e => ({
              title: e.title || 'Unknown Role',
              company: e.company || 'Unknown Company',
              description: e.description,
            }));
          }
        }

        // Parse projects from resume
        let projects: UserContext['projects'] = [];
        if (resumeRes.data?.projects) {
          const proj = resumeRes.data.projects as Array<{ title?: string; description?: string }>;
          if (Array.isArray(proj)) {
            projects = proj.slice(0, 4).map(p => ({
              title: p.title || 'Untitled Project',
              description: p.description || '',
            }));
          }
        }

        // Extract personal info location
        if (!location && resumeRes.data?.personal_info) {
          const pi = resumeRes.data.personal_info as Record<string, string>;
          location = pi.location || pi.city || null;
        }

        setContext({
          fullName: profileRes.data?.full_name || null,
          location,
          degree: studentRes.data?.degree_type || null,
          major: studentRes.data?.major || null,
          school: studentRes.data?.school || null,
          graduationYear: studentRes.data?.expected_completion || null,
          primaryInterest: assessmentRes.data?.primary_interest || null,
          secondaryInterest: assessmentRes.data?.secondary_interest || null,
          tertiaryInterest: assessmentRes.data?.tertiary_interest || null,
          readinessScore: null, // computed separately if needed
          skills: (skillsRes.data || []).map(s => ({
            name: s.skill_name,
            proficiency: s.proficiency,
            category: s.category,
          })),
          workExperience,
          projects,
        });
      } catch (err) {
        console.error('Failed to fetch user context:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchContext();
  }, []);

  return { context, loading };
}
