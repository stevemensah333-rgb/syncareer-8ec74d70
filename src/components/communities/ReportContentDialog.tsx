import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Flag } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const REPORT_REASONS = [
  { value: 'spam', label: 'Spam', description: 'Promotional or repetitive content' },
  { value: 'harassment', label: 'Harassment', description: 'Bullying, threats, or personal attacks' },
  { value: 'misinformation', label: 'Misinformation', description: 'False or misleading claims' },
  { value: 'inappropriate', label: 'Inappropriate', description: 'Content that violates community standards' },
  { value: 'self_harm', label: 'Self-harm', description: 'Content promoting self-harm or dangerous behavior' },
  { value: 'other', label: 'Other', description: 'Something else not listed above' },
] as const;

const reportSchema = z.object({
  reason: z.enum(['spam', 'harassment', 'misinformation', 'inappropriate', 'self_harm', 'other']),
  description: z.string().max(500).optional(),
});

type ReportFormData = z.infer<typeof reportSchema>;

interface ReportContentDialogProps {
  contentType: 'post' | 'comment';
  contentId: string;
  trigger?: React.ReactNode;
}

export function ReportContentDialog({ contentType, contentId, trigger }: ReportContentDialogProps) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema),
    defaultValues: { reason: 'spam', description: '' },
  });

  const handleSubmit = async (data: ReportFormData) => {
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to report content');
        return;
      }

      const { error } = await supabase.from('content_reports').insert({
        reporter_id: user.id,
        content_type: contentType,
        content_id: contentId,
        reason: data.reason,
        description: data.description || null,
      });

      if (error) {
        if (error.code === '23505') {
          toast.info('You have already reported this content');
        } else {
          throw error;
        }
      } else {
        toast.success('Report submitted. Thank you for helping keep the community safe.');
      }

      setOpen(false);
      form.reset();
    } catch (err: any) {
      console.error('[ReportContentDialog] Error:', err);
      toast.error('Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
            <Flag className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">Report</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Report {contentType === 'post' ? 'Post' : 'Comment'}</DialogTitle>
          <DialogDescription>
            Help us understand the issue. Reports are reviewed by community moderators.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="space-y-2"
                    >
                      {REPORT_REASONS.map((reason) => (
                        <div key={reason.value} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-muted/50">
                          <RadioGroupItem value={reason.value} id={reason.value} className="mt-0.5" />
                          <Label htmlFor={reason.value} className="cursor-pointer flex-1">
                            <span className="font-medium text-sm">{reason.label}</span>
                            <p className="text-xs text-muted-foreground">{reason.description}</p>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional details (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Provide any additional context..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="destructive" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Report'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
