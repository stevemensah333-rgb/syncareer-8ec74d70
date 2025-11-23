import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, Clock, Users } from 'lucide-react';

interface ChallengeCardProps {
  title: string;
  description: string;
  deadline: string;
  participants: number;
  reward: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

export function ChallengeCard({ title, description, deadline, participants, reward, difficulty }: ChallengeCardProps) {
  const difficultyColors = {
    Beginner: 'bg-success/10 text-success',
    Intermediate: 'bg-warning/10 text-warning',
    Advanced: 'bg-danger/10 text-danger',
  };

  return (
    <Card className="hover:shadow-md transition-shadow border-l-4 border-l-primary">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
          <Badge className={difficultyColors[difficulty]}>
            {difficulty}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{description}</p>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{deadline}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{participants} joined</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-sm font-medium text-primary">Reward: {reward}</span>
          <Button size="sm">Join Challenge</Button>
        </div>
      </CardContent>
    </Card>
  );
}
