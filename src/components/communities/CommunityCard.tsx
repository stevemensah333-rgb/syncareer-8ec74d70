import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Community } from '@/types/community';

interface CommunityCardProps {
  community: Community & { member_count?: number };
  isJoined?: boolean;
  onJoin?: (communityId: string) => Promise<boolean>;
  onLeave?: (communityId: string) => Promise<boolean>;
}

export function CommunityCard({ 
  community, 
  isJoined = false,
  onJoin,
  onLeave 
}: CommunityCardProps) {
  const [loading, setLoading] = useState(false);
  const [joined, setJoined] = useState(isJoined);

  const handleToggleMembership = async () => {
    setLoading(true);
    try {
      if (joined) {
        const success = await onLeave?.(community.id);
        if (success) setJoined(false);
      } else {
        const success = await onJoin?.(community.id);
        if (success) setJoined(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="hover:border-primary/20 transition-colors overflow-hidden">
      {/* Banner */}
      <div 
        className="h-20 bg-gradient-to-r from-primary/20 to-primary/5"
        style={community.banner_url ? { 
          backgroundImage: `url(${community.banner_url})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        } : undefined}
      />
      
      <CardContent className="p-4 -mt-8">
        <div className="flex items-start gap-3">
          <Avatar className="h-14 w-14 border-4 border-background">
            <AvatarImage src={community.icon_url || undefined} />
            <AvatarFallback className="text-lg bg-primary text-primary-foreground">
              {community.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0 pt-8">
            <Link 
              to={`/communities/${community.slug}`}
              className="font-semibold text-lg hover:text-primary transition-colors block truncate"
            >
              {community.name}
            </Link>
            
            <Badge variant="secondary" className="text-xs mt-1">
              {community.category}
            </Badge>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
          {community.description || 'No description available'}
        </p>

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{community.member_count || 0} members</span>
          </div>

          <Button
            variant={joined ? "secondary" : "default"}
            size="sm"
            onClick={handleToggleMembership}
            disabled={loading}
          >
            {joined ? (
              <>
                <Check className="h-4 w-4 mr-1" />
                Joined
              </>
            ) : (
              'Join'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
