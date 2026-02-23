import React, { useState, useEffect } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, ExternalLink, Trash2, Linkedin, Save } from 'lucide-react';
import { UploadProjectDialog } from '@/components/portfolio/UploadProjectDialog';
import ProfileSummaryCard from '@/components/portfolio/ProfileSummaryCard';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Project {
  id: string;
  title: string;
  description: string;
  project_url: string | null;
  github_url: string | null;
  tags: string[];
  is_verified: boolean;
  created_at: string;
  user_id: string;
}

const Portfolio = () => {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [savingLinkedin, setSavingLinkedin] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setLoading(false);
        return;
      }
      
      setCurrentUserId(session.user.id);

      const { data: profileData } = await supabase
        .from('profiles')
        .select('linkedin_url')
        .eq('id', session.user.id)
        .maybeSingle();
      
      if (profileData?.linkedin_url) {
        setLinkedinUrl(profileData.linkedin_url);
      }

      const { data: projectsData, error: projectsError } = await supabase
        .from('portfolio_projects')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (projectsError) throw projectsError;
      setProjects(projectsData || []);
    } catch (error) {
      console.error('Error fetching portfolio data:', error);
      toast.error('Failed to load portfolio');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      const { error } = await supabase
        .from('portfolio_projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;
      setProjects(projects.filter(p => p.id !== projectId));
      toast.success('Project deleted');
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project');
    }
  };

  const saveLinkedinUrl = async () => {
    if (!currentUserId) return;
    setSavingLinkedin(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ linkedin_url: linkedinUrl || null })
        .eq('id', currentUserId);

      if (error) throw error;
      toast.success('LinkedIn profile updated!');
    } catch (error) {
      console.error('Error saving LinkedIn URL:', error);
      toast.error('Failed to save LinkedIn URL');
    } finally {
      setSavingLinkedin(false);
    }
  };

  const totalProjects = projects.length;

  const skillCounts: Record<string, number> = {};
  projects.forEach(project => {
    project.tags.forEach(tag => {
      skillCounts[tag] = (skillCounts[tag] || 0) + 1;
    });
  });
  const topSkills = Object.entries(skillCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  const getProjectEmoji = (tags: string[]) => {
    const tagLower = tags[0]?.toLowerCase() || '';
    if (tagLower.includes('react') || tagLower.includes('vue')) return '⚛️';
    if (tagLower.includes('node') || tagLower.includes('backend')) return '🖥️';
    if (tagLower.includes('mobile') || tagLower.includes('flutter')) return '📱';
    if (tagLower.includes('data') || tagLower.includes('python')) return '📊';
    if (tagLower.includes('design') || tagLower.includes('ui')) return '🎨';
    if (tagLower.includes('game')) return '🎮';
    return '💼';
  };

  if (loading) {
    return (
      <PageLayout title="Portfolio">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Portfolio">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Upload className="h-12 w-12 text-primary" />
                <div className="flex-1">
                  <h3 className="text-xl font-bold">Showcase Your Work</h3>
                  <p className="text-muted-foreground">
                    Upload projects to build your portfolio
                  </p>
                </div>
                <UploadProjectDialog onProjectUploaded={fetchData} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Linkedin className="h-10 w-10 text-[#0A66C2]" />
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">LinkedIn Profile</h3>
                  <div className="flex gap-2">
                    <Input
                      type="url"
                      placeholder="https://linkedin.com/in/your-profile"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      className="flex-1"
                    />
                    <Button onClick={saveLinkedinUrl} disabled={savingLinkedin} size="sm">
                      <Save className="h-4 w-4 mr-1" />
                      Save
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {projects.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">No projects yet</h3>
                <p className="text-muted-foreground mb-4">
                  Upload your first project to start building your portfolio
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {projects.map((project) => (
                <Card
                  key={project.id}
                  className={`cursor-pointer transition-all hover:border-primary/50 ${
                    selectedProject === project.id ? 'border-primary' : ''
                  }`}
                  onClick={() => setSelectedProject(project.id)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="text-5xl mb-3">{getProjectEmoji(project.tags)}</div>
                      <div className="flex items-center gap-2">
                        {project.is_verified && (
                          <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">
                            ✓ AI Verified
                          </span>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteProject(project.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <CardTitle className="text-lg">{project.title}</CardTitle>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {project.description}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {project.tags.map((tag) => (
                        <span key={tag} className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-end text-sm">
                      {(project.project_url || project.github_url) && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(project.project_url || project.github_url || '', '_blank');
                          }}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <ProfileSummaryCard />
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Projects</span>
                <span className="font-bold">{totalProjects}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Skills in Portfolio</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {topSkills.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  Add projects to see skill breakdown
                </p>
              ) : (
                topSkills.map(([skill, count]) => (
                  <div key={skill} className="flex justify-between items-center">
                    <span className="text-sm">{skill}</span>
                    <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full">
                      {count} project{count > 1 ? 's' : ''}
                    </span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="bg-primary text-primary-foreground">
            <CardContent className="pt-6 text-center">
              <h3 className="font-bold mb-2">Share Your Portfolio</h3>
              <p className="text-sm mb-4 opacity-90">
                Let employers see your amazing work!
              </p>
              <Button 
                variant="secondary"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success('Portfolio link copied to clipboard!');
                }}
              >
                Copy Link
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
};

export default Portfolio;