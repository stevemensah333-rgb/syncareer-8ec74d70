import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCommunities } from '@/hooks/useCommunities';
import { COMMUNITY_CATEGORIES } from '@/types/community';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const communitySchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(50),
  description: z.string().max(500).optional(),
  category: z.string().min(1, 'Please select a category'),
  rules: z.string().max(2000).optional(),
});

type CommunityFormData = z.infer<typeof communitySchema>;

export default function CreateCommunity() {
  const navigate = useNavigate();
  const { createCommunity } = useCommunities();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  const form = useForm<CommunityFormData>({
    resolver: zodResolver(communitySchema),
    defaultValues: {
      name: '',
      description: '',
      category: '',
      rules: '',
    },
  });

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({ title: 'Icon must be less than 2MB', variant: 'destructive' });
        return;
      }
      setIconFile(file);
      setIconPreview(URL.createObjectURL(file));
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: 'Banner must be less than 5MB', variant: 'destructive' });
        return;
      }
      setBannerFile(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  const removeIcon = () => {
    setIconFile(null);
    if (iconPreview) URL.revokeObjectURL(iconPreview);
    setIconPreview(null);
  };

  const removeBanner = () => {
    setBannerFile(null);
    if (bannerPreview) URL.revokeObjectURL(bannerPreview);
    setBannerPreview(null);
  };

  const uploadFile = async (file: File, path: string): Promise<string | null> => {
    const { data, error } = await supabase.storage
      .from('community-assets')
      .upload(path, file, { upsert: true });

    if (error) {
      console.error('Upload error:', error);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from('community-assets')
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  };

  const handleSubmit = async (data: CommunityFormData) => {
    setSubmitting(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        toast({ title: 'Please sign in to create a community', variant: 'destructive' });
        return;
      }

      const userId = userData.user.id;
      const timestamp = Date.now();
      
      let iconUrl: string | null = null;
      let bannerUrl: string | null = null;

      if (iconFile) {
        const iconPath = `${userId}/icons/${timestamp}-${iconFile.name}`;
        iconUrl = await uploadFile(iconFile, iconPath);
        if (!iconUrl) {
          toast({ title: 'Failed to upload icon', variant: 'destructive' });
          return;
        }
      }

      if (bannerFile) {
        const bannerPath = `${userId}/banners/${timestamp}-${bannerFile.name}`;
        bannerUrl = await uploadFile(bannerFile, bannerPath);
        if (!bannerUrl) {
          toast({ title: 'Failed to upload banner', variant: 'destructive' });
          return;
        }
      }

      const community = await createCommunity({
        name: data.name,
        description: data.description || null,
        category: data.category,
        rules: data.rules || null,
        icon_url: iconUrl,
        banner_url: bannerUrl,
      });

      if (community) {
        navigate(`/communities/${community.slug}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto p-6">
        <Button 
          variant="ghost" 
          size="sm" 
          className="mb-6"
          onClick={() => navigate('/communities')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Create a Community</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Community Name *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., Tech Enthusiasts" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Choose a unique name for your community
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category *</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {COMMUNITY_CATEGORIES.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="What is this community about?"
                          className="resize-y"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="rules"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Community Rules</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="List the rules for your community..."
                          className="min-h-[120px] resize-y"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Optional guidelines for members
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Icon Upload */}
                <FormItem>
                  <FormLabel>Community Logo</FormLabel>
                  <div className="space-y-3">
                    {iconPreview ? (
                      <div className="relative inline-block">
                        <img 
                          src={iconPreview} 
                          alt="Icon preview" 
                          className="h-20 w-20 rounded-full object-cover border-2 border-border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 h-6 w-6"
                          onClick={removeIcon}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <label className="flex items-center gap-3 p-4 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
                        <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center">
                          <Upload className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Upload logo</p>
                          <p className="text-xs text-muted-foreground">PNG, JPG up to 2MB</p>
                        </div>
                        <input 
                          type="file" 
                          accept="image/png,image/jpeg,image/webp"
                          className="hidden" 
                          onChange={handleIconChange}
                        />
                      </label>
                    )}
                  </div>
                </FormItem>

                {/* Banner Upload */}
                <FormItem>
                  <FormLabel>Community Banner</FormLabel>
                  <div className="space-y-3">
                    {bannerPreview ? (
                      <div className="relative">
                        <img 
                          src={bannerPreview} 
                          alt="Banner preview" 
                          className="w-full h-32 object-cover rounded-lg border border-border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 h-6 w-6"
                          onClick={removeBanner}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
                        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-sm font-medium">Upload banner</p>
                        <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB (recommended: 1200x300)</p>
                        <input 
                          type="file" 
                          accept="image/png,image/jpeg,image/webp"
                          className="hidden" 
                          onChange={handleBannerChange}
                        />
                      </label>
                    )}
                  </div>
                </FormItem>

                <div className="flex justify-end gap-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate('/communities')}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? 'Creating...' : 'Create Community'}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
