import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { useApp } from '@/contexts/app-context';
import { useChatbots } from '@/hooks/use-chatbots';
import { useUser, useClerk } from '@clerk/clerk-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { 
  Bot, 
  BarChart3, 
  Settings, 
  Palette, 
  GitBranch, 
  Brain, 
  Users, 
  Code,
  LogOut,
  User,
  Shield
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
  { name: 'Chatbots', href: '/chatbots', icon: Bot },
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Appearance', href: '/appearance', icon: Palette },
  { name: 'Security', href: '/security', icon: Shield },
  { name: 'Question Flow', href: '/questions', icon: GitBranch },
  { name: 'Training Data', href: '/training', icon: Brain },
  { name: 'Leads', href: '/leads', icon: Users },
  { name: 'Embed Code', href: '/embed', icon: Code },
  { name: 'Profile', href: '/profile', icon: User },
];

export function Sidebar() {
  const [location] = useLocation();
  const { activeChatbot, setActiveChatbot } = useApp();
  const { data: chatbots } = useChatbots();
  const { user } = useUser();
  const { signOut } = useClerk();

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
      {/* Permanent Branding */}
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
            <Bot className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-slate-900 text-lg">RankVed</h1>
            <p className="text-xs text-slate-500">AI Platform</p>
          </div>
        </div>
      </div>

      {/* Active Chatbot Selector */}
      <div className="p-4 border-b border-slate-200">
        <label className="block text-xs font-medium text-slate-600 mb-2">
          Active Chatbot
        </label>
        <Select
          value={activeChatbot?.id || ''}
          onValueChange={(value) => {
            const chatbot = chatbots?.find(c => c.id === value);
            setActiveChatbot(chatbot || null);
          }}
        >
          <SelectTrigger className="w-full">
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

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const isActive = location.startsWith(item.href);
            const Icon = item.icon;
            
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center space-x-3 px-3 py-2 rounded-lg font-medium transition-colors cursor-pointer',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-slate-200">
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.imageUrl || undefined} alt={user?.username || user?.email || undefined} />
            <AvatarFallback>
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">
              {user?.firstName || user?.username || user?.primaryEmailAddress?.emailAddress || 'User'}
            </p>
            <p className="text-xs text-slate-500 truncate">
              {user?.primaryEmailAddress?.emailAddress || 'user@example.com'}
            </p>
          </div>
          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-600" onClick={() => signOut()} title="Sign out" aria-label="Sign out">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
