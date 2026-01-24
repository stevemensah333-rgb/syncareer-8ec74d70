import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Star, MapPin, DollarSign, ChevronRight, ArrowLeft, User, MessageSquare, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { z } from 'zod';

interface Counsellor {
  id: string;
  user_id: string;
  full_name: string;
  bio: string | null;
  specialization: string | null;
  hiring_price: number;
  location: string | null;
  avatar_url: string | null;
  average_rating: number;
  review_count: number;
}

interface AskCounsellorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const bookingSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  contact: z.string().trim().min(1, 'Contact is required').max(200, 'Contact must be less than 200 characters'),
});

type Step = 'form' | 'list' | 'profile';

const AskCounsellorDialog: React.FC<AskCounsellorDialogProps> = ({ open, onOpenChange }) => {
  const [step, setStep] = useState<Step>('form');
  const [counsellors, setCounsellors] = useState<Counsellor[]>([]);
  const [selectedCounsellor, setSelectedCounsellor] = useState<Counsellor | null>(null);
  const [loading, setLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  
  // Form state
  const [userName, setUserName] = useState('');
  const [userContact, setUserContact] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (open && step === 'list') {
      fetchCounsellors();
    }
  }, [open, step]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setStep('form');
      setUserName('');
      setUserContact('');
      setSelectedCounsellor(null);
      setSearchQuery('');
    }
  }, [open]);

  const fetchCounsellors = async () => {
    setLoading(true);
    try {
      // Fetch all counsellors using the public view (excludes phone numbers for privacy)
      const { data: counsellorsData, error } = await supabase
        .from('counsellor_profiles_public')
        .select('*');

      if (error) throw error;

      if (counsellorsData) {
        // Fetch ratings for each counsellor
        const counsellorsWithRatings = await Promise.all(
          counsellorsData.map(async (counsellor) => {
            const { data: reviews } = await supabase
              .from('counsellor_reviews')
              .select('rating')
              .eq('counsellor_id', counsellor.id);

            const ratings = reviews || [];
            const averageRating = ratings.length > 0
              ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
              : 0;

            return {
              ...counsellor,
              average_rating: averageRating,
              review_count: ratings.length,
            } as Counsellor;
          })
        );

        // Sort by rating (highest first)
        counsellorsWithRatings.sort((a, b) => b.average_rating - a.average_rating);
        setCounsellors(counsellorsWithRatings);
      }
    } catch (error) {
      console.error('Error fetching counsellors:', error);
      toast.error('Failed to load counsellors');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = () => {
    const result = bookingSchema.safeParse({ name: userName, contact: userContact });
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }
    setStep('list');
  };

  const handleSelectCounsellor = (counsellor: Counsellor) => {
    setSelectedCounsellor(counsellor);
    setStep('profile');
  };

  const handleBook = async () => {
    if (!selectedCounsellor) return;

    setBookingLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        toast.error('Please sign in to book a session');
        return;
      }

      const { error } = await supabase
        .from('counsellor_bookings')
        .insert({
          counsellor_id: selectedCounsellor.id,
          user_id: session.user.id,
          user_name: userName,
          user_contact: userContact,
          status: 'pending',
        });

      if (error) throw error;

      toast.success('Booking request sent! The counsellor will contact you soon.');
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to book session');
    } finally {
      setBookingLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${i < Math.round(rating) ? 'text-yellow-500 fill-yellow-500' : 'text-muted'}`}
          />
        ))}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {step !== 'form' && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setStep(step === 'profile' ? 'list' : 'form')}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            {step === 'form' && 'Book a Counsellor'}
            {step === 'list' && 'Select a Counsellor'}
            {step === 'profile' && selectedCounsellor?.full_name}
          </DialogTitle>
          <DialogDescription>
            {step === 'form' && 'Enter your details to find and book a career counsellor.'}
            {step === 'list' && 'Choose from our top-rated career counsellors.'}
            {step === 'profile' && 'View counsellor profile and book a session.'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {/* Step 1: User Info Form */}
          {step === 'form' && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Your Name *</Label>
                <Input
                  id="name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact">Contact (Email or Phone) *</Label>
                <Input
                  id="contact"
                  value={userContact}
                  onChange={(e) => setUserContact(e.target.value)}
                  placeholder="Enter your email or phone number"
                />
              </div>
              <Button onClick={handleFormSubmit} className="w-full mt-4">
                Find Counsellors
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}

          {/* Step 2: Counsellor List */}
          {step === 'list' && (
            <div className="flex flex-col h-[400px]">
              {/* Search Bar */}
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or specialization..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              <ScrollArea className="flex-1 pr-4">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : counsellors.filter(c => 
                    c.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (c.specialization?.toLowerCase().includes(searchQuery.toLowerCase()))
                  ).length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>{searchQuery ? 'No counsellors match your search.' : 'No counsellors available at the moment.'}</p>
                  </div>
                ) : (
                  <div className="space-y-3 py-2">
                    {counsellors
                      .filter(c => 
                        c.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (c.specialization?.toLowerCase().includes(searchQuery.toLowerCase()))
                      )
                      .map((counsellor) => (
                    <Card
                      key={counsellor.id}
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleSelectCounsellor(counsellor)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={counsellor.avatar_url || ''} />
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {counsellor.full_name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold truncate">{counsellor.full_name}</h4>
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 shrink-0">
                                ${counsellor.hiring_price}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              {renderStars(counsellor.average_rating)}
                              <span className="text-sm text-muted-foreground">
                                ({counsellor.review_count})
                              </span>
                            </div>
                            {counsellor.specialization && (
                              <p className="text-sm text-muted-foreground truncate mt-1">
                                {counsellor.specialization}
                              </p>
                            )}
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                        </div>
                      </CardContent>
                    </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          )}

          {/* Step 3: Counsellor Profile */}
          {step === 'profile' && selectedCounsellor && (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-6 py-4">
                {/* Profile Header */}
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={selectedCounsellor.avatar_url || ''} />
                    <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                      {selectedCounsellor.full_name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-bold">{selectedCounsellor.full_name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      {renderStars(selectedCounsellor.average_rating)}
                      <span className="text-sm text-muted-foreground">
                        ({selectedCounsellor.review_count} reviews)
                      </span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Location Info */}
                {selectedCounsellor.location && (
                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Location
                    </h4>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{selectedCounsellor.location}</span>
                    </div>
                  </div>
                )}

                <Separator />

                {/* Price */}
                <div className="flex items-center justify-between p-4 rounded-lg bg-green-50 border border-green-200">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-700">Session Price</span>
                  </div>
                  <span className="text-xl font-bold text-green-700">
                    ${selectedCounsellor.hiring_price}
                  </span>
                </div>

                {/* Bio */}
                {selectedCounsellor.bio && (
                  <div className="space-y-2">
                    <h4 className="font-semibold">About</h4>
                    <p className="text-muted-foreground">{selectedCounsellor.bio}</p>
                  </div>
                )}

                {/* Specialization */}
                {selectedCounsellor.specialization && (
                  <div className="space-y-2">
                    <h4 className="font-semibold">Specialization</h4>
                    <p className="text-muted-foreground">{selectedCounsellor.specialization}</p>
                  </div>
                )}

                {/* Book Button */}
                <Button
                  onClick={handleBook}
                  disabled={bookingLoading}
                  className="w-full"
                  size="lg"
                >
                  {bookingLoading ? 'Booking...' : 'Book Session'}
                </Button>
              </div>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AskCounsellorDialog;
