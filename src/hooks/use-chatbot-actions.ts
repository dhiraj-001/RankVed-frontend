
import { useCreateChatbot, useDeleteChatbot, useUpdateChatbot } from '@/hooks/use-chatbots';
import { useToast } from '@/hooks/use-toast';

export function useChatbotActions({ setShowCreateDialog, setNewChatbot }: { setShowCreateDialog: any, setNewChatbot: any }) {
  const createChatbot = useCreateChatbot();
  const deleteChatbot = useDeleteChatbot();
  const updateChatbot = useUpdateChatbot();
  const { toast } = useToast();

  const handleCreateChatbot = async (newChatbot: any) => {
    try {
      await createChatbot.mutateAsync(newChatbot);
      setShowCreateDialog(false);
      setNewChatbot({
        name: '',
        aiSystemPrompt: '',
        welcomeMessage: '',
        isActive: true,
      });
      toast({
        title: 'Chatbot created',
        description: 'Your new chatbot has been created successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create chatbot. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateChatbot = async (id: any, data: any) => {
    try {
      await updateChatbot.mutateAsync({ id, data });
      setShowCreateDialog(false);
      toast({
        title: 'Chatbot updated',
        description: 'Your chatbot has been updated successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update chatbot. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteChatbot = async (id: any) => {
    try {
      await deleteChatbot.mutateAsync(id);
      toast({
        title: 'Chatbot deleted',
        description: 'The chatbot has been deleted successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete chatbot. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return { handleCreateChatbot, handleUpdateChatbot, handleDeleteChatbot, createChatbot, updateChatbot };
} 