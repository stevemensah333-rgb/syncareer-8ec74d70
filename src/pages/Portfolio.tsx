import React, { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, Star, MessageSquare, ThumbsUp, ExternalLink } from 'lucide-react';
import { UploadProjectDialog } from '@/components/portfolio/UploadProjectDialog';
import { toast } from 'sonner';

const Portfolio = () => {
  const [selectedProject, setSelectedProject] = useState<number | null>(null);

  // User's portfolio projects
  const projects = [
    {
      id: 1,
      title: 'E-Commerce Platform',
      description: 'Full-stack shopping platform with payment integration',
      tags: ['React', 'Node.js', 'MongoDB'],
      rating: 4.8,
      endorsements: 24,
      comments: 8,
      image: '🛒',
      verified: true,
    },
    {
      id: 2,
      title: 'Weather Dashboard',
      description: 'Real-time weather app with beautiful UI',
      tags: ['React', 'API Integration', 'CSS'],
      rating: 4.6,
      endorsements: 18,
      comments: 5,
      image: '🌤️',
      verified: true,
    },
    {
      id: 3,
      title: 'Task Manager App',
      description: 'Productivity app with team collaboration features',
      tags: ['TypeScript', 'Firebase', 'React'],
      rating: 4.9,
      endorsements: 31,
      comments: 12,
      image: '✅',
      verified: true,
    },
    {
      id: 4,
      title: 'Portfolio Website',
      description: 'Personal portfolio with animations and dark mode',
      tags: ['Next.js', 'Tailwind', 'Framer Motion'],
      rating: 4.7,
      endorsements: 22,
      comments: 7,
      image: '💼',
      verified: false,
    },
  ];

  // Peer reviews
  const reviews = [
    {
      reviewer: 'Sarah Johnson',
      project: 'E-Commerce Platform',
      rating: 5,
      comment: 'Excellent work! Clean code and great UX.',
      date: '2 days ago',
    },
    {
      reviewer: 'Mike Chen',
      project: 'Task Manager App',
      rating: 5,
      comment: 'Impressive feature set and performance.',
      date: '1 week ago',
    },
    {
      reviewer: 'Emma Wilson',
      project: 'Weather Dashboard',
      rating: 4,
      comment: 'Nice design! Could improve mobile responsiveness.',
      date: '2 weeks ago',
    },
  ];

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
                    Upload projects to get peer ratings and boost your SkillScore
                  </p>
                </div>
                <UploadProjectDialog />
              </div>
            </CardContent>
          </Card>

          {/* Projects Grid */}
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
                    <div className="text-5xl mb-3">{project.image}</div>
                    {project.verified && (
                      <Badge className="bg-primary">
                        ✓ AI Verified
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg">{project.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {project.description}
                  </p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                        {project.rating}
                      </span>
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="h-4 w-4" />
                        {project.endorsements}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        {project.comments}
                      </span>
                    </div>
                    <Button size="sm" variant="outline">
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Recent Reviews */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Peer Reviews</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {reviews.map((review, idx) => (
                <div key={idx} className="border-b last:border-0 pb-4 last:pb-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold">{review.reviewer}</p>
                      <p className="text-sm text-muted-foreground">
                        reviewed {review.project}
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
                  <p className="text-sm mb-1">{review.comment}</p>
                  <p className="text-xs text-muted-foreground">{review.date}</p>
                </div>
              ))}
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
                <span className="font-bold">{projects.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Avg Rating</span>
                <span className="font-bold">4.75 ⭐</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Endorsements</span>
                <span className="font-bold">95</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Profile Views</span>
                <span className="font-bold">342</span>
              </div>
            </CardContent>
          </Card>

          {/* Skill Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Skills in Portfolio</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { skill: 'React', projects: 3 },
                { skill: 'TypeScript', projects: 2 },
                { skill: 'Node.js', projects: 2 },
                { skill: 'CSS/Design', projects: 3 },
              ].map((item) => (
                <div key={item.skill} className="flex justify-between items-center">
                  <span className="text-sm">{item.skill}</span>
                  <Badge variant="secondary">{item.projects} projects</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Badges Earned */}
          <Card>
            <CardHeader>
              <CardTitle>Badges Earned</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                {['🏆', '⭐', '🔥', '💎', '🎯', '⚡'].map((badge, idx) => (
                  <div
                    key={idx}
                    className="aspect-square flex items-center justify-center text-3xl bg-muted rounded-lg"
                  >
                    {badge}
                  </div>
                ))}
              </div>
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
