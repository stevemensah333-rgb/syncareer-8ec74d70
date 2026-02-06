// Major-specific content configurations
export interface MajorContent {
  skills: string[];
  jobTrends: { title: string; growth: string; demand: string }[];
  suggestedCourses: string[];
  industryNews: string[];
}

const majorContentMap: Record<string, MajorContent> = {
  'Computer Science': {
    skills: ['Python', 'JavaScript', 'React', 'Machine Learning', 'Cloud Computing', 'Data Structures', 'System Design'],
    jobTrends: [
      { title: 'Software Engineer', growth: '+25%', demand: 'Very High' },
      { title: 'Data Scientist', growth: '+31%', demand: 'High' },
      { title: 'Cloud Architect', growth: '+28%', demand: 'High' },
      { title: 'DevOps Engineer', growth: '+22%', demand: 'High' },
    ],
    suggestedCourses: ['Advanced Algorithms', 'Cloud Computing Fundamentals', 'AI & Machine Learning', 'Full-Stack Development'],
    industryNews: ['AI adoption surges in South African tech sector', 'Remote software jobs increase by 40%'],
  },
  'Business Administration': {
    skills: ['Financial Analysis', 'Strategic Planning', 'Project Management', 'Leadership', 'Marketing', 'Business Analytics', 'Negotiation'],
    jobTrends: [
      { title: 'Business Analyst', growth: '+14%', demand: 'High' },
      { title: 'Management Consultant', growth: '+11%', demand: 'Medium' },
      { title: 'Operations Manager', growth: '+9%', demand: 'High' },
      { title: 'Marketing Manager', growth: '+10%', demand: 'Medium' },
    ],
    suggestedCourses: ['Business Strategy', 'Financial Management', 'Digital Marketing', 'Leadership & Team Management'],
    industryNews: ['SME sector growth drives management demand', 'Digital transformation reshaping business roles'],
  },
  'Law': {
    skills: ['Legal Research', 'Contract Drafting', 'Litigation', 'Negotiation', 'Compliance', 'Legal Writing', 'Client Relations'],
    jobTrends: [
      { title: 'Corporate Lawyer', growth: '+8%', demand: 'Medium' },
      { title: 'Legal Advisor', growth: '+12%', demand: 'High' },
      { title: 'Compliance Officer', growth: '+15%', demand: 'High' },
      { title: 'Legal Consultant', growth: '+10%', demand: 'Medium' },
    ],
    suggestedCourses: ['Corporate Law', 'Labour Law', 'Contract Law', 'Legal Tech & Innovation'],
    industryNews: ['Legal tech adoption accelerating in SA firms', 'Compliance roles surge amid new regulations'],
  },
  'Electrical Engineering': {
    skills: ['Circuit Design', 'Power Systems', 'Control Systems', 'PLC Programming', 'CAD Software', 'Renewable Energy', 'Electronics'],
    jobTrends: [
      { title: 'Electrical Engineer', growth: '+7%', demand: 'High' },
      { title: 'Power Systems Engineer', growth: '+12%', demand: 'High' },
      { title: 'Automation Engineer', growth: '+18%', demand: 'Very High' },
      { title: 'Renewable Energy Engineer', growth: '+25%', demand: 'High' },
    ],
    suggestedCourses: ['Renewable Energy Systems', 'Power Electronics', 'Industrial Automation', 'Smart Grid Technology'],
    industryNews: ['Eskom invests in grid modernization', 'Renewable energy sector creates new engineering roles'],
  },
  'Mechanical Engineering': {
    skills: ['CAD/CAM', 'Thermodynamics', 'Manufacturing', 'Robotics', 'Project Management', '3D Printing', 'Quality Control'],
    jobTrends: [
      { title: 'Mechanical Engineer', growth: '+6%', demand: 'Medium' },
      { title: 'Manufacturing Engineer', growth: '+8%', demand: 'High' },
      { title: 'Robotics Engineer', growth: '+20%', demand: 'High' },
      { title: 'Quality Engineer', growth: '+9%', demand: 'Medium' },
    ],
    suggestedCourses: ['Advanced Manufacturing', 'Robotics & Automation', 'Product Design', 'Lean Manufacturing'],
    industryNews: ['Manufacturing sector embraces automation', 'Automotive industry seeks skilled engineers'],
  },
  'Finance': {
    skills: ['Financial Modeling', 'Investment Analysis', 'Risk Management', 'Excel/VBA', 'Bloomberg Terminal', 'Valuation', 'Portfolio Management'],
    jobTrends: [
      { title: 'Financial Analyst', growth: '+9%', demand: 'High' },
      { title: 'Investment Banker', growth: '+6%', demand: 'Medium' },
      { title: 'Risk Manager', growth: '+14%', demand: 'High' },
      { title: 'FinTech Analyst', growth: '+22%', demand: 'Very High' },
    ],
    suggestedCourses: ['Advanced Financial Modeling', 'CFA Preparation', 'FinTech & Blockchain', 'Risk Analytics'],
    industryNews: ['FinTech disruption accelerates in SA banking', 'ESG investing creates new finance roles'],
  },
  'Marketing': {
    skills: ['Digital Marketing', 'SEO/SEM', 'Social Media', 'Content Strategy', 'Analytics', 'Brand Management', 'CRM'],
    jobTrends: [
      { title: 'Digital Marketing Manager', growth: '+18%', demand: 'High' },
      { title: 'Content Strategist', growth: '+15%', demand: 'High' },
      { title: 'SEO Specialist', growth: '+20%', demand: 'High' },
      { title: 'Brand Manager', growth: '+8%', demand: 'Medium' },
    ],
    suggestedCourses: ['Advanced Digital Marketing', 'Data-Driven Marketing', 'Brand Strategy', 'Marketing Analytics'],
    industryNews: ['E-commerce growth drives digital marketing demand', 'AI transforms marketing personalization'],
  },
  'Medicine': {
    skills: ['Clinical Skills', 'Patient Care', 'Diagnosis', 'Medical Research', 'Healthcare Technology', 'Communication', 'Ethics'],
    jobTrends: [
      { title: 'Medical Doctor', growth: '+5%', demand: 'Very High' },
      { title: 'Specialist Physician', growth: '+8%', demand: 'Very High' },
      { title: 'Healthcare Administrator', growth: '+12%', demand: 'High' },
      { title: 'Medical Researcher', growth: '+10%', demand: 'High' },
    ],
    suggestedCourses: ['Specialized Medicine', 'Healthcare Management', 'Medical Research Methods', 'Telemedicine'],
    industryNews: ['Telemedicine adoption grows in rural SA', 'Public health sector expands hiring'],
  },
  'Data Science': {
    skills: ['Python', 'Machine Learning', 'SQL', 'Statistics', 'Data Visualization', 'Deep Learning', 'Big Data'],
    jobTrends: [
      { title: 'Data Scientist', growth: '+31%', demand: 'Very High' },
      { title: 'ML Engineer', growth: '+35%', demand: 'Very High' },
      { title: 'Data Analyst', growth: '+25%', demand: 'High' },
      { title: 'AI Engineer', growth: '+40%', demand: 'Very High' },
    ],
    suggestedCourses: ['Deep Learning', 'Natural Language Processing', 'Big Data Engineering', 'MLOps'],
    industryNews: ['AI talent shortage creates opportunities', 'Data-driven companies outperform competitors'],
  },
  // ─── New majors below ────────────────────────────────────────
  'Civil Engineering': {
    skills: ['Structural Analysis', 'AutoCAD', 'Project Management', 'Geotechnical Engineering', 'Construction Management', 'Surveying', 'BIM'],
    jobTrends: [
      { title: 'Structural Engineer', growth: '+8%', demand: 'High' },
      { title: 'Site Engineer', growth: '+10%', demand: 'High' },
      { title: 'Project Manager', growth: '+12%', demand: 'High' },
      { title: 'Urban Planner', growth: '+9%', demand: 'Medium' },
    ],
    suggestedCourses: ['Building Information Modelling', 'Sustainable Construction', 'Structural Design', 'Transport Engineering'],
    industryNews: ['Infrastructure spend boosts civil engineering demand', 'Green building standards reshape construction industry'],
  },
  'Chemical Engineering': {
    skills: ['Process Design', 'Chemical Analysis', 'MATLAB', 'Process Simulation', 'Safety Engineering', 'Thermodynamics', 'Quality Assurance'],
    jobTrends: [
      { title: 'Process Engineer', growth: '+7%', demand: 'High' },
      { title: 'Chemical Engineer', growth: '+6%', demand: 'Medium' },
      { title: 'Quality Assurance Engineer', growth: '+10%', demand: 'High' },
      { title: 'Environmental Engineer', growth: '+14%', demand: 'High' },
    ],
    suggestedCourses: ['Process Optimization', 'Environmental Engineering', 'Petrochemical Processing', 'Sustainable Chemistry'],
    industryNews: ['Petrochemical sector modernizes processes', 'Water treatment engineering demand rises in SA'],
  },
  'Information Technology': {
    skills: ['Networking', 'Cybersecurity', 'Database Management', 'Cloud Infrastructure', 'Linux Administration', 'ITIL', 'Scripting'],
    jobTrends: [
      { title: 'IT Systems Administrator', growth: '+10%', demand: 'High' },
      { title: 'Cybersecurity Analyst', growth: '+32%', demand: 'Very High' },
      { title: 'Network Engineer', growth: '+12%', demand: 'High' },
      { title: 'Cloud Engineer', growth: '+28%', demand: 'Very High' },
    ],
    suggestedCourses: ['Cybersecurity Fundamentals', 'AWS/Azure Cloud Certification', 'Network Architecture', 'DevOps Practices'],
    industryNews: ['Cyber threats drive security hiring surge in SA', 'Cloud migration accelerates across industries'],
  },
  'Accounting': {
    skills: ['Financial Reporting', 'Auditing', 'Tax Compliance', 'IFRS Standards', 'SAP/ERP', 'Bookkeeping', 'Data Analytics'],
    jobTrends: [
      { title: 'Chartered Accountant', growth: '+6%', demand: 'High' },
      { title: 'Tax Consultant', growth: '+9%', demand: 'High' },
      { title: 'Audit Manager', growth: '+7%', demand: 'Medium' },
      { title: 'Forensic Accountant', growth: '+15%', demand: 'High' },
    ],
    suggestedCourses: ['SAICA Board Exam Prep', 'Tax Law & Practice', 'Forensic Accounting', 'Financial Data Analytics'],
    industryNews: ['Forensic accounting demand rises amid corporate governance focus', 'Big Four firms expand SA operations'],
  },
  'Human Resources': {
    skills: ['Talent Acquisition', 'Employee Relations', 'Labour Law', 'Performance Management', 'HRIS Systems', 'Training & Development', 'Conflict Resolution'],
    jobTrends: [
      { title: 'HR Business Partner', growth: '+10%', demand: 'High' },
      { title: 'Talent Acquisition Specialist', growth: '+14%', demand: 'High' },
      { title: 'Learning & Development Manager', growth: '+12%', demand: 'Medium' },
      { title: 'Compensation Analyst', growth: '+8%', demand: 'Medium' },
    ],
    suggestedCourses: ['SA Labour Law', 'People Analytics', 'Organisational Development', 'HR Technology & HRIS'],
    industryNews: ['Remote work policies reshape HR practices', 'Employee wellness programmes become standard'],
  },
  'Economics': {
    skills: ['Econometrics', 'Statistical Analysis', 'Policy Analysis', 'Research Methods', 'Data Modelling', 'Financial Economics', 'R/Stata'],
    jobTrends: [
      { title: 'Economic Analyst', growth: '+8%', demand: 'Medium' },
      { title: 'Policy Researcher', growth: '+10%', demand: 'Medium' },
      { title: 'Data Analyst', growth: '+20%', demand: 'High' },
      { title: 'Investment Analyst', growth: '+9%', demand: 'High' },
    ],
    suggestedCourses: ['Applied Econometrics', 'Development Economics', 'Behavioural Economics', 'Public Policy Analysis'],
    industryNews: ['Economic research roles grow in think tanks', 'Data-literate economists in high demand'],
  },
  'Psychology': {
    skills: ['Counselling', 'Research Design', 'Clinical Assessment', 'Behavioural Analysis', 'SPSS/Statistics', 'Empathy', 'Report Writing'],
    jobTrends: [
      { title: 'Clinical Psychologist', growth: '+10%', demand: 'High' },
      { title: 'Industrial Psychologist', growth: '+14%', demand: 'High' },
      { title: 'HR Specialist', growth: '+8%', demand: 'Medium' },
      { title: 'UX Researcher', growth: '+18%', demand: 'High' },
    ],
    suggestedCourses: ['Clinical Psychology Practice', 'Industrial/Organisational Psychology', 'Research Methodology', 'Psychometric Assessment'],
    industryNews: ['Mental health awareness drives demand for psychologists', 'Corporate wellness creates industrial psychology roles'],
  },
  'Nursing': {
    skills: ['Patient Assessment', 'Clinical Procedures', 'Emergency Care', 'Medication Administration', 'Infection Control', 'Health Education', 'Critical Care'],
    jobTrends: [
      { title: 'Registered Nurse', growth: '+12%', demand: 'Very High' },
      { title: 'Critical Care Nurse', growth: '+15%', demand: 'Very High' },
      { title: 'Community Health Nurse', growth: '+10%', demand: 'High' },
      { title: 'Nurse Educator', growth: '+8%', demand: 'Medium' },
    ],
    suggestedCourses: ['Advanced Clinical Nursing', 'Critical Care Specialisation', 'Community Health Practice', 'Nursing Management'],
    industryNews: ['Global nursing shortage creates opportunities abroad', 'SA public health sector expands nursing roles'],
  },
  'Pharmacy': {
    skills: ['Pharmaceutical Chemistry', 'Drug Dispensing', 'Patient Counselling', 'Pharmacokinetics', 'Clinical Pharmacy', 'Regulatory Compliance', 'Compounding'],
    jobTrends: [
      { title: 'Clinical Pharmacist', growth: '+8%', demand: 'High' },
      { title: 'Retail Pharmacist', growth: '+5%', demand: 'High' },
      { title: 'Pharmaceutical Sales Rep', growth: '+10%', demand: 'Medium' },
      { title: 'Regulatory Affairs Specialist', growth: '+12%', demand: 'High' },
    ],
    suggestedCourses: ['Clinical Pharmacy Practice', 'Pharmacovigilance', 'Pharmaceutical Regulations', 'Drug Development'],
    industryNews: ['Pharmaceutical innovation drives specialist demand', 'Community pharmacies expand clinical services'],
  },
  'Architecture': {
    skills: ['AutoCAD', 'Revit/BIM', 'SketchUp', 'Sustainable Design', '3D Visualisation', 'Project Management', 'Building Codes'],
    jobTrends: [
      { title: 'Junior Architect', growth: '+6%', demand: 'Medium' },
      { title: 'Urban Designer', growth: '+9%', demand: 'Medium' },
      { title: 'BIM Specialist', growth: '+15%', demand: 'High' },
      { title: 'Interior Designer', growth: '+8%', demand: 'Medium' },
    ],
    suggestedCourses: ['Sustainable Architecture', 'Digital Fabrication', 'Urban Design Theory', 'Advanced BIM Workflows'],
    industryNews: ['Green building trend transforms architecture practice', 'Smart city projects create urban design opportunities'],
  },
  'Graphic Design': {
    skills: ['Adobe Creative Suite', 'UI/UX Design', 'Typography', 'Branding', 'Motion Graphics', 'Illustration', 'Figma'],
    jobTrends: [
      { title: 'Graphic Designer', growth: '+8%', demand: 'Medium' },
      { title: 'UI/UX Designer', growth: '+22%', demand: 'Very High' },
      { title: 'Brand Designer', growth: '+10%', demand: 'Medium' },
      { title: 'Motion Designer', growth: '+15%', demand: 'High' },
    ],
    suggestedCourses: ['UI/UX Design', 'Motion Graphics & After Effects', 'Design Systems', 'Brand Identity Design'],
    industryNews: ['UX design demand explodes in SA tech sector', 'AI design tools reshape creative workflows'],
  },
  'Communications': {
    skills: ['Public Relations', 'Media Writing', 'Social Media Management', 'Content Creation', 'Crisis Communication', 'Copywriting', 'Event Planning'],
    jobTrends: [
      { title: 'Communications Specialist', growth: '+8%', demand: 'Medium' },
      { title: 'PR Manager', growth: '+7%', demand: 'Medium' },
      { title: 'Content Manager', growth: '+15%', demand: 'High' },
      { title: 'Social Media Manager', growth: '+18%', demand: 'High' },
    ],
    suggestedCourses: ['Digital Content Strategy', 'Crisis Communications', 'Media Relations', 'Copywriting Masterclass'],
    industryNews: ['Content marketing budgets increase across SA companies', 'Social media management becomes a core business function'],
  },
  'Education': {
    skills: ['Curriculum Design', 'Classroom Management', 'Assessment & Evaluation', 'Educational Technology', 'Inclusive Education', 'Lesson Planning', 'Student Mentoring'],
    jobTrends: [
      { title: 'Secondary School Teacher', growth: '+5%', demand: 'High' },
      { title: 'Educational Technologist', growth: '+15%', demand: 'High' },
      { title: 'Curriculum Developer', growth: '+10%', demand: 'Medium' },
      { title: 'Special Education Teacher', growth: '+12%', demand: 'High' },
    ],
    suggestedCourses: ['Educational Technology Integration', 'Inclusive Teaching Practices', 'Curriculum Development', 'Assessment Design'],
    industryNews: ['EdTech adoption transforms SA classrooms', 'Teacher shortage creates opportunities in STEM education'],
  },
  'Environmental Science': {
    skills: ['Environmental Impact Assessment', 'GIS/Remote Sensing', 'Water Quality Analysis', 'Ecology', 'Sustainability Planning', 'Data Analysis', 'Environmental Law'],
    jobTrends: [
      { title: 'Environmental Consultant', growth: '+12%', demand: 'High' },
      { title: 'Sustainability Manager', growth: '+18%', demand: 'High' },
      { title: 'GIS Analyst', growth: '+15%', demand: 'High' },
      { title: 'Environmental Officer', growth: '+10%', demand: 'Medium' },
    ],
    suggestedCourses: ['Environmental Impact Assessment', 'GIS & Spatial Analysis', 'Climate Change Science', 'Sustainability Management'],
    industryNews: ['ESG regulations drive environmental consulting growth', 'Climate change creates new career paths in SA'],
  },
  'Agriculture': {
    skills: ['Agronomy', 'Soil Science', 'Agricultural Technology', 'Farm Management', 'Precision Agriculture', 'Irrigation Systems', 'Supply Chain'],
    jobTrends: [
      { title: 'Agricultural Scientist', growth: '+8%', demand: 'Medium' },
      { title: 'Farm Manager', growth: '+6%', demand: 'High' },
      { title: 'Agri-Tech Specialist', growth: '+20%', demand: 'High' },
      { title: 'Food Safety Analyst', growth: '+12%', demand: 'High' },
    ],
    suggestedCourses: ['Precision Agriculture Technology', 'Sustainable Farming Practices', 'Agricultural Economics', 'Food Science & Safety'],
    industryNews: ['AgriTech startups flourish in SA', 'Climate-smart agriculture investment grows'],
  },
};

// Default content for majors not specifically mapped (e.g. "Other")
const defaultContent: MajorContent = {
  skills: ['Communication', 'Critical Thinking', 'Problem Solving', 'Teamwork', 'Time Management', 'Adaptability', 'Leadership'],
  jobTrends: [
    { title: 'Project Coordinator', growth: '+10%', demand: 'Medium' },
    { title: 'Administrative Manager', growth: '+8%', demand: 'Medium' },
    { title: 'Business Development', growth: '+12%', demand: 'High' },
    { title: 'Consultant', growth: '+9%', demand: 'Medium' },
  ],
  suggestedCourses: ['Professional Communication', 'Project Management', 'Business Writing', 'Leadership Skills'],
  industryNews: ['Soft skills increasingly valued by employers', 'Cross-functional roles on the rise'],
};

export const getMajorContent = (major: string | null | undefined): MajorContent => {
  if (!major) return defaultContent;
  return majorContentMap[major] || defaultContent;
};

export const getAllMajors = (): string[] => Object.keys(majorContentMap);
