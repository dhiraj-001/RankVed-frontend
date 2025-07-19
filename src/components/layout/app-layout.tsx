
import { Sidebar } from './sidebar';
import { Header } from './header';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  // Onboarding flow removed - users go directly to dashboard

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50 w-screen">
      {/* Header at the top */}
      <Header />
      
      {/* Main content area with sidebar and content */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto transition-all duration-300 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
