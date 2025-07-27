import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export interface ChatSessionSummary {
  sessionId: string;
  chatbotId: string;
  messageCount: number;
  firstMessage: Date;
  lastMessage: Date;
  duration: number;
  leadCollected: boolean;
  userEmail?: string;
  userName?: string;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  chatbotId: string;
  content: string;
  sender: 'user' | 'bot';
  createdAt: string;
  messageType: string;
  metadata?: any;
}

export interface ChatSessionsFilters {
  chatbotId?: string;
  startDate?: Date;
  endDate?: Date;
  leadCollected?: boolean;
  searchTerm?: string;
}

export function useChatSessions(chatbotId?: string, filters?: ChatSessionsFilters) {
  return useQuery({
    queryKey: ['chat-sessions', chatbotId, filters],
    queryFn: async () => {
      if (!chatbotId) return [];
      
      const params = new URLSearchParams();
      if (filters?.startDate) {
        params.append('startDate', filters.startDate.toISOString());
      }
      if (filters?.endDate) {
        params.append('endDate', filters.endDate.toISOString());
      }
      if (filters?.leadCollected !== undefined) {
        params.append('leadCollected', filters.leadCollected.toString());
      }
      if (filters?.searchTerm) {
        params.append('q', filters.searchTerm);
      }

      const url = `/api/chatbots/${chatbotId}/sessions${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await apiRequest('GET', url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch chat sessions');
      }
      
      const data = await response.json();
      return data.map((session: any) => ({
        ...session,
        firstMessage: new Date(session.firstMessage),
        lastMessage: new Date(session.lastMessage),
      }));
    },
    enabled: !!chatbotId,
  });
}

export function useChatMessages(sessionId: string) {
  return useQuery({
    queryKey: ['chat-messages', sessionId],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/chat-sessions/${sessionId}/messages`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch chat messages');
      }
      
      return response.json();
    },
    enabled: !!sessionId,
  });
}

export function useDeleteChatSession() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ sessionId, chatbotId }: { sessionId: string; chatbotId: string }) => {
      const response = await apiRequest('DELETE', `/api/chat-sessions/${sessionId}`);
      
      if (!response.ok) {
        throw new Error('Failed to delete chat session');
      }
      
      return response.json();
    },
    onSuccess: (_, { chatbotId }) => {
      // Invalidate and refetch chat sessions
      queryClient.invalidateQueries({ queryKey: ['chat-sessions', chatbotId] });
    },
  });
}

export function useDeleteAllChatSessions() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (chatbotId: string) => {
      const response = await apiRequest('DELETE', `/api/chatbots/${chatbotId}/sessions`);
      
      if (!response.ok) {
        throw new Error('Failed to delete all chat sessions');
      }
      
      return response.json();
    },
    onSuccess: (_, chatbotId) => {
      // Invalidate and refetch chat sessions
      queryClient.invalidateQueries({ queryKey: ['chat-sessions', chatbotId] });
    },
  });
} 