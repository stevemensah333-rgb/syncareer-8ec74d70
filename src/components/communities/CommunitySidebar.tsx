import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Pin, PinOff, Plus, Compass, Users, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useCommunities } from '@/hooks/useCommunities';

export function CommunitySidebar() {
  const { userCommunities, loading, togglePinCommunity } = useCommunities();
  const navigate = useNavigate();
  const location = useLocation();
  const isOnMainCommunities = location.pathname === '/communities';

  if (loading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-6 w-32" />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    );
  }

  const pinnedCommunities = userCommunities.filter(c => c.is_pinned);
  const otherCommunities = userCommunities.filter(c => !c.is_pinned);

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <Users className="h-5 w-5" />
            My Communities
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/communities/create')}
            title="Create community"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-1">
          <button
            onClick={() => navigate('/portfolio')}
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors w-full text-left mb-2"
          >
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Home className="h-4 w-4 text-primary" />
            </div>
            <span className="font-medium">Home</span>
          </button>
          
          <Link
            to="/communities"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors ${isOnMainCommunities ? 'bg-accent' : ''}`}
          >
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="h-4 w-4 text-primary" />
            </div>
            <span className="font-medium">All Posts</span>
          </Link>

          {pinnedCommunities.length > 0 && (
            <>
              <p className="text-xs text-muted-foreground px-3 pt-4 pb-2 uppercase tracking-wider">
                Pinned
              </p>
              {pinnedCommunities.map((community) => (
                <CommunityItem
                  key={community.id}
                  community={community}
                  onTogglePin={() => togglePinCommunity(community.id, community.is_pinned)}
                />
              ))}
            </>
          )}

          {otherCommunities.length > 0 && (
            <>
              <p className="text-xs text-muted-foreground px-3 pt-4 pb-2 uppercase tracking-wider">
                My Subscriptions
              </p>
              {otherCommunities.map((community) => (
                <CommunityItem
                  key={community.id}
                  community={community}
                  onTogglePin={() => togglePinCommunity(community.id, community.is_pinned)}
                />
              ))}
            </>
          )}

          {userCommunities.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">You haven't joined any communities yet.</p>
              <Button
                variant="link"
                size="sm"
                onClick={() => navigate('/communities/explore')}
              >
                Explore communities
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        <Button
          variant="outline"
          className="w-full justify-start gap-2"
          onClick={() => navigate('/communities/explore')}
        >
          <Compass className="h-4 w-4" />
          Explore Communities...
        </Button>
      </div>
    </div>
  );
}

function CommunityItem({
  community,
  onTogglePin,
}: {
  community: { id: string; name: string; icon_url: string | null; is_pinned: boolean; role: string; slug: string };
  onTogglePin: () => void;
}) {
  const [showPin, setShowPin] = useState(false);

  return (
    <div
      className="group flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-accent transition-colors"
      onMouseEnter={() => setShowPin(true)}
      onMouseLeave={() => setShowPin(false)}
    >
      <Link
        to={`/communities/${community.slug}`}
        className="flex items-center gap-3 flex-1 min-w-0"
      >
        <Avatar className="h-8 w-8">
          <AvatarImage src={community.icon_url || undefined} />
          <AvatarFallback className="text-xs bg-primary/10 text-primary">
            {community.name.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <span className="font-medium truncate">{community.name}</span>
        {community.role !== 'member' && (
          <span className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary capitalize">
            {community.role === 'admin' ? 'Admin' : 'Mod'}
          </span>
        )}
      </Link>
      {showPin && (
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.preventDefault();
            onTogglePin();
          }}
          title={community.is_pinned ? 'Unpin' : 'Pin'}
        >
          {community.is_pinned ? (
            <PinOff className="h-3 w-3" />
          ) : (
            <Pin className="h-3 w-3" />
          )}
        </Button>
      )}
    </div>
  );
}
