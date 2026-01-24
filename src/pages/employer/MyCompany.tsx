import { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, MapPin, Users, Megaphone, ShoppingCart, Edit, Globe, Mail, Phone } from 'lucide-react';
import { useUserProfile } from '@/contexts/UserProfileContext';
import { EditCompanyDialog } from '@/components/employer/EditCompanyDialog';
import { AddEmployeeDialog } from '@/components/employer/AddEmployeeDialog';
import { toast } from 'sonner';

const MyCompany = () => {
  const { employerDetails, loading, refreshProfile } = useUserProfile();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  if (loading) {
    return (
      <PageLayout title="My Company">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading company information...</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="My Company">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Company Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Company Profile Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Company Profile
              </CardTitle>
              <Button variant="outline" size="sm" onClick={() => setIsEditDialogOpen(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="h-20 w-20 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Building2 className="h-10 w-10 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold">{employerDetails?.company_name || 'Your Company'}</h2>
                  <div className="flex items-center gap-2 text-muted-foreground mt-1">
                    <MapPin className="h-4 w-4" />
                    <span>{employerDetails?.company_location || 'Location not set'}</span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="secondary">{employerDetails?.industry || 'Industry'}</Badge>
                    <Badge variant="outline">{employerDetails?.company_size || 'Company Size'}</Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">www.company.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">hr@company.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">+1 234 567 890</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Company Description */}
          <Card>
            <CardHeader>
              <CardTitle>About the Company</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Add a description about your company, its mission, values, and what makes it a great place to work.
                This will be visible to job seekers browsing your job postings.
              </p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => {
                  setIsEditDialogOpen(true);
                  toast.info('You can add company description in the edit dialog');
                }}
              >
                Add Company Description
              </Button>
            </CardContent>
          </Card>

          {/* Team Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Registered Employees
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No employees registered yet</p>
                <p className="text-sm mt-2">Invite employees to join your company training programs</p>
                <AddEmployeeDialog 
                  trigger={<Button className="mt-4">Invite Employees</Button>}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Company Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Active Job Posts</span>
                <span className="font-bold text-lg">0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total Applications</span>
                <span className="font-bold text-lg">0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Employees</span>
                <span className="font-bold text-lg">0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Profile Views</span>
                <span className="font-bold text-lg">0</span>
              </div>
            </CardContent>
          </Card>

          {/* Advertise Card */}
          <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-primary" />
                Advertise
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Promote your brand to thousands of skilled professionals on Syncareer.
              </p>
              <Button 
                className="w-full"
                onClick={() => toast.info('Ad campaign feature coming soon!')}
              >
                <Megaphone className="h-4 w-4 mr-2" />
                Create Ad Campaign
              </Button>
            </CardContent>
          </Card>

          {/* Sell Products Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-primary" />
                Sell Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Offer products or services to our community of professionals.
              </p>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => toast.info('Marketplace feature coming soon!')}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Start Selling
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <EditCompanyDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        companyData={employerDetails}
        onSave={refreshProfile}
      />
    </PageLayout>
  );
};

export default MyCompany;
