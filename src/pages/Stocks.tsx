import React, { useState, useRef } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Upload, Sparkles, TrendingUp, Award, Code, Palette, Database } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const MySkills = () => {
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const { toast } = useToast();
  const cvInputRef = useRef<HTMLInputElement>(null);
  const portfolioInputRef = useRef<HTMLInputElement>(null);

  const handleCVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      toast({
        title: "CV Uploaded Successfully",
        description: `${file.name} is being analyzed by AI...`,
      });
    }
  };

  const handlePortfolioAnalyze = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      toast({
        title: "Portfolio Uploaded Successfully",
        description: `${file.name} is being analyzed by AI...`,
      });
    }
  };

  // Mock user skills with proficiency levels
  const userSkills = [
    { name: 'React', category: 'Frontend', level: 'Advanced', score: 92, icon: Code, color: 'text-blue-500' },
    { name: 'TypeScript', category: 'Frontend', level: 'Advanced', score: 88, icon: Code, color: 'text-blue-600' },
    { name: 'UI/UX Design', category: 'Design', level: 'Intermediate', score: 75, icon: Palette, color: 'text-pink-500' },
    { name: 'Node.js', category: 'Backend', level: 'Intermediate', score: 70, icon: Database, color: 'text-green-500' },
    { name: 'Python', category: 'Backend', level: 'Beginner', score: 55, icon: Database, color: 'text-yellow-500' },
    { name: 'Figma', category: 'Design', level: 'Advanced', score: 85, icon: Palette, color: 'text-purple-500' },
  ];

  // AI suggested skills to learn
  const suggestedSkills = [
    { name: 'Next.js', reason: 'Complements your React skills', demand: 'High' },
    { name: 'GraphQL', reason: 'Pairs with your Node.js knowledge', demand: 'Growing' },
    { name: 'Docker', reason: 'Essential for modern development', demand: 'High' },
    { name: 'AWS', reason: 'Top employer requirement', demand: 'Very High' },
  ];

  return (
    <PageLayout title="My Skills">
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
                Upload your CV or portfolio to get instant AI analysis of your skills, gaps, and personalized recommendations.
              </p>
              <div className="flex gap-3">
                <input
                  ref={cvInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
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
                <input
                  ref={portfolioInputRef}
                  type="file"
                  accept=".pdf,.zip,.url"
                  onChange={handlePortfolioAnalyze}
                  className="hidden"
                />
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => portfolioInputRef.current?.click()}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userSkills.map((skill) => {
                  const Icon = skill.icon;
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
                          <Icon className={`h-5 w-5 ${skill.color}`} />
                          <h3 className="font-semibold">{skill.name}</h3>
                        </div>
                        <Badge variant="secondary">{skill.level}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{skill.category}</p>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${skill.score}%` }}
                        />
                      </div>
                      <p className="text-xs text-right mt-1 text-muted-foreground">
                        {skill.score}/100
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Skill Gap Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Missing Skills Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Based on your career goals and current market demands, these skills would strengthen your profile:
              </p>
              <div className="space-y-3">
                {[
                  { skill: 'System Design', gap: 'High', color: 'text-red-500' },
                  { skill: 'Testing (Jest)', gap: 'Medium', color: 'text-yellow-500' },
                  { skill: 'CI/CD', gap: 'Medium', color: 'text-yellow-500' },
                  { skill: 'Accessibility', gap: 'Low', color: 'text-green-500' },
                ].map((item) => (
                  <div key={item.skill} className="flex items-center justify-between p-3 border rounded-md">
                    <span className="font-medium">{item.skill}</span>
                    <Badge variant="outline" className={item.color}>
                      {item.gap} Priority
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* SkillScore Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                SkillScore
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-5xl font-bold text-primary mb-2">1,847</div>
              <p className="text-sm text-muted-foreground mb-4">
                Top 15% in your network
              </p>
              <div className="space-y-2 text-left">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Technical Skills</span>
                  <span className="font-medium">620</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Peer Endorsements</span>
                  <span className="font-medium">427</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Projects Completed</span>
                  <span className="font-medium">800</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Suggested Skills */}
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
                      <Badge variant="secondary" className="text-xs">
                        {skill.demand}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{skill.reason}</p>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                View Learning Paths
              </Button>
            </CardContent>
          </Card>

          {/* Recent Badges */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Badges</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                {['🏆', '⚡', '🎯', '🔥', '💎', '⭐'].map((emoji, idx) => (
                  <div
                    key={idx}
                    className="aspect-square flex items-center justify-center text-3xl bg-muted rounded-lg"
                  >
                    {emoji}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
};

export default MySkills;
