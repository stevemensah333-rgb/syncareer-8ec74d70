
import React, { useState, useEffect } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Bell, Globe, Lock, User, Settings as SettingsIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type SettingsSection = 'account' | 'notifications' | 'security' | 'regional' | 'preferences';

const Settings = () => {
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState<SettingsSection>('account');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  const [isCompactView, setIsCompactView] = useState(() => {
    const saved = localStorage.getItem('compactView');
    return saved === 'true';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('compactView', isCompactView.toString());
    // Apply compact view class to body or root element
    if (isCompactView) {
      document.body.classList.add('compact-view');
    } else {
      document.body.classList.remove('compact-view');
    }
  }, [isCompactView]);

  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated successfully.",
    });
  };
  return (
    <PageLayout title="Settings">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-card rounded-lg p-6 shadow">
            <h2 className="text-xl font-semibold mb-4">Settings</h2>
            <nav className="space-y-2">
              <Button 
                variant={activeSection === 'account' ? 'secondary' : 'ghost'} 
                className="w-full justify-start" 
                size="lg"
                onClick={() => setActiveSection('account')}
              >
                <User className="mr-2 h-5 w-5" />
                Account
              </Button>
              <Button 
                variant={activeSection === 'notifications' ? 'secondary' : 'ghost'} 
                className="w-full justify-start" 
                size="lg"
                onClick={() => setActiveSection('notifications')}
              >
                <Bell className="mr-2 h-5 w-5" />
                Notifications
              </Button>
              <Button 
                variant={activeSection === 'security' ? 'secondary' : 'ghost'} 
                className="w-full justify-start" 
                size="lg"
                onClick={() => setActiveSection('security')}
              >
                <Lock className="mr-2 h-5 w-5" />
                Security
              </Button>
              <Button 
                variant={activeSection === 'regional' ? 'secondary' : 'ghost'} 
                className="w-full justify-start" 
                size="lg"
                onClick={() => setActiveSection('regional')}
              >
                <Globe className="mr-2 h-5 w-5" />
                Regional Settings
              </Button>
              <Button 
                variant={activeSection === 'preferences' ? 'secondary' : 'ghost'} 
                className="w-full justify-start" 
                size="lg"
                onClick={() => setActiveSection('preferences')}
              >
                <SettingsIcon className="mr-2 h-5 w-5" />
                Preferences
              </Button>
            </nav>
          </div>
        </div>
        
        <div className="lg:col-span-2">
          <div className="bg-card rounded-lg p-6 shadow">
            {activeSection === 'account' && (
              <>
                <h2 className="text-xl font-semibold mb-6">Account Settings</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">First Name</label>
                        <input 
                          type="text" 
                          defaultValue="John"
                          className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Last Name</label>
                        <input 
                          type="text" 
                          defaultValue="Smith"
                          className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input 
                          type="email" 
                          defaultValue="john.smith@example.com"
                          className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Phone</label>
                        <input 
                          type="text" 
                          defaultValue="+1 (555) 123-4567"
                          className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground" 
                        />
                      </div>
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    <Button onClick={handleSave}>Save Changes</Button>
                    <Button variant="outline" className="ml-2">Cancel</Button>
                  </div>
                </div>
              </>
            )}

            {activeSection === 'notifications' && (
              <>
                <h2 className="text-xl font-semibold mb-6">Notification Settings</h2>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b">
                      <div>
                        <p className="font-medium">Email Notifications</p>
                        <p className="text-sm text-muted-foreground">Receive updates via email</p>
                      </div>
                      <input type="checkbox" defaultChecked className="h-4 w-4" />
                    </div>
                    <div className="flex items-center justify-between py-3 border-b">
                      <div>
                        <p className="font-medium">Push Notifications</p>
                        <p className="text-sm text-muted-foreground">Receive browser notifications</p>
                      </div>
                      <input type="checkbox" defaultChecked className="h-4 w-4" />
                    </div>
                    <div className="flex items-center justify-between py-3 border-b">
                      <div>
                        <p className="font-medium">Weekly Digest</p>
                        <p className="text-sm text-muted-foreground">Weekly summary of activity</p>
                      </div>
                      <input type="checkbox" className="h-4 w-4" />
                    </div>
                    <div className="flex items-center justify-between py-3">
                      <div>
                        <p className="font-medium">Marketing Emails</p>
                        <p className="text-sm text-muted-foreground">Receive promotional content</p>
                      </div>
                      <input type="checkbox" className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    <Button onClick={handleSave}>Save Changes</Button>
                    <Button variant="outline" className="ml-2">Cancel</Button>
                  </div>
                </div>
              </>
            )}

            {activeSection === 'security' && (
              <>
                <h2 className="text-xl font-semibold mb-6">Security Settings</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Change Password</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Current Password</label>
                        <input 
                          type="password" 
                          className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">New Password</label>
                        <input 
                          type="password" 
                          className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Confirm New Password</label>
                        <input 
                          type="password" 
                          className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground" 
                        />
                      </div>
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    <h3 className="text-lg font-medium mb-4">Two-Factor Authentication</h3>
                    <p className="text-sm text-muted-foreground mb-4">Add an extra layer of security to your account</p>
                    <Button variant="outline">Enable 2FA</Button>
                  </div>
                  <div className="pt-4 border-t">
                    <Button onClick={handleSave}>Save Changes</Button>
                    <Button variant="outline" className="ml-2">Cancel</Button>
                  </div>
                </div>
              </>
            )}

            {activeSection === 'regional' && (
              <>
                <h2 className="text-xl font-semibold mb-6">Regional Settings</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-1">Language</label>
                    <select className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground">
                      <option>English (US)</option>
                      <option>English (UK)</option>
                      <option>Afrikaans</option>
                      <option>Zulu</option>
                      <option>Xhosa</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Timezone</label>
                    <select className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground">
                      <option>Africa/Johannesburg (SAST)</option>
                      <option>UTC</option>
                      <option>Europe/London (GMT)</option>
                      <option>America/New_York (EST)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Date Format</label>
                    <select className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground">
                      <option>DD/MM/YYYY</option>
                      <option>MM/DD/YYYY</option>
                      <option>YYYY-MM-DD</option>
                    </select>
                  </div>
                  <div className="pt-4 border-t">
                    <Button onClick={handleSave}>Save Changes</Button>
                    <Button variant="outline" className="ml-2">Cancel</Button>
                  </div>
                </div>
              </>
            )}

            {activeSection === 'preferences' && (
              <>
                <h2 className="text-xl font-semibold mb-6">Preferences</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Display Settings</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Dark Mode</p>
                          <p className="text-sm text-muted-foreground">Switch between light and dark theme</p>
                        </div>
                        <div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              className="sr-only peer" 
                              checked={isDarkMode}
                              onChange={(e) => setIsDarkMode(e.target.checked)}
                            />
                            <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-background after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                          </label>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Compact View</p>
                          <p className="text-sm text-muted-foreground">Show more data with less spacing</p>
                        </div>
                        <div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              className="sr-only peer" 
                              checked={isCompactView}
                              onChange={(e) => setIsCompactView(e.target.checked)}
                            />
                            <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-background after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    <Button onClick={handleSave}>Save Changes</Button>
                    <Button variant="outline" className="ml-2">Cancel</Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Settings;
