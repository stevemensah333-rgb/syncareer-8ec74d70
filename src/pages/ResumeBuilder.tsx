import { useState, useEffect } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { FileText, Plus, Trash2, Sparkles, Download, Save, Eye, User, GraduationCap, Briefcase, FolderOpen, Award, Wrench } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useUserProfile } from '@/contexts/UserProfileContext';

interface Education {
  school: string;
  degree: string;
  major: string;
  graduationDate: string;
  gpa?: string;
}

interface Experience {
  company: string;
  title: string;
  location: string;
  startDate: string;
  endDate?: string;
  bullets: string[];
}

interface Project {
  name: string;
  role: string;
  duration: string;
  bullets: string[];
}

interface Achievement {
  title: string;
  organization: string;
  date: string;
}

const ResumeBuilder = () => {
  const { profile, studentDetails } = useUserProfile();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [resumeId, setResumeId] = useState<string | null>(null);

  // Personal Info
  const [personalInfo, setPersonalInfo] = useState({
    fullName: '',
    phone: '',
    email: '',
    secondaryEmail: '',
    linkedin: '',
    nationality: '',
  });

  // Sections
  const [education, setEducation] = useState<Education[]>([{
    school: '',
    degree: '',
    major: '',
    graduationDate: '',
    gpa: '',
  }]);
  
  const [experience, setExperience] = useState<Experience[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');

  // Pre-populate from profile
  useEffect(() => {
    if (profile) {
      setPersonalInfo(prev => ({
        ...prev,
        fullName: profile.full_name || '',
      }));
    }
    if (studentDetails) {
      setEducation([{
        school: studentDetails.school || '',
        degree: studentDetails.degree_type || '',
        major: studentDetails.major || '',
        graduationDate: studentDetails.expected_completion?.toString() || '',
        gpa: '',
      }]);
    }
  }, [profile, studentDetails]);

  const addEducation = () => {
    setEducation([...education, { school: '', degree: '', major: '', graduationDate: '', gpa: '' }]);
  };

  const updateEducation = (index: number, field: keyof Education, value: string) => {
    const updated = [...education];
    updated[index] = { ...updated[index], [field]: value };
    setEducation(updated);
  };

  const removeEducation = (index: number) => {
    if (education.length > 1) {
      setEducation(education.filter((_, i) => i !== index));
    }
  };

  const addExperience = () => {
    setExperience([...experience, { company: '', title: '', location: '', startDate: '', endDate: '', bullets: [''] }]);
  };

  const updateExperience = (index: number, field: keyof Experience, value: any) => {
    const updated = [...experience];
    updated[index] = { ...updated[index], [field]: value };
    setExperience(updated);
  };

  const removeExperience = (index: number) => {
    setExperience(experience.filter((_, i) => i !== index));
  };

  const addProject = () => {
    setProjects([...projects, { name: '', role: '', duration: '', bullets: [''] }]);
  };

  const updateProject = (index: number, field: keyof Project, value: any) => {
    const updated = [...projects];
    updated[index] = { ...updated[index], [field]: value };
    setProjects(updated);
  };

  const removeProject = (index: number) => {
    setProjects(projects.filter((_, i) => i !== index));
  };

  const addAchievement = () => {
    setAchievements([...achievements, { title: '', organization: '', date: '' }]);
  };

  const updateAchievement = (index: number, field: keyof Achievement, value: string) => {
    const updated = [...achievements];
    updated[index] = { ...updated[index], [field]: value };
    setAchievements(updated);
  };

  const removeAchievement = (index: number) => {
    setAchievements(achievements.filter((_, i) => i !== index));
  };

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill));
  };

  const generateBullets = async (context: string, index: number, type: 'experience' | 'project') => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please sign in');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-resume`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          action: 'generate',
          targetRole: type === 'experience' ? experience[index]?.title : projects[index]?.role,
          contentToImprove: context,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate');

      const data = await response.json();
      
      if (type === 'experience') {
        updateExperience(index, 'bullets', data.bullets);
      } else {
        updateProject(index, 'bullets', data.bullets);
      }
      toast.success('Bullet points generated!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to generate bullets');
    } finally {
      setIsLoading(false);
    }
  };

  const improveContent = async (content: string, section: string) => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please sign in');
        return content;
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-resume`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          action: 'improve',
          sectionToImprove: section,
          contentToImprove: content,
        }),
      });

      if (!response.ok) throw new Error('Failed to improve');

      const data = await response.json();
      toast.success('Content improved!');
      return data.improvedContent;
    } catch (error) {
      console.error(error);
      toast.error('Failed to improve content');
      return content;
    } finally {
      setIsLoading(false);
    }
  };

  const saveResume = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please sign in');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-resume`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          action: 'save',
          resumeId,
          personalInfo,
          education,
          experience,
          skills,
          projects,
          achievements,
        }),
      });

      if (!response.ok) throw new Error('Failed to save');

      const data = await response.json();
      setResumeId(data.resume.id);
      toast.success('Resume saved successfully!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to save resume');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadResume = () => {
    // Generate a text-based resume for download
    let resumeText = `${personalInfo.fullName.toUpperCase()}\n`;
    resumeText += `${personalInfo.phone}${personalInfo.nationality ? ` / ${personalInfo.nationality}` : ''}\n`;
    resumeText += `${personalInfo.email}${personalInfo.secondaryEmail ? ` / ${personalInfo.secondaryEmail}` : ''}\n`;
    if (personalInfo.linkedin) resumeText += `${personalInfo.linkedin}\n`;
    
    resumeText += `\nEDUCATION\n`;
    education.forEach(edu => {
      resumeText += `${edu.school}\n`;
      resumeText += `${edu.degree} - ${edu.major}\n`;
      if (edu.graduationDate) resumeText += `Expected Graduation: ${edu.graduationDate}\n`;
      if (edu.gpa) resumeText += `GPA: ${edu.gpa}\n`;
      resumeText += '\n';
    });

    if (achievements.length > 0) {
      resumeText += `ACHIEVEMENTS/AWARDS\n`;
      achievements.forEach(a => {
        resumeText += `${a.title}, ${a.organization}, ${a.date}\n`;
      });
      resumeText += '\n';
    }

    if (experience.length > 0) {
      resumeText += `WORK EXPERIENCE\n`;
      experience.forEach(exp => {
        resumeText += `${exp.company} – ${exp.location}, ${exp.startDate}${exp.endDate ? ` - ${exp.endDate}` : ''}\n`;
        resumeText += `${exp.title}\n`;
        exp.bullets.forEach(b => {
          if (b) resumeText += `• ${b}\n`;
        });
        resumeText += '\n';
      });
    }

    if (projects.length > 0) {
      resumeText += `PROJECTS AND RESEARCH\n`;
      projects.forEach(proj => {
        resumeText += `${proj.name}, ${proj.duration}\n`;
        resumeText += `${proj.role}\n`;
        proj.bullets.forEach(b => {
          if (b) resumeText += `• ${b}\n`;
        });
        resumeText += '\n';
      });
    }

    if (skills.length > 0) {
      resumeText += `SKILLS\n`;
      skills.forEach(s => {
        resumeText += `• ${s}\n`;
      });
      resumeText += '\n';
    }

    resumeText += `REFERENCES\nAvailable upon request\n`;

    const blob = new Blob([resumeText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${personalInfo.fullName || 'resume'}_CV.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Resume downloaded!');
  };

  return (
    <PageLayout title="Resume Builder">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-6 w-full">
              <TabsTrigger value="personal" className="text-xs">
                <User className="h-3 w-3 mr-1" />
                Personal
              </TabsTrigger>
              <TabsTrigger value="education" className="text-xs">
                <GraduationCap className="h-3 w-3 mr-1" />
                Education
              </TabsTrigger>
              <TabsTrigger value="experience" className="text-xs">
                <Briefcase className="h-3 w-3 mr-1" />
                Experience
              </TabsTrigger>
              <TabsTrigger value="projects" className="text-xs">
                <FolderOpen className="h-3 w-3 mr-1" />
                Projects
              </TabsTrigger>
              <TabsTrigger value="achievements" className="text-xs">
                <Award className="h-3 w-3 mr-1" />
                Awards
              </TabsTrigger>
              <TabsTrigger value="skills" className="text-xs">
                <Wrench className="h-3 w-3 mr-1" />
                Skills
              </TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Your contact details for the resume header</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Full Name *</Label>
                      <Input
                        value={personalInfo.fullName}
                        onChange={(e) => setPersonalInfo({ ...personalInfo, fullName: e.target.value })}
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone Number *</Label>
                      <Input
                        value={personalInfo.phone}
                        onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                        placeholder="+233 00 000 0000"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Primary Email *</Label>
                      <Input
                        value={personalInfo.email}
                        onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                        placeholder="john@email.com"
                        type="email"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Secondary Email</Label>
                      <Input
                        value={personalInfo.secondaryEmail}
                        onChange={(e) => setPersonalInfo({ ...personalInfo, secondaryEmail: e.target.value })}
                        placeholder="john@university.edu"
                        type="email"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>LinkedIn Profile</Label>
                      <Input
                        value={personalInfo.linkedin}
                        onChange={(e) => setPersonalInfo({ ...personalInfo, linkedin: e.target.value })}
                        placeholder="linkedin.com/in/johndoe"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Nationality</Label>
                      <Input
                        value={personalInfo.nationality}
                        onChange={(e) => setPersonalInfo({ ...personalInfo, nationality: e.target.value })}
                        placeholder="Ghanaian"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="education" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Education</CardTitle>
                  <CardDescription>Your academic qualifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {education.map((edu, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">Education {index + 1}</h4>
                        {education.length > 1 && (
                          <Button variant="ghost" size="sm" onClick={() => removeEducation(index)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>School/University *</Label>
                          <Input
                            value={edu.school}
                            onChange={(e) => updateEducation(index, 'school', e.target.value)}
                            placeholder="University Name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Degree *</Label>
                          <Input
                            value={edu.degree}
                            onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                            placeholder="BSc., BA, MSc., etc."
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Major/Field *</Label>
                          <Input
                            value={edu.major}
                            onChange={(e) => updateEducation(index, 'major', e.target.value)}
                            placeholder="Computer Science"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Graduation Date</Label>
                          <Input
                            value={edu.graduationDate}
                            onChange={(e) => updateEducation(index, 'graduationDate', e.target.value)}
                            placeholder="June 2025"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>GPA</Label>
                          <Input
                            value={edu.gpa}
                            onChange={(e) => updateEducation(index, 'gpa', e.target.value)}
                            placeholder="3.8/4.0"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" onClick={addEducation} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Education
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="experience" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Work Experience</CardTitle>
                  <CardDescription>Your professional experience</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {experience.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No experience added yet. Click below to add your first role.
                    </p>
                  ) : (
                    experience.map((exp, index) => (
                      <div key={index} className="p-4 border rounded-lg space-y-4">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium">Experience {index + 1}</h4>
                          <Button variant="ghost" size="sm" onClick={() => removeExperience(index)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Company *</Label>
                            <Input
                              value={exp.company}
                              onChange={(e) => updateExperience(index, 'company', e.target.value)}
                              placeholder="Company Name"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Job Title *</Label>
                            <Input
                              value={exp.title}
                              onChange={(e) => updateExperience(index, 'title', e.target.value)}
                              placeholder="Software Engineer"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label>Location</Label>
                            <Input
                              value={exp.location}
                              onChange={(e) => updateExperience(index, 'location', e.target.value)}
                              placeholder="Accra, Ghana"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Start Date</Label>
                            <Input
                              value={exp.startDate}
                              onChange={(e) => updateExperience(index, 'startDate', e.target.value)}
                              placeholder="Jan 2023"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>End Date</Label>
                            <Input
                              value={exp.endDate}
                              onChange={(e) => updateExperience(index, 'endDate', e.target.value)}
                              placeholder="Present"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <Label>Bullet Points</Label>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => generateBullets(`${exp.title} at ${exp.company}`, index, 'experience')}
                              disabled={isLoading}
                            >
                              <Sparkles className="h-3 w-3 mr-1" />
                              AI Generate
                            </Button>
                          </div>
                          {exp.bullets.map((bullet, bIndex) => (
                            <div key={bIndex} className="flex gap-2">
                              <span className="mt-2">•</span>
                              <Input
                                value={bullet}
                                onChange={(e) => {
                                  const newBullets = [...exp.bullets];
                                  newBullets[bIndex] = e.target.value;
                                  updateExperience(index, 'bullets', newBullets);
                                }}
                                placeholder="Describe your achievement..."
                              />
                              {exp.bullets.length > 1 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    const newBullets = exp.bullets.filter((_, i) => i !== bIndex);
                                    updateExperience(index, 'bullets', newBullets);
                                  }}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          ))}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateExperience(index, 'bullets', [...exp.bullets, ''])}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add Bullet
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                  <Button variant="outline" onClick={addExperience} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Experience
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="projects" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Projects & Research</CardTitle>
                  <CardDescription>Notable projects you've worked on</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {projects.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No projects added yet. Click below to add your first project.
                    </p>
                  ) : (
                    projects.map((proj, index) => (
                      <div key={index} className="p-4 border rounded-lg space-y-4">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium">Project {index + 1}</h4>
                          <Button variant="ghost" size="sm" onClick={() => removeProject(index)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label>Project Name *</Label>
                            <Input
                              value={proj.name}
                              onChange={(e) => updateProject(index, 'name', e.target.value)}
                              placeholder="Project Name"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Your Role</Label>
                            <Input
                              value={proj.role}
                              onChange={(e) => updateProject(index, 'role', e.target.value)}
                              placeholder="Team Lead"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Duration</Label>
                            <Input
                              value={proj.duration}
                              onChange={(e) => updateProject(index, 'duration', e.target.value)}
                              placeholder="Jan - Mar 2024"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <Label>Description</Label>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => generateBullets(`${proj.role} on ${proj.name}`, index, 'project')}
                              disabled={isLoading}
                            >
                              <Sparkles className="h-3 w-3 mr-1" />
                              AI Generate
                            </Button>
                          </div>
                          {proj.bullets.map((bullet, bIndex) => (
                            <div key={bIndex} className="flex gap-2">
                              <span className="mt-2">•</span>
                              <Input
                                value={bullet}
                                onChange={(e) => {
                                  const newBullets = [...proj.bullets];
                                  newBullets[bIndex] = e.target.value;
                                  updateProject(index, 'bullets', newBullets);
                                }}
                                placeholder="Describe what you did..."
                              />
                            </div>
                          ))}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateProject(index, 'bullets', [...proj.bullets, ''])}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add Bullet
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                  <Button variant="outline" onClick={addProject} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Project
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="achievements" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Achievements & Awards</CardTitle>
                  <CardDescription>Recognition and accomplishments</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {achievements.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No achievements added yet.
                    </p>
                  ) : (
                    achievements.map((ach, index) => (
                      <div key={index} className="flex gap-4 items-center">
                        <div className="flex-1 grid grid-cols-3 gap-4">
                          <Input
                            value={ach.title}
                            onChange={(e) => updateAchievement(index, 'title', e.target.value)}
                            placeholder="Award Title"
                          />
                          <Input
                            value={ach.organization}
                            onChange={(e) => updateAchievement(index, 'organization', e.target.value)}
                            placeholder="Organization"
                          />
                          <Input
                            value={ach.date}
                            onChange={(e) => updateAchievement(index, 'date', e.target.value)}
                            placeholder="Date"
                          />
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => removeAchievement(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  )}
                  <Button variant="outline" onClick={addAchievement} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Achievement
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="skills" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Skills</CardTitle>
                  <CardDescription>Your technical and soft skills</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      placeholder="Add a skill (e.g., Python, Project Management)"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    />
                    <Button onClick={addSkill}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => removeSkill(skill)}
                      >
                        {skill} ×
                      </Badge>
                    ))}
                  </div>
                  {skills.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">
                      No skills added yet. Start typing above.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Preview & Actions */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Resume Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" onClick={saveResume} disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                Save Resume
              </Button>
              <Button variant="outline" className="w-full" onClick={downloadResume}>
                <Download className="h-4 w-4 mr-2" />
                Download (.txt)
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Preview</CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-2 max-h-96 overflow-y-auto">
              <div className="font-bold text-sm">{personalInfo.fullName || 'Your Name'}</div>
              <div className="text-muted-foreground">
                {personalInfo.phone} {personalInfo.nationality && `/ ${personalInfo.nationality}`}
              </div>
              <div className="text-muted-foreground">{personalInfo.email}</div>
              
              <Separator className="my-2" />
              
              <div className="font-semibold">EDUCATION</div>
              {education.map((edu, i) => (
                <div key={i}>
                  <div className="font-medium">{edu.school || 'School'}</div>
                  <div>{edu.degree} - {edu.major}</div>
                </div>
              ))}

              {experience.length > 0 && (
                <>
                  <Separator className="my-2" />
                  <div className="font-semibold">EXPERIENCE</div>
                  {experience.map((exp, i) => (
                    <div key={i}>
                      <div className="font-medium">{exp.company}</div>
                      <div>{exp.title}</div>
                    </div>
                  ))}
                </>
              )}

              {skills.length > 0 && (
                <>
                  <Separator className="my-2" />
                  <div className="font-semibold">SKILLS</div>
                  <div className="flex flex-wrap gap-1">
                    {skills.slice(0, 5).map(s => (
                      <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                    ))}
                    {skills.length > 5 && <span>+{skills.length - 5} more</span>}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
            <CardContent className="pt-6">
              <Sparkles className="h-8 w-8 text-primary mb-2" />
              <h4 className="font-semibold mb-1">AI-Powered</h4>
              <p className="text-xs text-muted-foreground">
                Use the "AI Generate" buttons to create professional bullet points based on your role.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
};

export default ResumeBuilder;
