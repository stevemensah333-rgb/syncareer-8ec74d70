import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getCareerSkills } from '@/utils/careerSkillFramework';

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

const proficiencyToPercent: Record<string, number> = {
  beginner: 25,
  intermediate: 50,
  advanced: 75,
  expert: 100,
};

function computeCVScore(resume: any): number {
  if (!resume) return 0;
  let score = 0;
  const pi = resume.personal_info as any;
  if (pi?.fullName || pi?.full_name) score += 15;
  if (pi?.email) score += 10;
  if (pi?.phone) score += 5;
  if (Array.isArray(resume.education) && resume.education.length > 0) score += 20;
  if (Array.isArray(resume.experience) && resume.experience.length > 0) score += 20;
  if (Array.isArray(resume.skills) && resume.skills.length > 0) score += 15;
  if (Array.isArray(resume.projects) && resume.projects.length > 0) score += 15;
  return Math.min(100, score);
}

function computeReadinessScore(
  major: string,
  userSkills: Array<{ skill_name: string; proficiency: string }>,
  portfolioCount: number,
  resume: any,
  interviews: Array<{ overall_score: number | null }>,
): number {
  const careerSkills = getCareerSkills(major);

  // Technical (50%)
  const technicalScore = careerSkills.length > 0
    ? careerSkills.reduce((sum, skill) => {
        const found = userSkills.find(s => s.skill_name === skill);
        return sum + (found ? (proficiencyToPercent[found.proficiency] || 0) : 0);
      }, 0) / careerSkills.length
    : 0;

  // Practical (30%)
  const practicalScore = Math.min(100, portfolioCount * 25);

  // Professional (20%)
  const cvScore = computeCVScore(resume);
  const avgInterview = interviews.length > 0
    ? interviews.reduce((sum, i) => sum + (i.overall_score || 0), 0) / interviews.length
    : 0;
  const professionalScore = interviews.length > 0 ? (cvScore + avgInterview) / 2 : cvScore;

  return Math.round(technicalScore * 0.5 + practicalScore * 0.3 + professionalScore * 0.2);
}

export function useUserContext() {
  const [context, setContext] = useState<UserContext | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchContext = useCallback(async () => {
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
        portfolioRes,
        interviewsRes,
      ] = await Promise.all([
        supabase.from('profiles').select('full_name, bio').eq('id', userId).single(),
        supabase.from('student_details').select('major, school, degree_type, expected_completion').eq('user_id', userId).maybeSingle(),
        supabase.from('assessments').select('primary_interest, secondary_interest, tertiary_interest').eq('user_id', userId).order('created_at', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('user_skills').select('skill_name, proficiency, category').eq('user_id', userId).limit(30),
        supabase.from('resumes').select('personal_info, education, experience, skills, projects').eq('user_id', userId).eq('is_primary', true).maybeSingle(),
        supabase.from('portfolio_projects').select('id').eq('user_id', userId),
        supabase.from('mock_interviews').select('overall_score').eq('user_id', userId).not('overall_score', 'is', null),
      ]);

      // Extract location from resume personal_info, then fallback to bio
      let location: string | null = null;
      if (resumeRes.data?.personal_info) {
        const pi = resumeRes.data.personal_info as Record<string, string>;
        location = pi.location || pi.country || pi.city || null;
      }
      if (!location && profileRes.data?.bio) {
        const match = profileRes.data.bio.match(/(?:based in|from|located in|in)\s+([^,.]+(?:,\s*[^,.]+)?)/i);
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
        const proj = resumeRes.data.projects as Array<{ title?: string; projectName?: string; description?: string }>;
        if (Array.isArray(proj)) {
          projects = proj.slice(0, 4).map(p => ({
            title: p.title || p.projectName || 'Untitled Project',
            description: p.description || '',
          }));
        }
      }

      // Compute readiness score if major is known
      const major = studentRes.data?.major || null;
      let readinessScore: number | null = null;
      if (major) {
        readinessScore = computeReadinessScore(
          major,
          (skillsRes.data || []) as Array<{ skill_name: string; proficiency: string }>,
          portfolioRes.data?.length || 0,
          resumeRes.data,
          (interviewsRes.data || []) as Array<{ overall_score: number | null }>,
        );
      }

      setContext({
        fullName: profileRes.data?.full_name || null,
        location,
        degree: studentRes.data?.degree_type || null,
        major,
        school: studentRes.data?.school || null,
        graduationYear: studentRes.data?.expected_completion || null,
        primaryInterest: assessmentRes.data?.primary_interest || null,
        secondaryInterest: assessmentRes.data?.secondary_interest || null,
        tertiaryInterest: assessmentRes.data?.tertiary_interest || null,
        readinessScore,
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
  }, []);

  useEffect(() => {
    fetchContext();
  }, [fetchContext]);

  return { context, loading, refetch: fetchContext };
}
