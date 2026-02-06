import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Shield, Flag, Users, Settings, AlertTriangle, 
  Check, X, Ban, UserMinus, Crown, ChevronDown, Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose,
} from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { CommunityErrorBoundary } from '@/components/communities/CommunityErrorBoundary';
import { useCommunityModeration, ContentReport, CommunityMemberWithProfile } from '@/hooks/useCommunityModeration';
import { supabase } from '@/integrations/supabase/client';
import { Community } from '@/types/community';
import { toast } from 'sonner';

export default function CommunityModeration() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [community, setCommunity] = useState<Community | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!slug) return;
      try {
        const { data: comm, error } = await supabase
          .from('communities')
          .select('*')
          .eq('slug', slug)
          .single();
        if (error) throw error;
        setCommunity(comm);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/');
          return;
        }

        const { data: membership } = await supabase
          .from('community_members')
          .select('role')
          .eq('community_id', comm.id)
          .eq('user_id', user.id)
          .maybeSingle();

        if (!membership || !['admin', 'moderator'].includes(membership.role)) {
          toast.error('You do not have permission to access moderation');
          navigate(`/communities/${slug}`);
          return;
        }
        setIsAuthorized(true);
      } catch {
        toast.error('Community not found');
        navigate('/communities');
      } finally {
        setPageLoading(false);
      }
    };
    load();
  }, [slug, navigate]);

  const {
    reports, bans, members, loading,
    resolveReport, banUser, unbanUser, updateMemberRole, removePost, updateCommunity,
  } = useCommunityModeration(community?.id);

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-background p-6" aria-busy="true">
        <Skeleton className="h-8 w-64 mb-6" />
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (!community || !isAuthorized) return null;

  const pendingReports = reports.filter(r => r.status === 'pending');
  const resolvedReports = reports.filter(r => r.status !== 'pending');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3 mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/communities/${slug}`)}
              aria-label="Back to community"
            >
              <ArrowLeft className="h-4 w-4 mr-2" aria-hidden="true" />
              Back
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-primary" aria-hidden="true" />
            <div>
              <h1 className="text-xl font-bold">Moderation Dashboard</h1>
              <p className="text-sm text-muted-foreground">{community.name}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="max-w-5xl mx-auto px-6 py-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-destructive">{pendingReports.length}</div>
              <p className="text-xs text-muted-foreground">Pending Reports</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{resolvedReports.length}</div>
              <p className="text-xs text-muted-foreground">Resolved</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-warning">{bans.length}</div>
              <p className="text-xs text-muted-foreground">Active Bans</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{members.length}</div>
              <p className="text-xs text-muted-foreground">Members</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 pb-12">
        <Tabs defaultValue="reports" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="reports" className="gap-2">
              <Flag className="h-4 w-4" aria-hidden="true" />
              Reports
              {pendingReports.length > 0 && (
                <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {pendingReports.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="members" className="gap-2">
              <Users className="h-4 w-4" aria-hidden="true" />
              Members
            </TabsTrigger>
            <TabsTrigger value="bans" className="gap-2">
              <Ban className="h-4 w-4" aria-hidden="true" />
              Bans
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="h-4 w-4" aria-hidden="true" />
              Settings
            </TabsTrigger>
          </TabsList>

          <CommunityErrorBoundary fallbackTitle="Failed to load tab content">
            <TabsContent value="reports">
              <ReportsTab
                pendingReports={pendingReports}
                resolvedReports={resolvedReports}
                loading={loading}
                onResolve={resolveReport}
                onRemovePost={removePost}
                onBanUser={banUser}
              />
            </TabsContent>

            <TabsContent value="members">
              <MembersTab
                members={members}
                loading={loading}
                onUpdateRole={updateMemberRole}
                onBanUser={banUser}
                communityCreator={community.created_by}
              />
            </TabsContent>

            <TabsContent value="bans">
              <BansTab bans={bans} loading={loading} onUnban={unbanUser} />
            </TabsContent>

            <TabsContent value="settings">
              <SettingsTab community={community} onSave={updateCommunity} />
            </TabsContent>
          </CommunityErrorBoundary>
        </Tabs>
      </div>
    </div>
  );
}

// ─── Reports Tab ────────────────────────────────────────────────────────────

function ReportsTab({
  pendingReports,
  resolvedReports,
  loading,
  onResolve,
  onRemovePost,
  onBanUser,
}: {
  pendingReports: ContentReport[];
  resolvedReports: ContentReport[];
  loading: boolean;
  onResolve: (id: string, status: 'resolved' | 'dismissed', note: string) => Promise<void>;
  onRemovePost: (postId: string) => Promise<void>;
  onBanUser: (userId: string, reason: string) => Promise<void>;
}) {
  if (loading) {
    return <div className="space-y-4">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}</div>;
  }

  if (pendingReports.length === 0 && resolvedReports.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" aria-hidden="true" />
          <h3 className="text-lg font-medium mb-2">No reports</h3>
          <p className="text-muted-foreground">Your community is clean! No content has been reported.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {pendingReports.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Pending Review ({pendingReports.length})
          </h3>
          <div className="space-y-3">
            {pendingReports.map(report => (
              <ReportCard
                key={report.id}
                report={report}
                onResolve={onResolve}
                onRemovePost={onRemovePost}
                onBanUser={onBanUser}
              />
            ))}
          </div>
        </div>
      )}

      {resolvedReports.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Resolved ({resolvedReports.length})
          </h3>
          <div className="space-y-3">
            {resolvedReports.map(report => (
              <ReportCard key={report.id} report={report} resolved />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ReportCard({
  report,
  resolved,
  onResolve,
  onRemovePost,
  onBanUser,
}: {
  report: ContentReport;
  resolved?: boolean;
  onResolve?: (id: string, status: 'resolved' | 'dismissed', note: string) => Promise<void>;
  onRemovePost?: (postId: string) => Promise<void>;
  onBanUser?: (userId: string, reason: string) => Promise<void>;
}) {
  const [note, setNote] = useState('');
  const [acting, setActing] = useState(false);

  const handleAction = async (action: 'resolved' | 'dismissed') => {
    if (!onResolve) return;
    setActing(true);
    await onResolve(report.id, action, note);
    setActing(false);
  };

  const reasonLabels: Record<string, string> = {
    spam: 'Spam',
    harassment: 'Harassment',
    misinformation: 'Misinformation',
    inappropriate: 'Inappropriate Content',
    other: 'Other',
  };

  return (
    <Card className={resolved ? 'opacity-60' : ''} role="article">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <Badge variant={report.status === 'pending' ? 'destructive' : 'secondary'} className="text-xs">
                {report.status === 'pending' ? (
                  <><AlertTriangle className="h-3 w-3 mr-1" aria-hidden="true" />Pending</>
                ) : report.status === 'resolved' ? (
                  <><Check className="h-3 w-3 mr-1" aria-hidden="true" />Resolved</>
                ) : (
                  <><X className="h-3 w-3 mr-1" aria-hidden="true" />Dismissed</>
                )}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {reasonLabels[report.reason] || report.reason}
              </Badge>
            </div>

            <p className="font-medium text-sm">
              Post: <span className="text-primary">{report.post?.title || 'Unknown post'}</span>
            </p>

            {report.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{report.description}</p>
            )}

            <p className="text-xs text-muted-foreground mt-2">
              Reported by {report.reporter?.full_name || report.reporter?.username || 'Anonymous'} · {new Date(report.created_at).toLocaleDateString()}
            </p>

            {report.resolution_note && (
              <p className="text-xs text-muted-foreground mt-1 italic">
                Resolution: {report.resolution_note}
              </p>
            )}
          </div>

          {!resolved && onResolve && (
            <div className="flex flex-col gap-2 shrink-0">
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="gap-1">
                    <Check className="h-3 w-3" aria-hidden="true" />
                    Review
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Review Report</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium mb-1">Reason: {reasonLabels[report.reason] || report.reason}</p>
                      {report.description && (
                        <p className="text-sm text-muted-foreground">{report.description}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="resolution-note" className="text-sm font-medium">Resolution Note</label>
                      <Textarea
                        id="resolution-note"
                        placeholder="Add a note about your decision..."
                        value={note}
                        onChange={e => setNote(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button
                      variant="outline"
                      disabled={acting}
                      onClick={() => handleAction('dismissed')}
                      className="gap-1"
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                      Dismiss
                    </Button>
                    {onRemovePost && (
                      <Button
                        variant="destructive"
                        disabled={acting}
                        onClick={async () => {
                          setActing(true);
                          await onRemovePost(report.content_id);
                          await handleAction('resolved');
                        }}
                        className="gap-1"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                        Remove Post
                      </Button>
                    )}
                    <Button
                      disabled={acting}
                      onClick={() => handleAction('resolved')}
                      className="gap-1"
                    >
                      <Check className="h-4 w-4" aria-hidden="true" />
                      Resolve
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {onBanUser && report.post?.author_id && (
                <BanUserButton userId={report.post.author_id} onBan={onBanUser} />
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Members Tab ────────────────────────────────────────────────────────────

function MembersTab({
  members,
  loading,
  onUpdateRole,
  onBanUser,
  communityCreator,
}: {
  members: CommunityMemberWithProfile[];
  loading: boolean;
  onUpdateRole: (memberId: string, role: string) => Promise<void>;
  onBanUser: (userId: string, reason: string) => Promise<void>;
  communityCreator: string;
}) {
  const [roleFilter, setRoleFilter] = useState<string>('all');

  if (loading) {
    return <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>;
  }

  const filtered = roleFilter === 'all' ? members : members.filter(m => m.role === roleFilter);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">{members.length} Members</h3>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-32" aria-label="Filter by role">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admins</SelectItem>
            <SelectItem value="moderator">Moderators</SelectItem>
            <SelectItem value="member">Members</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        {filtered.map(member => {
          const isCreator = member.user_id === communityCreator;

          return (
            <Card key={member.id}>
              <CardContent className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={member.profile?.avatar_url || undefined} />
                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                      {(member.profile?.full_name || member.profile?.username || '?')[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {member.profile?.full_name || member.profile?.username || 'Unknown User'}
                      </span>
                      <Badge
                        variant={member.role === 'admin' ? 'default' : member.role === 'moderator' ? 'secondary' : 'outline'}
                        className="text-xs"
                      >
                        {isCreator && <Crown className="h-3 w-3 mr-1" aria-hidden="true" />}
                        {member.role}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Joined {new Date(member.joined_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {!isCreator && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" aria-label={`Manage ${member.profile?.full_name || 'member'}`}>
                        <ChevronDown className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {member.role !== 'moderator' && (
                        <DropdownMenuItem onClick={() => onUpdateRole(member.id, 'moderator')}>
                          <Shield className="h-4 w-4 mr-2" aria-hidden="true" />
                          Make Moderator
                        </DropdownMenuItem>
                      )}
                      {member.role === 'moderator' && (
                        <DropdownMenuItem onClick={() => onUpdateRole(member.id, 'member')}>
                          <UserMinus className="h-4 w-4 mr-2" aria-hidden="true" />
                          Remove Moderator
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => onBanUser(member.user_id, 'Banned by moderator')}
                      >
                        <Ban className="h-4 w-4 mr-2" aria-hidden="true" />
                        Ban User
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </CardContent>
            </Card>
          );
        })}

        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-8">No members match filter.</p>
        )}
      </div>
    </div>
  );
}

// ─── Bans Tab ───────────────────────────────────────────────────────────────

function BansTab({
  bans,
  loading,
  onUnban,
}: {
  bans: { id: string; user_id: string; reason: string | null; created_at: string; user_profile?: { username: string | null; full_name: string | null; avatar_url: string | null } }[];
  loading: boolean;
  onUnban: (banId: string) => Promise<void>;
}) {
  if (loading) {
    return <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>;
  }

  if (bans.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Ban className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" aria-hidden="true" />
          <h3 className="text-lg font-medium mb-2">No active bans</h3>
          <p className="text-muted-foreground">No users are currently banned from this community.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {bans.map(ban => (
        <Card key={ban.id}>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarImage src={ban.user_profile?.avatar_url || undefined} />
                <AvatarFallback className="text-xs bg-destructive/10 text-destructive">
                  {(ban.user_profile?.full_name || '?')[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">
                  {ban.user_profile?.full_name || ban.user_profile?.username || 'Unknown User'}
                </p>
                <p className="text-xs text-muted-foreground">
                  Banned {new Date(ban.created_at).toLocaleDateString()}
                  {ban.reason && ` · ${ban.reason}`}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onUnban(ban.id)}
              className="gap-1"
            >
              <Check className="h-3 w-3" aria-hidden="true" />
              Unban
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ─── Settings Tab ───────────────────────────────────────────────────────────

function SettingsTab({
  community,
  onSave,
}: {
  community: Community;
  onSave: (updates: { description?: string; rules?: string }) => Promise<void>;
}) {
  const [description, setDescription] = useState(community.description || '');
  const [rules, setRules] = useState(community.rules || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave({ description, rules });
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Community Description</CardTitle>
          <CardDescription>Describe what this community is about</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Tell people what this community is about..."
            rows={4}
            aria-label="Community description"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Community Rules</CardTitle>
          <CardDescription>Set guidelines for members to follow</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={rules}
            onChange={e => setRules(e.target.value)}
            placeholder="1. Be respectful&#10;2. No spam&#10;3. Stay on topic..."
            rows={6}
            aria-label="Community rules"
          />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
}

// ─── Shared Components ──────────────────────────────────────────────────────

function BanUserButton({ userId, onBan }: { userId: string; onBan: (userId: string, reason: string) => Promise<void> }) {
  const [reason, setReason] = useState('');
  const [banning, setBanning] = useState(false);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="destructive" className="gap-1">
          <Ban className="h-3 w-3" aria-hidden="true" />
          Ban
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ban User</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            This will remove the user from the community and prevent them from rejoining.
          </p>
          <div>
            <label htmlFor="ban-reason" className="text-sm font-medium">Reason</label>
            <Textarea
              id="ban-reason"
              placeholder="Why is this user being banned?"
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            variant="destructive"
            disabled={banning || !reason.trim()}
            onClick={async () => {
              setBanning(true);
              await onBan(userId, reason);
              setBanning(false);
            }}
          >
            {banning ? 'Banning...' : 'Ban User'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
