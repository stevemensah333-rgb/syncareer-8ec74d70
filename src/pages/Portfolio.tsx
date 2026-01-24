import React, { useState, useEffect } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Star, MessageSquare, ThumbsUp, ExternalLink, Trash2 } from 'lucide-react';
import { UploadProjectDialog } from '@/components/portfolio/UploadProjectDialog';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';

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

interface Review {
  id: string;
  project_id: string;
  reviewer_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  project_title?: string;
  reviewer_name?: string;
}

const Portfolio = () => {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setCurrentUserId(session.user.id);
      }

      // Fetch user's projects
      const { data: projectsData, error: projectsError } = await supabase
        .from('portfolio_projects')
        .select('*')
        .eq('user_id', session?.user?.id || '')
        .order('created_at', { ascending: false });

      if (projectsError) throw projectsError;
      setProjects(projectsData || []);

      // Fetch reviews for user's projects
      if (projectsData && projectsData.length > 0) {
        const projectIds = projectsData.map(p => p.id);
        const { data: reviewsData, error: reviewsError } = await supabase
          .from('portfolio_reviews')
          .select('*')
          .in('project_id', projectIds)
          .order('created_at', { ascending: false });

        if (reviewsError) throw reviewsError;
        
        // Map reviews with project titles
        const reviewsWithTitles = (reviewsData || []).map(review => ({
          ...review,
          project_title: projectsData.find(p => p.id === review.project_id)?.title || 'Unknown Project',
          reviewer_name: 'Anonymous Reviewer', // In production, fetch from profiles
        }));
        
        setReviews(reviewsWithTitles);
      }
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

  // Calculate stats
  const totalProjects = projects.length;
  const totalEndorsements = reviews.length; // Each review counts as an endorsement
  const avgRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  // Calculate skills from projects
  const skillCounts: Record<string, number> = {};
  projects.forEach(project => {
    project.tags.forEach(tag => {
      skillCounts[tag] = (skillCounts[tag] || 0) + 1;
    });
  });
  const topSkills = Object.entries(skillCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  // Get emoji for project based on tags
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
        {/* Main Portfolio Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upload Section */}
          <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Upload className="h-12 w-12 text-primary" />
                <div className="flex-1">
                  <h3 className="text-xl font-bold">Showcase Your Work</h3>
                  <p className="text-muted-foreground">
                    Upload projects to get peer ratings and build your portfolio
                  </p>
                </div>
                <UploadProjectDialog onProjectUploaded={fetchData} />
              </div>
            </CardContent>
          </Card>

          {/* Projects Grid */}
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
              {projects.map((project) => {
                const projectReviews = reviews.filter(r => r.project_id === project.id);
                const projectRating = projectReviews.length > 0
                  ? (projectReviews.reduce((sum, r) => sum + r.rating, 0) / projectReviews.length).toFixed(1)
                  : null;

                return (
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
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-3">
                          {projectRating && (
                            <span className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                              {projectRating}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <ThumbsUp className="h-4 w-4" />
                            {projectReviews.length}
                          </span>
                        </div>
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
                );
              })}
            </div>
          )}

          {/* Recent Reviews */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Peer Reviews</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {reviews.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No reviews yet. Share your portfolio to get feedback!
                </p>
              ) : (
                reviews.slice(0, 5).map((review) => (
                  <div key={review.id} className="border-b last:border-0 pb-4 last:pb-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold">{review.reviewer_name}</p>
                        <p className="text-sm text-muted-foreground">
                          reviewed {review.project_title}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: review.rating }).map((_, i) => (
                          <Star
                            key={i}
                            className="h-4 w-4 fill-yellow-500 text-yellow-500"
                          />
                        ))}
                      </div>
                    </div>
                    {review.comment && <p className="text-sm mb-1">{review.comment}</p>}
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Portfolio Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Projects</span>
                <span className="font-bold">{totalProjects}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Avg Rating</span>
                <span className="font-bold">{avgRating} ⭐</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Reviews</span>
                <span className="font-bold">{totalEndorsements}</span>
              </div>
            </CardContent>
          </Card>

          {/* Skill Breakdown */}
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

          {/* Call to Action */}
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