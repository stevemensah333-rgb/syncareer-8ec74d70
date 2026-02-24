import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Smartphone, Monitor, Share, MoreVertical, PlusSquare, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function Install() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [platform, setPlatform] = useState<'ios' | 'android' | 'desktop'>('desktop');

  useEffect(() => {
    // Detect platform
    const ua = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) {
      setPlatform('ios');
    } else if (/android/.test(ua)) {
      setPlatform('android');
    } else {
      setPlatform('desktop');
    }

    // Listen for install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  if (isInstalled) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-6 space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Smartphone className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold">Already Installed!</h2>
            <p className="text-muted-foreground text-sm">
              Syncareer is installed on your device. Open it from your home screen.
            </p>
            <Link to="/">
              <Button variant="outline" className="mt-4">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to App
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-2xl mx-auto px-4 py-12 space-y-8">
        <div className="text-center space-y-3">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Download className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Install Syncareer</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Add Syncareer to your home screen for a faster, app-like experience — no app store needed.
          </p>
        </div>

        {/* Direct install button (Android/Desktop Chrome) */}
        {deferredPrompt && (
          <div className="flex justify-center">
            <Button size="lg" onClick={handleInstall} className="gap-2">
              <Download className="h-5 w-5" />
              Install Now
            </Button>
          </div>
        )}

        {/* Platform-specific instructions */}
        <div className="space-y-4">
          {/* iOS Instructions */}
          {(platform === 'ios' || platform === 'desktop') && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-primary" />
                  iPhone / iPad (Safari)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Step number={1} icon={<Share className="h-4 w-4" />}>
                  Tap the <strong>Share</strong> button at the bottom of Safari
                </Step>
                <Step number={2} icon={<PlusSquare className="h-4 w-4" />}>
                  Scroll down and tap <strong>"Add to Home Screen"</strong>
                </Step>
                <Step number={3}>
                  Tap <strong>"Add"</strong> in the top right corner
                </Step>
              </CardContent>
            </Card>
          )}

          {/* Android Instructions */}
          {(platform === 'android' || platform === 'desktop') && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-primary" />
                  Android (Chrome)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Step number={1} icon={<MoreVertical className="h-4 w-4" />}>
                  Tap the <strong>three dots menu</strong> (⋮) in Chrome
                </Step>
                <Step number={2}>
                  Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>
                </Step>
                <Step number={3}>
                  Tap <strong>"Install"</strong> to confirm
                </Step>
              </CardContent>
            </Card>
          )}

          {/* Desktop Instructions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Monitor className="h-5 w-5 text-primary" />
                Desktop (Chrome / Edge)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Step number={1}>
                Look for the <strong>install icon</strong> (⊕) in the address bar
              </Step>
              <Step number={2}>
                Click <strong>"Install"</strong> in the popup
              </Step>
            </CardContent>
          </Card>
        </div>

        <div className="text-center pt-4">
          <Link to="/">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Back to Syncareer
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function Step({ number, icon, children }: { number: number; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center mt-0.5">
        {number}
      </span>
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        {icon}
        <span>{children}</span>
      </div>
    </div>
  );
}
