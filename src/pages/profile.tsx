import { useState, useEffect } from 'react';
import { Building, X, User, Mail, Save, Upload, Shield, Settings, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { compressAndConvertToDataURI } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@clerk/clerk-react';

export default function Profile() {
  const { user: clerkUser, isLoaded } = useUser();
  const { toast } = useToast();
  const [agencySettings, setAgencySettings] = useState({
    agencyName: '',
    agencyLogo: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  // Fetch agency settings from backend on mount
  useEffect(() => {
    if (!isLoaded || !clerkUser) return;
    setIsLoading(true);
    const fetchAgencySettings = async () => {
      try {
        const apiUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000';
        const response = await fetch(`${apiUrl}/api/users/1`, {
          method: 'GET',
          credentials: 'include',
        });
        
        if (!response.ok) throw new Error('Failed to fetch agency settings');
        const data = await response.json();
        setAgencySettings({
          agencyName: data.user?.agencyName || '',
          agencyLogo: data.user?.agencyLogo || '',
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to fetch agency settings.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchAgencySettings();
  }, [clerkUser, isLoaded]);

  const handleSaveAgency = async () => {
    if (!isLoaded || !clerkUser) {
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
      const response = await fetch(`${apiUrl}/api/users/1`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          agencyName: agencySettings.agencyName,
          agencyLogo: agencySettings.agencyLogo,
        }),
      });
      if (!response.ok) throw new Error('Failed to update agency settings');
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

  // Handle logo upload and preview
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const dataUri = await compressAndConvertToDataURI(file, 128, 128, 0.7);
        setAgencySettings(prev => ({ ...prev, agencyLogo: dataUri }));
      } catch (error) {
        toast({ title: 'Error', description: 'Failed to process agency logo.', variant: 'destructive' });
      }
    }
  };

  const removeLogo = () => {
    setAgencySettings(prev => ({ ...prev, agencyLogo: '' }));
    toast({ title: 'Logo removed', description: 'Your agency logo has been removed.' });
  };

  if (!isLoaded) {
    return (
      <div className="flex-1 bg-gradient-to-br from-slate-50 to-white min-h-screen">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-lg text-slate-600">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gradient-to-br from-blue-50 to-white min-h-screen">
      {/* Header */}
      <header className="hidden sm:block backdrop-blur-md bg-gradient-to-br from-blue-50 via-white to-white border-b border-blue-50 px-4 sm:px-6 py-2 sm:py-4 sticky top-0 z-20 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between max-w-7xl mx-auto gap-2 sm:gap-4">
          <div className="text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Profile Settings</h2>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <Button variant="outline" asChild className="px-3 py-1.5 border-blue-200 text-blue-700 hover:bg-blue-50">
              <a href="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Back to Dashboard</span>
                <span className="sm:hidden">Back</span>
              </a>
            </Button>
            <Button 
              onClick={handleSaveAgency} 
              disabled={isLoading} 
              className="bg-blue-600 hover:bg-blue-700 text-white border-none px-3 py-1.5"
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Header */}
      <div className="sm:hidden bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 ">Profile</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="border-blue-200 text-blue-700 hover:bg-blue-50">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <Button 
              size="sm"
              onClick={handleSaveAgency} 
              disabled={isLoading} 
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5"
            >
              <Save className="h-4 w-4 mr-1" />
              {isLoading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
        {/* User Info Card */}
        <Card className="shadow-md rounded-lg border border-gray-200 bg-white animate-in fade-in duration-700 ease-in-out">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gray-900 font-semibold text-lg">
              <User className="h-5 w-5 text-blue-600" />
              <span>Account Information</span>
            </CardTitle>
            <p className="text-gray-600 text-sm">Your personal account details and email address</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="h-4 w-4 text-blue-600" />
                  <Label className="text-sm font-medium text-gray-700">Email Address</Label>
                </div>
                <p className="text-gray-900 font-medium break-all">
                  {clerkUser?.primaryEmailAddress?.emailAddress || clerkUser?.emailAddresses?.[0]?.emailAddress || 'N/A'}
                </p>
                <Badge variant="secondary" className="mt-2 bg-green-100 text-green-700 border-green-200">
                  Verified
                </Badge>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <Label className="text-sm font-medium text-gray-700">Account Status</Label>
                </div>
                <p className="text-gray-900 font-medium">Active</p>
                
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Agency Branding Card */}
        <Card className="shadow-md rounded-lg border border-gray-200 bg-white animate-in fade-in duration-700 ease-in-out delay-100">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gray-900 font-semibold text-lg">
              <Building className="h-5 w-5 text-blue-600" />
              <span>Agency Branding</span>
            </CardTitle>
            <p className="text-gray-600 text-sm">Customize your agency logo and name for branding</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Logo Upload Section */}
            <div className="flex flex-col sm:flex-row sm:items-start gap-6">
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  {agencySettings.agencyLogo ? (
                    <img
                      src={agencySettings.agencyLogo}
                      alt="Agency Logo"
                      className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-blue-200 shadow-md"
                    />
                  ) : (
                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-md">
                      <Building className="h-12 w-12 sm:h-16 sm:w-16" />
                    </div>
                  )}
                  {agencySettings.agencyLogo && (
                    <Button
                      size="sm"
                      variant="destructive"
                      className="absolute -top-2 -right-2 rounded-full w-8 h-8 p-0 shadow-md hover:shadow-lg transition-all duration-200"
                      onClick={removeLogo}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="text-center">
                  <Label htmlFor="logo-upload" className="cursor-pointer">
                    <div className="flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-all duration-200">
                      <Upload className="h-4 w-4" />
                      <span className="text-sm font-medium">Upload Logo</span>
                    </div>
                  </Label>
                  <Input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  <p className="text-xs text-gray-500 mt-2">PNG, JPG up to 2MB</p>
                </div>
              </div>

              <div className="flex-1 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="agencyName" className="text-gray-700 font-medium">
                    Agency Name
                  </Label>
                  <Input
                    id="agencyName"
                    value={agencySettings.agencyName}
                    onChange={e => setAgencySettings(prev => ({ ...prev, agencyName: e.target.value }))}
                    placeholder="Enter your agency name"
                    className="border-gray-200 focus:ring-2 focus:ring-blue-200 focus:border-blue-200 rounded-lg transition-all duration-200 hover:border-blue-200"
                  />
                  <p className="text-xs text-gray-500">
                    This name will appear in your chatbot branding and embed codes
                  </p>
                </div>

                <Alert className="bg-blue-50 border-blue-200 rounded-lg">
                  <AlertDescription className="text-sm">
                    <strong>Tip:</strong> Your agency branding will be used across all your chatbots and embed codes. 
                    Make sure to use a high-quality logo for the best appearance.
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Settings Preview Card */}
        <Card className="shadow-md rounded-lg border border-gray-200 bg-white animate-in fade-in duration-700 ease-in-out delay-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gray-900 font-semibold text-lg">
              <Settings className="h-5 w-5 text-blue-600" />
              <span>Branding Preview</span>
            </CardTitle>
            <p className="text-gray-600 text-sm">How your agency branding will appear to users</p>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <div className="flex items-center gap-4 mb-4">
                {agencySettings.agencyLogo ? (
                  <img
                    src={agencySettings.agencyLogo}
                    alt="Agency Logo"
                    className="w-12 h-12 rounded-full object-cover border-2 border-blue-200"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white">
                    <Building className="h-6 w-6" />
                  </div>
                )}
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {agencySettings.agencyName || 'Your Agency Name'}
                  </h4>
                  <p className="text-sm text-gray-600">Powered by RankVed</p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-sm text-gray-600 italic">
                  "This is how your agency branding will appear in chatbot windows and embed codes"
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}