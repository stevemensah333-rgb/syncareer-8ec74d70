import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Sparkles, TrendingUp, Award, Code, Palette, Database, FileText, X, Briefcase, BookOpen, ExternalLink, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { AnalysisDialog } from '@/components/skillbridge/AnalysisDialog';
import { useUserProfile } from '@/contexts/UserProfileContext';
import { Badge } from '@/components/ui/badge';

interface UserSkill {
  id: string;
  skill_name: string;
  category: string;
  proficiency: string;
  source: string;
  created_at: string;
}

interface SuggestedCourse {
  title: string;
  platform: string;
  skill_addressed: string;
  difficulty: string;
  reason: string;
  estimated_hours: number;
  url?: string;
}

const MySkills = () => {
  const navigate = useNavigate();
  const { studentDetails } = useUserProfile();
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const cvInputRef = useRef<HTMLInputElement>(null);
  const [uploadedCV, setUploadedCV] = useState<File | null>(null);
  const [analysisOpen, setAnalysisOpen] = useState(false);
  const [analysis, setAnalysis] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [extractedSkills, setExtractedSkills] = useState<any[]>([]);
  const [experienceSummary, setExperienceSummary] = useState<any>(null);
  const [scores, setScores] = useState<any>(null);
  const [suggestedRoles, setSuggestedRoles] = useState<string[]>([]);
  const [missingSkills, setMissingSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Real data from user_skills table
  const [userSkills, setUserSkills] = useState<UserSkill[]>([]);
  // Course suggestions
  const [courses, setCourses] = useState<SuggestedCourse[]>([]);
  const [courseSummary, setCourseSummary] = useState('');
  const [loadingCourses, setLoadingCourses] = useState(false);

  const getSkillIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'technical':
      case 'frontend':
      case 'programming':
        return Code;
      case 'design':
        return Palette;
      case 'backend':
      case 'database':
      case 'tool':
        return Database;
      default:
        return Briefcase;
    }
  };

  const getProficiencyColor = (proficiency: string) => {
    switch (proficiency) {
      case 'expert': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'advanced': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'intermediate': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const getProficiencyScore = (proficiency: string): number => {
    switch (proficiency) {
      case 'expert': return 95;
      case 'advanced': return 75;
      case 'intermediate': return 50;
      default: return 25;
    }
  };

  const fetchSkillsData = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }

      // Fetch skills from user_skills table
      const { data: skills, error } = await supabase
        .from('user_skills')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching skills:', error);
      } else {
        setUserSkills((skills as UserSkill[]) || []);
      }
    } catch (error) {
      console.error('Error fetching skills:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCourseSuggestions = useCallback(async () => {
    if (userSkills.length === 0) return;
    
    setLoadingCourses(true);
    try {
      const { data, error } = await supabase.functions.invoke('suggest-courses');
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      
      setCourses(data.courses || []);
      setCourseSummary(data.summary || '');
    } catch (error) {
      console.error('Error fetching course suggestions:', error);
    } finally {
      setLoadingCourses(false);
    }
  }, [userSkills.length]);

  useEffect(() => {
    fetchSkillsData();
  }, [fetchSkillsData]);

  // Fetch course suggestions when skills change
  useEffect(() => {
    if (userSkills.length > 0) {
      fetchCourseSuggestions();
    }
  }, [userSkills.length, fetchCourseSuggestions]);

  const SUPPORTED_TEXT_TYPES = ['text/plain', 'text/markdown', 'text/csv'];
  const SUPPORTED_BINARY_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleCVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedCV(file);
      toast.success(`${file.name} ready for analysis`);
    }
  };

  const handleRemoveCV = () => {
    setUploadedCV(null);
    if (cvInputRef.current) {
      cvInputRef.current.value = '';
    }
  };

  // Auto-save extracted skills to user_skills table
  const saveExtractedSkills = async (skills: Array<{ name: string; category: string; proficiency: string }>) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const userId = session.user.id;
      
      // Format skills for upsert (handle duplicates via unique constraint)
      const skillRows = skills.map(s => ({
        user_id: userId,
        skill_name: s.name.trim().replace(/\b\w/g, c => c.toUpperCase()), // Capitalize
        category: s.category || 'general',
        proficiency: s.proficiency || 'beginner',
        source: 'ai-extracted',
      }));

      // Upsert skills - skip duplicates by using onConflict
      for (const skill of skillRows) {
        const { error } = await supabase
          .from('user_skills')
          .upsert(skill, { onConflict: 'user_id,skill_name' });
        
        if (error) {
          console.error(`Error saving skill ${skill.skill_name}:`, error);
        }
      }

      console.log(`[Skills] Saved ${skillRows.length} skills to user_skills table`);
      toast.success(`${skillRows.length} skills added to your profile`);
      
      // Refresh skills list
      await fetchSkillsData();
    } catch (error) {
      console.error('Error saving extracted skills:', error);
      toast.error('Failed to save some skills');
    }
  };

  const handleAnalyzePortfolio = async () => {
    if (!uploadedCV) {
      toast.error('Please upload your CV first');
      return;
    }

    const fileType = uploadedCV.type;
    const isSupportedText = SUPPORTED_TEXT_TYPES.includes(fileType);
    const isSupportedBinary = SUPPORTED_BINARY_TYPES.includes(fileType);

    if (!isSupportedText && !isSupportedBinary) {
      toast.error("Please upload a supported file format (PDF, DOC, DOCX, or TXT).");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisOpen(true);
    setAnalysis('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please sign in to scan your CV');
        setAnalysisOpen(false);
        setIsAnalyzing(false);
        return;
      }

      let body: Record<string, string>;

      if (isSupportedBinary) {
        const base64Content = await readFileAsBase64(uploadedCV);
        body = {
          fileBase64: base64Content,
          fileMimeType: uploadedCV.type,
          portfolioContent: '',
          fileName: uploadedCV.name,
        };
      } else {
        const cvContent = await readFileAsText(uploadedCV);
        if (!cvContent || cvContent.trim().length < 20) {
          toast.error("Couldn't extract text from your CV. Try uploading a .txt file instead.");
          setAnalysisOpen(false);
          setIsAnalyzing(false);
          return;
        }
        body = {
          cvContent,
          portfolioContent: '',
          fileName: uploadedCV.name,
        };
      }

      const { data, error } = await supabase.functions.invoke('analyze-portfolio', { body });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setAnalysis(data.analysis || '');
      setExtractedSkills(data.extractedSkills || []);
      setExperienceSummary(data.experienceSummary || null);
      setScores(data.scores || null);
      setSuggestedRoles(data.suggestedRoles || []);
      setMissingSkills(data.missingSkills || []);
      toast.success('Your CV has been analyzed by AI');

      // AUTO-SAVE: Save extracted skills to user_skills table
      if (data.extractedSkills && data.extractedSkills.length > 0) {
        await saveExtractedSkills(data.extractedSkills);
      }
    } catch (error) {
      console.error('Error analyzing files:', error);
      toast.error("Couldn't process your CV. Please try again or upload a supported format.");
      setAnalysisOpen(false);
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <PageLayout title="My Skills">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading your skills...</p>
        </div>
      </PageLayout>
    );
  }

  const technicalSkills = userSkills.filter(s => ['technical', 'tool', 'frontend', 'backend', 'database'].includes(s.category.toLowerCase()));
  const softSkills = userSkills.filter(s => s.category.toLowerCase() === 'soft');
  const domainSkills = userSkills.filter(s => ['domain', 'general'].includes(s.category.toLowerCase()));

  return (
    <PageLayout title="My Skills">
      <AnalysisDialog 
        open={analysisOpen}
        onOpenChange={setAnalysisOpen}
        analysis={analysis}
        isLoading={isAnalyzing}
        extractedSkills={extractedSkills}
        experienceSummary={experienceSummary}
        scores={scores}
        suggestedRoles={suggestedRoles}
        missingSkills={missingSkills}
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Skills Display */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Skills Scanner Card */}
          <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                AI Skills Scanner
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Upload your CV to automatically extract skills, get AI analysis, and receive personalized course suggestions.
              </p>
              
              {uploadedCV ? (
                <div className="border rounded-lg p-4 bg-muted/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-primary" />
                      <div>
                        <p className="font-medium">{uploadedCV.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(uploadedCV.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={handleRemoveCV}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-4">No CV uploaded yet</p>
                </div>
              )}

              <div className="flex gap-3">
                <input
                  ref={cvInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleCVUpload}
                  className="hidden"
                />
                <Button variant="default" className="flex-1" onClick={() => cvInputRef.current?.click()}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload CV
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={handleAnalyzePortfolio}
                  disabled={!uploadedCV || isAnalyzing}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  {isAnalyzing ? 'Analyzing...' : 'Analyze Portfolio'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Your Skills */}
          <Card>
            <CardHeader>
              <CardTitle>Your Skills</CardTitle>
            </CardHeader>
            <CardContent>
              {userSkills.length === 0 ? (
                <div className="text-center py-8">
                  <Code className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-2">No skills tracked yet</p>
                  <p className="text-sm text-muted-foreground">
                    Upload and analyze your CV to automatically extract and save your skills.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {technicalSkills.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Technical Skills</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {technicalSkills.map((skill) => {
                          const Icon = getSkillIcon(skill.category);
                          const score = getProficiencyScore(skill.proficiency);
                          return (
                            <div
                              key={skill.id}
                              onClick={() => setSelectedSkill(skill.skill_name)}
                              className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                                selectedSkill === skill.skill_name 
                                  ? 'border-primary bg-primary/5' 
                                  : 'border-border hover:border-primary/50'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <Icon className="h-4 w-4 text-primary" />
                                  <h3 className="font-semibold text-sm">{skill.skill_name}</h3>
                                </div>
                                <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${getProficiencyColor(skill.proficiency)}`}>
                                  {skill.proficiency}
                                </span>
                              </div>
                              <div className="w-full bg-muted rounded-full h-1.5">
                                <div className="bg-primary h-1.5 rounded-full transition-all" style={{ width: `${score}%` }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {softSkills.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Soft Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {softSkills.map((skill) => (
                          <Badge key={skill.id} variant="secondary" className="capitalize">
                            {skill.skill_name} • {skill.proficiency}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {domainSkills.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Domain Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {domainSkills.map((skill) => (
                          <Badge key={skill.id} variant="outline" className="capitalize">
                            {skill.skill_name} • {skill.proficiency}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Course Suggestions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Recommended Courses
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingCourses ? (
                <div className="flex items-center justify-center py-8 gap-2">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <p className="text-muted-foreground">Generating personalized course suggestions...</p>
                </div>
              ) : courses.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-2">No course suggestions yet</p>
                  <p className="text-sm text-muted-foreground">
                    {userSkills.length === 0 
                      ? 'Analyze your CV first to get personalized course recommendations.'
                      : 'Course suggestions will appear after your skills are analyzed.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {courseSummary && (
                    <p className="text-sm text-muted-foreground mb-4">{courseSummary}</p>
                  )}
                  {courses.map((course, i) => (
                    <div key={i} className="p-4 border rounded-lg hover:border-primary/50 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm">{course.title}</h4>
                          <p className="text-xs text-muted-foreground">{course.platform} • {course.estimated_hours}h • {course.difficulty}</p>
                        </div>
                        {course.url && (
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => window.open(course.url, '_blank')}>
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{course.reason}</p>
                      <Badge variant="outline" className="mt-2 text-xs">
                        Fills gap: {course.skill_addressed}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                Skills Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-5xl font-bold text-primary mb-2">{userSkills.length}</div>
              <p className="text-sm text-muted-foreground mb-4">Skills in your profile</p>
              <div className="space-y-2 text-left">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Technical</span>
                  <span className="font-medium">{technicalSkills.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Soft Skills</span>
                  <span className="font-medium">{softSkills.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Domain</span>
                  <span className="font-medium">{domainSkills.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">AI-Extracted</span>
                  <span className="font-medium">{userSkills.filter(s => s.source === 'ai-extracted').length}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Missing Skills from last analysis */}
          {missingSkills.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Skills to Develop
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {missingSkills.map((skill, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 border rounded-md">
                      <span className="text-sm">{skill}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Suggested Roles from last analysis */}
          {suggestedRoles.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-primary" />
                  Suited Roles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {suggestedRoles.map((role, i) => (
                    <Badge key={i} variant="secondary">{role}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default MySkills;
