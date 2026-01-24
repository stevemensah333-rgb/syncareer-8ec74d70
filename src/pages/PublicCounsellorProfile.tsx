import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  User, Star, MapPin, DollarSign, 
  Calendar, MessageSquare, TrendingUp
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface CounsellorProfile {
  id: string;
  user_id: string;
  full_name: string;
  bio: string | null;
  specialization: string | null;
  hiring_price: number;
  location: string | null;
  avatar_url: string | null;
}

interface Review {
  id: string;
  rating: number;
  review_text: string | null;
  created_at: string;
}

export default function PublicCounsellorProfile() {
  const { counsellorId } = useParams();
  const [counsellor, setCounsellor] = useState<CounsellorProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCounsellor = async () => {
      if (!counsellorId) return;

      // Fetch counsellor from public view
      const { data: counsellorData, error } = await supabase
        .from('counsellor_profiles_public')
        .select('*')
        .eq('user_id', counsellorId)
        .single();

      if (error || !counsellorData) {
        setLoading(false);
        return;
      }

      setCounsellor(counsellorData as CounsellorProfile);

      // Fetch reviews if we have counsellor id
      if (counsellorData.id) {
        const { data: reviewsData } = await supabase
          .from('counsellor_reviews')
          .select('id, rating, review_text, created_at')
          .eq('counsellor_id', counsellorData.id)
          .order('created_at', { ascending: false });

        if (reviewsData) {
          setReviews(reviewsData);
        }
      }

      setLoading(false);
    };

    fetchCounsellor();
  }, [counsellorId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card>
            <div className="h-32 bg-muted" />
            <CardContent className="pt-0">
              <div className="flex gap-6 -mt-16">
                <Skeleton className="h-32 w-32 rounded-full" />
                <div className="pt-8 space-y-2">
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!counsellor) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">Counsellor profile not found.</p>
          </Card>
        </div>
      </div>
    );
  }

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Card */}
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-primary/20 to-primary/5 h-32" />
          <CardContent className="relative pt-0">
            <div className="flex flex-col md:flex-row gap-6 -mt-16">
              <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
                <AvatarImage src={counsellor.avatar_url || ''} />
                <AvatarFallback className="text-3xl bg-primary/10 text-primary">
                  {counsellor.full_name?.charAt(0) || 'C'}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 pt-4 md:pt-8">
                <h1 className="text-2xl font-bold">{counsellor.full_name}</h1>
                {counsellor.location && (
                  <p className="text-muted-foreground flex items-center gap-1 mt-1">
                    <MapPin className="h-4 w-4" />
                    {counsellor.location}
                  </p>
                )}

                <div className="flex flex-wrap gap-4 mt-4">
                  <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    {averageRating} Rating
                  </Badge>
                  <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1">
                    <MessageSquare className="h-4 w-4" />
                    {reviews.length} Reviews
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 border-green-200">
                    <DollarSign className="h-4 w-4" />
                    ${counsellor.hiring_price}/session
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bio */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  About
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-foreground">
                  {counsellor.bio || 'No bio available.'}
                </p>
                {counsellor.specialization && (
                  <div className="pt-2">
                    <p className="text-sm text-muted-foreground">Specialization</p>
                    <p className="text-foreground">{counsellor.specialization}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Reviews */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Reviews
                </CardTitle>
              </CardHeader>
              <CardContent>
                {reviews.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No reviews yet.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b pb-4 last:border-0">
                        <div className="flex items-center gap-2 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-muted'}`}
                            />
                          ))}
                          <span className="text-sm text-muted-foreground ml-2">
                            {new Date(review.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        {review.review_text && (
                          <p className="text-foreground">{review.review_text}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Average Rating</span>
                  <span className="font-semibold flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    {averageRating}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Reviews</span>
                  <span className="font-semibold">{reviews.length}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Session Price</span>
                  <span className="font-semibold text-green-600">${counsellor.hiring_price}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
