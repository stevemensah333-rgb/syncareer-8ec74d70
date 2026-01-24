import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PenSquare, ArrowLeft, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { CommunitySidebar } from '@/components/communities/CommunitySidebar';
import { TrendingCommunitiesSidebar } from '@/components/communities/TrendingCommunitiesSidebar';
import { CommunityPostCard } from '@/components/communities/CommunityPostCard';
import { CreatePostDialog } from '@/components/communities/CreatePostDialog';
import { useCommunityPosts } from '@/hooks/useCommunityPosts';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

type SortOption = 'trending' | 'new' | 'hot';

export default function Communities() {
  const [sortBy, setSortBy] = useState<SortOption>('trending');
  const { posts, loading, createPost, votePost, deletePost } = useCommunityPosts(undefined, sortBy);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-20 bg-background border-b p-3 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/portfolio')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="font-semibold flex-1">Communities</h1>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-80">
            <CommunitySidebar />
          </SheetContent>
        </Sheet>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[280px_1fr_280px] gap-0">
        {/* Left Sidebar - My Communities */}
        <aside className="hidden lg:block border-r min-h-screen sticky top-0">
          <CommunitySidebar />
        </aside>

        {/* Main Feed */}
        <main className="min-h-screen lg:border-r">
          {/* Desktop header - hidden on mobile since we have the mobile header above */}
          <div className="hidden lg:block sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 p-4 border-b">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold">My Communities</h1>
              <div className="flex items-center gap-2">
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="trending">Trending</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="hot">Hot</SelectItem>
                  </SelectContent>
                </Select>

                <CreatePostDialog
                  trigger={
                    <Button size="sm" className="gap-2">
                      <PenSquare className="h-4 w-4" />
                      Create Post
                    </Button>
                  }
                  onSubmit={createPost}
                />
              </div>
            </div>
          </div>

          {/* Mobile controls bar */}
          <div className="lg:hidden sticky top-[53px] z-10 bg-background border-b p-3 flex items-center justify-between gap-2">
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
              <SelectTrigger className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="trending">Trending</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="hot">Hot</SelectItem>
              </SelectContent>
            </Select>

            <CreatePostDialog
              trigger={
                <Button size="sm" className="gap-2">
                  <PenSquare className="h-4 w-4" />
                  <span className="hidden sm:inline">Create Post</span>
                  <span className="sm:hidden">Post</span>
                </Button>
              }
              onSubmit={createPost}
            />
          </div>

          <div className="p-4 space-y-4">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <div key={i} className="space-y-3 p-4 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-16 w-full" />
                  <div className="flex gap-4">
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                </div>
              ))
            ) : posts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  No posts yet. Join some communities and start posting!
                </p>
                <Button variant="outline" asChild>
                  <a href="/communities/explore">Explore Communities</a>
                </Button>
              </div>
            ) : (
              posts.map((post) => (
                <CommunityPostCard
                  key={post.id}
                  post={post}
                  onVote={votePost}
                  onDelete={deletePost}
                  showCommunity
                />
              ))
            )}
          </div>
        </main>

        {/* Right Sidebar - Trending Communities */}
        <aside className="hidden lg:block min-h-screen sticky top-0">
          <TrendingCommunitiesSidebar />
        </aside>
      </div>
    </div>
  );
}
