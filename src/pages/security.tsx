import { useState } from 'react';
import { Shield, Globe, Plus, X, Save, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useApp } from '@/contexts/app-context';
import { useUpdateChatbot } from '@/hooks/use-chatbots';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function Security() {
  const { activeChatbot } = useApp();
  const updateChatbot = useUpdateChatbot();
  const { toast } = useToast();

  const [allowedDomains, setAllowedDomains] = useState<string[]>(
    activeChatbot?.allowedDomains || []
  );
  const [newDomain, setNewDomain] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-50 to-white min-h-screen">
        <div className="text-center">
          <Shield className="h-16 w-16 text-blue-200 mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-slate-900 mb-2">No Active Chatbot</h3>
          <p className="text-slate-500 mb-4">Please select a chatbot to configure security settings.</p>
          <Button asChild>
            <a href="/chatbots">Go to Chatbots</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      {/* Sticky Glassmorphism Header */}
      <header className="backdrop-blur-md bg-white/80 border-b border-slate-200 px-6 py-5 sticky top-0 z-20 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-blue-600" />
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Security Settings</h2>
            <p className="text-slate-600 mt-1 text-base font-normal">Manage domain restrictions and best practices for <span className="font-semibold">{activeChatbot.name}</span></p>
          </div>
        </div>
      </header>

      <div className="p-6 max-w-3xl mx-auto space-y-8">
        {/* Domain Restrictions Card */}
        <Card className="shadow-lg bg-gradient-to-br from-blue-50 to-white border-0 rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-bold">
              <Globe className="h-6 w-6 text-blue-600" /> Domain Restrictions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="domain-input">Allowed Domains</Label>
              <p className="text-sm text-slate-600 mb-3">Restrict your chatbot to work only on specific domains. Leave empty to allow all domains.</p>
              <div className="flex gap-2">
                <Input
                  id="domain-input"
                  placeholder="example.com"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addDomain()}
                  className="rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                />
                <Button onClick={addDomain} variant="outline" className="rounded-full px-4 py-2">
                  <Plus className="h-4 w-4 mr-2" /> Add
                </Button>
              </div>
            </div>
            {allowedDomains.length > 0 && (
              <div className="space-y-2">
                <Label>Current Allowed Domains</Label>
                <div className="flex flex-wrap gap-2">
                  {allowedDomains.map((domain) => (
                    <Badge key={domain} variant="secondary" className="flex items-center gap-1 rounded-full px-3 py-1 text-base bg-blue-100 text-blue-700 animate-fade-in">
                      <span>{domain}</span>
                      <button
                        onClick={() => removeDomain(domain)}
                        className="ml-1 text-blue-400 hover:text-red-500 transition-colors"
                        aria-label={`Remove ${domain}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            <Alert className="bg-yellow-50 border-yellow-200 mt-4">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <AlertDescription>
                <strong>Important:</strong> Once you add domains, your chatbot will only work on those specific domains. Make sure to include all domains where you want the chatbot to appear.
              </AlertDescription>
            </Alert>
            <div className="flex justify-end">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={handleSave} disabled={isLoading} className="rounded-full px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-all">
                    <Save className="h-5 w-5 mr-2" />
                    {isLoading ? 'Saving...' : 'Save Settings'}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Save Security Settings</TooltipContent>
              </Tooltip>
            </div>
          </CardContent>
        </Card>

        {/* Best Practices Card */}
        <Card className="shadow bg-white/90 border-0 rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-bold">
              <Shield className="h-5 w-5 text-green-600" /> Security Best Practices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-slate-600 space-y-3">
              <li className="flex items-center gap-2 bg-blue-50 rounded-lg px-3 py-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                Use domain restrictions to prevent unauthorized usage of your chatbot on other websites.
              </li>
              <li className="flex items-center gap-2 bg-blue-50 rounded-lg px-3 py-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                Regularly review your allowed domains and remove any that are no longer needed.
              </li>
              <li className="flex items-center gap-2 bg-blue-50 rounded-lg px-3 py-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                Consider using subdomains (e.g., www.example.com) if you need more specific control.
              </li>
              <li className="flex items-center gap-2 bg-blue-50 rounded-lg px-3 py-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                Monitor your chatbot usage through the dashboard to detect any unauthorized access.
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}