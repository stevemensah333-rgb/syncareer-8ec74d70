import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const DEPARTMENTS = [
  'Engineering',
  'Marketing',
  'Sales',
  'HR',
  'Finance',
  'Operations',
  'Product',
  'Design',
  'Customer Support',
  'Other',
];

interface AddEmployeeDialogProps {
  trigger?: React.ReactNode;
}

export function AddEmployeeDialog({ trigger }: AddEmployeeDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [inviterName, setInviterName] = useState('');

  useEffect(() => {
    const fetchEmployerDetails = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [employerResult, profileResult] = await Promise.all([
        supabase
          .from('employer_details')
          .select('company_name')
          .eq('user_id', user.id)
          .single(),
        supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single()
      ]);

      if (employerResult.data) {
        setCompanyName(employerResult.data.company_name);
      }
      if (profileResult.data?.full_name) {
        setInviterName(profileResult.data.full_name);
      }
    };

    if (open) {
      fetchEmployerDetails();
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error('Name and email are required');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (!companyName) {
      toast.error('Company details not found. Please set up your company profile first.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-employee-invite', {
        body: {
          email: formData.email.trim(),
          companyName: companyName,
          inviterName: inviterName || 'Your employer'
        }
      });

      if (error) {
        throw error;
      }

      toast.success(`Invitation sent to ${formData.email}!`);
      setFormData({ name: '', email: '', department: '' });
      setOpen(false);
    } catch (error: any) {
      console.error('Error sending invitation:', error);
      toast.error(error.message || 'Failed to send invitation');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Employee
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Add New Employee
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Full Name *</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter employee name"
            />
          </div>

          <div className="space-y-2">
            <Label>Email Address *</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="employee@company.com"
            />
          </div>

          <div className="space-y-2">
            <Label>Department</Label>
            <Select
              value={formData.department}
              onValueChange={(value) => setFormData({ ...formData, department: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {DEPARTMENTS.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <p className="text-sm text-muted-foreground">
            An invitation email will be sent to the employee to join your company's training programs.
          </p>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Sending...' : 'Send Invitation'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
