import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { GraduationCap, Briefcase, Users, RefreshCw, ChevronRight, ChevronLeft } from 'lucide-react';
import { z } from 'zod';

// Validation schemas
const studentSchema = z.object({
  school: z.string().max(200, 'School name must be less than 200 characters').optional(),
  major: z.string().min(1, 'Major is required'),
  degreeType: z.string().min(1, 'Degree type is required'),
});

const employerSchema = z.object({
  companyName: z.string().trim().min(1, 'Company name is required').max(200, 'Company name must be less than 200 characters'),
  companyLocation: z.string().max(200, 'Location must be less than 200 characters').optional(),
  jobTitle: z.string().max(100, 'Job title must be less than 100 characters').optional(),
});

const USER_TYPES = [
  { id: 'student', label: 'Student', icon: GraduationCap, description: 'I am currently studying or recently graduated' },
  { id: 'employer', label: 'Employer / Recruiter', icon: Briefcase, description: 'I represent a company looking to hire or recruit talent' },
  { id: 'career_counsellor', label: 'Career Counsellor', icon: Users, description: 'I help individuals with career guidance and planning' },
  { id: 'professional_transition', label: 'Professional in Transition', icon: RefreshCw, description: 'I am changing careers or re-entering the workforce' },
];

const MAJORS = [
  'Computer Science',
  'Business Administration',
  'Law',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Chemical Engineering',
  'Information Technology',
  'Data Science',
  'Finance',
  'Accounting',
  'Marketing',
  'Human Resources',
  'Economics',
  'Psychology',
  'Medicine',
  'Nursing',
  'Pharmacy',
  'Architecture',
  'Graphic Design',
  'Communications',
  'Education',
  'Environmental Science',
  'Agriculture',
  'Other',
];

const DEGREE_TYPES = [
  'Certificate',
  'Diploma',
  'Associate Degree',
  'Bachelor\'s Degree',
  'Honours Degree',
  'Postgraduate Diploma',
  'Master\'s Degree',
  'Doctoral Degree (PhD)',
  'Professional Degree',
];

const INDUSTRIES = [
  'Technology',
  'Finance & Banking',
  'Healthcare',
  'Manufacturing',
  'Retail',
  'Education',
  'Construction',
  'Mining',
  'Agriculture',
  'Telecommunications',
  'Hospitality & Tourism',
  'Legal Services',
  'Consulting',
  'Media & Entertainment',
  'Non-Profit',
  'Government',
  'Other',
];

const COMPANY_SIZES = [
  '1-10 employees',
  '11-50 employees',
  '51-200 employees',
  '201-500 employees',
  '501-1000 employees',
  '1000+ employees',
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 20 }, (_, i) => currentYear - 10 + i);

