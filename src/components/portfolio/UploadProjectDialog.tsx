import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Upload, X, Link } from 'lucide-react';
import { toast } from 'sonner';

interface UploadProjectDialogProps {
  onProjectUploaded?: () => void;
}

export function UploadProjectDialog({ onProjectUploaded }: UploadProjectDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    projectUrl: '',
    githubUrl: '',
  });
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (tag && !tags.includes(tag) && tags.length < 6) {
      setTags([...tags, tag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast.error('Project title is required');
      return;
    }

    if (!formData.description.trim()) {
      toast.error('Project description is required');
      return;
    }

    setIsSubmitting(true);
    try {
      // In a real app, this would save to the database
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast.success('Project uploaded successfully! It will be reviewed for AI verification.');
      setFormData({ title: '', description: '', projectUrl: '', githubUrl: '' });
      setTags([]);
      setOpen(false);
      onProjectUploaded?.();
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload project');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Upload Project</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload New Project
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4 max-h-[60vh] overflow-y-auto pr-2">
          <div className="space-y-2">
            <Label>Project Title *</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., E-Commerce Platform"
            />
          </div>

          <div className="space-y-2">
            <Label>Description *</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your project, its features, and what you learned..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label>Project URL</Label>
            <div className="relative">
              <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={formData.projectUrl}
                onChange={(e) => setFormData({ ...formData, projectUrl: e.target.value })}
                placeholder="https://your-project.com"
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>GitHub Repository</Label>
            <div className="relative">
              <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={formData.githubUrl}
                onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                placeholder="https://github.com/username/repo"
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Technologies Used (up to 6)</Label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g., React, Node.js"
                disabled={tags.length >= 6}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddTag}
                disabled={!tagInput.trim() || tags.length >= 6}
              >
                Add
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <p className="text-sm text-muted-foreground">
            Your project will be reviewed by our AI system for skill verification. High-quality projects may receive an "AI Verified" badge.
          </p>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              <Upload className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Uploading...' : 'Upload Project'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
