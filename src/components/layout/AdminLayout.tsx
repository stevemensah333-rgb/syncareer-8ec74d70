import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import syncareerLogo from '@/assets/syncareer-logo.png';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

export function AdminLayout({ children, title }: AdminLayoutProps) {
  const navigate = useNavigate();

  const handleSignOut = () => {
    sessionStorage.removeItem('syncareer_admin_access');
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
              <img src={syncareerLogo} alt="Syncareer" className="h-8 w-auto object-contain" />
              <span className="text-sm font-semibold text-foreground">Syncareer</span>
            <span className="text-muted-foreground mx-1">·</span>
            <span className="text-sm text-muted-foreground">Admin Dashboard</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="text-muted-foreground hover:text-foreground gap-2"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </header>

      {/* Page Content */}
      <main className="container mx-auto px-6 py-8">
        <h1 className="text-xl font-semibold text-foreground mb-6">{title}</h1>
        {children}
      </main>
    </div>
  );
}
