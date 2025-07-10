import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, Chatbot } from '@/types';

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  activeChatbot: Chatbot | null;
  setActiveChatbot: (chatbot: Chatbot | null) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  refreshUser: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [activeChatbot, setActiveChatbot] = useState<Chatbot | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserData = async () => {
    try {
      const apiUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000';
      
      // Get user email from Clerk
      // const email = clerkUser?.primaryEmailAddress?.emailAddress; // Removed Clerk user email
      // if (!email) return; // Removed Clerk user email check

      // Try to fetch user data from backend (assuming user ID 1 for demo)
      try {
        const userResponse = await fetch(`${apiUrl}/api/users/1`, { 
          credentials: 'include' 
        });
        
        if (userResponse.ok) {
          const userData = await userResponse.json();
          if (userData.user) {
            setUser(userData.user);
          } else {
            // Fallback to demo user with Clerk data
            const demoUser: User = {
              id: 1,
              username: "user", // Placeholder, ideally from Clerk
              email: "user@example.com", // Placeholder, ideally from Clerk
              agencyName: "Your Agency Name",
              agencyLogo: undefined,
              onboardingCompleted: true,
              businessType: undefined,
              primaryGoals: [],
              experienceLevel: "beginner",
              onboardingStep: 0,
              personalizedRecommendations: undefined,
              createdAt: new Date(),
            };
            setUser(demoUser);
          }
        } else {
          // Fallback to demo user with Clerk data
          const demoUser: User = {
            id: 1,
            username: "user", // Placeholder, ideally from Clerk
            email: "user@example.com", // Placeholder, ideally from Clerk
            agencyName: "Your Agency Name",
            agencyLogo: undefined,
            onboardingCompleted: true,
            businessType: undefined,
            primaryGoals: [],
            experienceLevel: "beginner",
            onboardingStep: 0,
            personalizedRecommendations: undefined,
            createdAt: new Date(),
          };
          setUser(demoUser);
        }
      } catch (error) {
        console.error('Error fetching user from backend:', error);
        // Fallback to demo user with Clerk data
        const demoUser: User = {
          id: 1,
          username: "user", // Placeholder, ideally from Clerk
          email: "user@example.com", // Placeholder, ideally from Clerk
          agencyName: "Your Agency Name",
          agencyLogo: undefined,
          onboardingCompleted: true,
          businessType: undefined,
          primaryGoals: [],
          experienceLevel: "beginner",
          onboardingStep: 0,
          personalizedRecommendations: undefined,
          createdAt: new Date(),
        };
        setUser(demoUser);
      }
      
      // Fetch user's chatbots
      try {
        const chatbotsResponse = await fetch(`${apiUrl}/api/chatbots`, { 
          credentials: 'include' 
        });
        
        if (chatbotsResponse.ok) {
          const chatbots = await chatbotsResponse.json();
          if (chatbots && chatbots.length > 0) {
            // Sort by updatedAt to get the latest one
            const sortedChatbots = chatbots.sort((a: Chatbot, b: Chatbot) => 
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
            );
            setActiveChatbot(sortedChatbots[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching chatbots:', error);
      }
    } catch (error) {
      console.error('Error in fetchUserData:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    // Removed Clerk user refresh logic
    await fetchUserData();
  };

  useEffect(() => {
    // Removed Clerk user effect logic
    fetchUserData();
  }, []); // Removed clerkUser and clerkLoaded from dependencies

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        activeChatbot,
        setActiveChatbot,
        isLoading,
        setIsLoading,
        refreshUser,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
