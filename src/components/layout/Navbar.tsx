
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, User, Briefcase, Users, LogOut, ChevronDown, UserPlus, Megaphone, ShoppingCart, FileText, Menu } from 'lucide-react';
import skillbridgeLogo from '@/assets/skillbridge-logo.png';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface NavbarProps {
  className?: string;
  onMobileMenuClick?: () => void;
}

export function Navbar({ className, onMobileMenuClick }: NavbarProps) {
  const [userType, setUserType] = useState<'seeker' | 'employer'>('seeker');
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

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
            <img src={skillbridgeLogo} alt="SkillBridge" className="h-8 w-8 object-contain" />
            <h1 className="text-lg font-semibold tracking-tight lg:text-xl">SkillBridge</h1>
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
            <Button
              variant="ghost"
              className="text-sm"
              onClick={() => setUserType('seeker')}
            >
              <Users className="h-4 w-4 mr-1" />
              For Job Seekers
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-sm">
                  <Briefcase className="h-4 w-4 mr-1" />
                  For Employers
                  <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64">
                <DropdownMenuLabel>Employer Services</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer py-3">
                  <UserPlus className="h-5 w-5 mr-3 text-primary flex-shrink-0" />
                  <div className="flex flex-col">
                    <div className="font-medium">Hire with SkillBridge</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Find and recruit top talent for your company
                    </div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer py-3">
                  <Megaphone className="h-5 w-5 mr-3 text-primary flex-shrink-0" />
                  <div className="flex flex-col">
                    <div className="font-medium">Advertise on SkillBridge</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Promote your brand to skilled professionals
                    </div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer py-3">
                  <ShoppingCart className="h-5 w-5 mr-3 text-primary flex-shrink-0" />
                  <div className="flex flex-col">
                    <div className="font-medium">Sell on SkillBridge</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Offer products or services to our community
                    </div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer py-3">
                  <FileText className="h-5 w-5 mr-3 text-primary flex-shrink-0" />
                  <div className="flex flex-col">
                    <div className="font-medium">Post a Job</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Create and publish job openings quickly
                    </div>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative h-9 w-9"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary animate-pulse" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="h-9 w-9 transition-transform duration-200 hover:scale-105 cursor-pointer">
                <AvatarFallback className="bg-primary/10 text-primary">
                  <User className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/settings?tab=profile')} className="cursor-pointer">
                <User className="h-4 w-4 mr-2" />
                Profile
              </DropdownMenuItem>
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
  );
}
