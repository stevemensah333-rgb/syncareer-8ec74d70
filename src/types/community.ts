export interface Community {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  banner_url: string | null;
  icon_url: string | null;
  category: string;
  rules: string | null;
  created_by: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  member_count?: number;
}

export interface CommunityMember {
  id: string;
  community_id: string;
  user_id: string;
  role: 'admin' | 'moderator' | 'member';
  is_pinned: boolean;
  joined_at: string;
}

export interface CommunityPost {
  id: string;
  community_id: string;
  author_id: string;
  title: string;
  content: string;
  cover_image_url: string | null;
  tags: string[];
  is_pinned: boolean;
  upvotes: number;
  downvotes: number;
  comment_count: number;
  created_at: string;
  updated_at: string;
  community?: Community;
  author?: {
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
  };
  user_vote?: 'up' | 'down' | null;
  user_role?: 'admin' | 'moderator' | 'member' | null;
}

export interface CommunityPostComment {
  id: string;
  post_id: string;
  author_id: string;
  parent_id: string | null;
  content: string;
  upvotes: number;
  created_at: string;
  updated_at: string;
  author?: {
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
  };
  replies?: CommunityPostComment[];
}

export interface PostVote {
  id: string;
  post_id: string;
  user_id: string;
  vote_type: 'up' | 'down';
  created_at: string;
}

export interface PostBookmark {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
}

export const COMMUNITY_CATEGORIES = [
  'General',
  'Technology',
  'Education',
  'Finance',
  'Photography',
  'Art & Design',
  'Gaming',
  'Health & Fitness',
  'Music',
  'Travel',
  'Food',
  'Sports',
  'Science',
  'Business',
  'Entertainment',
] as const;
