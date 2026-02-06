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
import { CommunityErrorBoundary } from '@/components/communities/CommunityErrorBoundary';
import { useCommunityPosts } from '@/hooks/useCommunityPosts';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

type SortOption = 'trending' | 'new' | 'hot';

export default function Communities() {
  const [sortBy, setSortBy] = useState<SortOption>('trending');
  const { posts, loading, hasMore, createPost, votePost, deletePost, loadMore } = useCommunityPosts(undefined, sortBy);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-20 bg-background border-b p-3 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/portfolio')} aria-label="Go back">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="font-semibold flex-1">Communities</h1>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Open navigation menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-80">
            <CommunitySidebar />
          </SheetContent>
        </Sheet>
      </header>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[280px_1fr_280px] gap-0">
        {/* Left Sidebar */}
        <aside className="hidden lg:block border-r min-h-screen sticky top-0" aria-label="My communities">
          <CommunityErrorBoundary fallbackTitle="Sidebar error">
            <CommunitySidebar />
          </CommunityErrorBoundary>
        </aside>

        {/* Main Feed */}
        <main className="min-h-screen lg:border-r" role="main" aria-label="Community feed">
          {/* Desktop header */}
          <div className="hidden lg:block sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 p-4 border-b">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold">My Communities</h1>
              <div className="flex items-center gap-2">
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                  <SelectTrigger className="w-32" aria-label="Sort posts">
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
                      <PenSquare className="h-4 w-4" aria-hidden="true" />
                      Create Post
                    </Button>
                  }
                  onSubmit={createPost}
                />
              </div>
            </div>
          </div>

          {/* Mobile controls */}
          <div className="lg:hidden sticky top-[53px] z-10 bg-background border-b p-3 flex items-center justify-between gap-2">
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
              <SelectTrigger className="w-28" aria-label="Sort posts">
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
                  <PenSquare className="h-4 w-4" aria-hidden="true" />
                  <span className="hidden sm:inline">Create Post</span>
                  <span className="sm:hidden">Post</span>
                </Button>
              }
              onSubmit={createPost}
            />
          </div>

          <div className="p-4 space-y-4" role="feed" aria-label="Posts feed">
            <CommunityErrorBoundary fallbackTitle="Feed error">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <div key={i} className="space-y-3 p-4 border rounded-lg" aria-hidden="true">
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
                <>
                  {posts.map((post) => (
                    <CommunityPostCard
                      key={post.id}
                      post={post}
                      onVote={votePost}
                      onDelete={deletePost}
                      showCommunity
                    />
                  ))}
                  {hasMore && (
                    <div className="flex justify-center pt-4">
                      <Button variant="outline" onClick={loadMore}>
                        Load More
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CommunityErrorBoundary>
          </div>
        </main>

        {/* Right Sidebar */}
        <aside className="hidden lg:block min-h-screen sticky top-0" aria-label="Trending communities">
          <CommunityErrorBoundary fallbackTitle="Trending error">
            <TrendingCommunitiesSidebar />
          </CommunityErrorBoundary>
        </aside>
      </div>
    </div>
  );
}
