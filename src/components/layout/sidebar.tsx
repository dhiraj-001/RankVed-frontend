import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { useApp } from '@/contexts/app-context';
import { useChatbots } from '@/hooks/use-chatbots';
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
  Shield,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { useClerk, useUser } from '@clerk/clerk-react';
import { useEffect, useState } from 'react';

// Add CSS animations for sidebar
const sidebarStyles = `
  @keyframes slideInFromLeft {
    from {
      opacity: 0;
      transform: translateX(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .sidebar-item {
    animation: slideInFromLeft 0.6s ease-out forwards;
  }
  
  .sidebar-item:hover {
    animation: fadeInUp 0.2s ease-out;
  }
`;

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

interface SidebarProps {
  // No props needed - sidebar handles mobile detection internally
}

export function Sidebar({}: SidebarProps) {
  const [location] = useLocation();
  const { signOut } = useClerk();
  const { user } = useUser();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screens
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    // Check on mount
    checkMobile();

    // Add event listener for resize
    window.addEventListener('resize', checkMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-collapse on mobile
  useEffect(() => {
    if (isMobile && !isCollapsed) {
      setIsCollapsed(true);
    }
  }, [isMobile, isCollapsed]);

  const handleToggleCollapse = () => {
    // On mobile, don't allow expanding
    if (isMobile) return;
    setIsCollapsed((v) => !v);
  };

  return (
    <>
      <style>{sidebarStyles}</style>
      <aside className={cn(
        "bg-gradient-to-br from-blue-100 via-white to-blue-50 border-r-2 border-purple-200 flex flex-col transition-all duration-500 ease-in-out flex-shrink-0 shadow-lg",
        isCollapsed ? 'w-18' : 'w-64'
      )}>
      {/* Sidebar Toggle Button - Hidden on mobile */}
      {!isMobile && (
        <div className={cn(
          "border-b border-slate-200 flex items-center transition-all duration-500 ease-in-out", 
          isCollapsed ? "p-3 justify-center" : "p-4 justify-end"
        )}>
          <button
            className={cn(
              "p-2 rounded-full hover:bg-blue-100 hover:shadow-md transition-all duration-300 ease-in-out transform hover:scale-105",
              isCollapsed ? "w-full" : ""
            )}
            onClick={handleToggleCollapse}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <div className="transition-transform duration-500 ease-in-out">
              {isCollapsed ? <ChevronRight className="h-5 w-5 text-blue-500" /> : <ChevronLeft className="h-5 w-5 text-blue-500" />}
            </div>
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navigation.map((item, index) => {
            const isActive = location.startsWith(item.href);
            const Icon = item.icon;
            return (
              <li key={item.name} className="sidebar-item" style={{ animationDelay: `${index * 100}ms` }}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center space-x-3 px-3 py-3 rounded-lg font-medium transition-all duration-300 ease-in-out cursor-pointer group relative transform hover:scale-105 hover:shadow-md',
                    isActive
                      ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-600 shadow-sm border border-blue-200/50'
                      : 'text-slate-600 hover:bg-gradient-to-r hover:from-slate-100 hover:to-blue-50 hover:text-slate-900'
                  )}
                  title={isCollapsed ? item.name : undefined}
                >
                  <div className="transition-transform duration-300 ease-in-out group-hover:scale-110">
                    <Icon className="h-4 w-4 flex-shrink-0" />
                  </div>
                  {!isCollapsed && (
                    <span className="transition-all duration-300 ease-in-out opacity-100 transform translate-x-0">
                      {item.name}
                    </span>
                  )}
                  {/* Tooltip for collapsed state */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-2 px-3 py-2 bg-slate-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out pointer-events-none whitespace-nowrap z-50 shadow-lg transform scale-95 group-hover:scale-100">
                      {item.name}
                    </div>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile and Sign Out */}
      <div className="p-4 border-t border-slate-200 transition-all duration-500 ease-in-out">
        {/* Sign Out Button - Always visible */}
        <Button 
          variant="ghost" 
          size="sm"  
          onClick={() => signOut()} 
          className={cn(
            "w-full text-blue-500 hover:text-slate-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-md group relative",
            isCollapsed ? "justify-center" : "justify-start"
          )}
          title={isCollapsed ? "Sign out" : undefined}
          aria-label="Sign out"
        >
          <div className="transition-transform duration-300 ease-in-out group-hover:scale-110">
            <LogOut className="h-4 w-4" />
          </div>
          {!isCollapsed && (
            <span className="ml-2 transition-all duration-300 ease-in-out opacity-100 transform translate-x-0">
              Sign Out
            </span>
          )}
          {/* Tooltip for collapsed state */}
          {isCollapsed && (
            <div className="absolute left-full ml-2 px-3 py-2 bg-slate-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out pointer-events-none whitespace-nowrap z-50 shadow-lg transform scale-95 group-hover:scale-100">
              Sign Out
            </div>
          )}
        </Button>
      </div>
      </aside>
    </>
  );
}
