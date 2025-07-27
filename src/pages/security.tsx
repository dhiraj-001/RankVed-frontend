import { useState, useEffect } from 'react';
import { Shield, Globe, Plus, X, Save, AlertTriangle, Lock, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useApp } from '@/contexts/app-context';
import { useUpdateChatbot, useChatbot } from '@/hooks/use-chatbots';
import { useToast } from '@/hooks/use-toast';
import { TooltipProvider } from '@/components/ui/tooltip';

export default function Security() {
  const { activeChatbot } = useApp();
  const updateChatbot = useUpdateChatbot();
  const { toast } = useToast();
  const { data: fetchedChatbot, refetch } = useChatbot(activeChatbot?.id || "");

  const [allowedDomains, setAllowedDomains] = useState<string[]>([]);
  const [newDomain, setNewDomain] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Sync allowedDomains state with fetchedChatbot
  useEffect(() => {
    if (fetchedChatbot) {
      setAllowedDomains(fetchedChatbot.allowedDomains || []);
    }
  }, [fetchedChatbot]);

  const validateDomain = (domain: string): boolean => {
    const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i;
    return domainRegex.test(domain);
  };

  const addDomain = () => {
    if (!newDomain.trim()) return;
    
    const cleanDomain = newDomain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '');
    
    if (!validateDomain(cleanDomain)) {
      toast({
        title: 'Invalid domain',
        description: 'Please enter a valid domain name (e.g., example.com)',
        variant: 'destructive',
      });
      return;
    }

    if (allowedDomains.includes(cleanDomain)) {
      toast({
        title: 'Domain already exists',
        description: 'This domain is already in your allowed list.',
        variant: 'destructive',
      });
      return;
    }

    setAllowedDomains([...allowedDomains, cleanDomain]);
    setNewDomain('');
  };

  const removeDomain = (domain: string) => {
    setAllowedDomains(allowedDomains.filter(d => d !== domain));
  };

  const handleSave = async () => {
    if (!activeChatbot) {
      toast({
        title: 'No chatbot selected',
        description: 'Please select a chatbot to configure security settings.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      await updateChatbot.mutateAsync({
        id: activeChatbot.id,
        data: {
          allowedDomains: allowedDomains,
        },
      });

      toast({
        title: 'Security settings saved',
        description: 'Domain restrictions have been updated successfully.',
      });
      refetch(); // Refetch latest data after save
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save security settings. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!activeChatbot) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-50 to-white min-h-screen">
        <div className="text-center px-4">
          <Shield className="h-16 w-16 text-gray-300 mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-gray-900 mb-2">No Active Chatbot</h3>
          <p className="text-gray-500 mb-4">Please select a chatbot to configure security settings.</p>
          <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200">
            <a href="/chatbots">Go to Chatbots</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex-1 bg-gradient-to-br from-blue-50 to-white min-h-screen">
        {/* Header */}
        <header className="hidden sm:block backdrop-blur-md bg-gradient-to-br from-blue-50 via-white to-white border-b border-blue-50 px-4 sm:px-6 py-2 sm:py-4 sticky top-0 z-20 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between max-w-7xl mx-auto gap-2 sm:gap-4">
            <div className="text-center sm:text-left">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Security Settings</h2>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <Button 
                onClick={handleSave} 
                disabled={isLoading} 
                className="bg-blue-600 hover:bg-blue-700 text-white border-none px-3 py-1.5"
                aria-label="Save security settings"
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
            <h2 className="text-lg font-bold text-slate-900">Security</h2>
            <div className="flex items-center gap-2">
              <Button 
                size="sm"
                onClick={handleSave} 
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
          {/* Domain Restrictions Card */}
          <Card className="shadow-md rounded-lg border border-gray-200 bg-white animate-in fade-in duration-700 ease-in-out">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-gray-900 font-semibold text-lg">
                <Globe className="h-5 w-5 text-blue-600" />
                <span>Domain Restrictions</span>
              </CardTitle>
              <p className="text-gray-600 text-sm">Restrict your chatbot to work only on specific domains for enhanced security</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="domain-input" className="text-gray-700 font-medium">Allowed Domains</Label>
                <p className="text-xs text-gray-500">Leave empty to allow all domains. Add specific domains to restrict access.</p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    id="domain-input"
                    placeholder="example.com"
                    value={newDomain}
                    onChange={(e) => setNewDomain(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addDomain()}
                    className="border-gray-200 focus:ring-2 focus:ring-blue-200 focus:border-blue-200 rounded-lg transition-all duration-200 hover:border-blue-200 flex-1"
                  />
                  <Button 
                    onClick={addDomain} 
                    variant="outline" 
                    className="border-blue-200 hover:border-blue-300 hover:bg-blue-50 text-blue-700 rounded-lg transition-all duration-200 px-4 py-2"
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Domain
                  </Button>
                </div>
              </div>
              
              {allowedDomains.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-gray-700 font-medium">Current Allowed Domains ({allowedDomains.length})</Label>
                  <div className="flex flex-wrap gap-2">
                    {allowedDomains.map((domain) => (
                      <Badge 
                        key={domain} 
                        variant="secondary" 
                        className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-all duration-200"
                      >
                        <CheckCircle className="h-3 w-3 text-blue-600" />
                        <span>{domain}</span>
                        <button
                          onClick={() => removeDomain(domain)}
                          className="ml-1 text-blue-400 hover:text-red-500 transition-colors p-1 rounded"
                          aria-label={`Remove ${domain}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <Alert className="bg-blue-50 border-blue-200 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-sm">
                  <strong>Important:</strong> Once you add domains, your chatbot will only work on those specific domains. Make sure to include all domains where you want the chatbot to appear.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Security Best Practices Card */}
          <Card className="shadow-md rounded-lg border border-gray-200 bg-white animate-in fade-in duration-700 ease-in-out delay-100">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-gray-900 font-semibold text-lg">
                <Shield className="h-5 w-5 text-blue-600" />
                <span>Security Best Practices</span>
              </CardTitle>
              <p className="text-gray-600 text-sm">Follow these guidelines to keep your chatbot secure</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3 bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm">Domain Restrictions</h4>
                      <p className="text-xs text-gray-600 mt-1">Use domain restrictions to prevent unauthorized usage of your chatbot on other websites.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm">Regular Reviews</h4>
                      <p className="text-xs text-gray-600 mt-1">Regularly review your allowed domains and remove any that are no longer needed.</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm">Subdomain Control</h4>
                      <p className="text-xs text-gray-600 mt-1">Consider using subdomains (e.g., www.example.com) if you need more specific control.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm">Usage Monitoring</h4>
                      <p className="text-xs text-gray-600 mt-1">Monitor your chatbot usage through the dashboard to detect any unauthorized access.</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Status Card */}
          <Card className="shadow-md rounded-lg border border-gray-200 bg-white animate-in fade-in duration-700 ease-in-out delay-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-gray-900 font-semibold text-lg">
                <Lock className="h-5 w-5 text-blue-600" />
                <span>Security Status</span>
              </CardTitle>
              <p className="text-gray-600 text-sm">Current security configuration overview</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-3 h-3 rounded-full ${allowedDomains.length > 0 ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                    <span className="text-sm font-medium text-gray-900">Domain Restrictions</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    {allowedDomains.length > 0 
                      ? `${allowedDomains.length} domain(s) configured` 
                      : 'No restrictions (all domains allowed)'}
                  </p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-sm font-medium text-gray-900">Access Control</span>
                  </div>
                  <p className="text-xs text-gray-600">Active and monitoring</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-sm font-medium text-gray-900">Security Level</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    {allowedDomains.length > 0 ? 'Enhanced' : 'Standard'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  );
}