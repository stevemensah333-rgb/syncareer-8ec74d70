import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { 
  ArrowBigUp, 
  ArrowBigDown, 
  MessageSquare, 
  Share2, 
  MoreHorizontal,
  Trash2,
  Pin
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CommunityPost } from '@/types/community';
import { cn } from '@/lib/utils';
import { UserProfileLink } from './UserProfileLink';

interface CommunityPostCardProps {
  post: CommunityPost;
  onVote: (postId: string, voteType: 'up' | 'down') => void;
  onDelete?: (postId: string) => void;
  showCommunity?: boolean;
}

export function CommunityPostCard({ 
  post, 
  onVote, 
  onDelete,
  showCommunity = true 
}: CommunityPostCardProps) {
  const score = post.upvotes - post.downvotes;

  const canModerate = post.user_role === 'admin' || post.user_role === 'moderator';

  const handleShare = async () => {
    const url = window.location.origin + `/communities/post/${post.id}`;
    try {
      await navigator.clipboard.writeText(url);
      // Show feedback via toast
      const { toast } = await import('sonner');
      toast.success('Link copied to clipboard!');
    } catch (e) {
      console.error('Failed to copy link');
      const { toast } = await import('sonner');
      toast.error('Failed to copy link');
    }
  };

  return (
    <Card className="hover:border-primary/20 transition-colors">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
          <Avatar className="h-6 w-6">
            <AvatarImage src={post.author?.avatar_url || undefined} />
            <AvatarFallback className="text-xs">
              {post.author?.username?.substring(0, 2).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <UserProfileLink 
            userId={post.author_id}
            displayName={post.author?.username || post.author?.full_name || 'Anonymous'}
            className="font-medium text-foreground hover:underline"
          />
          
          {post.user_role && post.user_role !== 'member' && (
            <Badge variant="secondary" className="text-xs capitalize">
              {post.user_role === 'admin' ? 'Admin' : 'MOD'}
            </Badge>
          )}

          {showCommunity && post.community && (
            <>
              <span>in</span>
              <Link 
                to={`/communities/${post.community.slug}`}
                className="text-primary hover:underline"
              >
                {post.community.name}
              </Link>
            </>
          )}

          <span>•</span>
          <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>

          {post.is_pinned && (
            <Badge variant="outline" className="text-xs gap-1">
              <Pin className="h-3 w-3" />
              Pinned
            </Badge>
          )}
        </div>

        {/* Content */}
        <div className="flex gap-4">
          {post.cover_image_url && (
            <Link to={`/communities/post/${post.id}`} className="flex-shrink-0">
              <img 
                src={post.cover_image_url} 
                alt=""
                className="w-32 h-24 object-cover rounded-lg"
              />
            </Link>
          )}
          
          <div className="flex-1 min-w-0">
            <Link to={`/communities/post/${post.id}`}>
              <h3 className="font-semibold text-lg hover:text-primary transition-colors line-clamp-2">
                {post.title}
              </h3>
            </Link>
            <p className="text-muted-foreground text-sm mt-1 line-clamp-2">
              {post.content.length > 200 
                ? post.content.substring(0, 200) + '...' 
                : post.content}
            </p>

            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {post.tags.slice(0, 5).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 mt-4">
          {/* Vote buttons */}
          <div className="flex items-center bg-muted rounded-full">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "rounded-l-full px-3",
                post.user_vote === 'up' && "text-primary"
              )}
              onClick={() => onVote(post.id, 'up')}
            >
              <ArrowBigUp className={cn("h-5 w-5", post.user_vote === 'up' && "fill-current")} />
            </Button>
            <span className="font-medium text-sm min-w-[2rem] text-center">{score}</span>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "rounded-r-full px-3",
                post.user_vote === 'down' && "text-destructive"
              )}
              onClick={() => onVote(post.id, 'down')}
            >
              <ArrowBigDown className={cn("h-5 w-5", post.user_vote === 'down' && "fill-current")} />
            </Button>
          </div>

          {/* Comments */}
          <Link to={`/communities/post/${post.id}`}>
            <Button variant="ghost" size="sm" className="gap-1">
              <MessageSquare className="h-4 w-4" />
              <span>{post.comment_count}</span>
            </Button>
          </Link>

          {/* Share */}
          <Button variant="ghost" size="sm" onClick={handleShare}>
            <Share2 className="h-4 w-4" />
          </Button>

          {/* More options */}
          {(canModerate || onDelete) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onDelete && (
                  <DropdownMenuItem 
                    className="text-destructive"
                    onClick={() => onDelete(post.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Post
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
