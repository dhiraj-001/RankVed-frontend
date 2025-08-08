import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export interface LeadFieldsConfig {
  leadCollectionEnabled: boolean;
  leadCollectionFields: string[];
  chatbotId: string;
}

export function useLeadFields(chatbotId: string) {
  return useQuery({
    queryKey: ['/api/chatbots', chatbotId, 'lead-fields'],
    queryFn: async (): Promise<LeadFieldsConfig> => {
      console.log('[LeadFields Hook] Fetching lead fields for chatbot:', chatbotId);
      
      const response = await apiRequest('GET', `/api/chatbots/${chatbotId}/lead-fields`);
      if (!response.ok) throw new Error('Failed to fetch lead fields');
      
      const data = await response.json();
      console.log('[LeadFields Hook] Received data from API:', {
        data: data,
        leadCollectionFields: data.leadCollectionFields,
        leadCollectionFieldsType: typeof data.leadCollectionFields,
        leadCollectionFieldsIsArray: Array.isArray(data.leadCollectionFields)
      });
      
      return data;
    },
    enabled: !!chatbotId,
  });
}

export function useUpdateLeadFields() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ chatbotId, fields, enabled }: { chatbotId: string; fields: string[]; enabled?: boolean }) => {
      console.log('[LeadFields Hook] Updating lead fields:', {
        chatbotId: chatbotId,
        fields: fields,
        fieldsType: typeof fields,
        fieldsIsArray: Array.isArray(fields),
        enabled: enabled
      });
      
      const requestData = {
        leadCollectionFields: fields,
        leadCollectionEnabled: enabled,
      };
      
      console.log('[LeadFields Hook] Sending request data:', requestData);
      
      const response = await apiRequest('PUT', `/api/chatbots/${chatbotId}`, requestData);
      if (!response.ok) throw new Error('Failed to update lead fields');
      
      const result = await response.json();
      console.log('[LeadFields Hook] Update response:', result);
      
      return result;
    },
    onSuccess: (_, { chatbotId }) => {
      console.log('[LeadFields Hook] Update successful, invalidating queries for chatbot:', chatbotId);
      queryClient.invalidateQueries({ queryKey: ['/api/chatbots', chatbotId, 'lead-fields'] });
      queryClient.invalidateQueries({ queryKey: ['/api/chatbots', chatbotId] });
    },
  });
}

// Common field options for lead collection
export const LEAD_FIELD_OPTIONS = [
  { value: 'name', label: 'Full Name', required: true },
  { value: 'email', label: 'Email Address', required: false },
  { value: 'phone', label: 'Phone Number', required: false },

] as const;

export type LeadFieldType = typeof LEAD_FIELD_OPTIONS[number]['value']; 