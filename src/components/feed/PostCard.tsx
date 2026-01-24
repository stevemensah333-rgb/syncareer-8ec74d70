import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ThumbsUp, MessageCircle, Send, Award } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  author_name?: string;
}

interface SkillEndorsement {
  skill_name: string;
  count: number;
  endorsed_by_me: boolean;
}

interface PostCardProps {
  id: string;
  content: string;
  skill_tags: string[];
  created_at: string;
  author_name: string;
  user_id: string;
  currentUserId?: string;
}

export function PostCard({ id, content, skill_tags, created_at, author_name, user_id, currentUserId }: PostCardProps) {
  const [likes, setLikes] = useState<string[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingLikes, setLoadingLikes] = useState(true);
  const [skillEndorsements, setSkillEndorsements] = useState<Map<string, SkillEndorsement>>(new Map());
  const [endorsingSkill, setEndorsingSkill] = useState<string | null>(null);

  const isLiked = currentUserId ? likes.includes(currentUserId) : false;
  const isOwnPost = currentUserId === user_id;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  useEffect(() => {
    fetchLikes();
    fetchComments();
    if (skill_tags?.length > 0) {
      fetchSkillEndorsements();
    }

    // Subscribe to real-time likes updates
    const likesChannel = supabase
      .channel(`post-likes-${id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'post_likes',
          filter: `post_id=eq.${id}`,
        },
        () => {
          fetchLikes();
        }
      )
      .subscribe();

    // Subscribe to real-time comments updates
    const commentsChannel = supabase
      .channel(`post-comments-${id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'post_comments',
          filter: `post_id=eq.${id}`,
        },
        () => {
          fetchComments();
        }
      )
      .subscribe();

    // Subscribe to real-time endorsements updates for this user
    const endorsementsChannel = supabase
      .channel(`skill-endorsements-${user_id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'skill_endorsements',
          filter: `user_id=eq.${user_id}`,
        },
        () => {
          if (skill_tags?.length > 0) {
            fetchSkillEndorsements();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(likesChannel);
      supabase.removeChannel(commentsChannel);
      supabase.removeChannel(endorsementsChannel);
    };
  }, [id, user_id, skill_tags]);

  const fetchLikes = async () => {
    try {
      const { data, error } = await supabase
        .from('post_likes')
        .select('user_id')
        .eq('post_id', id);

      if (error) throw error;
      setLikes(data?.map(l => l.user_id) || []);
    } catch (error) {
      console.error('Error fetching likes:', error);
    } finally {
      setLoadingLikes(false);
    }
  };

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('post_comments')
        .select('*')
        .eq('post_id', id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        const userIds = [...new Set(data.map(c => c.user_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', userIds);

        const profileMap = new Map(profiles?.map(p => [p.id, p.full_name]) || []);

        const commentsWithAuthors = data.map(c => ({
          ...c,
          author_name: profileMap.get(c.user_id) || 'Anonymous',
        }));

        setComments(commentsWithAuthors);
      } else {
        setComments([]);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const fetchSkillEndorsements = async () => {
    if (!skill_tags?.length) return;

    try {
      // Get all endorsements for the post author's skills that match the post's skill tags
      const { data, error } = await supabase
        .from('skill_endorsements')
        .select('skill_name, endorser_id')
        .eq('user_id', user_id)
        .in('skill_name', skill_tags);

      if (error) throw error;

      const endorsementMap = new Map<string, SkillEndorsement>();
      
      // Initialize all skill tags
      skill_tags.forEach(tag => {
        endorsementMap.set(tag, {
          skill_name: tag,
          count: 0,
          endorsed_by_me: false,
        });
      });

      // Count endorsements
      data?.forEach(endorsement => {
        const existing = endorsementMap.get(endorsement.skill_name);
        if (existing) {
          existing.count++;
          if (endorsement.endorser_id === currentUserId) {
            existing.endorsed_by_me = true;
          }
        }
      });

      setSkillEndorsements(endorsementMap);
    } catch (error) {
      console.error('Error fetching skill endorsements:', error);
    }
  };

  const handleLike = async () => {
    if (!currentUserId) {
      toast.error('Please sign in to like posts');
      return;
    }

    try {
      if (isLiked) {
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', id)
          .eq('user_id', currentUserId);

        if (error) throw error;
        setLikes(prev => prev.filter(uid => uid !== currentUserId));
      } else {
        const { error } = await supabase
          .from('post_likes')
          .insert({ post_id: id, user_id: currentUserId });

        if (error) throw error;
        setLikes(prev => [...prev, currentUserId]);
      }
    } catch (error: any) {
      console.error('Error toggling like:', error);
      toast.error('Failed to update like');
    }
  };

  const handleEndorseSkill = async (skillName: string) => {
    if (!currentUserId) {
      toast.error('Please sign in to endorse skills');
      return;
    }

    if (isOwnPost) {
      toast.error("You can't endorse your own skills");
      return;
    }

    const endorsement = skillEndorsements.get(skillName);
    if (!endorsement) return;

    setEndorsingSkill(skillName);
    
    try {
      if (endorsement.endorsed_by_me) {
        // Remove endorsement
        const { error } = await supabase
          .from('skill_endorsements')
          .delete()
          .eq('user_id', user_id)
          .eq('endorser_id', currentUserId)
          .eq('skill_name', skillName);

        if (error) throw error;
        
        setSkillEndorsements(prev => {
          const newMap = new Map(prev);
          const existing = newMap.get(skillName);
          if (existing) {
            newMap.set(skillName, {
              ...existing,
              count: existing.count - 1,
              endorsed_by_me: false,
            });
          }
          return newMap;
        });
        
        toast.success(`Removed endorsement for ${skillName}`);
      } else {
        // Add endorsement
        const { error } = await supabase
          .from('skill_endorsements')
          .insert({
            user_id: user_id,
            endorser_id: currentUserId,
            skill_name: skillName,
          });

        if (error) throw error;
        
        setSkillEndorsements(prev => {
          const newMap = new Map(prev);
          const existing = newMap.get(skillName);
          if (existing) {
            newMap.set(skillName, {
              ...existing,
              count: existing.count + 1,
              endorsed_by_me: true,
            });
          }
          return newMap;
        });
        
        toast.success(`Endorsed ${author_name}'s ${skillName} skill!`);
      }
    } catch (error: any) {
      console.error('Error toggling endorsement:', error);
      toast.error('Failed to update endorsement');
    } finally {
      setEndorsingSkill(null);
    }
  };

  const handleSubmitComment = async () => {
    if (!currentUserId) {
      toast.error('Please sign in to comment');
      return;
    }

    const trimmedComment = newComment.trim();
    if (!trimmedComment) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('post_comments')
        .insert({
          post_id: id,
          user_id: currentUserId,
          content: trimmedComment,
        });

      if (error) throw error;

      setNewComment('');
      await fetchComments();
      toast.success('Comment added!');
    } catch (error: any) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback className="bg-primary/10 text-primary">
                {getInitials(author_name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{author_name}</h3>
              <p className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(created_at), { addSuffix: true })}
              </p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm whitespace-pre-wrap">{content}</p>
        
        {skill_tags && skill_tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {skill_tags.map((tag) => {
              const endorsement = skillEndorsements.get(tag);
              const isEndorsed = endorsement?.endorsed_by_me;
              const endorseCount = endorsement?.count || 0;
              const isEndorsing = endorsingSkill === tag;
              
              return (
                <Tooltip key={tag}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => handleEndorseSkill(tag)}
                      disabled={isOwnPost || isEndorsing}
                      className={`
                        inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full transition-all
                        ${isEndorsed 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-secondary text-secondary-foreground hover:bg-primary/20'
                        }
                        ${isOwnPost ? 'cursor-default' : 'cursor-pointer'}
                        ${isEndorsing ? 'opacity-50' : ''}
                      `}
                    >
                      <span>#{tag}</span>
                      {endorseCount > 0 && (
                        <span className="flex items-center gap-0.5">
                          <Award className="h-3 w-3" />
                          {endorseCount}
                        </span>
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isOwnPost 
                      ? "You can't endorse your own skills" 
                      : isEndorsed 
                        ? `Click to remove endorsement` 
                        : `Click to endorse ${author_name}'s ${tag} skill`
                    }
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        )}

        <div className="flex items-center gap-4 pt-2 border-t">
          <Button
            variant="ghost"
            size="sm"
            className={`gap-2 ${isLiked ? 'text-primary' : ''}`}
            onClick={handleLike}
            disabled={loadingLikes}
          >
            <ThumbsUp className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
            <span>{likes.length}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageCircle className="h-4 w-4" />
            <span>{comments.length}</span>
          </Button>
        </div>

        {showComments && (
          <div className="space-y-3 pt-3 border-t">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs bg-muted">
                    {getInitials(comment.author_name || 'A')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 bg-muted rounded-lg p-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{comment.author_name}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm">{comment.content}</p>
                </div>
              </div>
            ))}

            <div className="flex gap-2">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="resize-none min-h-[60px]"
                rows={2}
              />
              <Button
                size="icon"
                onClick={handleSubmitComment}
                disabled={isSubmitting || !newComment.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
