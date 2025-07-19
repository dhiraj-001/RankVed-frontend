import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/app-context';
import { useChatbots } from '@/hooks/use-chatbots';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { 
  Bot, 
  LogOut,
} from 'lucide-react';
import { useClerk, useUser } from '@clerk/clerk-react';

export function Header() {
  const { activeChatbot, setActiveChatbot } = useApp();
  const { data: chatbots } = useChatbots();
  const { signOut } = useClerk();
  const { user } = useUser();
  const [agency, setAgency] = useState<{ name: string; logo: string }>({ name: '', logo: '' });

  useEffect(() => {
    const fetchAgency = async () => {
      try {
        const apiUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000';
        const userId = 1;
        const res = await fetch(`${apiUrl}/api/users/${userId}`, { credentials: 'include' });
        if (!res.ok) return;
        const data = await res.json();
        setAgency({ name: data.user?.agencyName || 'RankVed', logo: data.user?.agencyLogo || '' });
      } catch (e) {
        setAgency({ name: 'RankVed', logo: '' });
      }
    };
    fetchAgency();
  }, []);

  return (
    <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 sm:py-4 z-40">
      {/* Mobile Layout */}
      <div className="flex flex-col space-y-3 sm:hidden">
        {/* Top row - Branding and User */}
        <div className="flex items-center justify-between">
          {/* Branding */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-blue-600 flex items-center justify-center overflow-hidden">
              {agency.logo ? (
                <img src={agency.logo} alt="Agency Logo" className="w-8 h-8 sm:w-10 sm:h-10 object-cover rounded-lg" />
              ) : (
                <Bot className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              )}
            </div>
            <div>
              <h1 className="font-semibold text-slate-900 text-base sm:text-lg">{agency.name || 'RankVed'}</h1>
              <p className="text-xs text-slate-500">AI Platform</p>
            </div>
          </div>

          {/* User Profile - Mobile */}
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm"  
              onClick={() => signOut()} 
              className="text-blue-600 hover:text-slate-600 p-2"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Bottom row - Chatbot Selector */}
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-slate-600 whitespace-nowrap">Active:</span>
          <Select
            value={activeChatbot?.id || ''}
            onValueChange={(value) => {
              const chatbot = chatbots?.find(c => c.id === value);
              setActiveChatbot(chatbot || null);
            }}
          >
            <SelectTrigger className="flex-1 min-w-0">
              <SelectValue placeholder="Select a chatbot" />
            </SelectTrigger>
            <SelectContent>
              {chatbots?.map((chatbot) => (
                <SelectItem key={chatbot.id} value={chatbot.id}>
                  {chatbot.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden sm:flex items-center justify-between">
        {/* Left side - Branding and Chatbot Selector */}
        <div className="flex items-center space-x-4 lg:space-x-6">
          {/* Branding */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center overflow-hidden">
              {agency.logo ? (
                <img src={agency.logo} alt="Agency Logo" className="w-10 h-10 object-cover rounded-lg" />
              ) : (
                <Bot className="h-6 w-6 text-white" />
              )}
            </div>
            <div>
              <h1 className="font-semibold text-slate-900 text-lg">{agency.name || 'RankVed'}</h1>
              <p className="text-xs text-slate-500">AI Platform</p>
            </div>
          </div>

          {/* Divider */}
          <div className="w-px h-8 bg-slate-300"></div>

          {/* Active Chatbot Selector */}
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium text-slate-600 whitespace-nowrap">Active Chatbot:</span>
            <Select
              value={activeChatbot?.id || ''}
              onValueChange={(value) => {
                const chatbot = chatbots?.find(c => c.id === value);
                setActiveChatbot(chatbot || null);
              }}
            >
              <SelectTrigger className="w-48 lg:w-64">
                <SelectValue placeholder="Select a chatbot" />
              </SelectTrigger>
              <SelectContent>
                {chatbots?.map((chatbot) => (
                  <SelectItem key={chatbot.id} value={chatbot.id}>
                    {chatbot.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Right side - User Profile */}
        <div className="flex items-center space-x-4">
          {/* User Profile */}
          <div className="flex items-center space-x-3">
            <div className="hidden lg:block">
              <p className="text-sm font-medium text-slate-900">
                {user?.primaryEmailAddress?.emailAddress || 'user@example.com'}
              </p>
            </div>
            <Button 
              variant="ghost" 
              size="sm"  
              onClick={() => signOut()} 
              className="text-blue-600 hover:text-slate-600"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