const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // User type selection
  const [userType, setUserType] = useState<string>('');

  // Student fields
  const [yearOfAdmission, setYearOfAdmission] = useState<string>('');
  const [expectedCompletion, setExpectedCompletion] = useState<string>('');
  const [major, setMajor] = useState<string>('');
  const [school, setSchool] = useState<string>('');
  const [degreeType, setDegreeType] = useState<string>('');

  // Employer fields
  const [companyName, setCompanyName] = useState<string>('');
  const [companyLocation, setCompanyLocation] = useState<string>('');
  const [industry, setIndustry] = useState<string>('');
  const [companySize, setCompanySize] = useState<string>('');
  const [jobTitle, setJobTitle] = useState<string>('');

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }
      setUserId(session.user.id);

      // Check if onboarding is already completed
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', session.user.id)
        .single();

      if (profile?.onboarding_completed) {
        navigate('/');
      }
    };

    checkSession();
  }, [navigate]);

  const handleUserTypeSelect = (type: string) => {
    setUserType(type);
  };

  const handleNext = () => {
    if (step === 1 && !userType) {
      toast.error('Please select your role');
      return;
    }
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleSubmit = async () => {
    if (!userId) return;

    // Validate with zod schemas
    if (userType === 'student') {
      const result = studentSchema.safeParse({ school, major, degreeType });
      if (!result.success) {
        toast.error(result.error.errors[0].message);
        return;
      }
    } else if (userType === 'employer' || userType === 'career_counsellor') {
      const result = employerSchema.safeParse({ 
        companyName: companyName.trim(), 
        companyLocation: companyLocation || undefined, 
        jobTitle: jobTitle || undefined 
      });
      if (!result.success) {
        toast.error(result.error.errors[0].message);
        return;
      }
    }

    setLoading(true);

    try {
      // Update profile with user type
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          user_type: userType,
          onboarding_completed: true,
        })
        .eq('id', userId);

      if (profileError) throw profileError;

      // Insert role-specific details
      if (userType === 'student') {
        const { error: studentError } = await supabase
          .from('student_details')
          .upsert({
            user_id: userId,
            year_of_admission: yearOfAdmission ? parseInt(yearOfAdmission) : null,
            expected_completion: expectedCompletion ? parseInt(expectedCompletion) : null,
            major,
            school: school || null,
            degree_type: degreeType,
          }, { onConflict: 'user_id' });

        if (studentError) throw studentError;
      } else if (userType === 'employer' || userType === 'career_counsellor') {
        const { error: employerError } = await supabase
          .from('employer_details')
          .upsert({
            user_id: userId,
            company_name: companyName,
            company_location: companyLocation || null,
            industry: industry || null,
            company_size: companySize || null,
            job_title: jobTitle || null,
          }, { onConflict: 'user_id' });

        if (employerError) throw employerError;
      }

      toast.success('Profile setup complete!');
      navigate('/');
    } catch (error: any) {
      console.error('Onboarding error:', error);
      toast.error(error.message || 'Failed to complete setup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl p-8 shadow-xl">
        {/* Progress indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              1
            </div>
            <div className={`w-16 h-1 ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              2
            </div>
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-foreground">Welcome to SkillBridge!</h1>
              <p className="text-muted-foreground mt-2">Tell us about yourself to personalize your experience</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
              {USER_TYPES.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => handleUserTypeSelect(type.id)}
                    className={`p-6 rounded-xl border-2 transition-all text-left ${
                      userType === type.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50 hover:bg-muted/50'
                    }`}
                  >
                    <Icon className={`w-8 h-8 mb-3 ${userType === type.id ? 'text-primary' : 'text-muted-foreground'}`} />
                    <h3 className="font-semibold text-foreground">{type.label}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{type.description}</p>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end mt-8">
              <Button onClick={handleNext} disabled={!userType} className="px-8">
                Continue <ChevronRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 2 && userType === 'student' && (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-foreground">Academic Details</h1>
              <p className="text-muted-foreground mt-2">Help us tailor content to your field of study</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div className="space-y-2">
                <Label>Major / Field of Study *</Label>
                <Select value={major} onValueChange={setMajor}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select your major" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border shadow-lg z-50">
                    {MAJORS.map((m) => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Degree Type *</Label>
                <Select value={degreeType} onValueChange={setDegreeType}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select degree type" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border shadow-lg z-50">
                    {DEGREE_TYPES.map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>School / University</Label>
                <Input
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  placeholder="Enter your school name"
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label>Year of Admission</Label>
                <Select value={yearOfAdmission} onValueChange={setYearOfAdmission}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border shadow-lg z-50">
                    {years.map((y) => (
                      <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Expected Completion</Label>
                <Select value={expectedCompletion} onValueChange={setExpectedCompletion}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border shadow-lg z-50">
                    {years.map((y) => (
                      <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <Button variant="outline" onClick={handleBack}>
                <ChevronLeft className="mr-2 w-4 h-4" /> Back
              </Button>
              <Button onClick={handleSubmit} disabled={loading || !major || !degreeType} className="px-8">
                {loading ? 'Saving...' : 'Complete Setup'}
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (userType === 'employer' || userType === 'career_counsellor') && (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-foreground">Company Details</h1>
              <p className="text-muted-foreground mt-2">Tell us about your organization</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div className="space-y-2">
                <Label>Company Name *</Label>
                <Input
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Enter company name"
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label>Your Job Title</Label>
                <Input
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g., HR Manager"
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label>Industry</Label>
                <Select value={industry} onValueChange={setIndustry}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border shadow-lg z-50">
                    {INDUSTRIES.map((i) => (
                      <SelectItem key={i} value={i}>{i}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Company Size</Label>
                <Select value={companySize} onValueChange={setCompanySize}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border shadow-lg z-50">
                    {COMPANY_SIZES.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Company Location</Label>
                <Input
                  value={companyLocation}
                  onChange={(e) => setCompanyLocation(e.target.value)}
                  placeholder="e.g., Johannesburg, South Africa"
                  className="h-12"
                />
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <Button variant="outline" onClick={handleBack}>
                <ChevronLeft className="mr-2 w-4 h-4" /> Back
              </Button>
              <Button onClick={handleSubmit} disabled={loading || !companyName} className="px-8">
                {loading ? 'Saving...' : 'Complete Setup'}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Onboarding;
