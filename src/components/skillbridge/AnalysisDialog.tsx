import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AnalysisDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  analysis: string;
  isLoading: boolean;
}

export function AnalysisDialog({ open, onOpenChange, analysis, isLoading }: AnalysisDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>AI Portfolio & CV Analysis</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-3 text-muted-foreground">Analyzing your portfolio and CV...</span>
            </div>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <div className="whitespace-pre-wrap">{analysis}</div>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
