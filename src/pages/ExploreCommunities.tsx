import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, ArrowLeft, TrendingUp, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { CommunityCard } from '@/components/communities/CommunityCard';
import { useCommunities } from '@/hooks/useCommunities';
import { COMMUNITY_CATEGORIES } from '@/types/community';

type SortOption = 'trending' | 'new' | 'most-members';
type FilterCategory = 'all' | typeof COMMUNITY_CATEGORIES[number];

export default function ExploreCommunities() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('trending');
  const [category, setCategory] = useState<FilterCategory>('all');
  
  const { 
    communities, 
    userCommunities, 
    loading, 
    joinCommunity, 
    leaveCommunity 
  } = useCommunities();

  const userCommunityIds = new Set(userCommunities.map(c => c.id));

  const filteredCommunities = useMemo(() => {
    let filtered = [...communities];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(query) ||
        c.description?.toLowerCase().includes(query) ||
        c.category.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (category !== 'all') {
      filtered = filtered.filter(c => c.category === category);
    }

    // Sort
    if (sortBy === 'new') {
      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sortBy === 'most-members') {
      filtered.sort((a, b) => (b.member_count || 0) - (a.member_count || 0));
    }
    // trending is default order from API

    return filtered;
  }, [communities, searchQuery, sortBy, category]);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            size="sm" 
            className="mb-4"
            onClick={() => navigate('/communities')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Communities
          </Button>
          <h1 className="text-3xl font-bold">Explore Communities</h1>
          <p className="text-muted-foreground mt-2">
            Discover and join communities that match your interests
          </p>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search communities..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="trending">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Trending
                  </div>
                </SelectItem>
                <SelectItem value="new">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    New
                  </div>
                </SelectItem>
                <SelectItem value="most-members">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Most Members
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            <Select value={category} onValueChange={(v) => setCategory(v as FilterCategory)}>
              <SelectTrigger className="w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {COMMUNITY_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Category Badges */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Badge
            variant={category === 'all' ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setCategory('all')}
          >
            All
          </Badge>
          {COMMUNITY_CATEGORIES.slice(0, 8).map((cat) => (
            <Badge
              key={cat}
              variant={category === cat ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setCategory(cat)}
            >
              {cat}
            </Badge>
          ))}
        </div>

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="border rounded-lg overflow-hidden">
                <Skeleton className="h-20 w-full" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-8 w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredCommunities.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {searchQuery 
                ? `No communities found matching "${searchQuery}"`
                : 'No communities found in this category'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCommunities.map((community) => (
              <CommunityCard
                key={community.id}
                community={community}
                isJoined={userCommunityIds.has(community.id)}
                onJoin={joinCommunity}
                onLeave={leaveCommunity}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
