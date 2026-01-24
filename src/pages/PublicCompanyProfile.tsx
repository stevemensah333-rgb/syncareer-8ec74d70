import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Building2, MapPin, Briefcase, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface CompanyProfile {
  id: string;
  user_id: string;
  company_name: string;
  company_location: string | null;
  industry: string | null;
  company_size: string | null;
  job_title: string | null;
}

interface JobPosting {
  id: string;
  title: string;
  location: string;
  employment_type: string;
  created_at: string;
}

export default function PublicCompanyProfile() {
  const { employerId } = useParams();
  const [company, setCompany] = useState<CompanyProfile | null>(null);
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompany = async () => {
      if (!employerId) return;

      // Fetch employer details - need to use RPC or a public view
      // For now, we'll fetch from job_postings and get company info
      const { data: jobsData } = await supabase
        .from('job_postings')
        .select('id, title, location, employment_type, created_at, employer_id')
        .eq('employer_id', employerId)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (jobsData && jobsData.length > 0) {
        setJobs(jobsData);
      }

      // We can't directly access employer_details due to RLS
      // So we'll show what we can from job postings
      // In a real app, you'd create a public view for this

      setLoading(false);
    };

    fetchCompany();
  }, [employerId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex gap-6">
                <Skeleton className="h-20 w-20 rounded-lg" />
                <div className="space-y-2">
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

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="h-20 w-20 rounded-lg bg-primary/10 flex items-center justify-center">
                <Building2 className="h-10 w-10 text-primary" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold">Company Profile</h1>
                <p className="text-muted-foreground">
                  View active job postings from this employer
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Job Postings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Active Job Postings
            </CardTitle>
          </CardHeader>
          <CardContent>
            {jobs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No active job postings</p>
              </div>
            ) : (
              <div className="space-y-4">
                {jobs.map((job) => (
                  <div 
                    key={job.id} 
                    className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <h3 className="font-semibold text-lg">{job.title}</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {job.location}
                      </Badge>
                      <Badge variant="outline">{job.employment_type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Posted {new Date(job.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
