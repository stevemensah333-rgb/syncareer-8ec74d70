import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Sparkles, TrendingUp, Award, Code, Palette, Database, FileText, X, Briefcase } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { AnalysisDialog } from '@/components/skillbridge/AnalysisDialog';
import { useUserProfile } from '@/contexts/UserProfileContext';

interface SkillData {
  name: string;
  category: string;
  count: number;
  endorsements: number;
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
  
  // Real data state
  const [userSkills, setUserSkills] = useState<SkillData[]>([]);
  const [totalEndorsements, setTotalEndorsements] = useState(0);
  const [suggestedSkills, setSuggestedSkills] = useState<Array<{ name: string; reason: string; demand: string }>>([]);
  const [skillGaps, setSkillGaps] = useState<Array<{ skill: string; gap: string }>>([]);

  const getSkillIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'frontend':
      case 'programming':
        return Code;
      case 'design':
        return Palette;
      case 'backend':
      case 'database':
        return Database;
      default:
        return Briefcase;
    }
  };

  const categorizeSkill = (skillName: string): string => {
    const skill = skillName.toLowerCase();
    if (['react', 'vue', 'angular', 'html', 'css', 'javascript', 'typescript', 'tailwind', 'nextjs'].some(s => skill.includes(s))) {
      return 'Frontend';
    }
    if (['node', 'python', 'java', 'go', 'rust', 'php', 'ruby', 'django', 'express'].some(s => skill.includes(s))) {
      return 'Backend';
    }
    if (['figma', 'sketch', 'adobe', 'ui', 'ux', 'design', 'photoshop', 'illustrator'].some(s => skill.includes(s))) {
      return 'Design';
    }
    if (['sql', 'mongodb', 'postgres', 'mysql', 'redis', 'database'].some(s => skill.includes(s))) {
      return 'Database';
    }
    return 'General';
  };

  const fetchSkillsData = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }

      const userId = session.user.id;

      // Fetch skills from user's community posts (tags)
      const { data: posts } = await supabase
        .from('community_posts')
        .select('tags')
        .eq('author_id', userId);

      // Count skill occurrences
      const skillCounts: Record<string, number> = {};
      (posts || []).forEach(post => {
        (post.tags || []).forEach((tag: string) => {
          skillCounts[tag] = (skillCounts[tag] || 0) + 1;
        });
      });

      // Fetch endorsements for the user
      const { data: endorsements } = await supabase
        .from('skill_endorsements')
        .select('skill_name')
        .eq('user_id', userId);

      // Count endorsements per skill
      const endorsementCounts: Record<string, number> = {};
      let totalEndo = 0;
      (endorsements || []).forEach(e => {
        endorsementCounts[e.skill_name] = (endorsementCounts[e.skill_name] || 0) + 1;
        totalEndo++;
      });

      // Combine into skill data
      const allSkillNames = new Set([...Object.keys(skillCounts), ...Object.keys(endorsementCounts)]);
      const skills: SkillData[] = Array.from(allSkillNames).map(name => ({
        name,
        category: categorizeSkill(name),
        count: skillCounts[name] || 0,
        endorsements: endorsementCounts[name] || 0,
      }));

      // Sort by total activity (posts + endorsements)
      skills.sort((a, b) => (b.count + b.endorsements) - (a.count + a.endorsements));

      setUserSkills(skills.slice(0, 8)); // Top 8 skills
      setTotalEndorsements(totalEndo);

      // Generate AI suggestions based on user's major and current skills
      const major = studentDetails?.major?.toLowerCase() || '';
      const currentSkillNames = skills.map(s => s.name.toLowerCase());
      
      let suggestions: Array<{ name: string; reason: string; demand: string }> = [];
      let gaps: Array<{ skill: string; gap: string }> = [];

      if (major.includes('computer') || major.includes('software') || major.includes('data')) {
        suggestions = [
          !currentSkillNames.includes('typescript') && { name: 'TypeScript', reason: 'Type safety for larger projects', demand: 'Very High' },
          !currentSkillNames.includes('docker') && { name: 'Docker', reason: 'Essential for modern deployment', demand: 'High' },
          !currentSkillNames.includes('aws') && { name: 'AWS/Cloud', reason: 'Top employer requirement', demand: 'Very High' },
          !currentSkillNames.includes('graphql') && { name: 'GraphQL', reason: 'Modern API development', demand: 'Growing' },
        ].filter(Boolean) as typeof suggestions;
        
        gaps = [
          { skill: 'System Design', gap: 'High' },
          { skill: 'Testing/QA', gap: 'Medium' },
          { skill: 'CI/CD', gap: 'Medium' },
        ];
      } else if (major.includes('business') || major.includes('finance')) {
        suggestions = [
          { name: 'Data Analysis', reason: 'Critical for business decisions', demand: 'Very High' },
          { name: 'SQL', reason: 'Database querying skills', demand: 'High' },
          { name: 'Power BI/Tableau', reason: 'Data visualization', demand: 'High' },
          { name: 'Python', reason: 'Automation and analysis', demand: 'Growing' },
        ];
        gaps = [
          { skill: 'Financial Modeling', gap: 'High' },
          { skill: 'Business Intelligence', gap: 'Medium' },
        ];
      } else if (major.includes('design') || major.includes('graphic')) {
        suggestions = [
          { name: 'Figma', reason: 'Industry standard design tool', demand: 'Very High' },
          { name: 'Motion Design', reason: 'Animations and micro-interactions', demand: 'High' },
          { name: 'Design Systems', reason: 'Scalable design architecture', demand: 'Growing' },
          { name: 'Prototyping', reason: 'Interactive mockups', demand: 'High' },
        ];
        gaps = [
          { skill: 'User Research', gap: 'High' },
          { skill: 'Accessibility Design', gap: 'Medium' },
        ];
      } else {
        suggestions = [
          { name: 'Microsoft Excel', reason: 'Universal business tool', demand: 'High' },
          { name: 'Communication', reason: 'Essential soft skill', demand: 'Very High' },
          { name: 'Project Management', reason: 'Organizational skills', demand: 'High' },
          { name: 'Data Analysis', reason: 'Growing in all fields', demand: 'Growing' },
        ];
        gaps = [
          { skill: 'Technical Writing', gap: 'Medium' },
          { skill: 'Presentation Skills', gap: 'Medium' },
        ];
      }

      setSuggestedSkills(suggestions.slice(0, 4));
      setSkillGaps(gaps);

    } catch (error) {
      console.error('Error fetching skills:', error);
    } finally {
      setLoading(false);
    }
  }, [studentDetails?.major]);

  useEffect(() => {
    fetchSkillsData();
  }, [fetchSkillsData]);

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
        // Remove the data URL prefix (e.g., "data:application/pdf;base64,")
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

  const handleAnalyzePortfolio = async () => {
    if (!uploadedCV) {
      toast.error('Please upload your CV first');
      return;
    }

    const fileType = uploadedCV.type;
    const isSupportedText = SUPPORTED_TEXT_TYPES.includes(fileType);
    const isSupportedBinary = SUPPORTED_BINARY_TYPES.includes(fileType);

    if (!isSupportedText && !isSupportedBinary) {
      toast.error("We couldn't process your CV. Please upload a supported file format (PDF, DOC, DOCX, or TXT).");
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
        // Send binary files as base64 for server-side AI extraction
        const base64Content = await readFileAsBase64(uploadedCV);
        body = {
          fileBase64: base64Content,
          fileMimeType: uploadedCV.type,
          portfolioContent: '',
          fileName: uploadedCV.name,
        };
      } else {
        // Text files can be read directly
        const cvContent = await readFileAsText(uploadedCV);
        if (!cvContent || cvContent.trim().length < 20) {
          toast.error("We couldn't extract text from your CV. Please try uploading a .txt file instead.");
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

      const { data, error } = await supabase.functions.invoke('analyze-portfolio', {
        body,
      });

      if (error) throw error;

      if (data?.error) {
        throw new Error(data.error);
      }

      setAnalysis(data.analysis || '');
      setExtractedSkills(data.extractedSkills || []);
      setExperienceSummary(data.experienceSummary || null);
      setScores(data.scores || null);
      setSuggestedRoles(data.suggestedRoles || []);
      setMissingSkills(data.missingSkills || []);
      toast.success('Your CV has been analyzed by AI');
    } catch (error) {
      console.error('Error analyzing files:', error);
      toast.error("We couldn't process your CV. Please try again or upload a supported file format.");
      setAnalysisOpen(false);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSkillLevel = (count: number, endorsements: number): string => {
    const total = count + endorsements;
    if (total >= 10) return 'Expert';
    if (total >= 5) return 'Advanced';
    if (total >= 2) return 'Intermediate';
    return 'Beginner';
  };

  const getSkillScore = (count: number, endorsements: number): number => {
    return Math.min(100, (count * 10) + (endorsements * 15));
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
                Upload your CV to get instant AI analysis of your skills, gaps, and personalized recommendations.
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
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleRemoveCV}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-4">
                    No CV uploaded yet
                  </p>
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
                <Button 
                  variant="default" 
                  className="flex-1"
                  onClick={() => cvInputRef.current?.click()}
                >
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
                  Analyze Portfolio
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Current Skills */}
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
                    Start posting with skill tags or get endorsed by peers to build your skill profile.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userSkills.map((skill) => {
                    const Icon = getSkillIcon(skill.category);
                    const level = getSkillLevel(skill.count, skill.endorsements);
                    const score = getSkillScore(skill.count, skill.endorsements);
                    return (
                      <div
                        key={skill.name}
                        onClick={() => setSelectedSkill(skill.name)}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedSkill === skill.name 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Icon className="h-5 w-5 text-primary" />
                            <h3 className="font-semibold">{skill.name}</h3>
                          </div>
                          <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full">
                            {level}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{skill.category}</p>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: `${score}%` }}
                          />
                        </div>
                        <div className="flex justify-between mt-1">
                          <p className="text-xs text-muted-foreground">
                            {skill.count} posts • {skill.endorsements} endorsements
                          </p>
                          <p className="text-xs text-muted-foreground">{score}/100</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Skill Gap Analysis */}
          {skillGaps.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Skills to Develop
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Based on your career goals and market demands, focus on these skills:
                </p>
                <div className="space-y-3">
                  {skillGaps.map((item) => (
                    <div key={item.skill} className="flex items-center justify-between p-3 border rounded-md">
                      <span className="font-medium">{item.skill}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        item.gap === 'High' 
                          ? 'bg-red-100 text-red-700' 
                          : item.gap === 'Medium'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-green-100 text-green-700'
                      }`}>
                        {item.gap} Priority
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Skills Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                Skills Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-5xl font-bold text-primary mb-2">{userSkills.length}</div>
              <p className="text-sm text-muted-foreground mb-4">
                Skills in your profile
              </p>
              <div className="space-y-2 text-left">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Technical Skills</span>
                  <span className="font-medium">
                    {userSkills.filter(s => ['Frontend', 'Backend', 'Database'].includes(s.category)).length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Design Skills</span>
                  <span className="font-medium">
                    {userSkills.filter(s => s.category === 'Design').length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Endorsements</span>
                  <span className="font-medium">{totalEndorsements}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Suggested Skills */}
          {suggestedSkills.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  AI Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {suggestedSkills.map((skill) => (
                    <div key={skill.name} className="p-3 border rounded-md">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-sm">{skill.name}</h4>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          skill.demand === 'Very High' 
                            ? 'bg-green-100 text-green-700'
                            : skill.demand === 'High'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-700'
                        }`}>
                          {skill.demand}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{skill.reason}</p>
                    </div>
                  ))}
                </div>
                <Button 
                  variant="outline" 
                  className="w-full mt-4"
                  onClick={() => navigate('/learn')}
                >
                  View Learning Paths
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default MySkills;