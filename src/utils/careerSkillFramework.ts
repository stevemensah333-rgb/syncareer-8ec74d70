/**
 * Career-to-Skill Framework Mapping
 * 
 * Maps each career path to an ordered list of skills with module ranges.
 * Each module number maps to a specific skill, enabling:
 * - Skill-specific quiz validation
 * - Targeted mastery tracking
 * - Career alignment scoring
 */

export interface SkillModule {
  skillName: string;
  moduleStart: number;
  moduleEnd: number;
}

export interface CareerSkillFramework {
  skills: SkillModule[];
  totalModules: number;
}

const frameworks: Record<string, CareerSkillFramework> = {
  'Computer Science': {
    totalModules: 24,
    skills: [
      { skillName: 'Programming', moduleStart: 1, moduleEnd: 4 },
      { skillName: 'Data Structures', moduleStart: 5, moduleEnd: 8 },
      { skillName: 'Algorithms', moduleStart: 9, moduleEnd: 12 },
      { skillName: 'Git & Version Control', moduleStart: 13, moduleEnd: 15 },
      { skillName: 'System Design', moduleStart: 16, moduleEnd: 20 },
      { skillName: 'Cloud Computing', moduleStart: 21, moduleEnd: 24 },
    ],
  },
  'Data Science': {
    totalModules: 24,
    skills: [
      { skillName: 'Statistics', moduleStart: 1, moduleEnd: 4 },
      { skillName: 'Machine Learning', moduleStart: 5, moduleEnd: 8 },
      { skillName: 'Python for Data Science', moduleStart: 9, moduleEnd: 12 },
      { skillName: 'Data Visualization', moduleStart: 13, moduleEnd: 16 },
      { skillName: 'SQL & Databases', moduleStart: 17, moduleEnd: 20 },
      { skillName: 'Deep Learning', moduleStart: 21, moduleEnd: 24 },
    ],
  },
  'Business Administration': {
    totalModules: 24,
    skills: [
      { skillName: 'Financial Analysis', moduleStart: 1, moduleEnd: 4 },
      { skillName: 'Strategic Planning', moduleStart: 5, moduleEnd: 8 },
      { skillName: 'Project Management', moduleStart: 9, moduleEnd: 12 },
      { skillName: 'Leadership', moduleStart: 13, moduleEnd: 16 },
      { skillName: 'Marketing', moduleStart: 17, moduleEnd: 20 },
      { skillName: 'Business Analytics', moduleStart: 21, moduleEnd: 24 },
    ],
  },
  'Information Technology': {
    totalModules: 24,
    skills: [
      { skillName: 'Networking', moduleStart: 1, moduleEnd: 4 },
      { skillName: 'Cybersecurity', moduleStart: 5, moduleEnd: 8 },
      { skillName: 'Cloud Infrastructure', moduleStart: 9, moduleEnd: 12 },
      { skillName: 'Database Management', moduleStart: 13, moduleEnd: 16 },
      { skillName: 'Linux Administration', moduleStart: 17, moduleEnd: 20 },
      { skillName: 'ITIL & Service Management', moduleStart: 21, moduleEnd: 24 },
    ],
  },
  'Finance': {
    totalModules: 24,
    skills: [
      { skillName: 'Financial Modeling', moduleStart: 1, moduleEnd: 4 },
      { skillName: 'Investment Analysis', moduleStart: 5, moduleEnd: 8 },
      { skillName: 'Risk Management', moduleStart: 9, moduleEnd: 12 },
      { skillName: 'Valuation', moduleStart: 13, moduleEnd: 16 },
      { skillName: 'Portfolio Management', moduleStart: 17, moduleEnd: 20 },
      { skillName: 'FinTech & Innovation', moduleStart: 21, moduleEnd: 24 },
    ],
  },
  'Law': {
    totalModules: 24,
    skills: [
      { skillName: 'Legal Research', moduleStart: 1, moduleEnd: 4 },
      { skillName: 'Contract Drafting', moduleStart: 5, moduleEnd: 8 },
      { skillName: 'Litigation', moduleStart: 9, moduleEnd: 12 },
      { skillName: 'Compliance', moduleStart: 13, moduleEnd: 16 },
      { skillName: 'Legal Writing', moduleStart: 17, moduleEnd: 20 },
      { skillName: 'Client Relations', moduleStart: 21, moduleEnd: 24 },
    ],
  },
  'Electrical Engineering': {
    totalModules: 24,
    skills: [
      { skillName: 'Circuit Design', moduleStart: 1, moduleEnd: 4 },
      { skillName: 'Power Systems', moduleStart: 5, moduleEnd: 8 },
      { skillName: 'Control Systems', moduleStart: 9, moduleEnd: 12 },
      { skillName: 'PLC Programming', moduleStart: 13, moduleEnd: 16 },
      { skillName: 'Renewable Energy', moduleStart: 17, moduleEnd: 20 },
      { skillName: 'Electronics', moduleStart: 21, moduleEnd: 24 },
    ],
  },
  'Mechanical Engineering': {
    totalModules: 24,
    skills: [
      { skillName: 'CAD/CAM', moduleStart: 1, moduleEnd: 4 },
      { skillName: 'Thermodynamics', moduleStart: 5, moduleEnd: 8 },
      { skillName: 'Manufacturing', moduleStart: 9, moduleEnd: 12 },
      { skillName: 'Robotics', moduleStart: 13, moduleEnd: 16 },
      { skillName: 'Quality Control', moduleStart: 17, moduleEnd: 20 },
      { skillName: '3D Printing', moduleStart: 21, moduleEnd: 24 },
    ],
  },
  'Marketing': {
    totalModules: 24,
    skills: [
      { skillName: 'Digital Marketing', moduleStart: 1, moduleEnd: 4 },
      { skillName: 'SEO/SEM', moduleStart: 5, moduleEnd: 8 },
      { skillName: 'Content Strategy', moduleStart: 9, moduleEnd: 12 },
      { skillName: 'Analytics', moduleStart: 13, moduleEnd: 16 },
      { skillName: 'Brand Management', moduleStart: 17, moduleEnd: 20 },
      { skillName: 'CRM', moduleStart: 21, moduleEnd: 24 },
    ],
  },
  'Medicine': {
    totalModules: 24,
    skills: [
      { skillName: 'Clinical Skills', moduleStart: 1, moduleEnd: 4 },
      { skillName: 'Patient Care', moduleStart: 5, moduleEnd: 8 },
      { skillName: 'Diagnosis', moduleStart: 9, moduleEnd: 12 },
      { skillName: 'Medical Research', moduleStart: 13, moduleEnd: 16 },
      { skillName: 'Healthcare Technology', moduleStart: 17, moduleEnd: 20 },
      { skillName: 'Ethics', moduleStart: 21, moduleEnd: 24 },
    ],
  },
};

