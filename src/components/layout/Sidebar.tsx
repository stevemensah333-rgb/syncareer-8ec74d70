
import React from 'react';
import { 
  Home, Users, Briefcase, GraduationCap, Trophy, 
  BarChart, Brain, Settings, ChevronRight, ChevronLeft, Sparkles,
  Building2, TrendingUp, FileText, UserPlus, Star
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Link, useLocation } from 'react-router-dom';
import { useUserProfile } from '@/contexts/UserProfileContext';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  className?: string;
}

interface NavItem {
  title: string;
  icon: React.ElementType;
  href: string;
}

export function Sidebar({ isCollapsed, onToggle, className }: SidebarProps) {
  const location = useLocation();
  const { profile } = useUserProfile();
  
  const isEmployer = profile?.user_type === 'employer';
  const isCounsellor = profile?.user_type === 'career_counsellor';
  
  // Navigation items for job seekers (students, professionals)
  const jobSeekerNavItems: NavItem[] = [
    {
      title: 'Feed',
      icon: Home,
      href: '/',
    },
    {
      title: 'My Skills',
      icon: Trophy,
      href: '/skills',
    },
    {
      title: 'Learn',
      icon: GraduationCap,
      href: '/learn',
    },
    {
      title: 'Opportunities',
      icon: Briefcase,
      href: '/opportunities',
    },
    {
      title: 'Portfolio',
      icon: BarChart,
      href: '/portfolio',
    },
    {
      title: 'Performance',
      icon: BarChart,
      href: '/performance',
    },
    {
      title: 'Analysis',
      icon: Brain,
      href: '/analysis',
    },
    {
      title: 'SkillBridge AI',
      icon: Sparkles,
      href: '/ai-coach',
    },
    {
      title: 'Settings',
      icon: Settings,
      href: '/settings',
    }
  ];

  // Navigation items for employers
  const employerNavItems: NavItem[] = [
    {
      title: 'Feed',
      icon: Home,
      href: '/',
    },
    {
      title: 'My Company',
      icon: Building2,
      href: '/my-company',
    },
    {
      title: 'Train',
      icon: GraduationCap,
      href: '/train',
    },
    {
      title: 'Post a Job',
      icon: FileText,
      href: '/post-job',
    },
    {
      title: 'Portfolio',
      icon: BarChart,
      href: '/portfolio',
    },
    {
      title: 'Performance',
      icon: BarChart,
      href: '/performance',
    },
    {
      title: 'Talent Insights',
      icon: TrendingUp,
      href: '/talent-insights',
    },
    {
      title: 'Hire with AI',
      icon: UserPlus,
      href: '/hire-ai',
    },
    {
      title: 'Settings',
      icon: Settings,
      href: '/settings',
    }
  ];

  // Navigation items for counsellors
  const counsellorNavItems: NavItem[] = [
    {
      title: 'Feed',
      icon: Home,
      href: '/',
    },
    {
      title: 'My Portfolio',
      icon: Users,
      href: '/counsellor-dashboard',
    },
    {
      title: 'Ratings',
      icon: Star,
      href: '/counsellor-dashboard',
    },
    {
      title: 'Settings',
      icon: Settings,
      href: '/settings',
    }
  ];

  const getNavItems = () => {
    if (isEmployer) return employerNavItems;
    if (isCounsellor) return counsellorNavItems;
    return jobSeekerNavItems;
  };

  const navItems = getNavItems();

  const getProgressText = () => {
    if (isEmployer) {
      return (
        <>
          <p className="font-medium">Employer Dashboard</p>
          <p>3 active job posts</p>
          <p className="text-[10px]">12 new applications</p>
        </>
      );
    }
    if (isCounsellor) {
      return (
        <>
          <p className="font-medium">Counsellor Dashboard</p>
          <p>Your profile is live</p>
          <p className="text-[10px]">Check your bookings</p>
        </>
      );
    }
    return (
      <>
        <p className="font-medium">Your Progress</p>
        <p>5-day streak 🔥</p>
        <p className="text-[10px]">Keep learning!</p>
      </>
    );
  };

  return (
    <aside className={cn(
      "bg-sidebar text-sidebar-foreground relative transition-all duration-300 ease-in-out flex flex-col border-r border-sidebar-border",
      isCollapsed ? "w-16" : "w-64",
      className
    )}>
      <div className="flex h-16 items-center justify-center border-b border-sidebar-border">
        <h2 className={cn(
          "font-semibold tracking-tight transition-opacity duration-200",
          isCollapsed ? "opacity-0" : "opacity-100"
        )}>
          SkillBridge
        </h2>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className={cn(
            "absolute right-2 text-sidebar-foreground h-8 w-8",
            isCollapsed ? "right-2" : "right-4"
          )}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
      
      <ScrollArea className="flex-1 py-4">
        <nav className="grid gap-1 px-2">
          {navItems.map((item, index) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={index}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground",
                  isCollapsed && "justify-center px-0"
                )}
              >
                <item.icon className={cn("h-5 w-5 shrink-0")} />
                <span className={cn(
                  "text-sm font-medium transition-opacity duration-200",
                  isCollapsed ? "opacity-0 w-0" : "opacity-100"
                )}>
                  {item.title}
                </span>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>
      
      <div className="p-4 border-t border-sidebar-border">
        <div className={cn(
          "transition-opacity duration-200 rounded-md bg-sidebar-accent/50 p-2 text-xs text-sidebar-accent-foreground",
          isCollapsed ? "opacity-0" : "opacity-100"
        )}>
          {getProgressText()}
        </div>
      </div>
    </aside>
  );
}
