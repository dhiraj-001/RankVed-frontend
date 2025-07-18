import { useState, useEffect } from 'react';
import { Save, User, Building, Bell, Palette, X, Info } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { fileToDataURI, compressAndConvertToDataURI } from '@/lib/utils';
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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-white">
        <div className="text-lg text-slate-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl border border-slate-100">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
                        {agencySettings.agencyLogo ? (
                            <img
                              src={agencySettings.agencyLogo}
                              alt="Agency Logo"
                className="w-24 h-24 rounded-full object-cover border-2 border-blue-200 shadow"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold">
                <Building className="h-12 w-12" />
              </div>
            )}
            {agencySettings.agencyLogo && (
                            <Button
                              size="sm"
                              variant="destructive"
                className="absolute -top-2 -right-2 rounded-full w-7 h-7 p-0"
                              onClick={removeLogo}
                            >
                <X className="h-4 w-4" />
                            </Button>
            )}
                          </div>
          <label className="block w-full">
            <span className="block text-sm font-medium text-slate-700 mb-1">Agency Logo</span>
                          <Input
                            type="file"
                            accept="image/*"
              onChange={handleLogoUpload}
              className="w-full"
            />
          </label>
          <div className="w-full mt-2">
            <label htmlFor="agencyName" className="block text-sm font-medium text-slate-700 mb-1">Agency Name</label>
            <Input
              id="agencyName"
              value={agencySettings.agencyName}
              onChange={e => setAgencySettings(prev => ({ ...prev, agencyName: e.target.value }))}
              placeholder="Your Agency Name"
              className="w-full"
                          />
                        </div>
          <div className="w-full mt-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <div className="w-full px-3 py-2 rounded bg-slate-100 text-slate-700 text-base border border-slate-200">{clerkUser?.primaryEmailAddress?.emailAddress || clerkUser?.emailAddresses?.[0]?.emailAddress || 'N/A'}</div>
          </div>
          <Button
            className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg shadow"
            onClick={handleSaveAgency}
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
}