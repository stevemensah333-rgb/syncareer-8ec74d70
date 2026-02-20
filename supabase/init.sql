-- Create core tables for SynCareer application
-- This SQL schema initializes all necessary tables for the platform

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============ USER PROFILES ============
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT CHECK (role IN ('student', 'employer', 'career_counsellor', 'admin')),
  avatar_url TEXT,
  bio TEXT,
  location TEXT,
  country TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  onboarded BOOLEAN DEFAULT FALSE
);

-- ============ STUDENT PROFILES ============
CREATE TABLE IF NOT EXISTS student_details (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  major TEXT,
  graduation_year INTEGER,
  skills TEXT[] DEFAULT '{}',
  interests TEXT[] DEFAULT '{}',
  portfolio_url TEXT,
  cv_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

-- ============ EMPLOYER PROFILES ============
CREATE TABLE IF NOT EXISTS employer_details (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  company_description TEXT,
  company_size TEXT,
  industry TEXT,
  website TEXT,
  logo_url TEXT,
  founded_year INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

-- ============ COUNSELLOR PROFILES ============
CREATE TABLE IF NOT EXISTS counsellor_details (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  specialization TEXT[] DEFAULT '{}',
  experience_years INTEGER,
  qualifications TEXT[] DEFAULT '{}',
  availability_start TIME,
  availability_end TIME,
  session_rate DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

-- ============ JOB LISTINGS ============
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT,
  salary_min DECIMAL(10, 2),
  salary_max DECIMAL(10, 2),
  job_type TEXT CHECK (job_type IN ('full-time', 'part-time', 'internship', 'contract')),
  required_skills TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed', 'draft'))
);

-- ============ APPLICATIONS ============
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'shortlisted', 'rejected', 'accepted')),
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(student_id, job_id)
);

-- ============ ASSESSMENTS ============
CREATE TABLE IF NOT EXISTS assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  assessment_type TEXT NOT NULL,
  score INTEGER,
  max_score INTEGER,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============ ASSESSMENT RESPONSES ============
CREATE TABLE IF NOT EXISTS assessment_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  question_id INTEGER,
  selected_value INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============ ASSESSMENT RESULTS ============
CREATE TABLE IF NOT EXISTS assessment_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  assessment_type TEXT,
  result_data JSONB,
  recommendations TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, assessment_type)
);

-- ============ PORTFOLIO PROJECTS ============
CREATE TABLE IF NOT EXISTS portfolio_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  url TEXT,
  image_url TEXT,
  technologies TEXT[] DEFAULT '{}',
  rating DECIMAL(3, 1),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============ COUNSELLOR SESSIONS ============
CREATE TABLE IF NOT EXISTS counsellor_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  counsellor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  session_date TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER,
  notes TEXT,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============ NOTIFICATIONS ============
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'error')),
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============ FEEDBACK ============
CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  feedback_type TEXT,
  message TEXT NOT NULL,
  rating INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============ CREATE INDEXES ============
CREATE INDEX IF NOT EXISTS idx_student_details_user_id ON student_details(user_id);
CREATE INDEX IF NOT EXISTS idx_employer_details_user_id ON employer_details(user_id);
CREATE INDEX IF NOT EXISTS idx_counsellor_details_user_id ON counsellor_details(user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_employer_id ON jobs(employer_id);
CREATE INDEX IF NOT EXISTS idx_applications_student_id ON applications(student_id);
CREATE INDEX IF NOT EXISTS idx_applications_job_id ON applications(job_id);
CREATE INDEX IF NOT EXISTS idx_assessments_user_id ON assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_projects_user_id ON portfolio_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_counsellor_sessions_counsellor_id ON counsellor_sessions(counsellor_id);
CREATE INDEX IF NOT EXISTS idx_counsellor_sessions_student_id ON counsellor_sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON feedback(user_id);

-- ============ ENABLE ROW LEVEL SECURITY ============
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE employer_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE counsellor_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE counsellor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- ============ RLS POLICIES - PROFILES ============
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============ RLS POLICIES - STUDENT DETAILS ============
CREATE POLICY "Students can read own details" ON student_details
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Students can update own details" ON student_details
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============ RLS POLICIES - JOBS ============
CREATE POLICY "Anyone can read jobs" ON jobs
  FOR SELECT USING (true);

CREATE POLICY "Employers can insert jobs" ON jobs
  FOR INSERT WITH CHECK (employer_id = auth.uid());

CREATE POLICY "Employers can update own jobs" ON jobs
  FOR UPDATE USING (employer_id = auth.uid())
  WITH CHECK (employer_id = auth.uid());

-- ============ RLS POLICIES - APPLICATIONS ============
CREATE POLICY "Students can read own applications" ON applications
  FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Employers can read applications to their jobs" ON applications
  FOR SELECT USING (
    job_id IN (SELECT id FROM jobs WHERE employer_id = auth.uid())
  );

CREATE POLICY "Students can insert applications" ON applications
  FOR INSERT WITH CHECK (student_id = auth.uid());

-- ============ RLS POLICIES - NOTIFICATIONS ============
CREATE POLICY "Users can read own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
