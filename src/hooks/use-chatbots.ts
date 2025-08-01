import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { Chatbot, InsertChatbot } from '@/types';

export function useChatbots() {
  return useQuery<Chatbot[]>({
    queryKey: ['/api/chatbots'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/chatbots');
      return response.json();
    },
  });
}

export function useChatbot(id: string) {
  return useQuery<Chatbot>({
    queryKey: ['/api/chatbots', id],
    enabled: !!id,
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/chatbots/${id}`);
      return response.json();
    },
  });
}

export function useCreateChatbot() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Partial<InsertChatbot>) => {
      const response = await apiRequest('POST', '/api/chatbots', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chatbots'] });
    },
  });
}

export function useUpdateChatbot() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertChatbot> }) => {
      const response = await apiRequest('PUT', `/api/chatbots/${id}`, data);
      return response.json();
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['/api/chatbots'] });
      queryClient.invalidateQueries({ queryKey: ['/api/chatbots', id] });
    },
  });
}

export function useDeleteChatbot() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('DELETE', `/api/chatbots/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chatbots'] });
    },
  });
}

export function useChatResponse() {
  return useMutation({
    mutationFn: async ({ chatbotId, message, sessionId }: { chatbotId: string; message: string; sessionId?: string }) => {
      const response = await apiRequest('POST', `/api/chat`, { 
        message, 
        chatbotId,
        sessionId: sessionId || localStorage.getItem('chat_session_id') || undefined
      });
      return response.json();
    },
  });
}
