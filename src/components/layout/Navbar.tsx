
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, Briefcase, Users, LogOut, MessageCircle, Menu, HelpCircle, Phone, Mail } from 'lucide-react';
import skillbridgeLogo from '@/assets/skillbridge-logo.png';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useUserProfile } from '@/contexts/UserProfileContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import AskCounsellorDialog from '@/components/counsellor/AskCounsellorDialog';
import { NotificationsDropdown } from '@/components/notifications/NotificationsDropdown';

interface NavbarProps {
  className?: string;
  onMobileMenuClick?: () => void;
}

export function Navbar({ className, onMobileMenuClick }: NavbarProps) {
  const [user, setUser] = useState<any>(null);
  const [askCounsellorOpen, setAskCounsellorOpen] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { profile } = useUserProfile();

  const isEmployer = profile?.user_type === 'employer';
  const isCounsellor = profile?.user_type === 'career_counsellor';

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error('Error signing out');
    } else {
      toast.success('Signed out successfully');
      navigate('/auth');
    }
  };

  return (
    <>
      <header className={cn("bg-background/95 backdrop-blur-sm sticky top-0 z-30 border-b", className)}>
        <div className="container flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-2 lg:gap-6">
            {/* Mobile Menu Button */}
            {isMobile && onMobileMenuClick && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onMobileMenuClick}
                className="md:hidden h-9 w-9"
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}
            
            <div className="flex items-center gap-2">
              <img src={skillbridgeLogo} alt="Synconnect" className="h-8 w-8 object-contain" />
              <h1 className="text-lg font-semibold tracking-tight lg:text-xl">Synconnect</h1>
            </div>
            
            <div className="relative hidden md:flex items-center h-9 rounded-md px-3 text-muted-foreground focus-within:text-foreground bg-muted/50">
              <Search className="h-4 w-4 mr-2" />
              <Input 
                type="search" 
                placeholder="Search skills, people..." 
                className="h-9 w-[200px] lg:w-[280px] bg-transparent border-none px-0 py-0 shadow-none focus-visible:ring-0 placeholder:text-muted-foreground"
              />
            </div>

            <div className="hidden lg:flex items-center gap-2">
              {isEmployer ? (
                // Employer sees "For Employers" button
                <Button
                  variant="ghost"
                  className="text-sm"
                >
                  <Briefcase className="h-4 w-4 mr-1" />
                  For Employers
                </Button>
              ) : isCounsellor ? (
                // Counsellors see their role indicator
                <Button
                  variant="ghost"
                  className="text-sm"
                >
                  <Users className="h-4 w-4 mr-1" />
                  Counsellor Portal
                </Button>
              ) : (
                // Job seekers see both buttons
                <>
                  <Button
                    variant="ghost"
                    className="text-sm"
                  >
                    <Users className="h-4 w-4 mr-1" />
                    For Job Seekers
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    className="text-sm"
                    onClick={() => setAskCounsellorOpen(true)}
                  >
                    <MessageCircle className="h-4 w-4 mr-1" />
                    Ask a Counsellor
                  </Button>
                </>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <NotificationsDropdown />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="h-9 w-9 transition-transform duration-200 hover:scale-105 cursor-pointer">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    <User className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/settings?tab=profile')} className="cursor-pointer">
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="cursor-pointer">
                    <HelpCircle className="h-4 w-4 mr-2" />
                    Contact Support
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="bg-popover">
                    <div className="px-3 py-2 space-y-2">
                      <a 
                        href="tel:+233555156128" 
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Phone className="h-3.5 w-3.5" />
                        +233 555 156 128
                      </a>
                      <a 
                        href="mailto:stephen.mensah@ashesi.edu.gh" 
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Mail className="h-3.5 w-3.5" />
                        stephen.mensah@ashesi.edu.gh
                      </a>
                    </div>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive cursor-pointer">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Ask a Counsellor Dialog */}
      <AskCounsellorDialog open={askCounsellorOpen} onOpenChange={setAskCounsellorOpen} />
    </>
  );
}
