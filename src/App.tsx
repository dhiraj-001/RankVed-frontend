import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider } from "@/contexts/app-context";
import { AppLayout } from "@/components/layout/app-layout";
import Dashboard from "@/pages/dashboard";
import Chatbots from "@/pages/chatbots";
import Settings from "@/pages/settings";
import Appearance from "@/pages/appearance";
import Security from "@/pages/security";
import Questions from "@/pages/questions";
import Training from "@/pages/training";
import Leads from "@/pages/leads";
import Embed from "@/pages/embed";
import Profile from "@/pages/profile";
import Onboarding from "@/pages/onboarding";
import ChatEmbed from "@/pages/chat-embed";
import ChatWidget from "@/pages/chat-widget";
import ChatStandalone from "@/pages/chat-standalone";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={() => <Dashboard />} />
      <Route path="/onboarding" component={Onboarding} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/chatbots" component={Chatbots} />
      <Route path="/settings" component={Settings} />
      <Route path="/appearance" component={Appearance} />
      <Route path="/security" component={Security} />
      <Route path="/questions" component={Questions} />
      <Route path="/training" component={Training} />
      <Route path="/leads" component={Leads} />
      <Route path="/embed" component={Embed} />
      <Route path="/profile" component={Profile} />
      <Route path="/chat-embed/:chatbotId?" component={ChatEmbed} />
      <Route path="/chat-widget/:chatbotId" component={ChatWidget} />
      <Route path="/chat/:chatbotId" component={ChatStandalone} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <>
 
        <QueryClientProvider client={queryClient}>
          <AppProvider>
            <TooltipProvider>
              <Toaster />
              <AppLayout>
                <Router />
              </AppLayout>
            </TooltipProvider>
          </AppProvider>
        </QueryClientProvider>

    
    </>
  );
}

export default App;