/**
 * Get the skill being tested for a given module number in a career path
 */
export const getSkillForModule = (careerPath: string, moduleNumber: number): string | null => {
  const framework = frameworks[careerPath];
  if (!framework) return null;
  
  const skill = framework.skills.find(
    s => moduleNumber >= s.moduleStart && moduleNumber <= s.moduleEnd
  );
  return skill?.skillName || null;
};

/**
 * Get the difficulty level based on module position within a skill's range
 */
export const getDifficultyForModule = (careerPath: string, moduleNumber: number): string => {
  const framework = frameworks[careerPath];
  if (!framework) return 'foundational';
  
  const skill = framework.skills.find(
    s => moduleNumber >= s.moduleStart && moduleNumber <= s.moduleEnd
  );
  if (!skill) return 'foundational';
  
  const range = skill.moduleEnd - skill.moduleStart + 1;
  const position = moduleNumber - skill.moduleStart;
  const progress = position / range;
  
  if (progress >= 0.75) return 'advanced';
  if (progress >= 0.5) return 'developing';
  return 'foundational';
};

/**
 * Get the full career skill framework
 */
export const getCareerFramework = (careerPath: string): CareerSkillFramework | null => {
  return frameworks[careerPath] || null;
};

/**
 * Get all skills for a career path
 */
export const getCareerSkills = (careerPath: string): string[] => {
  const framework = frameworks[careerPath];
  if (!framework) return [];
  return framework.skills.map(s => s.skillName);
};

/**
 * Calculate skill mastery percentage based on completed modules
 */
export const calculateSkillMastery = (
  careerPath: string,
  skillName: string,
  completedModules: number
): number => {
  const framework = frameworks[careerPath];
  if (!framework) return 0;
  
  const skill = framework.skills.find(s => s.skillName === skillName);
  if (!skill) return 0;
  
  const totalSkillModules = skill.moduleEnd - skill.moduleStart + 1;
  const completedInSkill = Math.min(
    Math.max(0, completedModules - skill.moduleStart + 1),
    totalSkillModules
  );
  
  return Math.round((completedInSkill / totalSkillModules) * 100);
};

/**
 * Get all supported career paths
 */
export const getSupportedCareerPaths = (): string[] => Object.keys(frameworks);

/**
 * Check if a career path has a structured question bank
 */
export const hasStructuredQuestionBank = (careerPath: string): boolean => {
  return careerPath in frameworks;
};
