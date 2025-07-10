import { useState, useEffect } from 'react';
import { Save, Upload, User, Building, Mail, Shield, Bell, Palette, Globe, Camera, Trash2, Check, X, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useApp } from '@/contexts/app-context';
import { useUser } from '@clerk/clerk-react';
import { fileToDataURI } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function Profile() {
  const { user: appUser, setUser, refreshUser } = useApp();
  const { user: clerkUser } = useUser();
  const { toast } = useToast();

  // Agency branding settings (synced with backend)
  const [agencySettings, setAgencySettings] = useState({
    agencyName: appUser?.agencyName || '',
    agencyLogo: appUser?.agencyLogo || '',
  });

  // User preferences (local state only)
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    marketingEmails: false,
    theme: 'light',
    language: 'en',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('agency');

  // Update agency settings when app user changes
  useEffect(() => {
    if (appUser) {
      setAgencySettings({
        agencyName: appUser.agencyName || '',
        agencyLogo: appUser.agencyLogo || '',
      });
    }
  }, [appUser]);

  const handleSaveAgency = async () => {
    if (!appUser) {
      toast({
        title: 'Error',
        description: 'No user session found.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const apiUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/users/${appUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          agencyName: agencySettings.agencyName,
          agencyLogo: agencySettings.agencyLogo,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update agency settings');
      }

      const updatedUser = await response.json();
      setUser(updatedUser.user || updatedUser);
      
      // Refresh user data to ensure persistence
      await refreshUser();
      
      toast({
        title: 'Agency settings saved',
        description: 'Your agency branding has been updated successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save agency settings. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (field: string, file: File) => {
    try {
      const dataUri = await fileToDataURI(file);
      setAgencySettings(prev => ({ ...prev, [field]: dataUri }));
      toast({
        title: 'File uploaded',
        description: 'Your file has been uploaded successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to upload file. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const removeLogo = () => {
    setAgencySettings(prev => ({ ...prev, agencyLogo: '' }));
    toast({
      title: 'Logo removed',
      description: 'Your agency logo has been removed.',
    });
  };

  if (!appUser || !clerkUser) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-50 to-white">
        <div className="text-center">
          <User className="h-16 w-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 mb-2">No User Session</h3>
          <p className="text-slate-500">Please refresh the page or sign in again.</p>
        </div>
      </div>
    );
  }

  // Get user info from Clerk
  const firstName = clerkUser.firstName || '';
  const lastName = clerkUser.lastName || '';
  const email = clerkUser.primaryEmailAddress?.emailAddress || '';
  const username = clerkUser.username || '';
  const userImage = clerkUser.imageUrl;

  return (
    <div className="flex-1 bg-gradient-to-br from-slate-50 to-white min-h-screen">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-6 sticky top-0 z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between max-w-7xl mx-auto gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Profile Settings</h2>
            <p className="text-slate-500 mt-1 text-base font-normal">
              Manage your agency branding and preferences
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => setActiveTab('preview')}>
              <Palette className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button 
              onClick={handleSaveAgency} 
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg shadow-md"
            >
              <Save className="h-5 w-5 mr-2" />
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Profile Overview */}
          <div className="lg:col-span-1">
            <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="relative inline-block">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold mb-4 mx-auto">
                      {userImage ? (
                        <img 
                          src={userImage} 
                          alt="Profile" 
                          className="w-24 h-24 rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-12 w-12" />
                      )}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-1">
                    {firstName && lastName 
                      ? `${firstName} ${lastName}`
                      : username || 'User'
                    }
                  </h3>
                  <p className="text-slate-500 text-sm mb-2">{email}</p>
                  {agencySettings.agencyName && (
                    <Badge variant="secondary" className="text-xs">
                      {agencySettings.agencyName}
                    </Badge>
                  )}
                </div>
                
                <Separator className="my-4" />
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Member since</span>
                    <span className="font-medium">
                      {appUser.createdAt ? new Date(appUser.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Experience</span>
                    <span className="font-medium capitalize">{appUser.experienceLevel || 'Beginner'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Status</span>
                    <Badge variant="default" className="text-xs">
                      Active
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Settings Tabs */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
              <CardContent className="p-6">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="agency" className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      Agency Branding
                    </TabsTrigger>
                    <TabsTrigger value="preferences" className="flex items-center gap-2">
                      <Bell className="h-4 w-4" />
                      Preferences
                    </TabsTrigger>
                    <TabsTrigger value="preview" className="flex items-center gap-2">
                      <Palette className="h-4 w-4" />
                      Preview
                    </TabsTrigger>
                  </TabsList>

                  {/* Agency Branding Tab */}
                  <TabsContent value="agency" className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="agencyName">Agency Name</Label>
                      <Input
                        id="agencyName"
                        value={agencySettings.agencyName}
                        onChange={(e) => setAgencySettings(prev => ({ ...prev, agencyName: e.target.value }))}
                        placeholder="Your Agency Name"
                      />
                      <p className="text-sm text-slate-500">
                        This will appear in the main panel header and throughout the interface
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Agency Logo</Label>
                      <div className="flex items-center gap-4">
                        {agencySettings.agencyLogo ? (
                          <div className="relative">
                            <img
                              src={agencySettings.agencyLogo}
                              alt="Agency Logo"
                              className="w-16 h-16 rounded-lg object-cover border border-slate-200"
                            />
                            <Button
                              size="sm"
                              variant="destructive"
                              className="absolute -top-2 -right-2 rounded-full w-6 h-6 p-0"
                              onClick={removeLogo}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <div className="w-16 h-16 rounded-lg bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center">
                            <Building className="h-6 w-6 text-slate-400" />
                          </div>
                        )}
                        <div className="flex-1">
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload('agencyLogo', file);
                            }}
                          />
                          <p className="text-sm text-slate-500 mt-1">
                            Upload your agency logo (recommended: square format, max 2MB)
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-blue-900 mb-1">Agency Branding</h4>
                          <p className="text-sm text-blue-700">
                            Your agency name and logo will be displayed throughout the platform and in your chatbot widgets. 
                            These settings are saved to your account and synced across all your chatbots.
                          </p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Preferences Tab */}
                  <TabsContent value="preferences" className="space-y-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-slate-900">Notifications</h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="emailNotifications" className="text-sm font-medium">
                              Email Notifications
                            </Label>
                            <p className="text-xs text-slate-500">Receive important updates via email</p>
                          </div>
                          <Switch
                            id="emailNotifications"
                            checked={preferences.emailNotifications}
                            onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, emailNotifications: checked }))}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="marketingEmails" className="text-sm font-medium">
                              Marketing Emails
                            </Label>
                            <p className="text-xs text-slate-500">Receive promotional content and updates</p>
                          </div>
                          <Switch
                            id="marketingEmails"
                            checked={preferences.marketingEmails}
                            onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, marketingEmails: checked }))}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-4">
                      <h4 className="font-semibold text-slate-900">Appearance</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="theme">Theme</Label>
                          <Select value={preferences.theme} onValueChange={(value) => setPreferences(prev => ({ ...prev, theme: value }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select theme" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="light">Light</SelectItem>
                              <SelectItem value="dark">Dark</SelectItem>
                              <SelectItem value="auto">Auto</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="language">Language</Label>
                          <Select value={preferences.language} onValueChange={(value) => setPreferences(prev => ({ ...prev, language: value }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="en">English</SelectItem>
                              <SelectItem value="es">Spanish</SelectItem>
                              <SelectItem value="fr">French</SelectItem>
                              <SelectItem value="de">German</SelectItem>
                              <SelectItem value="ja">Japanese</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Bell className="h-5 w-5 text-amber-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-amber-900 mb-1">Local Preferences</h4>
                          <p className="text-sm text-amber-700">
                            These preferences are stored locally in your browser and are not synced with your account.
                          </p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Preview Tab */}
                  <TabsContent value="preview" className="space-y-6">
                    <div className="text-center py-8">
                      <h4 className="text-lg font-semibold text-slate-900 mb-4">Agency Branding Preview</h4>
                      <div className="max-w-md mx-auto">
                        <Card className="shadow-lg">
                          <CardContent className="p-6">
                            <div className="text-center mb-4">
                              {agencySettings.agencyLogo ? (
                                <img 
                                  src={agencySettings.agencyLogo} 
                                  alt="Agency Logo" 
                                  className="w-16 h-16 rounded-full object-cover mx-auto mb-3"
                                />
                              ) : (
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold mx-auto mb-3">
                                  <Building className="h-8 w-8" />
                                </div>
                              )}
                              <h3 className="text-lg font-semibold text-slate-900">
                                {agencySettings.agencyName || 'Your Agency Name'}
                              </h3>
                              <p className="text-slate-500 text-sm">Agency Branding</p>
                            </div>
                            <div className="text-sm text-slate-600 text-center border-t pt-4">
                              This is how your agency branding will appear in the platform header and chatbot widgets.
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}