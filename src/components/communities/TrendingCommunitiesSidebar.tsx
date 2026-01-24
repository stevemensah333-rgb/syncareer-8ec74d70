import { Link } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useCommunities } from '@/hooks/useCommunities';

export function TrendingCommunitiesSidebar() {
  const { trendingCommunities, loading } = useCommunities();

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-6 w-40" />
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-5 w-32" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-4">
      <h3 className="font-semibold text-muted-foreground flex items-center gap-2 mb-4">
        <TrendingUp className="h-4 w-4" />
        Trending Communities
      </h3>
      <div className="space-y-2">
        {trendingCommunities.slice(0, 12).map((community) => (
          <Link
            key={community.id}
            to={`/communities/${community.slug}`}
            className="flex items-center gap-2 py-1.5 hover:text-primary transition-colors group"
          >
            <Avatar className="h-6 w-6">
              <AvatarImage src={community.icon_url || undefined} />
              <AvatarFallback className="text-[10px] bg-muted">
                {community.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm truncate group-hover:underline">{community.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
