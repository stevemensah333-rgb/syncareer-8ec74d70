import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ThumbsUp, MessageCircle, Star } from 'lucide-react';

interface SkillPostProps {
  user: string;
  avatar: string;
  skill: string;
  tags: string[];
  rating: number;
  description: string;
  endorsements: number;
  comments: number;
}

export function SkillPost({ user, avatar, skill, tags, rating, description, endorsements, comments }: SkillPostProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback className="bg-primary/10 text-primary">{avatar}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{user}</h3>
              <p className="text-sm text-muted-foreground">showcased a new skill</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-warning text-warning" />
            <span className="font-semibold">{rating}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <h4 className="font-semibold text-lg mb-2">{skill}</h4>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              #{tag}
            </Badge>
          ))}
        </div>
        <div className="flex items-center gap-4 pt-2 border-t">
          <Button variant="ghost" size="sm" className="gap-2">
            <ThumbsUp className="h-4 w-4" />
            <span>{endorsements}</span>
          </Button>
          <Button variant="ghost" size="sm" className="gap-2">
            <MessageCircle className="h-4 w-4" />
            <span>{comments}</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
