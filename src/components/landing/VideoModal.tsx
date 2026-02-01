import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

interface VideoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function VideoModal({ open, onOpenChange }: VideoModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black border-none">
        <video
          src="/videos/promo-video.mp4"
          controls
          autoPlay
          className="w-full h-auto max-h-[80vh]"
        >
          Your browser does not support the video tag.
        </video>
      </DialogContent>
    </Dialog>
  );
}
