import { Sidebar } from './sidebar';
import { useApp } from '@/contexts/app-context';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user } = useApp();
  const [location, setLocation] = useLocation();

  // Onboarding flow removed - users go directly to dashboard

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
