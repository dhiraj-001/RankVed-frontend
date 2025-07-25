import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  Bot, 
  BarChart3, 
  Settings, 
  Palette, 
  Brain, 
  Users, 
  Code,
  LogOut,
  User,
  Shield,
  ChevronLeft, ChevronRight,
} from 'lucide-react';
import { useClerk } from '@clerk/clerk-react';
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
  
  @keyframes slideInFromLeftMobile {
    from {
      opacity: 0;
      transform: translateX(-100%);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  .sidebar-mobile {
    animation: slideInFromLeftMobile 0.3s ease-out forwards;
  }
  
  .sidebar-overlay {
    animation: fadeIn 0.2s ease-out forwards;
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
  { name: 'Chatbots', href: '/chatbots', icon: Bot },
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Appearance', href: '/appearance', icon: Palette },
  { name: 'Security', href: '/security', icon: Shield },
  // { name: 'Question Flow', href: '/questions', icon: GitBranch },
  { name: 'Tune AI', href: '/training', icon: Brain },
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
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Detect mobile screens
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768; // md breakpoint
      setIsMobile(mobile);
      
      // Auto-close mobile sidebar when screen becomes larger
      if (!mobile && isMobileOpen) {
        setIsMobileOpen(false);
      }
    };

    // Check on mount
    checkMobile();

    // Add event listener for resize
    window.addEventListener('resize', checkMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, [isMobileOpen]);

  // Auto-collapse on mobile
  useEffect(() => {
    if (isMobile && !isCollapsed) {
      setIsCollapsed(true);
    }
  }, [isMobile, isCollapsed]);

  // Close mobile sidebar when clicking on a link
  const handleMobileLinkClick = () => {
    if (isMobile) {
      setIsMobileOpen(false);
    }
  };

  const handleToggleCollapse = () => {
    // On mobile, don't allow expanding
    if (isMobile) return;
    setIsCollapsed((v) => !v);
  };

  const handleMobileToggle = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  // Close mobile sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobile && isMobileOpen) {
        const sidebar = document.getElementById('mobile-sidebar');
        const toggleButton = document.getElementById('mobile-toggle-button');
        
        if (sidebar && !sidebar.contains(event.target as Node) && 
            toggleButton && !toggleButton.contains(event.target as Node)) {
          setIsMobileOpen(false);
        }
      }
    };

    if (isMobile && isMobileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Prevent body scroll when sidebar is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isMobile, isMobileOpen]);

  return (
    <>
      <style>{sidebarStyles}</style>
      
      {/* Mobile Toggle Button - Sticky */}
      {isMobile && (
        <button
          id="mobile-toggle-button"
          onClick={handleMobileToggle}
          className={cn(
            "fixed top-12 -left-2 z-50 p-2 bg-purple-200 border border-slate-200 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:scale-105",
            isMobileOpen && "bg-blue-50 border-blue-300"
          )}
          aria-label="Toggle sidebar"
        >
          <ChevronRight className={cn("h-5 w-5 transition-colors", isMobileOpen ? "text-blue-600" : "text-slate-600")} />
        </button>
      )}

      {/* Mobile Overlay */}
      {isMobile && isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 sidebar-overlay"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      {!isMobile && (
        <aside className={cn(
          "bg-gradient-to-br from-blue-100 via-white to-blue-50 border-r-2 border-purple-200 flex flex-col transition-all duration-500 ease-in-out flex-shrink-0 shadow-lg h-full",
          isCollapsed ? 'w-16' : 'w-56'
        )}>
          {/* Sidebar Toggle Button */}
          <div className={cn(
            "border-b border-slate-200 flex items-center transition-all duration-500 ease-in-out",
            isCollapsed ? "p-2.5 justify-center" : "p-4 justify-end"
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
                {isCollapsed ? <ChevronRight className="h-4 w-4 text-blue-500" /> : <ChevronLeft className="h-4 w-4 text-blue-500" />}
              </div>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 overflow-y-auto scrollbar-none">
            <ul className="space-y-2">
              {navigation.map((item, index) => {
                const isActive = location.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <li key={item.name} className="sidebar-item" style={{ animationDelay: `${index * 100}ms` }}>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center space-x-3 px-3 py-2.5 rounded-md font-medium text-sm transition-all duration-300 ease-in-out cursor-pointer group relative transform hover:scale-105',
                        isActive
                          ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-600 border border-blue-200/50'
                          : 'text-slate-600 hover:bg-gradient-to-r hover:from-slate-100 hover:to-blue-50 hover:text-slate-900'
                      )}
                      title={isCollapsed ? item.name : undefined}
                    >
                      <div className="transition-transform duration-300 ease-in-out group-hover:scale-110">
                        <Icon className="h-4 w-4 flex-shrink-0" />
                      </div>
                      {!isCollapsed && (
                        <span className="transition-all duration-300 ease-in-out opacity-100 transform translate-x-0 text-sm">
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
          <div className="p-3 border-t border-slate-200 transition-all duration-500 ease-in-out">
            <Button 
              variant="ghost" 
              size="sm"  
              onClick={() => signOut()} 
              className={cn(
                "w-full text-blue-500 hover:text-slate-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 transition-all duration-300 ease-in-out group relative text-sm py-2.5",
                isCollapsed ? "justify-center" : "justify-start"
              )}
              title={isCollapsed ? "Sign out" : undefined}
              aria-label="Sign out"
            >
              <div className="transition-transform duration-300 ease-in-out group-hover:scale-110">
                <LogOut className="h-4 w-4" />
              </div>
              {!isCollapsed && (
                <span className="ml-2 transition-all duration-300 ease-in-out opacity-100 transform translate-x-0 text-sm">
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
      )}

      {/* Mobile Sidebar */}
      {isMobile && (
        <aside 
          id="mobile-sidebar"
          className={cn(
            "fixed top-0 left-0 h-full w-80 bg-gradient-to-br from-blue-100 via-white to-blue-50 border-r-2 border-purple-200 flex flex-col shadow-2xl z-50",
            isMobileOpen ? "translate-x-0" : "-translate-x-full"
          )}
          style={{ 
            transition: 'transform 0.3s ease-in-out',
            transform: isMobileOpen ? 'translateX(0)' : 'translateX(-100%)'
          }}
        >
          {/* Mobile Header with Close Button */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-800">Menu</h2>
            <button
              onClick={() => setIsMobileOpen(false)}
              className="p-2 rounded-full hover:bg-slate-100 transition-all duration-200"
              aria-label="Close sidebar"
            >
              <ChevronLeft className="h-5 w-5 text-slate-600" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <ul className="space-y-2">
              {navigation.map((item, index) => {
                const isActive = location.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <li key={item.name} className="sidebar-item" style={{ animationDelay: `${index * 50}ms` }}>
                    <Link
                      href={item.href}
                      onClick={handleMobileLinkClick}
                      className={cn(
                        'flex items-center space-x-3 px-4 py-4 rounded-lg font-medium transition-all duration-300 ease-in-out cursor-pointer group relative transform hover:scale-105 hover:shadow-md',
                        isActive
                          ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-600 shadow-sm border border-blue-200/50'
                          : 'text-slate-600 hover:bg-gradient-to-r hover:from-slate-100 hover:to-blue-50 hover:text-slate-900'
                      )}
                    >
                      <div className="transition-transform duration-300 ease-in-out group-hover:scale-110">
                        <Icon className="h-5 w-5 flex-shrink-0" />
                      </div>
                      <span className="transition-all duration-300 ease-in-out opacity-100 transform translate-x-0">
                        {item.name}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Sign Out Button */}
          <div className="p-4 border-t border-slate-200">
            <Button 
              variant="ghost" 
              size="sm"  
              onClick={() => {
                signOut();
                setIsMobileOpen(false);
              }} 
              className="w-full text-blue-500 hover:text-slate-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-md group relative justify-start"
              aria-label="Sign out"
            >
              <div className="transition-transform duration-300 ease-in-out group-hover:scale-110">
                <LogOut className="h-5 w-5" />
              </div>
              <span className="ml-3 transition-all duration-300 ease-in-out opacity-100 transform translate-x-0">
                Sign Out
              </span>
            </Button>
          </div>
        </aside>
      )}
    </>
  );
}
